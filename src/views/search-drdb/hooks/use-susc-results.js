import useQuery from './use-query';


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



export default function useSuscResults({
  refName,
  spikeMutations,
  addColumns = [],
  joinClause = [],
  where: addWhere = [],
  params: addParams = {},
  skip = false
}) {
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
      for (const [idx, {position, aminoAcid}] of spikeMutations.entries()) {
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
  }

  const combinedWhere = [...where, ...addWhere];
  const combinedParams = {...params, ...addParams};

  if (combinedWhere.length === 0) {
    combinedWhere.push('false');
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
  const {
    payload,
    isPending
  } = useQuery({sql, params: combinedParams, skip});

  let suscResults;
  let suscResultLookup = {};
  if (!skip && !isPending) {
    suscResults = payload.map(sr => ({
      ...sr,
      resistanceLevel: calcResistanceLevel(sr),
    }));
    suscResultLookup = suscResults.reduce(
      (acc, sr) => {
        const key = getSuscResultUniqKey(sr);
        acc[key] = sr;
        return acc;
      },
      {}
    );
  }

  return {suscResults, suscResultLookup, isPending};
}
