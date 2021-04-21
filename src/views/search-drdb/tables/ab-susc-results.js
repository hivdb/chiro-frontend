import React from 'react';

import SimpleTable, {
  ColumnDef
} from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import CellAntibodies from './cell-antibodies';
import CellVariant from './cell-variant';
import {
  useCompareSuscResultsByVariant,
  useCompareSuscResultsByAntibodies
} from '../hooks';


function buildColDefs({
  variantLookup,
  antibodyLookup,
  compareByAntibodies,
  compareByVariant
}) {
  return [
    new ColumnDef({
      name: 'refName',
      label: 'Reference'
    }),
    new ColumnDef({
      name: 'controlVariantName',
      label: 'Control'
    }),
    new ColumnDef({
      name: 'variantName',
      label: 'Variant',
      render: (variantName, {assay}) => (
        <CellVariant {...{variantName, assay, variantLookup}} />
      ),
      sort: rows => [...rows].sort(compareByVariant)
    }),
    new ColumnDef({
      name: 'abNames',
      label: 'Antibodies',
      render: abNames => <CellAntibodies {...{abNames, antibodyLookup}} />,
      sort: rows => [...rows].sort(compareByAntibodies)
    }),
    new ColumnDef({
      name: 'section'
    }),
    new ColumnDef({
      name: 'fold',
      label: 'Fold'
    })
  ];
}


export default function AbSuscResults({
  antibodyLookup,
  variantLookup,
  abSuscResults,
  loaded
}) {
  const compareByAntibodies = (
    useCompareSuscResultsByAntibodies(antibodyLookup)
  );
  const compareByVariant = (
    useCompareSuscResultsByVariant(variantLookup)
  );

  const colDefs = React.useMemo(
    () => buildColDefs({
      antibodyLookup,
      variantLookup,
      compareByAntibodies,
      compareByVariant
    }),
    [
      antibodyLookup,
      variantLookup,
      compareByAntibodies,
      compareByVariant
    ]
  );
  if (loaded) {
    return (
      <SimpleTable
       columnDefs={colDefs}
       data={abSuscResults} />
    );
  }
  else {
    return <InlineLoader />;
  }
}
