import React from 'react';
import {useRouter} from 'found';
import pluralize from 'pluralize';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';


import InVivoMutations from '../../hooks/invivo-mutations';
import LocationParams from '../../hooks/location-params';

import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'subjectSpecies',
    'infectedVarName',
    'treatments',
    'severity',
    'countTotal',
    'mutation'
  ],
  labels: {
    'infectedVarName': 'Infection',
    'timing': 'Months since Infection',
    'countTotal': '# Samples'
  }
};

export default function InVivoMutationsTable() {
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

  const {inVivoMuts, isPending} = InVivoMutations.useMe();
  const columnDefs = useColumnDefs({
    columns,
    labels
  });


  if (isPending) {
    return <InlineLoader />;
  }

  if (inVivoMuts.length === 0) {
    return <>
      <div>
        No in-vivo selection data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }

  const numExps = inVivoMuts.length;

  const cacheKey = JSON.stringify({
    refName,
    varName,
    isoAggkey,
    abNames
  });
  return <>
    <div>
      <em>
        <strong>{numExps.toLocaleString('en-US')}</strong>{' '}
        {pluralize('result', numExps, false)}.
      </em>
    </div>
    <div ref={tableCtlRef} className={style['invivo-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       className={style['invivo-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={inVivoMuts} />
    </div>
  </>;
}
