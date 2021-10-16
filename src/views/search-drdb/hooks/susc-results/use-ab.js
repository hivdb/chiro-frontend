import React from 'react';
import PropTypes from 'prop-types';
import Antibodies from '../antibodies';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';
import {useCompareSuscResultsByAntibodies} from './use-compare';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';

const AbSuscResultsContext = React.createContext();


function usePrepareQuery({abNames, skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const params = {};
      const realAbNames = abNames.filter(n => n !== 'any');

      if (!skip) {
        addColumns.push("'antibody' AS rx_type");
        addColumns.push(
          `(
            SELECT GROUP_CONCAT(MAB.ab_name, $joinSep)
            FROM antibodies MAB
            WHERE
              EXISTS (
                SELECT 1 FROM rx_antibodies RXMAB WHERE
                  S.ref_name = RXMAB.ref_name AND
                  RXMAB.ab_name = MAB.ab_name AND (
                    S.rx_name = RXMAB.rx_name OR
                    EXISTS (
                      SELECT 1 FROM unlinked_susc_results USR WHERE
                      S.ref_name = USR.ref_name AND
                      S.rx_group = USR.rx_group AND
                      USR.rx_name = RXMAB.rx_name
                    )
                  )
              )
            ORDER BY MAB.priority, MAB.ab_name
          ) AS ab_names`
        );

        params.$joinSep = LIST_JOIN_MAGIC_SEP;
        let rxAbFiltered = false;

        if (realAbNames && realAbNames.length > 0) {
          rxAbFiltered = true;
          const excludeAbQuery = [];
          for (const [idx, abName] of realAbNames.entries()) {
            where.push(`
              EXISTS (
                SELECT 1 FROM rx_antibodies RXMAB
                WHERE
                RXMAB.ref_name = S.ref_name AND
                RXMAB.ab_name = $abName${idx} AND (
                  S.rx_name = RXMAB.rx_name OR
                  EXISTS (
                    SELECT 1 FROM unlinked_susc_results USR WHERE
                    S.ref_name = USR.ref_name AND
                    S.rx_group = USR.rx_group AND
                    USR.rx_name = RXMAB.rx_name
                  )
                )
              )
            `);
            params[`$abName${idx}`] = abName;
            excludeAbQuery.push(`$abName${idx}`);
          }
        }

        if (!rxAbFiltered) {
          where.push(`
            EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
                RXMAB.ref_name = S.ref_name AND (
                  S.rx_name = RXMAB.rx_name OR
                  EXISTS (
                    SELECT 1 FROM unlinked_susc_results USR WHERE
                    S.ref_name = USR.ref_name AND
                    S.rx_group = USR.rx_group AND
                    USR.rx_name = RXMAB.rx_name
                  )
                )
            )
          `);
        }

      }
      return {
        addColumns,
        where,
        params
      };
    },
    [abNames, skip]
  );
}

AbSuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


export function AbSuscResultsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
      genePos,
      abNames
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.vaccine || filterFlag.infectedVariant;
  const {
    addColumns,
    where,
    params
  } = usePrepareQuery({abNames, skip});

  const {
    antibodyLookup,
    isPending: isAbLookupPending
  } = Antibodies.useAll();

  const addCompareSuscResults = useCompareSuscResultsByAntibodies(
    antibodyLookup
  );

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    isoAggkey,
    genePos,
    varName,
    addColumns,
    where,
    params,
    addCompareSuscResults,
    skip: skip || isAbLookupPending
  });

  const cleanedSuscResults = React.useMemo(
    () => {
      if (!skip && !isAbLookupPending && !isPending && suscResults) {
        return suscResults.map(
          suscResult => {
            const cleanedSuscResult = {...suscResult};
            cleanedSuscResult.abNames =
              suscResult.abNames.split(LIST_JOIN_MAGIC_SEP);
            return cleanedSuscResult;
          }
        );
      }
      return [];
    },
    [isAbLookupPending, isPending, skip, suscResults]
  );

  const contextValue = {
    suscResults: cleanedSuscResults,
    suscResultLookup,
    isPending: isPending || isAbLookupPending
  };

  return <AbSuscResultsContext.Provider value={contextValue}>
    {children}
  </AbSuscResultsContext.Provider>;
}

export default function useAbSuscResults() {
  return React.useContext(AbSuscResultsContext);
}
