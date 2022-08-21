import {useQuery as useQueryWithDBParams} from 'icosa/utils/sqlite3';

import useConfig from './use-config';


export default function useQuery({sql, params, skip = false, camel = true}) {
  const {config, isPending: isConfigPending} = useConfig();
  const {drdbVersion: dbVersion} = config || {};
  const {payload, isPending} = useQueryWithDBParams({
    sql,
    params,
    dbVersion,
    dbName: 'covid-drdb',
    skip: skip || isConfigPending,
    camel
  });
  if (!skip && isConfigPending) {
    return {isPending: true};
  }
  return {payload, isPending};
}
