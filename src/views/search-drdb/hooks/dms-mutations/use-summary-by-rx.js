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
      where.push(`
        EXISTS (
          SELECT 1 FROM rx_antibodies RXMAB
          WHERE
            RXMAB.ref_name = M.ref_name AND
            RXMAB.rx_name = M.rx_name
        )
      `);

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
          COUNT(*) AS count
        FROM dms_escape_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY ab_names
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
