import React from 'react';

import SimpleTable, {
  ColumnDef
} from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';


const columnDefs = [
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
    label: 'Variant'
  }),
  new ColumnDef({
    name: 'abNames',
    label: 'Antibodies',
    render: abNames => abNames.join('+')
  }),
  new ColumnDef({
    name: 'section',
    label: 'Section'
  }),
  new ColumnDef({
    name: 'fold',
    label: 'Fold'
  }),
  new ColumnDef({
    name: 'assay'
  })
];


export default function AbSuscResults({
  abSuscResults, loaded
}) {
  if (loaded) {
    return (
      <SimpleTable
       columnDefs={columnDefs}
       data={abSuscResults} />
    );
  }
  else {
    return <InlineLoader />;
  }
}
