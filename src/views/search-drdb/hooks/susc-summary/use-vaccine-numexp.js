import React from 'react';

import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useVaccineNumExp() {
  const aggregateBy = [];
  const {
    params: {
      refName,
      varName,
      isoAggkey,
      genePos
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
  if (genePos) {
    aggregateBy.push('position');
  }
  const [
    suscSummary,
    isSuscSummaryPending
  ] = useSuscSummary({
    aggregateBy: ['vaccine', ...aggregateBy],
    refName,
    varName,
    isoAggkey,
    genePos,
    selectColumns: ['vaccine_name', 'num_experiments']
  });
  const [
    anySuscSummary,
    isAnySuscSummaryPending
  ] = useSuscSummary({
    aggregateBy: ['rx_type', ...aggregateBy],
    rxType: 'vacc-plasma',
    refName,
    varName,
    isoAggkey,
    genePos,
    selectColumns: ['num_experiments']
  });
  const isPending = isSuscSummaryPending || isAnySuscSummaryPending;

  const lookup = React.useMemo(
    () => {
      if (isPending) {
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
    [isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
