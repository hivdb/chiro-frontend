import React from 'react';
import {csvStringify} from 'sierra-frontend/dist/utils/csv';

import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useAntibodyNumExp(
  abAggregateBy = 'antibody:indiv'
) {
  const aggregateBy = [];
  const {
    params: {
      refName,
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  if (refName) {
    aggregateBy.push('article');
  }
  if (varName) {
    aggregateBy.push('variant');
  }
  if (isoAggkey) {
    aggregateBy.push('isolate_agg');
  }
  const [
    suscSummary,
    isSuscSummaryPending
  ] = useSuscSummary({
    aggregateBy: [abAggregateBy, ...aggregateBy],
    refName,
    varName,
    isoAggkey,
    selectColumns: ['antibody_names', 'num_experiments']
  });
  const [
    anySuscSummary,
    isAnySuscSummaryPending
  ] = useSuscSummary({
    aggregateBy: ['rx_type', ...aggregateBy],
    rxType: 'antibody',
    refName,
    varName,
    isoAggkey,
    selectColumns: ['num_experiments']
  });
  const isPending = isSuscSummaryPending || isAnySuscSummaryPending;

  const orderedAbNames = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      return suscSummary.map(({antibodyNames}) => antibodyNames);
    },
    [suscSummary, isPending]
  );

  const lookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      const lookup = {
        __ANY: anySuscSummary[0]?.numExperiments || 0
      };
      for (const one of suscSummary) {
        lookup[csvStringify(one.antibodyNames)] = one.numExperiments;
      }
      return lookup;
    },
    [isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending, orderedAbNames];
}
