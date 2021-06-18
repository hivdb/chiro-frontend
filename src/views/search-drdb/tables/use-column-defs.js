import React from 'react';
import sortBy from 'lodash/sortBy';
import {
  ColumnDef
} from 'sierra-frontend/dist/components/simple-table';

import CellFold from './cell-fold';
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
    controlIsoName: new ColumnDef({
      name: 'controlIsoName',
      label: labels.controlIsoName || 'Control',
      render: isoName => (
        <CellIsolate {...{isoName, isolateLookup}} />
      ),
      sort: rows => [...rows].sort(compareByControlIsolate)
    }),
    isoName: new ColumnDef({
      name: 'isoName',
      label: labels.isoName || 'Variant',
      render: isoName => (
        <CellIsolate {...{isoName, isolateLookup}} />
      ),
      sort: rows => [...rows].sort(compareByIsolate)
    }),
    abNames: new ColumnDef({
      name: 'abNames',
      label: labels.abNames || 'Antibodies',
      render: abNames => <CellAntibodies {...{abNames, antibodyLookup}} />,
      sort: rows => [...rows].sort(compareByAntibodies)
    }),
    section: new ColumnDef({
      name: 'section',
      label: labels.section
    }),
    cumulativeCount: new ColumnDef({
      name: 'cumulativeCount',
      label: labels.cumulativeCount || '# Samples'
    }),
    fold: new ColumnDef({
      name: 'fold',
      label: labels.fold,
      render: (fold, row) => <CellFold {...row} />,
      sort: rows => sortBy(
        rows,
        [({ineffective}) => ineffective || '', 'fold']
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
  articleLookup,
  antibodyLookup,
  isolateLookup,
  columns,
  labels
}) {
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

  return React.useMemo(
    () => buildColDefs({
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
