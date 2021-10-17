import React from 'react';
import Isolates from './isolates';

const isoTypes = {
  'individual-mutation': 'indivMut',
  'mutation-combination': 'comboMuts'
};


function multiGroupBy(inputArray, keyGetters) {
  // multi-dimentional group by
  const [keyGetter, ...remainKeyGetters] = keyGetters;
  const results = inputArray.reduce(
    (acc, one) => {
      const key = keyGetter(one);
      acc[key] = acc[key] || [];
      acc[key].push(one);
      return acc;
    },
    {}
  );
  if (remainKeyGetters.length > 0) {
    for (const key in results) {
      results[key] = multiGroupBy(results[key], remainKeyGetters);
    }
  }
  return results;
}


export default function useSeparateSuscResults({
  suscResults,
  dimensions,
  skip
}) {
  const {
    isolateLookup,
    isPending
  } = Isolates.useMe();

  const keyGetterLookup = React.useMemo(
    () => ({
      isoType: sr => isoTypes[isolateLookup[sr.isoName].type],
      aggForm: sr => (
        sr.cumulativeCount === 1 ||
        (sr.unlinkedPotency && sr.unlinkedPotency.length > 0) ?
          'indivFold' : 'aggFold'
      ),
      potencyType: ({rxType, potencyType}) => {
        if (rxType === 'antibody' && potencyType === 'IC50') {
          return 'main';
        }
        else if (potencyType === 'NT50') {
          return 'main';
        }
        else {
          return potencyType;
        }
      }
    }),
    [isolateLookup]
  );

  return React.useMemo(
    () => {
      if (skip || isPending) {
        return;
      }
      const keyGetters = dimensions.map(d => keyGetterLookup[d]);
      return multiGroupBy(suscResults, keyGetters);
    },
    [skip, isPending, dimensions, suscResults, keyGetterLookup]
  );
}
