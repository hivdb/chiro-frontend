import React from 'react';
import {useRouter} from 'found';
import pluralize from 'pluralize';

import InlineLoader
  from 'icosa/components/inline-loader';
import SimpleTable from 'icosa/components/simple-table';


import InVitroMutations from '../../hooks/invitro-mutations';
import LocationParams from '../../hooks/location-params';

import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'section',
    'treatment',
    'mutations'
  ],
  labels: {
    treatment: 'Antibodies',
    mutations: 'Emerging Mutations'
  },
  rowSpanKeyGetter: {
    refName: r => (
      `${r.refName}$$${r.rxType}$$` +
      JSON.stringify(r.abNames)
    ),
    section: r => (
      `${r.refName}$$${r.section}$$${r.rxType}$$` +
      JSON.stringify(r.abNames)
    ),
    treatment: r => (
      `${r.refName}$$${r.rxType}$$` +
      JSON.stringify(r.abNames)
    )
  },
  multiCells: ['mutations']
};

export default function InVitroMutationsTable() {
  let {columns, labels, rowSpanKeyGetter, multiCells} = tableConfig;

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
  const origColumnDefs = useColumnDefs({
    columns,
    labels
  });
  const columnDefs = React.useMemo(
    () => origColumnDefs.map(colDef => {
      if (multiCells.includes(colDef.name)) {
        colDef.multiCells = true;
      }
      if (colDef.name in rowSpanKeyGetter) {
        colDef.rowSpanKeyGetter = rowSpanKeyGetter[colDef.name];
      }
      return colDef;
    }),
    [multiCells, rowSpanKeyGetter, origColumnDefs]
  );

  if (isPending) {
    return <InlineLoader />;
  }

  if (inVitroMuts.length === 0) {
    return <>
      <div>
        No in-vitro selection data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }
  const numExps = inVitroMuts.length;
  const numStudies = Object.keys(inVitroMuts.reduce(
    (acc, {refName}) => {
      acc[refName] = 1;
      return acc;
    },
    {}
  )).length;

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
        {pluralize('experiment', numExps, false)}
        {' in '}
        <strong>{numStudies.toLocaleString('en-US')}</strong>{' '}
        {pluralize('publication', numStudies, false)}
      </em>.
    </div>
    <div ref={tableCtlRef} className={style['invitro-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       windowScroll
       className={style['invitro-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={inVitroMuts} />
    </div>
  </>;
}
