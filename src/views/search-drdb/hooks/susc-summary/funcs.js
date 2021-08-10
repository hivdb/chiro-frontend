import snakeCase from 'lodash/snakeCase';

import {csvParse, csvStringify} from 'sierra-frontend/dist/utils/csv';

import {
  AGG_OPTIONS,
  AGG_OPTION_BY_VALUE_NAME,
  ORDER_BY_VALUE_NAME
} from './constants';


export function compileAggKey(aggregateBy) {
  // aggregation key should be ordered exactly as AGG_OPTIONS listed
  const ordered = [];
  for (const aggkey of AGG_OPTIONS) {
    if (aggregateBy.includes(aggkey)) {
      ordered.push(aggkey);
    }
  }
  return ordered.join(',');
}


export function csvJoin(array) {
  return csvStringify(array);
}


export function csvSplit(text) {
  return csvParse(text, /* withHeader = */false)[0];
}


export function prepareAggFilter(
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
  orderBy.push(
    ORDER_BY_VALUE_NAME[valueName] || [snakeCase(valueName)]
  );
  return [where, params, orderBy];
}
