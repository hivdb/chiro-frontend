import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function usePositionNumExp() {
  let {params} = LocationParams.useMe();
  const [suscSummary, isPending] = useSuscSummary(params);

  const lookup = React.useMemo(
    () => isPending ? {any: 0} : {...suscSummary.position},
    [
      isPending,
      suscSummary.position
    ]
  );
  return [lookup, isPending];
}
