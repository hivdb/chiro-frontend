import React from 'react';
import {compareIsolates} from './use-isolates';
import {compareAntibodyLists} from './use-antibodies';


export function useCompareSuscResultsByIsolate(isolateLookup) {
  return React.useCallback(
    (srA, srB) => {
      const isoA = isolateLookup[srA.isoName];
      const isoB = isolateLookup[srB.isoName];
      return compareIsolates(isoA, isoB);
    },
    [isolateLookup]
  );
}


export function useCompareSuscResultsByControlIsolate(isolateLookup) {
  return React.useCallback(
    (srA, srB) => {
      const isoA = isolateLookup[srA.controlIsoName];
      const isoB = isolateLookup[srB.controlIsoName];
      return compareIsolates(isoA, isoB);
    },
    [isolateLookup]
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
