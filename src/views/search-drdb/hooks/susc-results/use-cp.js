import React from 'react';
import PropTypes from 'prop-types';
import useConfig from '../use-config';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';


const CPSuscResultsContext = React.createContext();


function usePrepareQuery({infectedVarName, infected, month, host, skip}) {
  const {config, isPending} = useConfig();
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const joinClause = [];
      const params = {};

      if (!skip && !isPending) {
        addColumns.push("subject_species");
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
                SELECT 1 FROM variants VAR
                WHERE
                  RXCP.infected_var_name = VAR.var_name AND
                  VAR.as_wildtype IS TRUE
              )
            `);
          }
          else if (infectedVarName !== 'any') {
            where.push(`
              RXCP.infected_var_name = $infectedVarName
          `);
          }
          params.$infectedVarName = infectedVarName;
        }
        if (infected.includes('yes')) {
          where.push(`RXCP.infected_var_name IS NOT NULL`);
        }
        else if (infected.includes('no')) {
          where.push(`RXCP.infected_var_name IS NULL`);
        }

        if (month && month.length > 0) {
          const monRanges = config.monthRanges
            .filter(({name}) => month.includes(name)) || [];
          const orConds = [];
          for (const [
            idx,
            {between: [begin, end] = []}
          ] of monRanges.entries()) {
            if (begin === null || begin === undefined) {
              orConds.push(`RxCP.timing <= $timingEnd${idx}`);
            }
            else if (end === null || end === undefined) {
              orConds.push(`RxCP.timing >= $timingBegin${idx}`);
            }
            else {
              orConds.push(
                `RxCP.timing BETWEEN $timingBegin${idx} AND $timingEnd${idx}`
              );
            }
            params[`$timingBegin${idx}`] = begin;
            params[`$timingEnd${idx}`] = end;
          }
          if (orConds.length > 0) {
            where.push('(' + orConds.join(') OR (') + ')');
          }
        }

        if (host.includes('human')) {
          where.push("subject_species = 'Human'");
        }
        else if (host.includes('animal')) {
          where.push(`
            subject_species IS NOT NULL AND subject_species != 'Human'
          `);
        }

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            RXCP.rowid = (
              SELECT rowid FROM rx_conv_plasma RXCP2
              WHERE
                S.ref_name = RXCP2.ref_name AND
                (
                  S.rx_name = RXCP2.rx_name OR
                  EXISTS (
                    SELECT 1 FROM
                      unlinked_susc_results USR
                    WHERE
                      S.ref_name = USR.ref_name AND
                      S.rx_group = USR.rx_group AND
                      USR.rx_name = RXCP2.rx_name
                  )
                )
              ORDER BY rowid
              LIMIT 1
            )
          LEFT JOIN subjects SUB ON
            RXCP.ref_name = SUB.ref_name AND
            RXCP.subject_name = SUB.subject_name
          LEFT JOIN variants INFECTED_VAR ON
            RXCP.infected_var_name = INFECTED_VAR.var_name
        `);
      }
      return {addColumns, where, joinClause, params};
    },
    [skip, isPending, config, infectedVarName, infected, month, host]
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
      infectedVarName,
      infected,
      month,
      host
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.vaccine;
  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({infectedVarName, infected, month, host, skip});
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
