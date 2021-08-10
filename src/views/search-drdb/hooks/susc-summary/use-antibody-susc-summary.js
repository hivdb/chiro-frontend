import LocationParams from '../location-params';
import useSuscSummary from './use-susc-summary';


export default function useAntibodyAll() {
  const {
    params: {
      refName,
      varName,
      isoAggkey
    }
  } = LocationParams.useMe();
  const aggregateBy = ['antibody'];
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
    isoAggkey
  });
  if (isPending) {
    return [null, true];
  }
  else {
    return [suscSummary, false];
  }
}
