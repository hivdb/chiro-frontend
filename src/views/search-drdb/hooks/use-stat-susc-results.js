import React from 'react';
import uniq from 'lodash/uniq';


export default function useStatSuscResults(suscResults) {

  return React.useMemo(
    () => {
      if (!suscResults || suscResults.length === 0) {
        return {
          numExps: 0,
          numArticles: 0,
          numNoNatExps: 0,
          numNon50Exps: 0
        };
      }
      const numExps = suscResults.reduce(
        (acc, {cumulativeCount}) => acc + cumulativeCount,
        0
      );
      const numArticles = uniq(suscResults.map(
        ({refName}) => refName
      )).length;
      const numNoNatExps = suscResults.reduce(
        (acc, {unlinkedControlPotency, cumulativeCount, ineffective}) => {
          if (unlinkedControlPotency && unlinkedControlPotency.length > 1) {
            for (const unPot of unlinkedControlPotency) {
              if (unPot.ineffective) {
                acc += unPot.cumulativeCount;
              }
            }
          }
          else {
            if (ineffective === 'control' || ineffective === 'both') {
              acc += cumulativeCount;
            }
          }
          return acc;
        },
        0
      );
      const numNon50Exps = suscResults.reduce(
        (acc, {rxType, potencyType, cumulativeCount}) => (
          acc + (
            potencyType === (rxType === 'antibody' ? 'IC50' : 'NT50') ?
              0 : cumulativeCount
          )
        ),
        0
      );
      return {numExps, numArticles, numNoNatExps, numNon50Exps};
    },
    [suscResults]
  );
}
