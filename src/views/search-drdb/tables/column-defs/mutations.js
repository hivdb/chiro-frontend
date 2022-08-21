import React from 'react';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import shortenMutationList from '../../../../utils/shorten-mutlist';

import {ColumnDef} from 'icosa/components/simple-table';

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
  isWaning: PropTypes.bool,
  species: PropTypes.string
};


function CellMutation({text, count, total, isEmerging, isWaning, species}) {
  return <span
   className={style.mutation}
   data-is-emerging={!(total > 1) && isEmerging}
   data-is-waning={isWaning}>
    {text}{total > 1 ? <>
      {' ('}
      {Number.parseInt(count).toLocaleString('en-US')}{' '}
      {pluralize(
        !species || species === 'Human' ?
          'patient' : species.toLocaleLowerCase(),
        Number.parseInt(count),
        false
      )})
    </> : null}
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
        render: (mutations, {subjectSpecies}) => shortenMutationList(
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
            isWaning,
            species: subjectSpecies
          }} />
        </React.Fragment>),
        exportCell: (mutations, {subjectSpecies: species}) => (
          shortenMutationList(mutations || [], true)
            .map(({
              text,
              count,
              total,
              isEmerging
            }) => (
              `${text}${total > 1 ? ` (${
                Number.parseInt(count).toLocaleString('en-US')
              } ${
                pluralize(
                  !species || species === 'Human' ?
                    'patient' : species.toLocaleLowerCase(),
                  Number.parseInt(count),
                  false
                )
              })` : (isEmerging ? ' (+)' : '')
              }`
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
