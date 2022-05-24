import React from 'react';
import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useIsolateAggNumExp() {
  let {params} = LocationParams.useMe();
  const [suscSummary, isPending] = useSuscSummary(params);

  const lookup = React.useMemo(
    () => isPending ? {any: 0} : {
      ...(
        suscSummary.isolateAgg ||
        suscSummary.isolate_agg
      )
    },
    [
      isPending,
      suscSummary.isolateAgg,
      suscSummary.isolate_agg
    ]
  );
  return [lookup, isPending];
}
