import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import shortenMutationList from '../../shorten-mutlist';

import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import style from './style.module.scss';


CellMutation.propTypes = {
  text: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  total: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  isEmerging: PropTypes.bool,
  isWaning: PropTypes.bool
};


function CellMutation({text, count, total, isEmerging, isWaning}) {
  return <span
   className={style.mutation}
   data-is-emerging={isEmerging}
   data-is-waning={isWaning}>
    {text}{total > 1 ? ` (${count}/${total})` : null}
  </span>;
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
        render: mutations => shortenMutationList(
          mutations || [],
          true
        ).map(({
          text,
          count,
          total,
          isEmerging,
          isWaning
        }, idx) => <React.Fragment key={idx}>
          {idx === 0 ? null : ', '}
          <CellMutation {...{
            text,
            count,
            total,
            isEmerging,
            isWaning
          }} />
        </React.Fragment>),
        exportCell: mutations => (
          shortenMutationList(mutations || [], true)
            .map(({
              text,
              count,
              total,
              isEmerging
            }) => (
              `${text}${total > 1 ? ` (${count}/${total})` : ''
              }${isEmerging ? ' (+)' : ''}`
            ))
            .join(', ')
        ),
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
