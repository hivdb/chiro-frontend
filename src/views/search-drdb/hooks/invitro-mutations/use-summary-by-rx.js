import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {getMutations} from '../isolate-aggs';

const LIST_JOIN_MAGIC_SEP = '$#\u0008#$';


function usePrepareQuery({refName, isoAggkey, genePos, skip}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {$joinSep: LIST_JOIN_MAGIC_SEP};
      const where = [];

      if (refName) {
        where.push(`
          M.ref_name = $refName
        `);
        params.$refName = refName;
      }
      if (isoAggkey) {
        const conds = [];
        for (const [
          idx,
          {gene, position: pos, aminoAcid: aa}
        ] of getMutations(isoAggkey).entries()) {
          conds.push(`(
            M.gene = $gene${idx} AND
            M.position = $pos${idx} AND
            M.amino_acid = $aa${idx}
          )`);
          params[`$gene${idx}`] = gene;
          params[`$pos${idx}`] = pos;
          params[`$aa${idx}`] = aa;
        }
        where.push(conds.join(' OR '));
      }
      else if (genePos) {
        const [gene, pos] = genePos.split(':');
        where.push(`M.gene = $gene AND M.position = $pos`);
        params.$gene = gene;
        params.$pos = Number.parseInt(pos);
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          (
            SELECT GROUP_CONCAT(RXMAB.ab_name, $joinSep)
            FROM rx_antibodies RXMAB, antibodies MAB
            WHERE
              M.ref_name = RXMAB.ref_name AND
              M.rx_name = RXMAB.rx_name AND
              RXMAB.ab_name = MAB.ab_name
            ORDER BY MAB.priority, RXMAB.ab_name
          ) AS ab_names,
          CASE
            WHEN INFVAR.as_wildtype IS TRUE THEN 'Wild Type'
            ELSE INFVAR.var_name
          END AS infected_var_name,
          COUNT(*) AS count
        FROM invitro_selection_results M
          LEFT JOIN rx_conv_plasma RXCP ON
            RXCP.ref_name = M.ref_name AND
            RXCP.rx_name = M.rx_name
          LEFT JOIN isolates INFISO ON
            RXCP.infected_iso_name = INFISO.iso_name
          LEFT JOIN variants INFVAR ON
            INFISO.var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY ab_names, infected_var_name
      `;
      return {
        sql,
        params
      };
    },
    [genePos, isoAggkey, refName, skip]
  );
}

export default function useSummaryByRx() {
  const {
    params: {
      refName,
      isoAggkey,
      genePos
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({refName, isoAggkey, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  const abSplitted = React.useMemo(
    () => {
      if (skip || isPending) {
        return [];
      }
      return payload.map(
        one => {
          one.abNames = (
            one.abNames ? one.abNames.split(LIST_JOIN_MAGIC_SEP) : []
          );
          return one;
        }
      );
    },
    [isPending, payload, skip]
  );

  return [abSplitted, skip || isPending];
}
