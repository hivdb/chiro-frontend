import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import shortenMutationList from '../../shorten-mutlist';

import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';


CellMutation.propTypes = {
  text: PropTypes.string.isRequired,
  count: PropTypes.number,
  total: PropTypes.number
};


function CellMutation({text, count, total}) {
  return <>{text}{total > 1 ? ` (${count}/${total})` : null}</>;
}


export default function useMutations({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('mutations')) {
        return null;
      }
      return new ColumnDef({
        name: 'mutations',
        label: labels.mutations || 'Mutations',
        render: mutations => shortenMutationList(mutations, true).map(({
          text,
          count,
          total
        }, idx) => <React.Fragment key={idx}>
          {idx === 0 ? null : ', '}
          <CellMutation
           text={text}
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
