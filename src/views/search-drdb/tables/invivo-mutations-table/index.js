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
    'subjectName',
    'immuneStatus',
    'severity',
    'infectedVarName',
    'treatments',
    'mutations'
  ],
  labels: {
    'infectedVarName': 'Infection',
    'countTotal': '# Samples'
  },
  multiCells: [
    'immuneStatus',
    'severity',
    'infectedVarName',
    'treatments',
    'mutations'
  ]
};


function groupMutationsByTreatments(inVivoSbjs) {
  const rxRows = [];
  for (const sbjRow of inVivoSbjs) {
    const rxSoFar = [];
    let prevStartDate = new Date(sbjRow.infectionDate);
    for (const rx of sbjRow.treatments) {
      const startDate = new Date(rx.startDate);
      const rxMuts = [];
      for (const mut of sbjRow.mutations) {
        const appearDate = new Date(mut.appearanceDate);
        if (appearDate > prevStartDate && appearDate <= startDate) {
          rxMuts.push(mut);
        }
      }
      if (rxMuts.length > 0) {
        rxRows.push({
          ...sbjRow,
          treatments: [...rxSoFar],
          mutations: rxMuts
        });
      }
      rxSoFar.push(rx);
      prevStartDate = startDate;
    }

    const rxMuts = [];
    for (const mut of sbjRow.mutations) {
      const appearDate = new Date(mut.appearanceDate);
      if (appearDate > prevStartDate) {
        rxMuts.push(mut);
      }
    }
    if (rxMuts.length > 0) {
      rxRows.push({
        ...sbjRow,
        treatments: [],
        mutations: rxMuts
      });
    }
  }
  return rxRows;
}


export default function InVivoMutationsTable() {
  let {columns, labels, multiCells} = tableConfig;

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

  const {inVivoSbjs, isPending} = InVivoMutations.useMe();
  const origColumnDefs = useColumnDefs({
    columns,
    labels
  });
  const columnDefs = React.useMemo(
    () => origColumnDefs.map(colDef => {
      if (multiCells.includes(colDef.name)) {
        colDef.multiCells = true;
      }
      return colDef;
    }),
    [origColumnDefs, multiCells]
  );

  const mutsByRx = React.useMemo(
    () => isPending ? [] : groupMutationsByTreatments(inVivoSbjs),
    [isPending, inVivoSbjs]
  );

  if (isPending) {
    return <InlineLoader />;
  }

  if (mutsByRx.length === 0) {
    return <>
      <div>
        No in-vivo selection data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }

  const numExps = mutsByRx.length;

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
       data={mutsByRx} />
    </div>
  </>;
}
