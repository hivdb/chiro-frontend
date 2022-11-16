import React from 'react';
import {useQuery} from 'icosa/utils/sqlite3';


export default function useMAbAbbrs({
  drdbVersion
}) {
  const {
    payload,
    isPending
  } = useQuery({
    sql: `SELECT drug_name, abbreviation_name FROM compounds`,
    dbVersion: drdbVersion,
    dbName: 'covid-drdb'
  });

  const lookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      return payload.reduce((acc, {
        drugName,
        abbreviationName
      }) => {
        acc[drugName] = abbreviationName || drugName;
        return acc;
      }, {});
    },
    [isPending, payload]
  );
  return [lookup, isPending];
}
