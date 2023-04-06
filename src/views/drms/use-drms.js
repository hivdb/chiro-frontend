import React from 'react';
import {useQuery} from 'icosa/utils/sqlite3';


export default function useDRMs({
  drdbVersion,
  gene,
  minPrevalence = null,
  posStart = null,
  posEnd = null
}) {
  const [sql, refSql, params] = React.useMemo(
    () => {
      const conds = [`drm.gene = $gene`];
      const params = {$gene: gene};
      if (minPrevalence) {
        params.$minPrevalence = minPrevalence;
        conds.push(`(
          drm.amino_acid IN ('ins', 'del') OR
          EXISTS(
            SELECT 1 FROM resistance_mutation_attributes drm2
            WHERE
              drm.gene = drm2.gene AND
              drm.position = drm2.position AND
              drm.amino_acid = drm2.amino_acid AND
              drm2.col_name = 'PREVALENCE' AND
              CAST(drm2.col_value AS DECIMAL) >= $minPrevalence
          )
        )`);
      }
      if (posStart !== null) {
        params.$posStart = posStart;
        conds.push(`drm.position >= $posStart`);
      }
      if (posEnd !== null) {
        params.$posEnd = posEnd;
        conds.push(`drm.position >= $posEnd`);
      }
      return [`
        SELECT
          drm.gene,
          drm.position,
          drm.amino_acid,
          ref.amino_acid AS ref_amino_acid,
          col_name,
          col_value
        FROM resistance_mutation_attributes drm
          JOIN ref_amino_acid ref ON
            drm.gene = ref.gene AND
            drm.position = ref.position
        WHERE
          ${conds.join(' AND ')}
        ORDER BY
          drm.position,
          drm.amino_acid
      `, `
        SELECT
          gene,
          position,
          amino_acid,
          ref_name,
          col_type
        FROM resistance_mutation_articles drm
        WHERE
          ${conds.join(' AND ')}
        ORDER BY
          position,
          amino_acid,
          ref_name,
          col_type
      `, params];
    },
    [gene, minPrevalence, posStart, posEnd]
  );

  const {
    payload,
    isPending
  } = useQuery({
    sql,
    params,
    dbVersion: drdbVersion,
    dbName: 'covid-drdb'
  });

  const {
    payload: refPayload,
    isPending: isRefPending
  } = useQuery({
    sql: refSql,
    params,
    dbVersion: drdbVersion,
    dbName: 'covid-drdb'
  });

  const mutations = React.useMemo(
    () => {
      if (isPending || isRefPending) {
        return [];
      }
      const refLookup = {};
      for (const ref of refPayload) {
        const key = `${ref.gene}:${ref.position}${ref.aminoAcid}`;
        refLookup[key] = refLookup[key] || {};
        refLookup[key][ref.colType] = refLookup[key][ref.colType] || [];
        refLookup[key][ref.colType].push(ref.refName);
      }
      return Object.values(payload.reduce((acc, {
        gene,
        refAminoAcid,
        position,
        aminoAcid,
        colName,
        colValue
      }) => {
        const key = `${gene}:${position}${aminoAcid}`;
        const mutText = `${refAminoAcid}${position}${aminoAcid}`;
        if (!(mutText in acc)) {
          acc[mutText] = {
            text: mutText,
            refAminoAcid,
            position,
            aminoAcid,
            footnotes: refLookup[key] || []
          };
        }
        acc[mutText][colName] = Number.parseFloat(colValue);
        return acc;
      }, {}));
    },
    [payload, refPayload, isPending, isRefPending]
  );

  return [mutations, isPending];
}
