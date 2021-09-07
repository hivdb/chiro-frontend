import React from 'react';
import PropTypes from 'prop-types';
import useConfig from '../use-config';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';

const VPSuscResultsContext = React.createContext();


function usePrepareQuery({vaccineName, skip}) {
  const {config, isPending} = useConfig();
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];
      const where = [];
      const params = {};

      if (!skip && !isPending) {
        addColumns.push("'vacc-plasma' AS rx_type");
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
        `);

        if (vaccineName && vaccineName !== 'any') {
          where.push('RXVP.vaccine_name=$vaccineName');
        }
        params.$vaccineName = vaccineName;
      }
      return {addColumns, joinClause, where, params};
    },
    [isPending, config, skip, vaccineName]
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
      vaccineName
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.infectedVariant;
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
