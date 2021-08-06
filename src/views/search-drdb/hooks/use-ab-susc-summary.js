import LocationParams from './location-params';
import useSuscSummary from './use-susc-summary';


export default function useAbSuscSummary({skip}) {
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
  const {
    suscSummary,
    isPending
  } = useSuscSummary({
    aggregateBy,
    refName,
    varName,
    isoAggkey,
    skip
  });
  if (skip || isPending) {
    return [null, true];
  }
  else {
    return [suscSummary, false];
  }
}
