import useSuscSummary from './use-susc-summary';


export default function useRxTotalNumExperiment({
  skip,
  articleValue,
  variantValue,
  mutationText
}) {
  const aggregateBy = [];
  if (articleValue) {
    aggregateBy.push('article');
  }
  if (variantValue) {
    aggregateBy.push('variant');
  }
  if (mutationText) {
    aggregateBy.push('isolate_agg');
  }
  const {
    suscSummary,
    isPending
  } = useSuscSummary({
    aggregateBy,
    refName: articleValue,
    varName: variantValue,
    isoAggkey: mutationText,
    selectColumns: ['num_experiments'],
    skip
  });
  if (skip || isPending) {
    return [null, true];
  }
  else {
    return [suscSummary[0]?.numExperiments || 0, false];
  }
}
