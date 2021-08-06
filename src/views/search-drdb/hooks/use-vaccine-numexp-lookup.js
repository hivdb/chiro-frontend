import React from 'react';

import LocationParams from './location-params';
import useSuscSummary from './use-susc-summary';


export default function useVaccineNumExperimentLookup(skip) {
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
  const {
    suscSummary,
    isPending: isSuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['vaccine', ...aggregateBy],
    refName,
    varName,
    isoAggkey,
    selectColumns: ['vaccine_name', 'num_experiments'],
    skip
  });
  const {
    suscSummary: anySuscSummary,
    isPending: isAnySuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['rx_type', ...aggregateBy],
    rxType: 'vacc-plasma',
    refName,
    varName,
    isoAggkey,
    selectColumns: ['num_experiments'],
    skip
  });
  const isPending = isSuscSummaryPending || isAnySuscSummaryPending;

  const lookup = React.useMemo(
    () => {
      if (skip || isPending) {
        return {};
      }
      const lookup = {
        __ANY: anySuscSummary[0]?.numExperiments || 0
      };
      for (const one of suscSummary) {
        lookup[one.vaccineName] = one.numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
