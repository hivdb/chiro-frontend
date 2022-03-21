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
    'subjectAge',
    'immuneStatus',
    'infectedVarName',
    'infectionDate',
    'treatments',
    'infectionTiming',
    'mutations'
  ],
  labels: {
    'infectedVarName': 'Infection Variant'
  },
  rowSpanKeyGetter: {
    subjectName: r => `${r.refName}$$${r.subjectName}`,
    subjectAge: r => `${r.refName}$$${r.subjectName}`,
    immuneStatus: r => `${r.refName}$$${r.subjectName}`,
    infectedVarName: r => (
      `${r.refName}$$${r.subjectName}$$${r.infectedVarName}`
    ),
    infectionDate: r => (
      `${r.refName}$$${r.subjectName}$$` +
      new Date(r.infectionDate).getFullYear()
    )
  },
  multiCells: [
    'treatments',
    'infectionTiming',
    'mutations'
  ]
};


function uniqTreatments(treatments) {
  const uniq = {};
  for (const {
    rxType,
    rxName,
    abNames
  } of treatments) {
    let abs;
    const rx = {rxType, rxName, abNames};
    switch (rxType) {
      case 'antibody':
        abs = abNames.join('+');
        uniq[abs] = rx;
        break;
      case 'conv-plasma':
        uniq.$cp = rx;
        break;
      case 'vacc-plasma':
        uniq.$vp = rx;
        break;
      default:
        uniq[rxName] = rx;
        break;
    }
  }
  return Object.values(uniq);
}


function groupMutationsByTreatments(inVivoSbjs) {
  const rxRows = [];
  for (const sbjRow of inVivoSbjs) {
    const rxMutsMap = {};
    const rxSoFarMap = {};
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
        const uniqRx = uniqTreatments(rxSoFar);
        const uniqRxKey = JSON.stringify(uniqRx);
        if (!(uniqRxKey in rxMutsMap)) {
          rxMutsMap[uniqRxKey] = [];
        }
        rxSoFarMap[uniqRxKey] = uniqRx;
        rxMutsMap[uniqRxKey] = [...rxMutsMap[uniqRxKey], ...rxMuts];
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
      const uniqRx = uniqTreatments(rxSoFar);
      const uniqRxKey = JSON.stringify(uniqRx);
      if (!(uniqRxKey in rxMutsMap)) {
        rxMutsMap[uniqRxKey] = [];
      }
      rxSoFarMap[uniqRxKey] = uniqRx;
      rxMutsMap[uniqRxKey] = [...rxMutsMap[uniqRxKey], ...rxMuts];
    }

    for (const uniqRxKey in rxSoFarMap) {
      const treatments = rxSoFarMap[uniqRxKey];
      const mutations = rxMutsMap[uniqRxKey];
      const infectionTiming = Math.max(
        ...mutations.map(({timing}) => timing)
      );
      rxRows.push({
        ...sbjRow,
        infectionTiming,
        treatments,
        mutations
      });
    }
  }
  return rxRows;
}


export default function InVivoMutationsTable() {
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
      if (colDef.name in rowSpanKeyGetter) {
        colDef.rowSpanKeyGetter = rowSpanKeyGetter[colDef.name];
      }
      return colDef;
    }),
    [origColumnDefs, multiCells, rowSpanKeyGetter]
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
  const numMuts = mutsByRx.reduce(
    (acc, {mutations}) => acc + mutations.length,
    0
  );

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
        {pluralize('result', numExps, false)}{', '}
        <strong>{numMuts.toLocaleString('en-US')}</strong>{' '}
        {pluralize('mutation', numMuts, false)}.
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
