import React from 'react';
import {useRouter} from 'found';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';


import DMSMutations from '../../hooks/dms-mutations';
import LocationParams from '../../hooks/location-params';

import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'abNames',
    'mutation',
    'escapeScore',
    'ace2Binding',
    'expression',
    'ace2Contact'
  ],
  labels: {}
};

export default function DMSMutationsTable() {
  let {columns, labels} = tableConfig;

  const {
    params: {
      refName,
      varName,
      isoAggkey,
      abNames
    }
  } = LocationParams.useMe();
  const tableCtlRef = React.useRef();

  const {router} = useRouter();
  const handleGoBack = React.useCallback(
    e => {
      e && e.preventDefault();
      router.go(-1);
    },
    [router]
  );

  const {dmsMuts, isPending} = DMSMutations.useMe();
  const columnDefs = useColumnDefs({
    columns,
    labels
  });


  if (isPending) {
    return <InlineLoader />;
  }

  if (dmsMuts.length === 0) {
    return <>
      <div>
        No deep mutational scanning data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }

  const cacheKey = JSON.stringify({
    refName,
    varName,
    isoAggkey,
    abNames
  });
  return <>
    <div><em>
      Mutations with an escape score <strong>≥0.1</strong> and a global
      prevalence <strong>≥0.001%</strong>.
    </em></div>
    <div ref={tableCtlRef} className={style['dms-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       className={style['dms-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={dmsMuts} />
    </div>
  </>;
}
