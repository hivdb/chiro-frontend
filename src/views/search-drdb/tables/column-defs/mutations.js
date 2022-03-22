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

export default function useMutations({
  colName = 'mutations',
  labels,
  skip,
  columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes(colName)) {
        return null;
      }
      return new ColumnDef({
        name: colName,
        label: labels[colName],
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
          `${colName}.0.gene`,
          `${colName}.0.position`,
          `${colName}.0.aminoAcid`,
          `${colName}.1.gene`,
          `${colName}.1.position`,
          `${colName}.1.aminoAcid`,
          `${colName}.2.gene`,
          `${colName}.2.position`,
          `${colName}.2.aminoAcid`
        ])
      });
    },
    [columns, labels, skip, colName]
  );
}
