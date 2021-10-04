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
        addColumns.push("'vacc-plasma' AS rx_type");
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
            S.ref_name = RXVP.ref_name AND
            S.rx_name = RXVP.rx_name
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

        if (infected === 'yes') {
          where.push(`RXVP.infected_iso_name IS NOT NULL`);
        }
        else if (infected === 'no') {
          where.push(`RXVP.infected_iso_name IS NULL`);
        }

        if (month) {
          const {between: [begin, end] = []} = config.monthRanges
            .find(({name}) => name === month) || {};
          let cond;
          if (begin === null || begin === undefined) {
            cond = `RxVP.timing <= $timingEnd`;
          }
          else if (end === null || end === undefined) {
            cond = `RxVP.timing >= $timingBegin`;
          }
          else {
            cond = `RxVP.timing BETWEEN $timingBegin AND $timingEnd`;
          }
          params.$timingBegin = begin;
          params.$timingEnd = end;
          where.push(cond);
        }

        if (host === 'human') {
          where.push("subject_species = 'Human'");
        }
        else if (host === 'animal') {
          where.push(`
            subject_species IS NOT NULL AND subject_species != 'Human'
          `);
        }

        if (['1', '2', '3'].includes(dosage)) {
          where.push('dosage = $dosage');
          params.$dosage = Number.parseInt(dosage, 10);
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
