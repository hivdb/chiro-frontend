import React from 'react';
import sortBy from 'lodash/sortBy';
import {ColumnDef} from '../../../components/pivot-table';

import CellFold from './cell-fold';
import CellAssay from './cell-assay';
import CellPotency from './cell-potency';
import CellSection from './cell-section';
import CellIsolate from './cell-isolate';
import CellReference from './cell-reference';
import CellAntibodies from './cell-antibodies';
import CellRLevel from './cell-resistance-level';
import {
  useCompareSuscResultsByIsolate,
  useCompareSuscResultsByControlIsolate,
  useCompareSuscResultsByInfectedIsolate,
  useCompareSuscResultsByAntibodies
} from '../hooks';

import Articles from '../hooks/articles';
import Antibodies from '../hooks/antibodies';
import Isolates from '../hooks/isolates';


export function comparePotency(potA, potB) {
  if (potA.potencyType !== potB.potencyType) {
    return potA.potencyType.localeCompare(potB.potencyType);
  }
  if (potA.potencyUnit !== potB.potencyUnit) {
    return (potA.potencyUnit || '').localeCompare(potB.potencyUnit || '');
  }
  return aggPotency(potA.potency, potA) - aggPotency(potB.potency, potB);
}


function aggPotency(pot, {cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // geomean for potency
  for (let i = 0; i < pot.length; i ++) {
    if (pot[i] !== undefined && pot[i] !== null) {
      total += Math.log(pot[i]) * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.exp(total / sumN);
  }
}


function aggPotencySD(avgPot, {potency: pot, cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // geostdev for potency
  const logAvgPot = Math.log(avgPot);
  for (let i = 0; i < pot.length; i ++) {
    if (pot[i] !== undefined && pot[i] !== null) {
      total += (Math.log(pot[i]) - logAvgPot) ** 2 * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.exp(Math.sqrt(total / sumN));
  }
}

function aggFold(fold, {cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  // artmean for fold
  for (let i = 0; i < fold.length; i ++) {
    if (fold[i] !== undefined && fold[i] !== null) {
      total += fold[i] * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return total / sumN;
  }
}

function aggFoldSD(avgFold, {fold, cumulativeCount: n}) {
  let total = 0;
  let sumN = 0;
  for (let i = 0; i < fold.length; i ++) {
    if (fold[i] !== undefined && fold[i] !== null) {
      total += (fold[i] - avgFold) ** 2 * n[i];
      sumN += n[i];
    }
  }
  if (sumN) {
    return Math.sqrt(total / sumN);
  }
}


function buildColDefs({
  articleLookup,
  isolateLookup,
  antibodyLookup,
  compareByAntibodies,
  compareByIsolate,
  compareByControlIsolate,
  compareByInfectedIsolate,
  columns,
  labels = {}
}) {
  const lookup = {
    refName: new ColumnDef({
      name: 'refName',
      label: labels.refName || 'Reference',
      render: refName => (
        <CellReference
         refName={refName}
         displayName={articleLookup[refName].displayName} />
      )
    }),
    assayName: new ColumnDef({
      name: 'assayName',
      label: labels.assayName || 'Assay',
      render: assayName => (
        <CellAssay assayName={assayName} />
      )
    }),
    controlIsoName: new ColumnDef({
      name: 'controlIsoName',
      label: labels.controlIsoName || 'Control',
      render: (isoName, {
        controlPotency,
        potencyType,
        potencyUnit,
        ineffective,
        cumulativeCount
      }) => (
        <CellIsolate
         {...{
           isoName,
           potency: aggPotency(controlPotency, {cumulativeCount}),
           potencyType,
           potencyUnit,
           isolateLookup
         }}
         enablePotency
         ineffective={
           ineffective === 'control' ||
           ineffective === 'both'
         } />
      ),
      sort: rows => [...rows].sort(compareByControlIsolate)
    }),
    isoName: new ColumnDef({
      name: 'isoName',
      label: labels.isoName || 'Variant',
      render: (isoName) => (
        <CellIsolate {...{
          isoName,
          isolateLookup
        }} />
      ),
      sort: rows => [...rows].sort(compareByIsolate)
    }),
    potency: new ColumnDef({
      name: 'potency',
      label: labels.potency || 'Potency',
      aggFunc: aggPotency,
      render: (potency, {
        potencyUnit,
        potencyType,
        rxType,
        ...row
      }) => (
        <CellPotency
         potencyUnit={potencyUnit}
         potencyType={potencyType}
         rxType={rxType}
         stdev={aggPotencySD(potency, row)}
         potency={potency} />
      ),
      sort: rows => [...rows].sort(comparePotency)
    }),
    abNames: new ColumnDef({
      name: 'abNames',
      label: labels.abNames || 'Antibodies',
      render: abNames => <CellAntibodies {...{abNames, antibodyLookup}} />,
      sort: rows => [...rows].sort(compareByAntibodies)
    }),
    section: new ColumnDef({
      name: 'section',
      label: labels.section,
      render: section => <CellSection {...{section}} />
    }),
    cumulativeCount: new ColumnDef({
      name: 'cumulativeCount',
      label: labels.cumulativeCount || '# Samples',
      aggFunc: n => n.reduce((acc, nn) => acc + nn, 0)
    }),
    fold: new ColumnDef({
      name: 'fold',
      label: labels.fold,
      render: (fold, row) => (
        <CellFold fold={fold} stdev={aggFoldSD(fold, row)} />
      ),
      aggFunc: aggFold,
      sort: rows => sortBy(
        rows,
        [
          ({ineffective}) => (
            ineffective !== null && ineffective !== 'experimental'
          ),
          ({fold, cumulativeCount}) => aggFold(fold, {cumulativeCount})
        ]
      )
    }),
    vaccineName: new ColumnDef({
      name: 'vaccineName',
      label: labels.vaccineName || 'Vaccine'
    }),
    infectedIsoName: new ColumnDef({
      name: 'infectedIsoName',
      label: labels.infectedIsoName || 'Infection (CP)',
      render: isoName => (
        <CellIsolate {...{isoName, isolateLookup}} />
      ),
      sort: rows => [...rows].sort(compareByInfectedIsolate)
    }),
    timing: new ColumnDef({
      name: 'timing',
      label: labels.timing
    }),
    dosage: new ColumnDef({
      name: 'dosage',
      label: labels.dosage
    }),
    severity: new ColumnDef({
      name: 'severity',
      label: labels.severity
    }),
    resistanceLevel: new ColumnDef({
      name: 'resistanceLevel',
      label: labels.resistanceLevel,
      render: resistanceLevel => <CellRLevel rLevel={resistanceLevel} />
    })
  };
  return columns.map(name => lookup[name]).filter(cd => cd);
}


export default function useColumnDefs({
  columns,
  labels
}) {
  const {
    articleLookup,
    isPending: isRefLookupPending
  } = Articles.useMe();
  const {
    antibodyLookup,
    isPending: isAbLookupPending
  } = Antibodies.useAll();
  const {
    isolateLookup,
    isPending: isIsoLookupPending
  } = Isolates.useMe();

  const compareByAntibodies = (
    useCompareSuscResultsByAntibodies(antibodyLookup)
  );
  const compareByIsolate = (
    useCompareSuscResultsByIsolate(isolateLookup)
  );
  const compareByControlIsolate = (
    useCompareSuscResultsByControlIsolate(isolateLookup)
  );
  const compareByInfectedIsolate = (
    useCompareSuscResultsByInfectedIsolate(isolateLookup)
  );

  const isPending = (
    isRefLookupPending || isAbLookupPending || isIsoLookupPending
  );

  return React.useMemo(
    () => isPending ? [] : buildColDefs({
      articleLookup,
      antibodyLookup,
      isolateLookup,
      compareByAntibodies,
      compareByIsolate,
      compareByControlIsolate,
      compareByInfectedIsolate,
      columns,
      labels
    }),
    [
      isPending,
      articleLookup,
      antibodyLookup,
      isolateLookup,
      compareByAntibodies,
      compareByIsolate,
      compareByControlIsolate,
      compareByInfectedIsolate,
      columns,
      labels
    ]
  );
}
