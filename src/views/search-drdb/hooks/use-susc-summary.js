import React from 'react';
import useQuery from './use-query';

import snakeCase from 'lodash/snakeCase';

import {csvParse, csvStringify} from 'sierra-frontend/dist/utils/csv';

const AGG_OPTIONS = [
  'article',
  'infected_variant',
  'vaccine',
  'antibody',
  'antibody:indiv',
  'variant',
  'isolate_agg',
  'isolate',
  'vaccine_dosage',
  'potency_type',
  'potency_unit'
];


function compileAggKey(aggregateBy) {
  // aggregation key should be ordered exactly as AGG_OPTIONS listed
  const ordered = [];
  for (const aggkey of AGG_OPTIONS) {
    if (aggregateBy.includes(aggkey)) {
      ordered.push(aggkey);
    }
  }
  return ordered.join(',');
}


function csvJoin(array) {
  return csvStringify(array);
}


function csvSplit(array) {
  return csvParse(array, /* withHeader = */false)[0];
}


const AGG_OPTION_BY_VALUE_NAME = {
  refName: ['article'],
  antibodyNames: ['antibody', 'antibody:indiv'],
  vaccineName: ['vaccine'],
  infectedVarName: ['infected_variant'],
  controlIsoName: ['control_isolate'],
  controlVarName: ['control_variant'],
  isoName: ['isolate'],
  varName: ['variant'],
  isoAggkey: ['isolate_agg']
};

const ORDER_BY_VALUE_NAME = {
  antibodyNames: ['antibody_order'],
  vaccineName: ['vaccine_order']
};


function prepareAggFilter(
  valueName,
  value,
  aggregateBy,
  where,
  params,
  orderBy
) {
  if (value) {
    const aggOpts = AGG_OPTION_BY_VALUE_NAME[valueName];
    let noMatch = true;
    for (const aggOpt of aggOpts) {
      if (aggregateBy.includes(aggOpt)) {
        where.push(`${snakeCase(valueName)} = $${valueName}`);
        params[`$${valueName}`] = value;
        orderBy.push(
          ORDER_BY_VALUE_NAME[valueName] || [snakeCase(valueName)]
        );
        noMatch = false;
        break;
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      if (noMatch) {
        console.warn(
          `useSuscSummary: ${valueName} ` +
          `is ignored because '${aggOpts.join("' or '")}' ` +
          (aggOpts.length === 1 ? 'is' : 'are') +
          ` not included in aggregateBy`
        );
      }
    }
  }
  return [where, params, orderBy];
}


export default function useSuscSummary({
  aggregateBy,
  refName,
  antibodyNames,
  vaccineName,
  infectedVarName,
  controlIsoName,
  controlVarName,
  isoName,
  varName,
  isoAggkey,
  skip = false
} = {}) {
  const aggKey = compileAggKey(aggregateBy);
  const where = [];
  const params = {$aggKey: aggKey};
  const orderBy = [];

  prepareAggFilter(
    'refName', refName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'antibodyNames', (
      antibodyNames && antibodyNames.length ?
        csvJoin(antibodyNames) : null
    ),
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'vaccineName', vaccineName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'infectedVarName', infectedVarName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'controlIsoName', controlIsoName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'controlVarName', controlVarName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'isoName', isoName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'varName', varName,
    aggregateBy, where, params, orderBy);
  prepareAggFilter(
    'isoAggkey', isoAggkey,
    aggregateBy, where, params, orderBy);

  if (where.length === 0) {
    where.push('TRUE');
  }

  let orderBySQL = '';
  if (orderBy.length > 0) {
    orderBySQL = `ORDER BY ${orderBy.join(', ')}`;
  }

  const sql = `
    SELECT
      aggregate_by,
      rx_type,
      iso_type,
      ref_name,
      antibody_names,
      antibody_order,
      vaccine_name,
      vaccine_order,
      -- vaccine_dosage,
      infected_var_name,
      control_iso_name,
      control_iso_display,
      control_var_name,
      iso_name,
      iso_aggkey,
      iso_agg_display,
      potency_type,
      potency_unit,

      num_subjects,
      num_samples,
      num_experiments,
      all_studies,
      all_control_potency,
      all_potency,
      all_fold

    FROM susc_summary
    WHERE
      aggregate_by = $aggKey AND
      ${where.join(' AND ')}
    ${orderBySQL}
  `;

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const suscSummary = React.useMemo(
    () => {
      if (skip || isPending || !payload) {
        return [];
      }
      return payload.map(
        suscSummary => {
          let {
            aggregateBy,
            antibodyNames,
            allStudies,
            allControlPotency,
            allPotency,
            allFold,
            ...others
          } = suscSummary;
          return {
            aggregateBy: aggregateBy.split(','),
            antibodyNames: antibodyNames && csvSplit(antibodyNames),
            ...others,
            allStudies: allStudies && csvSplit(allStudies),
            allControlPotency: allControlPotency &&
              csvSplit(allControlPotency).map(Number.parseFloat),
            allPotency: allPotency &&
              csvSplit(allPotency).map(Number.parseFloat),
            allFold: allFold &&
              csvSplit(allFold).map(Number.parseFloat)
          };
        }
      );
    },
    [skip, isPending, payload]
  );

  return {suscSummary, isPending};
}
