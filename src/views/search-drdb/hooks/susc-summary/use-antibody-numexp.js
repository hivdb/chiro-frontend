import React from 'react';

import LocationParams from '../location-params';

import {csvSplit} from './funcs';
import useSuscSummary from './use-susc-summary';


export default function useAntibodyNumExp(
  abAggregateBy = 'antibody:any'
) {
  let {params} = LocationParams.useMe();

  const [suscSummary, isPending] = useSuscSummary(params);
  const lookup = React.useMemo(
    () => {
      if (isPending) {
        return {any: 0};
      }
      if (abAggregateBy === 'antibody:any') {
        return {...suscSummary['antibody:any']};
      }
      else if (abAggregateBy === 'antibody') {
        return {...suscSummary.antibody};
      }
      else {
        return {any: 0};
      }
    },
    [abAggregateBy, isPending, suscSummary]
  );

  const orderedAbNames = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      return Object.keys(lookup)
        .filter(n => n !== 'any' && n !== 'ab-any')
        .map(csvSplit);
    },
    [isPending, lookup]
  );

  return [lookup, isPending, orderedAbNames];
}
