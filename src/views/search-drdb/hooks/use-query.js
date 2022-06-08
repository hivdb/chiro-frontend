import {useQueryWithVersion} from '../../../utils/covid-drdb';

import useConfig from './use-config';


export default function useQuery({sql, params, skip = false, camel = true}) {
  const {config, isPending: isConfigPending} = useConfig();
  const {drdbVersion} = config || {};
  const {payload, isPending} = useQueryWithVersion(
    {sql, params, drdbVersion, skip: skip || isConfigPending, camel}
  );
  if (!skip && isConfigPending) {
    return {isPending: true};
  }
  return {payload, isPending};
}
