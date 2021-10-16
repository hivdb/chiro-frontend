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
          usr.ref_name = $refName${idx} AND
          usr.rx_group = $rxGroup${idx} AND
          usr.potency_type = $potType${idx} AND (
            (
              usr.iso_name = $isoName${idx} AND
              usr.assay_name = $assayName${idx}
            ) OR (
              usr.iso_name = $ctlIsoName${idx} AND
              usr.assay_name = $ctlAssayName${idx}
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
          usr.ref_name,
          usr.rx_group,
          usr.rx_name,
          usr.potency_type,
          usr.iso_name,
          usr.assay_name,
          potency,
          cumulative_count,
          CASE WHEN CAST(usr.potency_type AS TEXT) LIKE 'NT%' THEN
            potency <= potency_lower_limit
          ELSE
            potency >= potency_upper_limit
          END AS ineffective
        FROM rx_potency pot, unlinked_susc_results usr
        WHERE
          usr.ref_name = pot.ref_name AND
          usr.rx_name = pot.rx_name AND
          usr.potency_type = pot.potency_type AND
          usr.iso_name = pot.iso_name AND
          usr.assay_name = pot.assay_name AND
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
