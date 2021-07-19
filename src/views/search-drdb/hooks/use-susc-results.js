import React from 'react';
import range from 'lodash/range';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import uniqWith from 'lodash/uniqWith';

import useQuery from './use-query';
import useIsolates from './use-isolates';
import {useCompareSuscResultsByIsolate} from './use-compare-susc-results';


export function getSuscResultUniqKey(suscResult) {
  const {
    refName,
    rxName,
    controlIsoName,
    isoName,
    ordinalNumber
  } = suscResult;
  return [
    refName,
    rxName,
    controlIsoName,
    isoName,
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


const RANGE_DELETIONS = [{
  gene: 'S',
  posStart: 69,
  posEnd: 70
}, {
  gene: 'S',
  posStart: 141,
  posEnd: 146
}, {
  gene: 'S',
  posStart: 242,
  posEnd: 247
}];


const getQueryMutations = memoize(
  mutations => {
    const queryMuts = mutations.filter(
      ({gene}) => gene === 'S'
    ).map(
      mut => {
        if (mut.aminoAcid === 'del') {
          const rangeDel = RANGE_DELETIONS.find(
            ({gene, posStart, posEnd}) => (
              mut.gene === gene &&
              mut.position >= posStart &&
              mut.position <= posEnd
            )
          );
          if (rangeDel) {
            const {gene, posStart, posEnd} = rangeDel;
            return range(posStart, posEnd + 1).map(
              position => ({
                gene: gene,
                position,
                aminoAcid: 'del'
              })
            );
          }
        }
        return [mut];
      }
    );
    return uniqWith(queryMuts, isEqual);
  },
  payload => JSON.stringify(payload)
);

export {getQueryMutations};


function usePrepareQuery({
  skip,
  refName,
  mutations,
  mutationMatch,
  varName,
  addColumns,
  joinClause,
  addWhere,
  addParams
}) {
  const queryMuts = getQueryMutations(mutations);
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

        if (queryMuts && queryMuts.length > 0) {
          const excludeMutQuery = [
            // constantly allow 614G
            `NOT (M.gene = 'S' AND M.position = 614 AND M.amino_acid = 'G')`,
            // constantly allow non-S
            `M.gene='S'`
          ];
          const allMutQuery = [];
          for (
            const [idx, mutgroup] of
            queryMuts.entries()
          ) {
            const mutQuery = [];
            for (
              const [jdx, {gene, position, aminoAcid}] of
              mutgroup.entries()
            ) {
              mutQuery.push(`
                M.gene = $gene${idx}_${jdx} AND
                M.position = $pos${idx}_${jdx} AND
                M.amino_acid = $aa${idx}_${jdx}
              `);
              params[`$gene${idx}_${jdx}`] = gene;
              params[`$pos${idx}_${jdx}`] = position;
              params[`$aa${idx}_${jdx}`] = aminoAcid;
            }
            allMutQuery.push(mutQuery.join(' OR '));
          }
          if (mutationMatch === 'all') {
            for (const mutQuery of allMutQuery) {
              where.push(`
                EXISTS (
                  SELECT 1
                  FROM isolate_mutations M
                  WHERE
                    S.iso_name = M.iso_name AND
                    (${mutQuery})
                )
              `);
              excludeMutQuery.push(`NOT (${mutQuery})`);
            }
            where.push(`
              NOT EXISTS (
                SELECT 1
                FROM isolate_mutations M
                WHERE
                  S.iso_name = M.iso_name AND
                  (${excludeMutQuery.join(' AND ')})
              )
            `);
          }
          else {
            where.push(`
              EXISTS (
                SELECT 1
                FROM isolate_mutations M
                WHERE
                  S.iso_name = M.iso_name AND
                  (${allMutQuery.join(' OR ')})
              )
            `);
          }
        }
        else if (varName) {
          where.push(`
            EXISTS (
              SELECT 1
              FROM isolates VV
              WHERE
                S.iso_name = VV.iso_name AND
                VV.var_name = $varName
            )
          `);
          params.$varName = varName;
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
          S.control_iso_name,
          S.iso_name,
          S.ordinal_number,
          S.section,
          S.potency_type,
          S.control_potency,
          S.potency,
          S.potency_unit,
          S.fold_cmp,
          S.fold,
          S.resistance_level as fb_resistance_level,
          S.ineffective,
          S.cumulative_count,
          S.assay_name
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
      queryMuts,
      mutationMatch,
      varName,
      addColumns,
      joinClause,
      addWhere,
      addParams
    ]
  );
}


export default function useSuscResults({
  refName,
  mutations,
  mutationMatch,
  varName = null,
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
    mutations,
    mutationMatch,
    varName,
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
    isolateLookup,
    isPending: isIsolatePending
  } = useIsolates({
    skip: skip || isPending
  });

  const compareByIsolates = useCompareSuscResultsByIsolate(isolateLookup);

  let suscResults;
  let suscResultLookup = {};

  if (!skip && !isPending && !isIsolatePending) {
    suscResults = payload.map(sr => ({
      ...sr,
      resistanceLevel: calcResistanceLevel(sr),
    }));

    suscResults.sort((srA, srB) => {
      let cmp = addCompareSuscResults(srA, srB);
      if (cmp) { return cmp; }

      cmp = compareByIsolates(srA, srB);
      if (cmp) { return cmp; }

      const assayA = srA.assayName !== 'authentic virus';
      const assayB = srB.assayName !== 'authentic virus';
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
    isPending: isPending || isIsolatePending
  };
}
