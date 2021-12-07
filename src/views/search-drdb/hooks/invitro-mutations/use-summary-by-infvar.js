import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {getMutations} from '../isolate-aggs';


function usePrepareQuery({
  refName,
  isoAggkey,
  genePos,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {};
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
          CASE
            WHEN INFVAR.as_wildtype IS TRUE THEN 'Wild Type'
            ELSE INFVAR.var_name
          END AS infected_var_name,
          COUNT(*) AS count
        FROM invitro_selection_results M
          JOIN rx_conv_plasma RXCP ON
            RXCP.ref_name = M.ref_name AND
            RXCP.rx_name = M.rx_name
          LEFT JOIN isolates INFISO ON
            RXCP.infected_iso_name = INFISO.iso_name
          LEFT JOIN variants INFVAR ON
            INFISO.var_name = INFVAR.var_name
        WHERE
          (${where.join(') AND (')})
        GROUP BY infected_var_name
      `;
      return {
        sql,
        params
      };
    },
    [genePos, isoAggkey, refName, skip]
  );
}


export default function useSummaryByInfVar() {
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
  } = usePrepareQuery({
    refName,
    isoAggkey,
    genePos,
    skip
  });

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
