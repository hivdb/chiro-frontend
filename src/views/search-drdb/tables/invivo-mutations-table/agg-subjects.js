import React from 'react';
import pluralize from 'pluralize';

import {H3} from 'icosa/components/heading-tags';
import InlineLoader
  from 'icosa/components/inline-loader';
import SimpleTable from 'icosa/components/simple-table';

import {groupByIsolates} from './funcs';

import InVivoMutations from '../../hooks/invivo-mutations';
import LocationParams from '../../hooks/location-params';

import useColumnDefs from '../column-defs';

import style from './style.module.scss';

const tableConfig = {
  columns: [
    'refName',
    'subjectName',
    'numSubjects',
    'immuneStatus',
    'infectedVarName',
    'infectionDate',
    'treatments',
    'infectionTiming',
    'mutations'
  ],
  labels: {
    subjectName: 'Patients',
    infectedVarName: 'Infection Variant',
    mutations: 'Emerging Spike Mutations',
    treatments: 'Monoclonal Antibody'
  },
  rowSpanKeyGetter: {
    refName: r => `${r.refName}$$${r.subjectName}`,
    subjectName: r => `${r.refName}$$${r.subjectName}`,
    subjectAge: r => `${r.refName}$$${r.subjectName}`,
    numSubjects: r => `${r.refName}$$${r.subjectName}`,
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
    'mutations'
  ]
};


export default function InVivoAggSbjTable() {
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
          numSubjects > 1 &&
          subjectSpecies === 'Human'
        )
      )
      .map(
        sbj => ({
          ...sbj,
          isolates: sbj.isolates.some(
            ({mutations}) => mutations.some(({total}) => total > 1)
          ) ?
            sbj.isolates.filter(
              ({mutations}) => mutations.some(({isEmerging}) => isEmerging)
            ) : sbj.isolates,
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
    return null;
  }

  const numSbjs = inVivoSbjsFiltered.reduce(
    (acc, {numSubjects}) => acc + numSubjects,
    0
  );
  const numStudies = Object.keys(
    inVivoSbjsFiltered.reduce(
      (acc, {refName}) => {
        acc[refName] = 1;
        return acc;
      },
      {}
    )
  ).length;

  const cacheKey = JSON.stringify({
    refName,
    varName,
    isoAggkey,
    abNames
  });
  return <section className={style['invivo-section']}>
    <H3 className={style['stat-title']} id="invivo-mutations_agg">
      <strong>{numSbjs.toLocaleString('en-US')}</strong>{' '}
      {pluralize('patient', numSbjs, false)}{' in '}
      <strong>{numStudies.toLocaleString('en-US')}</strong>{' '}
      {pluralize('publication', numStudies, false)}{' '}
      reported in aggregate.
    </H3>
    <div ref={tableCtlRef} className={style['invivo-muts-table-control']}>
      <InlineLoader className={style['loader']} />
      <SimpleTable
       windowScroll
       className={style['invivo-muts-table']}
       columnDefs={columnDefs}
       cacheKey={cacheKey}
       data={MutsByIso} />
    </div>
  </section>;
}
