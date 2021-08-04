import React from 'react';

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


function usePrepareQuery({
  skip,
  refName,
  mutationText,
  varName,
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
      const myJoinClause = [];
      const where = [];
      const params = {};

      if (!skip) {
        if (refName) {
          where.push(`
            S.ref_name = $refName
          `);
          params.$refName = refName;
        }

        if (mutationText) {
          myJoinClause.push(`
            JOIN isolate_pairs pair ON
              S.control_iso_name = pair.control_iso_name AND
              S.iso_name = pair.iso_name
          `);
          where.push(`
            pair.iso_aggkey = $isoAggkey
          `);
          params.$isoAggkey = mutationText;
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
          S.rx_name || S.control_iso_name || S.iso_name ||
            S.ref_name || S.potency_type || S.assay_name AS uniq_key,
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
        ${myJoinClause.join(' ')}
        ${joinClause.join(' ')}
        WHERE
          (${combinedWhere.join(') AND (')}) -- AND
          -- (ineffective == 'experimental' OR ineffective IS NULL)
      `;

      return {sql, params: combinedParams};
    },
    [
      skip,
      refName,
      mutationText,
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
  mutationText,
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
    mutationText,
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
