import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useVariantNumExp() {
  let {params} = LocationParams.useMe();

  const [suscSummary, isPending] = useSuscSummary(params);
  const lookup = React.useMemo(
    () => isPending ? {any: 0} : {...suscSummary.variant},
    [isPending, suscSummary.variant]
  );

  return [lookup, isPending];
}
