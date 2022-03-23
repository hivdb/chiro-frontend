import React from 'react';
import pluralize from 'pluralize';

import InlineLoader
  from 'sierra-frontend/dist/components/inline-loader';
import SimpleTable from 'sierra-frontend/dist/components/simple-table';

import {groupByIsolates} from './funcs';
import {useGoBack} from './hooks';

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
    'waningMutations'
  ],
  labels: {
    infectedVarName: 'Infection Variant',
    mutations: 'Emerging Mutations',
    waningMutations: 'Waning Mutations',
    treatments: 'Monoclonal Antibody'
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
    treatments: r => (
      `${r.refName}$$${r.subjectName}$$` +
      JSON.stringify(r.treatments)
    )
  },
  multiCells: [
    'infectionTiming',
    'mutations',
    'waningMutations'
  ]
};


export default function InVivoIndivSbjTable() {
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

  const handleGoBack = useGoBack();

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

  const {inVivoSbjs, isPending} = InVivoMutations.useMe();
  const inVivoSbjsFiltered = React.useMemo(
    () => inVivoSbjs
      .filter(
        ({numSubjects, subjectSpecies}) => (
          numSubjects === 1 &&
          subjectSpecies === 'Human'
        )
      )
      .map(
        sbj => ({
          ...sbj,
          treatments: sbj.treatments.filter(
            ({rxType}) => rxType === 'antibody'
          )
        })
      ),
    [inVivoSbjs]
  );

  const MutsByIso = React.useMemo(
    () => isPending ? [] : groupByIsolates(inVivoSbjsFiltered),
    [isPending, inVivoSbjsFiltered]
  );

  if (isPending) {
    return <InlineLoader />;
  }

  if (MutsByIso.length === 0) {
    return <>
      <div>
        No in-vivo selection data is found for this request.
        (<a href="#back" onClick={handleGoBack}>Go back</a>)
      </div>
    </>;
  }

  const numSbjs = inVivoSbjsFiltered.reduce(
    (acc, {numSubjects}) => acc + numSubjects,
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
        <strong>{numSbjs.toLocaleString('en-US')}</strong>{' '}
        {pluralize('patient', numSbjs, false)}.
      </em>
    </div>
    <div ref={tableCtlRef} className={style['invivo-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       className={style['invivo-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={MutsByIso} />
    </div>
  </>;
}
