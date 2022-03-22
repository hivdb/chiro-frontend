import React from 'react';
import {useRouter} from 'found';
import pluralize from 'pluralize';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import {consecutiveGroupsBy} from 'sierra-frontend/dist/utils/array-groups';


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
    'mutations',
    'emergentMutations'
  ],
  labels: {
    'infectedVarName': 'Infection Variant'
  },
  rowSpanKeyGetter: {
    refName: r => `${r.refName}$$${r.subjectName}`,
    subjectName: r => `${r.refName}$$${r.subjectName}`,
    subjectAge: r => `${r.refName}$$${r.subjectName}`,
    immuneStatus: r => `${r.refName}$$${r.subjectName}`,
    infectedVarName: r => (
      `${r.refName}$$${r.subjectName}$$${r.infectedVarName}`
    ),
    infectionDate: r => (
      `${r.refName}$$${r.subjectName}$$` +
      new Date(r.infectionDate).getFullYear()
    ),
    treatments: r => JSON.stringify(r.treatments)
  },
  multiCells: [
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


function groupByIsolates(inVivoSbjs) {
  const isoRows = [];
  for (const {isolates, ...sbjRow} of inVivoSbjs) {
    for (const iso of isolates) {
      const isoDate = new Date(iso.isolateDate);
      const isoMuts = iso.mutations.map(
        m => `${m.gene}:${m.position}${m.aminoAcid}`
      );
      const treatments = sbjRow.treatments.filter(
        ({startDate}) => new Date(startDate) < isoDate
      );
      const mutations = sbjRow.mutations.filter(
        m => isoMuts.includes(`${m.gene}:${m.position}${m.aminoAcid}`)
      );
      isoRows.push({
        ...sbjRow,
        infectionTiming: iso.timing,
        treatments: uniqTreatments(treatments),
        mutations: iso.mutations,
        emergentMutations: mutations
      });
    }
  }

  // remove duplicated isolates
  return Array.from(consecutiveGroupsBy(
    isoRows,
    (left, right) => (
      left.refName === right.refName &&
      left.subjectName === right.subjectName &&
      left.infectedVarName === right.infectedVarName &&
      left.infectionDate === right.infectionDate &&
      JSON.stringify(left.treatments) ===
      JSON.stringify(right.treatments) &&
      JSON.stringify(left.mutations) ===
      JSON.stringify(right.mutations)
    )
  )).map(group => {
    const [{
      refName,
      subjectName,
      subjectSpecies,
      subjectAge,
      immuneStatus,
      infectedVarName,
      infectionDate,
      treatments,
      mutations,
      emergentMutations
    }] = group;
    const minTiming = Math.min(...group.map(
      ({infectionTiming}) => infectionTiming
    ));
    const maxTiming = Math.max(...group.map(
      ({infectionTiming}) => infectionTiming
    ));
    return {
      refName,
      subjectName,
      subjectSpecies,
      subjectAge,
      immuneStatus,
      infectedVarName,
      infectionDate,
      treatments,
      infectionTiming: [minTiming, maxTiming],
      mutations,
      emergentMutations
    };
  });
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
    () => isPending ? [] : groupByIsolates(inVivoSbjs),
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
