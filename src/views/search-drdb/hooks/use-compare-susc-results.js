import React from 'react';
import {compareVariants} from './use-virus-variants';
import {compareAntibodyLists} from './use-antibodies';


export function useCompareSuscResultsByVariant(variantLookup) {
  return React.useCallback(
    (srA, srB) => {
      const varA = variantLookup[srA.variantName];
      const varB = variantLookup[srB.variantName];
      return compareVariants(varA, varB);
    },
    [variantLookup]
  );
}


export function useCompareSuscResultsByControlVariant(variantLookup) {
  return React.useCallback(
    (srA, srB) => {
      const varA = variantLookup[srA.controlVariantName];
      const varB = variantLookup[srB.controlVariantName];
      return compareVariants(varA, varB);
    },
    [variantLookup]
  );
}


const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


export function useCompareSuscResultsByAntibodies(antibodyLookup) {
  return React.useCallback(
    (srA, srB) => {
      const abNamesA = (
        srA.abNames instanceof Array ?
          srA.abNames :
          srA.abNames.split(LIST_JOIN_MAGIC_SEP)
      );
      const abNamesB = (
        srB.abNames instanceof Array ?
          srB.abNames :
          srB.abNames.split(LIST_JOIN_MAGIC_SEP)
      );
      const abListA = abNamesA
        .map(abName => antibodyLookup[abName]);
      const abListB = abNamesB
        .map(abName => antibodyLookup[abName]);
      return compareAntibodyLists(abListA, abListB);
    },
    [antibodyLookup]
  );
}
