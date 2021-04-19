import React from 'react';

import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import {useQuery, useConfig} from '../../utils/drdb';


export default function SearchDRDB() {
  
  const statement = "SELECT * FROM antibodies";

  const {config} = useConfig();
  const {payload, isPending} = useQuery(statement, config);

  if (isPending) {
    return <FixedLoader />;
  }

  return <pre>
    {JSON.stringify(payload, null, '  ')}
  </pre>;

}
