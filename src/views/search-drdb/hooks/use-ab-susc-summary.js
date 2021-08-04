import useSuscSummary from './use-susc-summary';


export default function useAbSuscSummary({
  skip,
  articleValue,
  variantValue,
  mutationText
}) {
  const aggregateBy = ['antibody'];
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
    skip
  });
  if (skip || isPending) {
    return [null, true];
  }
  else {
    return [suscSummary, false];
  }
}
