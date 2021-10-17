import React from 'react';

import useQuery from '../use-query';

const SEP = '$#\u0008#$';


export function getUnlinkedControlPotencyUniqKey({
  refName,
  rxGroup,
  controlIsoName,
  potencyType,
  controlAssayName
}) {
  return [
    refName,
    rxGroup,
    controlIsoName,
    potencyType,
    controlAssayName
  ].join(SEP);
}

export function getUnlinkedPotencyUniqKey({
  refName,
  rxGroup,
  isoName,
  potencyType,
  assayName
}) {
  return [
    refName,
    rxGroup,
    isoName,
    potencyType,
    assayName
  ].join(SEP);
}


function usePrepareQuery({
  unlinkedSuscResults,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }
      const where = [];
      const params = {};
      for (const [idx, sr] of unlinkedSuscResults.entries()) {
        where.push(`(
          ref_name = $refName${idx} AND
          rx_group = $rxGroup${idx} AND
          potency_type = $potType${idx} AND (
            (
              iso_name = $isoName${idx} AND
              assay_name = $assayName${idx}
            ) OR (
              iso_name = $ctlIsoName${idx} AND
              assay_name = $ctlAssayName${idx}
            )
          )
        )`);
        params[`$refName${idx}`] = sr.refName;
        params[`$rxGroup${idx}`] = sr.rxGroup;
        params[`$potType${idx}`] = sr.potencyType;
        params[`$isoName${idx}`] = sr.isoName;
        params[`$ctlIsoName${idx}`] = sr.controlIsoName;
        params[`$assayName${idx}`] = sr.assayName;
        params[`$ctlAssayName${idx}`] = sr.controlAssayName;
      }
      const sql = `
        SELECT
          ref_name,
          rx_group,
          rx_name,
          potency_type,
          iso_name,
          assay_name,
          potency,
          cumulative_count,
          ineffective
        FROM unlinked_susc_results
        WHERE
          (${where.join(' OR ')})
      `;
      return {sql, params};
    },
    [skip, unlinkedSuscResults]
  );
}


export default function useUnlinkedSuscResults({
  suscResults,
  skip = false
}) {
  const unlinkedSuscResults = React.useMemo(
    () => {
      if (skip) {
        return [];
      }
      return suscResults
        .filter(({rxName}) => rxName === null);
    },
    [skip, suscResults]
  );
  const isEmpty = unlinkedSuscResults.length === 0;

  const {sql, params} = usePrepareQuery({
    unlinkedSuscResults,
    skip: skip || isEmpty
  });
  const {
    payload,
    isPending
  } = useQuery({sql, params, skip: skip || isEmpty});

  return React.useMemo(
    () => {
      if (skip || isPending || isEmpty) {
        return {
          unlinkedSuscResults: {},
          isPending: skip || !isEmpty
        };
      }
      return {
        unlinkedSuscResults: payload.reduce(
          (acc, usr) => {
            const uniqKey = getUnlinkedPotencyUniqKey(usr);
            acc[uniqKey] = acc[uniqKey] || [];
            acc[uniqKey].push({
              potency: usr.potency,
              cumulativeCount: usr.cumulativeCount,
              ineffective: !!usr.ineffective
            });
            return acc;
          },
          {}
        ),
        isPending: false
      };
    },
    [isEmpty, isPending, payload, skip]
  );
}
