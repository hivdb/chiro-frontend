import React from 'react';
import {useQuery} from 'icosa/utils/sqlite3';


export default function useVariantConsensus({
  varName,
  parentVarName,
  drdbVersion: dbVersion
}) {
  const [sql, params] = React.useMemo(
    () => {
      if (parentVarName) {
        return [`
          SELECT * FROM (
            SELECT
            C.gene,
            CASE
              WHEN P.amino_acid IS NULL THEN R.amino_acid
              ELSE P.amino_acid
            END AS ref_amino_acid,
            C.position,
            C.amino_acid,
            FALSE AS is_back_mutation
            FROM ref_amino_acid R, variant_consensus C
              LEFT JOIN variant_consensus P ON
                C.gene = P.gene AND
                C.position = P.position AND
                P.var_name = $parentVarName
            WHERE
              C.var_name = $varName AND
              C.gene = R.gene AND
              C.position = R.position AND
              (
                P.amino_acid IS NULL OR
                P.amino_acid != C.amino_acid
              )
            UNION
            SELECT
            P.gene,
            P.amino_acid ref_amino_acid,
            P.position,
            CASE
              WHEN C.amino_acid IS NULL THEN R.amino_acid
              ELSE C.amino_acid
            END AS amino_acid,
            C.amino_acid IS NULL AS is_back_mutation
            FROM ref_amino_acid R, variant_consensus P
              LEFT JOIN variant_consensus C ON
                C.gene = P.gene AND
                C.position = P.position AND
                C.var_name = $varName
            WHERE
              P.var_name = $parentVarName AND
              P.gene = R.gene AND
              P.position = R.position AND
              (
                C.amino_acid IS NULL OR
                P.amino_acid != C.amino_acid
              )
          ) AS tmp
          ORDER BY gene, position, amino_acid
        `, {$varName: varName, $parentVarName: parentVarName}];
      }
      else {
        return [`
          SELECT
          C.gene,
          R.amino_acid ref_amino_acid,
          C.position,
          C.amino_acid,
          FALSE AS is_back_mutation
          FROM variant_consensus C, ref_amino_acid R
          WHERE
            C.var_name = $varName AND
            C.gene = R.gene AND
            C.position = R.position
          ORDER BY C.gene, C.position, C.amino_acid
        `, {$varName: varName}];
      }
    },
    [parentVarName, varName]
  );

  const {
    payload,
    isPending
  } = useQuery({
    sql,
    params,
    dbVersion,
    dbName: 'covid-drdb'
  });

  const mutations = React.useMemo(
    () => {
      if (isPending) {
        return [];
      }
      return payload.map(mut => ({
        ...mut,
        isBackMutation: !!mut.isBackMutation
      }));
    },
    [payload, isPending]
  );

  return [mutations, isPending];
}
