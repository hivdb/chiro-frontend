import React from 'react';

import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useInfectedVariantNumExp() {
  let {params} = LocationParams.useMe();
  const [suscSummary, isPending] = useSuscSummary(params);

  const lookup = React.useMemo(
    () => isPending ? {any: 0} : {
      ...(
        suscSummary.infectedVariant ||
        suscSummary.infected_variant
      )
    },
    [
      isPending,
      suscSummary.infectedVariant,
      suscSummary.infected_variant
    ]
  );
  return [lookup, isPending];
}
