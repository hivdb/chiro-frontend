import React from 'react';
import useQuery from '../use-query';
import LocationParams from '../location-params';

import {getMutations} from '../isolate-aggs';


function usePrepareQuery({abNames, infectedVarName, isoAggkey, genePos, skip}) {
  return React.useMemo(
    () => {
      if (skip) {
        return {};
      }

      const params = {};
      const where = [];
      const realAbNames = abNames.filter(n => n !== 'any');

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
      if (realAbNames && realAbNames.length > 0) {
        const excludeAbQuery = [];
        for (const [idx, abName] of realAbNames.entries()) {
          where.push(`
            EXISTS (
              SELECT 1 FROM rx_antibodies RXMAB
              WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name AND
              RXMAB.ab_name = $abName${idx}
            )
          `);
          params[`$abName${idx}`] = abName;
          excludeAbQuery.push(`$abName${idx}`);
        }
      }
      if (infectedVarName) {
        where.push(`
          EXISTS (
            SELECT 1 FROM rx_conv_plasma RXCP
              LEFT JOIN isolates INFISO
                ON RXCP.infected_iso_name = INFISO.iso_name
              LEFT JOIN variants INFVAR
                ON INFISO.var_name = INFVAR.var_name
              WHERE
                RXCP.ref_name = M.ref_name AND
                RXCP.rx_name = M.rx_name AND
                (
                  $infVarName = 'any' OR
                  ($infVarName = 'Wild Type' AND INFVAR.as_wildtype IS TRUE) OR
                  (INFISO.var_name = $infVarName)
                )
          )
        `);
        params.$infVarName = infectedVarName;
      }
      else if (abNames.some(n => n === 'any')) {
        where.push(`
          EXISTS (
            SELECT 1 FROM rx_antibodies RXMAB
            WHERE
              RXMAB.ref_name = M.ref_name AND
              RXMAB.rx_name = M.rx_name
          )
        `);
      }

      if (where.length === 0) {
        where.push('true');
      }

      const sql = `
        SELECT
          M.ref_name,
          COUNT(*) AS count
        FROM invitro_selection_results M
        WHERE
          (${where.join(') AND (')})
        GROUP BY M.ref_name
      `;
      return {
        sql,
        params
      };
    },
    [abNames, infectedVarName, genePos, isoAggkey, skip]
  );
}

export default function useSummaryByArticle() {
  const {
    params: {
      isoAggkey,
      infectedVarName,
      genePos,
      abNames
    }
  } = LocationParams.useMe();
  const skip = false;
  const {
    sql,
    params
  } = usePrepareQuery({abNames, isoAggkey, infectedVarName, genePos, skip});

  const {
    payload,
    isPending
  } = useQuery({sql, params, skip});

  return [payload, skip || isPending];
}
