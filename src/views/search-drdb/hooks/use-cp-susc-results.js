import React from 'react';
import useConfig from './use-config';
import useSuscResults from './use-susc-results';


function usePrepareQuery({cpOption, skip}) {
  const {config, isPending} = useConfig();
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const joinClause = [];
      const params = {};

      if (!skip && !isPending) {
        addColumns.push("'conv-plasma' AS rx_type");
        addColumns.push('RXCP.infected_iso_name');
        addColumns.push('RXCP.timing');
        addColumns.push('RXCP.severity');

        const {varNames} = (
          config.convPlasmaOptions
            .find(({name}) => name === cpOption)
        ) || {};
        if (varNames && varNames.length > 0) {
          where.push(`
            EXISTS (
              SELECT 1 FROM isolates ISO
              WHERE
                RXCP.infected_iso_name = ISO.iso_name AND (
                  ${varNames.map((_, idx) => `
                    ISO.var_name = $infectedVarName${idx}
                  `).join(' OR ')}
                )
            )
          `);
          varNames.forEach((varName, idx) => {
            params[`$infectedVarName${idx}`] = varName;
          });
        }

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            S.ref_name = RXCP.ref_name AND
            S.rx_name = RXCP.rx_name
        `);
      }
      return {addColumns, where, joinClause, params};
    },
    [skip, config, isPending, cpOption]
  );

}


export default function useConvPlasmaSuscResults({
  refName,
  mutations,
  mutationMatch,
  varName,
  cpOption,
  skip = false
}) {

  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({cpOption, skip});
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
