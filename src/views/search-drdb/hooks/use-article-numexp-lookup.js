import React from 'react';

import useSuscSummary from './use-susc-summary';


export default function useArticleNumExperimentLookup({
  skip,
  antibodyValue,
  vaccineValue,
  convPlasmaValue,
  variantValue,
  mutationText
}) {
  let rxType;
  const aggregateBy = [];
  if (antibodyValue && antibodyValue.length > 0) {
    if (antibodyValue[0] === 'any') {
      rxType = 'antibody';
      aggregateBy.push('rx_type');
      antibodyValue = null;
    }
    else if (antibodyValue.length === 1) {
      aggregateBy.push('antibody:indiv');
    }
    else {
      aggregateBy.push('antibody');
    }
  }
  if (vaccineValue) {
    if (vaccineValue === 'any') {
      rxType = 'vacc-plasma';
      aggregateBy.push('rx_type');
      vaccineValue = null;
    }
    else {
      aggregateBy.push('vaccine');
    }
  }
  if (convPlasmaValue) {
    if (convPlasmaValue === 'any') {
      rxType = 'conv-plasma';
      aggregateBy.push('rx_type');
      convPlasmaValue = null;
    }
    else {
      aggregateBy.push('infected_variant');
    }
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
    aggregateBy: ['article', ...aggregateBy],
    rxType,
    antibodyNames: antibodyValue,
    vaccineName: vaccineValue,
    infectedVariant: convPlasmaValue,
    varName: variantValue,
    isoAggkey: mutationText,
    skip
  });
  const {
    suscSummary: anySuscSummary,
    isPending: isAnySuscSummaryPending
  } = useSuscSummary({
    aggregateBy,
    rxType,
    antibodyNames: antibodyValue,
    vaccineName: vaccineValue,
    infectedVariant: convPlasmaValue,
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
        lookup[one.refName] = one.numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary, anySuscSummary]
  );
  return [lookup, isPending];
}
