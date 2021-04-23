import React from 'react';
import useSuscResults from './use-susc-results';


function usePrepareQuery({skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];

      if (!skip) {
        addColumns.push('vaccine_name');
        addColumns.push('timing');
        addColumns.push('dosage');

        joinClause.push(`
          JOIN rx_vacc_plasma RXVP ON
            S.ref_name = RXVP.ref_name AND
            S.rx_name = RXVP.rx_name
        `);
      }
      return {addColumns, joinClause};
    },
    [skip]
  );
}


export default function useVaccPlasmaSuscResults({
  refName,
  spikeMutations,
  mutationMatch,
  skip = false
}) {

  const {addColumns, joinClause} = usePrepareQuery({skip});

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    spikeMutations,
    mutationMatch,
    addColumns,
    joinClause,
    skip
  });

  return {suscResults, suscResultLookup, isPending};
}
