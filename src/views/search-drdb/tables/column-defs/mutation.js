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

export function useMutations({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('mutations')) {
        return null;
      }
      return new ColumnDef({
        name: 'mutations',
        label: labels.mutations || 'Mutations',
        render: mutations => mutations.map(({
          gene,
          refAminoAcid,
          position,
          aminoAcid,
          count,
          total
        }, idx) => <React.Fragment key={idx}>
          {idx === 0 ? null : ', '}
          <CellMutation
           gene={gene}
           refAminoAcid={refAminoAcid}
           position={position}
           aminoAcid={aminoAcid}
           count={count}
           total={total} />
        </React.Fragment>),
        sort: rows => sortBy(rows, [
          'mutations.0.gene',
          'mutations.0.position',
          'mutations.0.aminoAcid',
          'mutations.1.gene',
          'mutations.1.position',
          'mutations.1.aminoAcid',
          'mutations.2.gene',
          'mutations.2.position',
          'mutations.2.aminoAcid'
        ])
      });
    },
    [columns, labels.mutations, skip]
  );
}
