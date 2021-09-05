import React from 'react';

import useQuery from '../use-query';
import {
  compileAggKey,
  csvJoin,
  csvSplit,
  prepareAggFilter
} from './funcs';
import SuscSummaryContext from './context';
import {DEFAULT_SELECT_COLUMNS} from './constants';


function splitCount(data) {
  let [value, count] = data.split(':', 2);
  if (!count) {
    count = 1;
  }
  return {
    value: Number.parseFloat(value),
    count: Number.parseInt(count)
  };
}


export function useSuscSummaryNoCache({
  aggregateBy,
  rxType,
  refName,
  antibodyNames,
  vaccineName,
  infectedVarName,
  controlIsoName,
  controlVarName,
  isoName,
  varName,
  isoAggkey,
  genePos,
  selectColumns = null
} = {}, skip = false) {
  let aggKey, where, params, orderBy, sql;
  if (!skip) {
    aggKey = compileAggKey(aggregateBy);
    where = [];
    params = {$aggKey: aggKey};
    orderBy = [];
    const commonArgs = [
      aggregateBy,
      where,
      params,
      orderBy
    ];

    prepareAggFilter('rxType', rxType, ...commonArgs);
    prepareAggFilter('refName', refName, ...commonArgs);
    prepareAggFilter(
      'antibodyNames',
      antibodyNames && antibodyNames.length ?
        csvJoin(antibodyNames) : null,
      ...commonArgs
    );
    prepareAggFilter('vaccineName', vaccineName, ...commonArgs);
    prepareAggFilter('infectedVarName', infectedVarName, ...commonArgs);
    prepareAggFilter('controlIsoName', controlIsoName, ...commonArgs);
    prepareAggFilter('controlVarName', controlVarName, ...commonArgs);
    prepareAggFilter('isoName', isoName, ...commonArgs);
    prepareAggFilter('varName', varName, ...commonArgs);
    prepareAggFilter('isoAggkey', isoAggkey, ...commonArgs);
    prepareAggFilter('position', genePos, ...commonArgs);

    if (where.length === 0) {
      where.push('TRUE');
    }

    let orderBySQL = '';
    if (orderBy.length > 0) {
      orderBySQL = `ORDER BY ${orderBy.join(', ')}`;
    }

    if (!selectColumns) {
      selectColumns = DEFAULT_SELECT_COLUMNS;
    }

    sql = `
    SELECT
      ${selectColumns.join(',')}
    FROM susc_summary
    WHERE
      aggregate_by = $aggKey AND
      ${where.join(' AND ')}
    ${orderBySQL}
  `;
  }

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
            aggregateBy: aggregateBy && aggregateBy.split(','),
            antibodyNames: antibodyNames && csvSplit(antibodyNames),
            ...others,
            allStudies: allStudies && csvSplit(allStudies),
            allControlPotency: allControlPotency &&
              csvSplit(allControlPotency).map(splitCount),
            allPotency: allPotency &&
              csvSplit(allPotency).map(splitCount),
            allFold: allFold &&
              csvSplit(allFold).map(splitCount)
          };
        }
      );
    },
    [skip, isPending, payload]
  );

  return [suscSummary, isPending];
}

export default function useSuscSummary(props) {
  const {getPayload, setPayload} = React.useContext(SuscSummaryContext);

  let [payload, cached] = getPayload(props);

  let [
    suscSummary,
    isPending
  ] = useSuscSummaryNoCache(props, /* skip = */cached);

  if (!cached && !isPending) {
    setPayload(props, suscSummary);
    payload = suscSummary;
  }

  if (cached) {
    isPending = false;
  }

  return [payload, isPending];
}
