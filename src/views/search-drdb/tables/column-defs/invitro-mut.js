import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';


CellInVitroMut.propTypes = {
  gene: PropTypes.string.isRequired,
  refAminoAcid: PropTypes.string.isRequired,
  position: PropTypes.number.isRequired,
  aminoAcid: PropTypes.string.isRequired
};


function CellInVitroMut({gene, refAminoAcid, position, aminoAcid}) {
  let mut = `${refAminoAcid}${position}${aminoAcid}`;
  if (aminoAcid === 'del') {
    mut = `Δ${position}`;
  }
  if (gene !== 'S') {
    mut = `${gene}:${mut}`;
  }
  return <>{mut}</>;
}


export default function useInVitroMut({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('inVitroMut')) {
        return null;
      }
      return new ColumnDef({
        name: 'inVitroMut',
        label: labels.inVitroMut || 'Mutation',
        render: (_, {gene, refAminoAcid, position, aminoAcid}) => (
          <CellInVitroMut
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
    [columns, labels.inVitroMut, skip]
  );
}
