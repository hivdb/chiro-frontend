import React from 'react';

import LocationParams from './location-params';
import useSuscSummary from './use-susc-summary';


export default function useArticleNumExperimentLookup(skip) {
  let rxType;
  let {
    params: {
      abNames,
      vaccineName,
      infectedVarName,
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const aggregateBy = [];
      
  if (abNames && abNames.length > 0) {
    if (abNames[0] === 'any') {
      rxType = 'antibody';
      aggregateBy.push('rx_type');
      abNames = null;
    }
    else if (abNames.length === 1) {
      aggregateBy.push('antibody:indiv');
    }
    else {
      aggregateBy.push('antibody');
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
  const {
    suscSummary,
    isPending: isSuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['article', ...aggregateBy],
    rxType,
    antibodyNames: abNames,
    vaccineName,
    infectedVarName,
    varName,
    isoAggkey,
    selectColumns: ['ref_name', 'num_experiments'],
    skip
  });
  const {
    suscSummary: anySuscSummary,
    isPending: isAnySuscSummaryPending
  } = useSuscSummary({
    aggregateBy,
    rxType,
    antibodyNames: abNames,
    vaccineName,
    infectedVarName,
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
        lookup[one.refName] = one.numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
