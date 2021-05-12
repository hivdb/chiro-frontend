import useQuery from './use-query';


export default function useVariants({
  skip = false
} = {}) {

  const sql = `
    SELECT var_name, count as susc_result_count
    FROM variant_stats
    WHERE stat_group='susc_results'
    ORDER BY count DESC
  `;

  const {
    payload: variants,
    isPending
  } = useQuery({sql, skip});

  return {
    variants,
    isPending
  };
}
