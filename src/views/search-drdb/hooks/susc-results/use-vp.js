import React from 'react';
import PropTypes from 'prop-types';
import useConfig from '../use-config';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';

const VPSuscResultsContext = React.createContext();


function usePrepareQuery({vaccineName, infected, month, dosage, host, skip}) {
  const {config, isPending} = useConfig();
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];
      const where = [];
      const params = {};

      if (!skip && !isPending) {
        addColumns.push('subject_species');
        addColumns.push('infected_iso_name');
        addColumns.push(`
          CASE
            WHEN INFECTED_VAR.as_wildtype IS TRUE THEN 'Wild Type'
            ELSE INFECTED_VAR.var_name
          END AS infected_var_name
        `);
        addColumns.push('vaccine_name');
        addColumns.push('timing');
        const betweens = config.monthRanges
          .map(({name, between: [begin, end]}, idx) => {
            let cond;
            if (begin === null || begin === undefined) {
              cond = `timing <= $end${idx}`;
              params[`$end${idx}`] = end;
            }
            else if (end === null || end === undefined) {
              cond = `timing >= $begin${idx}`;
              params[`$begin${idx}`] = begin;
            }
            else {
              cond = `timing BETWEEN $begin${idx} AND $end${idx}`;
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
        addColumns.push('dosage');

        joinClause.push(`
          JOIN rx_vacc_plasma RXVP ON
            RXVP.rowid = (
              SELECT rowid FROM rx_vacc_plasma RXVP2
              WHERE
                S.ref_name = RXVP2.ref_name AND
                (
                  S.rx_name = RXVP2.rx_name OR
                  EXISTS (
                    SELECT 1 FROM
                      unlinked_susc_results USR
                    WHERE
                      S.ref_name = USR.ref_name AND
                      S.rx_group = USR.rx_group AND
                      USR.rx_name = RXVP2.rx_name
                  )
                )
              ORDER BY rowid
              LIMIT 1
            )
          LEFT JOIN subjects SUB ON
            RXVP.ref_name = SUB.ref_name AND
            RXVP.subject_name = SUB.subject_name
          LEFT JOIN isolates INFECTED_ISO ON
            INFECTED_ISO.iso_name = RXVP.infected_iso_name
          LEFT JOIN variants INFECTED_VAR ON
            INFECTED_ISO.var_name = INFECTED_VAR.var_name
        `);

        if (vaccineName && vaccineName !== 'any') {
          where.push('RXVP.vaccine_name=$vaccineName');
        }

        if (infected.includes('yes')) {
          where.push(`RXVP.infected_iso_name IS NOT NULL`);
        }
        else if (infected.includes('no')) {
          where.push(`RXVP.infected_iso_name IS NULL`);
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
              orConds.push(`RxVP.timing <= $timingEnd${idx}`);
            }
            else if (end === null || end === undefined) {
              orConds.push(`RxVP.timing >= $timingBegin${idx}`);
            }
            else {
              orConds.push(
                `RxVP.timing BETWEEN $timingBegin${idx} AND $timingEnd${idx}`
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

        if (dosage && dosage.length > 0) {
          const orConds = [];
          for (const dose of dosage) {
            if (['1', '2', '3'].includes(dose)) {
              orConds.push(`dosage = ${Number.parseInt(dose, 10)}`);
            }
          }
          where.push(orConds.join(' OR '));
        }

        params.$vaccineName = vaccineName;
      }
      return {addColumns, joinClause, where, params};
    },
    [isPending, config, skip, vaccineName, infected, month, dosage, host]
  );
}


VPSuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


export function VPSuscResultsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
      genePos,
      vaccineName,
      infected,
      month,
      host,
      dosage
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.infectedVariant;
  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({vaccineName, infected, month, dosage, host, skip});

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
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

  const contextValue = {suscResults, suscResultLookup, isPending};

  return <VPSuscResultsContext.Provider value={contextValue}>
    {children}
  </VPSuscResultsContext.Provider>;
}


export default function useVPSuscResults() {
  return React.useContext(VPSuscResultsContext);
}
