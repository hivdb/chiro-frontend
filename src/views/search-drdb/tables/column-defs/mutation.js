import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';


CellMutation.propTypes = {
  gene: PropTypes.string.isRequired,
  refAminoAcid: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  aminoAcid: PropTypes.string.isRequired
};


function CellMutation({gene, refAminoAcid, position, aminoAcid}) {
  let mut = `${refAminoAcid}${position}${aminoAcid}`;
  if (aminoAcid === 'del') {
    mut = `Δ${position}`;
  }
  if (gene !== 'S') {
    mut = `${gene}:${mut}`;
  }
  return <>{mut}</>;
}


export default function useMutation({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('mutation')) {
        return null;
      }
      return new ColumnDef({
        name: 'mutation',
        label: labels.mutation || 'Mutation',
        render: (_, {gene, refAminoAcid, position, aminoAcid}) => (
          <CellMutation
           gene={gene}
           refAminoAcid={refAminoAcid}
           position={position}
           aminoAcid={aminoAcid} />
        ),
        exportCell: (_, {gene, refAminoAcid, position, aminoAcid}) => ({
          gene,
          refAA: refAminoAcid,
          pos: position,
          AA: aminoAcid
        }),
        sort: rows => sortBy(rows, ['gene', 'position', 'aminoAcid'])
      });
    },
    [columns, labels.mutation, skip]
  );
}
