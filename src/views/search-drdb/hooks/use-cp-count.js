import useQuery from './use-query';


export default function useCPCount({
  skip = false
} = {}) {
  const sql = `
    SELECT
      count as susc_result_count
    FROM conv_plasma_stats
    WHERE stat_group='susc_results'
  `;
  const {
    payload,
    isPending
  } = useQuery({sql, skip});

  if (isPending) {
    return {
      cpSuscResultCount: 0,
      isPending
    };
  }
  else {
    return {
      cpSuscResultCount: payload[0].suscResultCount,
      isPending
    };
  }
}
