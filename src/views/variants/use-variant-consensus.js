import {useQueryWithVersion} from '../../utils/covid-drdb';


export default function useVariantConsensus({varName, drdbVersion}) {
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
  } = useQueryWithVersion({
    sql,
    params: {$varName: varName},
    drdbVersion
  });

  return [payload, isPending];
}
