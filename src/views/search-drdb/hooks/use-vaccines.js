import React from 'react';
import useQuery from './use-query';


export default function useVaccines({
  skip = false
} = {}) {
  const sql = `
    SELECT
      V.vaccine_name,
      vaccine_type,
      priority,
      VStat.count AS susc_result_count
    FROM vaccines V JOIN vaccine_stats VStat ON
      V.vaccine_name=VStat.vaccine_name AND
      VStat.stat_group='susc_results'
    ORDER BY priority, V.vaccine_name
  `;
  const {
    payload: vaccines,
    isPending
  } = useQuery({sql, skip});

  const vaccineLookup = React.useMemo(
    () => skip || isPending || !vaccines ? {} : vaccines.reduce(
      (acc, vacc) => {
        acc[vacc.vaccineName] = vacc;
        return acc;
      },
      {}
    ),
    [skip, isPending, vaccines]
  );

  return {
    vaccines,
    vaccineLookup,
    isPending: isPending
  };
}
