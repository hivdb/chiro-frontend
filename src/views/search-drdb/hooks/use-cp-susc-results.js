import React from 'react';
import useSuscResults from './use-susc-results';


function usePrepareQuery({infectedVarName, skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const joinClause = [];
      const params = {};

      if (!skip) {
        addColumns.push("'conv-plasma' AS rx_type");
        addColumns.push('RXCP.infected_iso_name');
        addColumns.push('RXCP.timing');
        addColumns.push('RXCP.severity');

        if (infectedVarName && infectedVarName !== 'any') {
          where.push(`
            EXISTS (
              SELECT 1 FROM isolates ISO
              WHERE
                RXCP.infected_iso_name = ISO.iso_name AND
                ISO.var_name = $infectedVarName
            )
          `);
          params.$infectedVarName = infectedVarName;
        }

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            S.ref_name = RXCP.ref_name AND
            S.rx_name = RXCP.rx_name
        `);
      }
      return {addColumns, where, joinClause, params};
    },
    [skip, infectedVarName]
  );

}


export default function useConvPlasmaSuscResults({
  refName,
  mutationText,
  varName,
  infectedVarName,
  skip = false
}) {

  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({infectedVarName, skip});
  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    mutationText,
    varName,
    addColumns,
    joinClause,
    where,
    params,
    skip
  });

  return {suscResults, suscResultLookup, isPending};
}
