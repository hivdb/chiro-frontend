import React from 'react';
import useQuery from './use-query';
import useVirusVariants from './use-virus-variants';
import {useCompareSuscResultsByVariant} from './use-compare-susc-results';


export function getSuscResultUniqKey(suscResult) {
  const {
    refName,
    rxName,
    controlVariantName,
    variantName,
    ordinalNumber
  } = suscResult;
  return [
    refName,
    rxName,
    controlVariantName,
    variantName,
    ordinalNumber
  ].join('$#\u0008#$');
}


const PARTIAL_RESIST_FOLD = 3;
const RESIST_FOLD = 10;

function calcResistanceLevel({
  fbResistanceLevel,
  ineffective,
  foldCmp,
  fold,
  cumulativeCount
}) {
  if (fbResistanceLevel === null) {
    if (
      ineffective !== null && (
        ineffective === "both" ||
        ineffective === "control"
      )
    ) {
      return "undetermined";
    }
    if (foldCmp === "<") {
      if (fold <= PARTIAL_RESIST_FOLD) {
        return "susceptible";
      }
      else if (fold <= RESIST_FOLD) {
        return "lt-resistant";
      }
      else {
        return "undetermined";
      }
    }
    else if (foldCmp === ">") {
      if (fold >= RESIST_FOLD) {
        return "resistant";
      }
      else if (fold >= PARTIAL_RESIST_FOLD) {
        return "gt-partial-resistance";
      }
      else {
        return "undetermined";
      }
    }
    else if (cumulativeCount === 1) {
      if (fold < PARTIAL_RESIST_FOLD) {
        return "susceptible";
      }
      else if (fold < RESIST_FOLD) {
        return "partial-resistance";
      }
      else {
        return "resistant";
      }
    }
    else {
      return "undetermined";
    }
  }
  else {
    return fbResistanceLevel;
  }
}


function usePrepareQuery({
  skip,
  refName,
  spikeMutations,
  mutationMatch,
  addColumns,
  joinClause,
  addWhere,
  addParams
}) {
  return React.useMemo(
    () => {
      const addColumnText = (
        addColumns.length > 0 ?
          `, ${addColumns.join(', ')}` : ''
      );
      const where = [];
      const params = {};

      if (!skip) {
        if (refName) {
          where.push(`
            S.ref_name = $refName
          `);
          params.$refName = refName;
        }

        if (spikeMutations && spikeMutations.length > 0) {
          const excludeMutQuery = [
            // constantly allow 614G
            `NOT (M.position = 614 AND M.amino_acid = 'G')`
          ];
          if (mutationMatch === 'all') {
            for (
              const [idx, {position, aminoAcid}] of
              spikeMutations.entries()
            ) {
              where.push(`
                EXISTS (
                  SELECT 1
                  FROM variant_mutations M
                  WHERE
                    S.variant_name = M.variant_name AND
                    M.gene = 'S' AND
                    M.position = $pos${idx} AND
                    M.amino_acid = $aa${idx}
                )
              `);
              excludeMutQuery.push(`NOT (
                M.position = $pos${idx} AND
                M.amino_acid = $aa${idx}
              )`);

              params[`$pos${idx}`] = position;
              params[`$aa${idx}`] = aminoAcid;
            }
            where.push(`
              NOT EXISTS (
                SELECT 1
                FROM variant_mutations M
                WHERE
                  S.variant_name = M.variant_name AND
                  M.gene = 'S' AND
                  (${excludeMutQuery.join(' AND ')})
              )
            `);
          }
          else {
            const includeMutQuery = [];
            for (
              const [idx, {position, aminoAcid}] of
              spikeMutations.entries()
            ) {
              includeMutQuery.push(`
                M.position = $pos${idx} AND
                M.amino_acid = $aa${idx}
              `);
              params[`$pos${idx}`] = position;
              params[`$aa${idx}`] = aminoAcid;
            }
            where.push(`
              EXISTS (
                SELECT 1
                FROM variant_mutations M
                WHERE
                  S.variant_name = M.variant_name AND
                  M.gene = 'S' AND
                  (${includeMutQuery.join(' OR ')})
              )
            `);
          }
        }
      }

      const combinedWhere = [...where, ...addWhere];
      const combinedParams = {...params, ...addParams};

      if (combinedWhere.length === 0) {
        combinedWhere.push('true');
      }

      const sql = `
        SELECT
          S.ref_name,
          S.rx_name,
          S.control_variant_name,
          S.variant_name,
          S.ordinal_number,
          S.section,
          S.fold_cmp,
          S.fold,
          S.resistance_level as fb_resistance_level,
          S.ineffective,
          S.cumulative_count,
          S.assay
          ${addColumnText}
        FROM susc_results S
        ${joinClause.join(' ')}
        WHERE
          (${combinedWhere.join(') AND (')}) AND
          (ineffective == 'experimental' OR ineffective IS NULL)
      `;

      return {sql, params: combinedParams};
    },
    [
      skip,
      refName,
      spikeMutations,
      mutationMatch,
      addColumns,
      joinClause,
      addWhere,
      addParams
    ]
  );
}


export default function useSuscResults({
  refName,
  spikeMutations,
  mutationMatch,
  addColumns = [],
  joinClause = [],
  where: addWhere = [],
  params: addParams = {},
  addCompareSuscResults = () => 0,
  skip = false
}) {
  const {sql, params} = usePrepareQuery({
    skip,
    refName,
    spikeMutations,
    mutationMatch,
    addColumns,
    joinClause,
    addWhere,
    addParams
  });
  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const {
    variantLookup,
    isPending: isVariantPending
  } = useVirusVariants({
    skip: skip || isPending
  });

  const compareByVariants = useCompareSuscResultsByVariant(variantLookup);

  let suscResults;
  let suscResultLookup = {};

  if (!skip && !isPending && !isVariantPending) {
    suscResults = payload.map(sr => ({
      ...sr,
      resistanceLevel: calcResistanceLevel(sr),
    }));

    suscResults.sort((srA, srB) => {
      let cmp = addCompareSuscResults(srA, srB);
      if (cmp) { return cmp; }

      cmp = compareByVariants(srA, srB);
      if (cmp) { return cmp; }

      const assayA = srA.assay !== 'authentic virus';
      const assayB = srB.assay !== 'authentic virus';
      return assayA - assayB;
    });

    suscResultLookup = suscResults.reduce(
      (acc, sr) => {
        const key = getSuscResultUniqKey(sr);
        acc[key] = sr;
        return acc;
      },
      {}
    );
  }

  return {
    suscResults,
    suscResultLookup,
    isPending: isPending || isVariantPending
  };
}
