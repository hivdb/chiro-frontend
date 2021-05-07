import React from 'react';
import sortBy from 'lodash/sortBy';
import {
  ColumnDef
} from 'sierra-frontend/dist/components/simple-table';

import CellFold from './cell-fold';
import CellVariant from './cell-variant';
import CellReference from './cell-reference';
import CellAntibodies from './cell-antibodies';
import CellRLevel from './cell-resistance-level';
import {
  useCompareSuscResultsByVariant,
  useCompareSuscResultsByControlVariant,
  useCompareSuscResultsByAntibodies
} from '../hooks';


function buildColDefs({
  articleLookup,
  variantLookup,
  antibodyLookup,
  compareByAntibodies,
  compareByVariant,
  compareByControlVariant,
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
    controlVariantName: new ColumnDef({
      name: 'controlVariantName',
      label: labels.controlVariantName || 'Control',
      render: variantName => (
        <CellVariant {...{variantName, variantLookup}} />
      ),
      sort: rows => [...rows].sort(compareByControlVariant)
    }),
    variantName: new ColumnDef({
      name: 'variantName',
      label: labels.variantName || 'Variant',
      render: (variantName, {assay}) => (
        <CellVariant {...{variantName, assay, variantLookup}} />
      ),
      sort: rows => [...rows].sort(compareByVariant)
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
    infection: new ColumnDef({
      name: 'infection',
      label: labels.infection
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
  variantLookup,
  columns,
  labels
}) {
  const compareByAntibodies = (
    useCompareSuscResultsByAntibodies(antibodyLookup)
  );
  const compareByVariant = (
    useCompareSuscResultsByVariant(variantLookup)
  );
  const compareByControlVariant = (
    useCompareSuscResultsByControlVariant(variantLookup)
  );

  return React.useMemo(
    () => buildColDefs({
      articleLookup,
      antibodyLookup,
      variantLookup,
      compareByAntibodies,
      compareByVariant,
      compareByControlVariant,
      columns,
      labels
    }),
    [
      articleLookup,
      antibodyLookup,
      variantLookup,
      compareByAntibodies,
      compareByVariant,
      compareByControlVariant,
      columns,
      labels
    ]
  );
}
