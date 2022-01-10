import React from 'react';

import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useArticleNumExp() {
  let rxType;
  let {
    params: {
      abNames,
      vaccineName,
      infectedVarName,
      varName,
      isoAggkey,
      genePos
    }
  } = LocationParams.useMe();
  const aggregateBy = [];

  if (abNames && abNames.length > 0) {
    if (abNames[0] === 'any') {
      rxType = 'antibody';
      aggregateBy.push('rx_type');
      abNames = null;
    }
    else {
      aggregateBy.push('antibody:any');
    }
  }
  if (vaccineName) {
    if (vaccineName === 'any') {
      rxType = 'vacc-plasma';
      aggregateBy.push('rx_type');
      vaccineName = null;
    }
    else {
      aggregateBy.push('vaccine');
    }
  }
  if (infectedVarName) {
    if (infectedVarName === 'any') {
      rxType = 'conv-plasma';
      aggregateBy.push('rx_type');
      infectedVarName = null;
    }
    else {
      aggregateBy.push('infected_variant');
    }
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
    aggregateBy: ['article', ...aggregateBy],
    rxType,
    antibodyNames: abNames,
    vaccineName,
    infectedVarName,
    varName,
    isoAggkey,
    genePos,
    selectColumns: ['ref_name', 'num_experiments']
  });
  const [
    anySuscSummary,
    isAnySuscSummaryPending
  ] = useSuscSummary({
    aggregateBy,
    rxType,
    antibodyNames: abNames,
    vaccineName,
    infectedVarName,
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
        lookup[one.refName] = one.numExperiments;
      }
      return lookup;
    },
    [isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
