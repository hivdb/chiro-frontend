import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useIsolateNumExp() {
  let {params} = LocationParams.useMe();

  const [suscSummary, isPending] = useSuscSummary(params);
  const lookup = React.useMemo(
    () => isPending ? {any: 0} : {...suscSummary.isolate},
    [isPending, suscSummary.isolate]
  );

  return [lookup, isPending];
}
