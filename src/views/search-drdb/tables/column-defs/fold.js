import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {comparePotency} from './potency';
import {aggSum, aggFold, aggFoldSD} from './agg-funcs';
import style from './style.module.scss';

export {comparePotency};


CellFold.propTypes = {
  fbResistanceLevel: PropTypes.array.isRequired,
  fold: PropTypes.number,
  stdev: PropTypes.number,
  displayNN: PropTypes.bool
};


function CellFold({fold, fbResistanceLevel, stdev, displayNN}) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  return <>
    {displayNN ? <em>N.N.</em> :
      (foldValue === undefined || foldValue === null ? (
        fbResistanceLevel.length > 0 ?
          fbResistanceLevel.join(' / ') : '?'
      ) : <>
        {foldCmp === "=" ? "" : foldCmp}
        {foldValue.toFixed(1)}
        {stdev && stdev > 1e-5 ? (
          <span className={style['supplement-info']}>
            ±{stdev < 1 ? stdev.toPrecision(1) : stdev.toFixed(1)}
          </span>
        ) : null}
      </>)}
  </>;
}


function exportCellFold({fold, fbResistanceLevel, stdev, displayNN}) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  if (displayNN) {
    foldValue = 'N.N.';
  }
  if (foldValue === undefined || foldValue === null) {
    if (fbResistanceLevel.length > 0) {
      foldValue = fbResistanceLevel.join(' / ');
    }
    else {
      foldValue = '?';
    }
  }
  else {
    foldValue = foldValue.toFixed(1);
  }
  return {
    Cmp: foldCmp,
    Mean: foldValue,
    SD: stdev && stdev > 1e-5 ? (
      stdev < 1 ? stdev.toPrecision(1) : stdev.toFixed(1)
    ) : null
  };
}


export default function useFold({
  labels,
  skip,
  columns
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('fold')) {
        return null;
      }
      return new ColumnDef({
        name: 'fold',
        label: labels.fold,
        exportLabel: 'Fold Reduction',
        render: (fold, row) => (
          <CellFold
           fold={fold}
           fbResistanceLevel={uniq(row.fbResistanceLevel || []).sort()}
           displayNN={
           aggSum(row.cumulativeCount) ===
           Array.from(row.ineffective.entries())
             .filter(([, ie]) => ie === 'control' || ie === 'both')
             .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)
         }
           stdev={aggFoldSD(fold, row)} />
        ),
        exportCell: (fold, row) => exportCellFold({
          fold,
          fbResistanceLevel: uniq(row.fbResistanceLevel || []).sort(),
          displayNN: (
            aggSum(row.cumulativeCount) ===
           Array.from(row.ineffective.entries())
             .filter(([, ie]) => ie === 'control' || ie === 'both')
             .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)
          ),
          stdev: aggFoldSD(fold, row)
        }),
        decorator: aggFold,
        sort: rows => sortBy(
          rows,
          [
            ({ineffective}) => (
              ineffective !== null && ineffective !== 'experimental'
            ),
            ({fold, cumulativeCount}) => aggFold(fold, {cumulativeCount})
          ]
        )
      });
    },
    [columns, labels.fold, skip]
  );
}
