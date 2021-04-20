import useSuscResults from './use-susc-results';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


export default function useAntibodySuscResults({
  refName,
  spikeMutations,
  abNames,
  antibodyVisibility = true,
  skip = false
}) {
  const addColumns = [];
  const where = [];
  const params = {};

  if (!skip) {
    addColumns.push(
      `(
        SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
        FROM rx_antibodies RXMAB
        WHERE
          S.ref_name = RXMAB.ref_name AND
          S.rx_name = RXMAB.rx_name
        ORDER BY RXMAB.ab_name
      ) AS ab_names`
    );

    params.$joinSep = LIST_JOIN_MAGIC_SEP;
    let rxAbFiltered = false;

    if (abNames && abNames.length > 0) {
      rxAbFiltered = true;
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
      }
    }

    if (antibodyVisibility === true || antibodyVisibility === false) {
      rxAbFiltered = true;
      where.push(`
        EXISTS (
          SELECT 1 FROM rx_antibodies RXMAB, antibodies MAB
          WHERE
            RXMAB.ref_name = S.ref_name AND
            RXMAB.rx_name = S.rx_name AND
            RXMAB.ab_name = MAB.ab_name AND
            MAB.visibility = $abVisibility
        )
      `);
      params.$abVisibility = + antibodyVisibility; // covert bool to int
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

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    spikeMutations,
    addColumns,
    where,
    params,
    skip
  });

  if (!skip && !isPending && suscResults) {
    for (const suscResult of suscResults) {
      suscResult.abNames = suscResult.abNames.split(LIST_JOIN_MAGIC_SEP);
    }
  }

  return {suscResults, suscResultLookup, isPending};
}
