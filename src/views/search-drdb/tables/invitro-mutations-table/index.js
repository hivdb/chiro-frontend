import React from 'react';
import {useRouter} from 'found';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';


import InVitroMutations from '../../hooks/invitro-mutations';
import LocationParams from '../../hooks/location-params';

import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'section',
    'abNames',
    'inVitroMut'
  ],
  labels: {}
};

export default function InVitroMutationsTable() {
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

  const {inVitroMuts, isPending} = InVitroMutations.useMe();
  const columnDefs = useColumnDefs({
    columns,
    labels
  });


  if (isPending) {
    return null;
  }

  if (inVitroMuts.length === 0) {
    return <>
      <div>
        No in-vitro selection data is found for this request.
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
    <br />
    <div ref={tableCtlRef} className={style['invitro-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       className={style['invitro-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={inVitroMuts} />
    </div>
  </>;
}
