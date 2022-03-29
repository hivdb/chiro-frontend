import React from 'react';
import {compareIsolates} from '../isolates';
import Antibodies, {compareAntibodyLists} from '../antibodies';


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


export function useCompareSuscResultsByAntibodies() {
  const {
    antibodyLookup,
    isPending
  } = Antibodies.useAll();
  return React.useCallback(
    (srA, srB) => {
      if (!isPending) {
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
      }
      else {
        // don't sort if antibodyLookup is loading
        return 0;
      }
    },
    [isPending, antibodyLookup]
  );
}
