import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {aggSum} from './agg-funcs';
import style from './style.module.scss';


CellCumulativeCount.propTypes = {
  num: PropTypes.number.isRequired,
  numNN: PropTypes.number
};


function exportCellCumulativeCount({num, numNN}) {
  return {
    '': num,
    'N.N.': numNN || null
  };
}


function CellCumulativeCount({num, numNN}) {
  return <>
    {num && num.toLocaleString('en-US')}
    {numNN > 0 ? <>
      <br />
      <span className={classNames(
        style['supplement-info'],
        style['small']
      )}>
        (<em>N.N.</em>={numNN.toLocaleString('en-US')})
      </span>
    </> : null}
  </>;
}


export default function useCumulativeCount({labels, skip, columns}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('cumulativeCount')) {
        return null;
      }
      return new ColumnDef({
        name: 'cumulativeCount',
        label: labels.cumulativeCount || '# Results',
        render: (num, row) => (
          <CellCumulativeCount
           num={num}
           numNN={Array.from(row.ineffective.entries())
             .filter(([, ie]) => ie === 'control' || ie === 'both')
             .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)} />
        ),
        exportCell: (num, row) => (
          exportCellCumulativeCount({
            num,
            numNN: Array.from(row.ineffective.entries())
              .filter(([, ie]) => ie === 'control' || ie === 'both')
              .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)
          })
        ),
        decorator: aggSum
      });
    },
    [columns, labels.cumulativeCount, skip]
  );
}
