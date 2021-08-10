import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useRxTotalNumExp() {
  const {
    params: {
      refName,
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const aggregateBy = [];
  if (refName) {
    aggregateBy.push('article');
  }
  if (varName) {
    aggregateBy.push('variant');
  }
  if (isoAggkey) {
    aggregateBy.push('isolate_agg');
  }
  const [
    suscSummary,
    isPending
  ] = useSuscSummary({
    aggregateBy,
    refName,
    varName,
    isoAggkey,
    selectColumns: ['num_experiments']
  });
  if (isPending) {
    return [null, true];
  }
  else {
    return [suscSummary[0]?.numExperiments || 0, false];
  }
}
