import React from 'react';
import useQuery from './use-query';


export default function useVaccines({
  skip = false
} = {}) {
  const sql = `
    SELECT vaccine_name, vaccine_type, priority
    FROM vaccines
    ORDER BY priority, vaccine_name
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
