import React from 'react';

import useSuscSummary from './use-susc-summary';


export default function useInfectedVariantNumExperimentLookup({
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
    isPending: isSuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['infected_variant', ...aggregateBy],
    refName: articleValue,
    varName: variantValue,
    isoAggkey: mutationText,
    skip
  });
  const {
    suscSummary: anySuscSummary,
    isPending: isAnySuscSummaryPending
  } = useSuscSummary({
    aggregateBy: ['rx_type', ...aggregateBy],
    rxType: 'conv-plasma',
    refName: articleValue,
    varName: variantValue,
    isoAggkey: mutationText,
    skip
  });
  const isPending = isSuscSummaryPending || isAnySuscSummaryPending;

  const lookup = React.useMemo(
    () => {
      if (skip || isPending) {
        return {};
      }
      const lookup = {
        __ANY: anySuscSummary[0]?.numExperiments || 0
      };
      for (const one of suscSummary) {
        lookup[one.infectedVarName] = one.numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
