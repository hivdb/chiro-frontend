import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function usePositionNumExp() {
  let rxType;
  let {
    params: {
      refName,
      abNames,
      vaccineName,
      infectedVarName
    }
  } = LocationParams.useMe();
  const aggregateBy = [];
  if (refName) {
    aggregateBy.push('article');
  }
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
  const [
    suscSummary,
    isPending
  ] = useSuscSummary({
    aggregateBy: ['position', ...aggregateBy],
    refName,
    rxType,
    antibodyNames: abNames,
    vaccineName,
    infectedVarName,
    selectColumns: ['position', 'num_experiments']
  });

  const lookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      const lookup = {};
      for (const one of suscSummary) {
        lookup[one.position] = one.numExperiments;
      }
      return lookup;
    },
    [isPending, suscSummary]
  );
  return [lookup, isPending];
}
