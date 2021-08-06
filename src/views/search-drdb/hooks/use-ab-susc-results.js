import React from 'react';
import LocationParams from './location-params';
import useSuscResults from './use-susc-results';
import useAntibodies from './use-antibodies';
import {useCompareSuscResultsByAntibodies} from './use-compare-susc-results';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


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
            SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
            FROM rx_antibodies RXMAB, antibodies MAB
            WHERE
              S.ref_name = RXMAB.ref_name AND
              S.rx_name = RXMAB.rx_name AND
              RXMAB.ab_name = MAB.ab_name
            ORDER BY MAB.priority, RXMAB.ab_name
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
                RXMAB.rx_name = S.rx_name AND
                RXMAB.ab_name = $abName${idx}
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
                RXMAB.ref_name = S.ref_name AND
                RXMAB.rx_name = S.rx_name
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


export default function useAntibodySuscResults() {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
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
  } = useAntibodies({skip});

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
    varName,
    addColumns,
    where,
    params,
    addCompareSuscResults,
    skip: skip || isAbLookupPending
  });

  if (!skip && !isAbLookupPending && !isPending && suscResults) {
    for (const suscResult of suscResults) {
      suscResult.abNames = suscResult.abNames.split(LIST_JOIN_MAGIC_SEP);
    }
  }

  return {
    suscResults,
    suscResultLookup,
    isPending: isPending || isAbLookupPending
  };
}
