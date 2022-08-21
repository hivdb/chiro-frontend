import {useQuery} from 'icosa/utils/sqlite3';


export default function useVariantConsensus({
  varName,
  drdbVersion: dbVersion
}) {
  const sql = `
    SELECT
    C.gene,
    R.amino_acid ref_amino_acid,
    C.position,
    C.amino_acid
    FROM variant_consensus C, ref_amino_acid R
    WHERE
      C.var_name = $varName AND
      C.gene = R.gene AND
      C.position = R.position
    ORDER BY C.gene, C.position, C.amino_acid
  `;

  const {
    payload,
    isPending
  } = useQuery({
    sql,
    params: {$varName: varName},
    dbVersion,
    dbName: 'covid-drdb'
  });

  return [payload, isPending];
}
