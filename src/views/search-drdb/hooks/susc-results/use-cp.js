import React from 'react';
import PropTypes from 'prop-types';
import useConfig from '../use-config';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';


const CPSuscResultsContext = React.createContext();


function usePrepareQuery({infectedVarName, skip}) {
  const {config, isPending} = useConfig();
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const joinClause = [];
      const params = {};

      if (!skip && !isPending) {
        addColumns.push("'conv-plasma' AS rx_type");
        addColumns.push("subject_species");
        addColumns.push('RXCP.infected_iso_name');
        addColumns.push(`
          CASE
            WHEN INFECTED_VAR.as_wildtype IS TRUE THEN 'Wild Type'
            ELSE INFECTED_VAR.var_name
          END AS infected_var_name
        `);
        addColumns.push('RXCP.timing');
        const betweens = config.monthRanges
          .map(({name, between: [begin, end]}, idx) => {
            let cond;
            if (begin === null || begin === undefined) {
              cond = `RxCP.timing <= $end${idx}`;
              params[`$end${idx}`] = end;
            }
            else if (end === null || end === undefined) {
              cond = `RxCP.timing >= $begin${idx}`;
              params[`$begin${idx}`] = begin;
            }
            else {
              cond = `RxCP.timing BETWEEN $begin${idx} AND $end${idx}`;
              params[`$begin${idx}`] = begin;
              params[`$end${idx}`] = end;
            }
            params[`$name${idx}`] = name;
            return `WHEN ${cond} THEN $name${idx}`;
          });
        addColumns.push(`
          CASE ${betweens.join(' ')}
          ELSE NULL
          END AS timing_range
        `);
        addColumns.push('RXCP.severity');

        if (infectedVarName) {
          if (infectedVarName === 'Wild Type') {
            where.push(`
              EXISTS (
                SELECT 1 FROM isolates ISO, variants VAR
                WHERE
                  RXCP.infected_iso_name = ISO.iso_name AND
                  ISO.var_name = VAR.var_name AND
                  VAR.as_wildtype IS TRUE
              )
            `);
          }
          else if (infectedVarName !== 'any') {
            where.push(`
              EXISTS (
                SELECT 1 FROM isolates ISO
                WHERE
                  RXCP.infected_iso_name = ISO.iso_name AND
                  ISO.var_name = $infectedVarName
              )
          `);
          }
          params.$infectedVarName = infectedVarName;
        }

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            S.ref_name = RXCP.ref_name AND
            S.rx_name = RXCP.rx_name
          LEFT JOIN subjects SUB ON
            RXCP.ref_name = SUB.ref_name AND
            RXCP.subject_name = SUB.subject_name
          LEFT JOIN isolates INFECTED_ISO ON
            INFECTED_ISO.iso_name = RXCP.infected_iso_name
          LEFT JOIN variants INFECTED_VAR ON
            INFECTED_ISO.var_name = INFECTED_VAR.var_name
        `);
      }
      return {addColumns, where, joinClause, params};
    },
    [skip, isPending, config, infectedVarName]
  );

}


CPSuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


export function CPSuscResultsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
      genePos,
      infectedVarName
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.vaccine;
  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({infectedVarName, skip});
  const contextValue = useSuscResults({
    refName,
    isoAggkey,
    varName,
    genePos,
    addColumns,
    joinClause,
    where,
    params,
    skip
  });

  return <CPSuscResultsContext.Provider value={contextValue}>
    {children}
  </CPSuscResultsContext.Provider>;
}


export default function useCPSuscResults() {
  return React.useContext(CPSuscResultsContext);
}
