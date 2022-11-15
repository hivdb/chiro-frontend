import React from 'react';

import useQuery from '../use-query';
import Isolates from '../isolates';
import {useCompareSuscResultsByIsolate} from './use-compare';
import useUnlinkedSuscResults, {
  getUnlinkedControlPotencyUniqKey,
  getUnlinkedPotencyUniqKey
} from './use-unlinked-susc-results';

const SEP = '$#\u0008#$';

export function getSuscResultUniqKey({
  refName,
  rxGroup,
  controlIsoName,
  isoName,
  potencyType,
  assayName
}) {
  return [
    refName,
    rxGroup,
    controlIsoName,
    isoName,
    potencyType,
    assayName
  ].join(SEP);
}


const PARTIAL_RESIST_FOLD = 5;
const RESIST_FOLD = 25;

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
  isoAggkey,
  genePos,
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
      const myJoinClause = [
        `LEFT JOIN isolates ctliso ON
          S.control_iso_name = ctliso.iso_name`,
        `LEFT JOIN variants ctlvar ON
          ctliso.var_name = ctlvar.var_name`,
        `LEFT JOIN isolates expiso ON
          S.iso_name = expiso.iso_name`,
        `JOIN isolate_pairs pair ON
          pair.gene = 'S' AND
          S.control_iso_name = pair.control_iso_name AND
          S.iso_name = pair.iso_name`
      ];
      const where = [];
      const params = {};

      if (!skip) {
        if (refName) {
          where.push(`
            S.ref_name = $refName
          `);
          params.$refName = refName;
        }

        if (isoAggkey) {
          where.push(`
            pair.iso_aggkey = $isoAggkey
          `);
          params.$isoAggkey = isoAggkey;
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
        else if (genePos) {
          where.push(`
            pair.iso_aggkey LIKE $genePos
          `);
          params.$genePos = `${genePos}_`;
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
          S.rx_group,
          S.rx_type,
          S.control_iso_name,
          CASE
            WHEN ctlvar.as_wildtype IS TRUE THEN 'Wild Type'
            ELSE ctliso.var_name
          END AS control_var_name,
          ctliso.var_name AS raw_control_var_name,
          S.iso_name,
          expiso.var_name AS var_name,
          pair.iso_aggkey,
          pair.num_mutations,
          CASE
            WHEN expiso.var_name IS NOT NULL THEN expiso.var_name
            ELSE pair.iso_aggkey
          END var_name_or_iso_aggkey,
          S.section,
          S.potency_type,
          S.control_potency,
          S.potency,
          CASE
            WHEN S.potency_unit IS NOT NULL THEN S.potency_unit
            WHEN S.potency_type LIKE 'IC%' THEN 'ng/ml'
            ELSE NULL
          END potency_unit,
          S.fold_cmp,
          S.fold,
          S.resistance_level as fb_resistance_level,
          S.ineffective,
          S.control_cumulative_count,
          S.cumulative_count,
          S.control_assay_name,
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
      addColumns,
      skip,
      addWhere,
      addParams,
      joinClause,
      refName,
      isoAggkey,
      varName,
      genePos
    ]
  );
}


export default function useSuscResults({
  refName,
  isoAggkey,
  genePos,
  varName = null,
  skip = false,
  ...options
}) {
  const addColumns = React.useMemo(
    () => options.addColumns || [],
    [options.addColumns]
  );
  const joinClause = React.useMemo(
    () => options.joinClause || [],
    [options.joinClause]
  );
  const addWhere = React.useMemo(
    () => options.where || [],
    [options.where]
  );
  const addParams = React.useMemo(
    () => options.params || [],
    [options.params]
  );
  const addCompareSuscResults = React.useMemo(
    () => options.addCompareSuscResults || (() => 0),
    [options.addCompareSuscResults]
  );

  const {sql, params} = usePrepareQuery({
    skip,
    refName,
    isoAggkey,
    genePos,
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
    unlinkedSuscResults,
    isPending: isUSRPending
  } = useUnlinkedSuscResults({
    suscResults: payload,
    skip: skip || isPending
  });

  const {
    isolateLookup,
    isPending: isIsolatePending
  } = Isolates.useMe();

  const compareByIsolates = useCompareSuscResultsByIsolate(isolateLookup);

  const [suscResults, suscResultLookup] = React.useMemo(
    () => {
      let suscResults = [];
      let suscResultLookup = {};

      if (!skip && !isPending && !isUSRPending && !isIsolatePending) {
        suscResults = payload.map(sr => {
          const row = {
            ...sr,
            uniqKey: getSuscResultUniqKey(sr),
            resistanceLevel: calcResistanceLevel(sr),
            unlinkedControlPotency: null,
            unlinkedPotency: null
          };
          if (sr.rxName === null) {
            row.unlinkedControlPotency = unlinkedSuscResults[
              getUnlinkedControlPotencyUniqKey(sr)
            ];
            row.unlinkedPotency = unlinkedSuscResults[
              getUnlinkedPotencyUniqKey(sr)
            ];
          }
          return row;
        });

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
            acc[sr.uniqKey] = sr;
            return acc;
          },
          {}
        );
      }
      return [suscResults, suscResultLookup];
    },
    [
      addCompareSuscResults,
      compareByIsolates,
      isIsolatePending,
      isPending,
      isUSRPending,
      payload,
      skip,
      unlinkedSuscResults
    ]
  );

  return {
    suscResults,
    suscResultLookup,
    isPending: isPending || isUSRPending || isIsolatePending
  };
}
