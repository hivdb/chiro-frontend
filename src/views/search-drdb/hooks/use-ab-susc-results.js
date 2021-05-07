import React from 'react';
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

      if (!skip) {
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

        if (abNames && abNames.length > 0) {
          rxAbFiltered = true;
          const excludeAbQuery = [];
          for (const [idx, abName] of abNames.entries()) {
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
          /* where.push(`
            NOT EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
              RXMAB.ref_name = S.ref_name AND
              RXMAB.rx_name = S.rx_name AND
              RXMAB.ab_name NOT IN (${excludeAbQuery.join(', ')})
            )
          `); */
        }

        else {
          rxAbFiltered = true;
          where.push(`
            EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB, antibodies MAB
              WHERE
                RXMAB.ref_name = S.ref_name AND
                RXMAB.rx_name = S.rx_name AND
                RXMAB.ab_name = MAB.ab_name AND
                MAB.visibility = 1
            )
          `);
          where.push(`
            NOT EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB, antibodies MAB
              WHERE
                RXMAB.ref_name = S.ref_name AND
                RXMAB.rx_name = S.rx_name AND
                RXMAB.ab_name = MAB.ab_name AND
                MAB.visibility = 0
            )
          `);
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


export default function useAntibodySuscResults({
  refName,
  mutations,
  mutationMatch,
  variantName,
  abNames,
  skip = false
}) {
  const {
    addColumns,
    where,
    params
  } = usePrepareQuery({abNames, skip});

  const {
    antibodyLookup,
    isPending: isAbLookupPending
  } = useAntibodies({
    skip
  });

  const addCompareSuscResults = useCompareSuscResultsByAntibodies(
    antibodyLookup
  );

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    mutations,
    mutationMatch,
    variantName,
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
