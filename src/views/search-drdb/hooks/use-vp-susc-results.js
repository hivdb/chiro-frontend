import React from 'react';
import useSuscResults from './use-susc-results';


function usePrepareQuery({vaccineName, skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];
      const where = [];
      const params = {};

      if (!skip) {
        addColumns.push("'vacc-plasma' AS rx_type");
        addColumns.push('vaccine_name');
        addColumns.push('timing');
        addColumns.push('dosage');

        joinClause.push(`
          JOIN rx_vacc_plasma RXVP ON
            S.ref_name = RXVP.ref_name AND
            S.rx_name = RXVP.rx_name
        `);

        if (vaccineName && vaccineName !== 'any') {
          where.push('RXVP.vaccine_name=$vaccineName');
        }
        params.$vaccineName = vaccineName;
      }
      return {addColumns, joinClause, where, params};
    },
    [skip, vaccineName]
  );
}


export default function useVaccPlasmaSuscResults({
  refName,
  mutations,
  mutationMatch,
  varName,
  vaccineName,
  skip = false
}) {

  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({vaccineName, skip});

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    mutations,
    mutationMatch,
    varName,
    addColumns,
    joinClause,
    where,
    params,
    skip
  });

  return {suscResults, suscResultLookup, isPending};
}
