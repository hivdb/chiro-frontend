import React from 'react';
import {useQuery} from 'icosa/utils/sqlite3';


export default function useMAbAbbrs({
  drdbVersion
}) {
  const {
    payload,
    isPending
  } = useQuery({
    sql: `SELECT ab_name, abbreviation_name FROM antibodies`,
    dbVersion: drdbVersion,
    dbName: 'covid-drdb'
  });

  const lookup = React.useMemo(
    () => {
      if (isPending) {
        return {};
      }
      return payload.reduce((acc, {
        abName,
        abbreviationName
      }) => {
        acc[abName] = abbreviationName || abName;
        return acc;
      }, {});
    },
    [isPending, payload]
  );
  return [lookup, isPending];
}
