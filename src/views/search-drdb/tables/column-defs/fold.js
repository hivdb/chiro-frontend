import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {comparePotency} from './potency';
import {
  aggPotency,
  aggWeightedPercentile,
  aggSum
} from './agg-funcs';
import style from './style.module.scss';

export {comparePotency};


CellFold.propTypes = {
  fbResistanceLevel: PropTypes.array.isRequired,
  fold: PropTypes.number,
  foldCmp: PropTypes.string,
  p25: PropTypes.number,
  p75: PropTypes.number,
  displayIQR: PropTypes.bool,
  displayNN: PropTypes.bool
};


function CellFold({
  fold,
  foldCmp,
  fbResistanceLevel,
  p25,
  p75,
  displayIQR,
  displayNN
}) {
  if (fold === null || fold === undefined) {
    return <em>N.A.</em>;
  }
  let foldValue = fold;
  if (foldValue && foldValue > 1000) {
    foldValue = 1000;
    foldCmp = '>';
  }
  else if (!isNaN(foldValue) && foldValue < 0.1) {
    foldValue = 0.1;
    foldCmp = '<';
  }
  if (!isNaN(foldValue)) {
    if (foldCmp !== '=') {
      if (foldValue >= 1) {
        foldValue = foldValue.toFixed(0);
        p25 = p25.toFixed(0);
        p75 = p75.toFixed(0);
      }
      else {
        foldValue = foldValue.toFixed(1);
        p25 = p25.toFixed(1);
        p75 = p75.toFixed(1);
      }
    }
    else if (foldValue >= 10) {
      foldValue = foldValue.toFixed(0);
      p25 = p25.toFixed(0);
      p75 = p75.toFixed(0);
    }
    else {
      foldValue = foldValue.toFixed(1);
      p25 = p25.toFixed(1);
      p75 = p75.toFixed(1);
    }
  }
  return <>
    {displayNN ? <em>N.N.</em> :
      (foldValue === undefined || foldValue === null ? (
        fbResistanceLevel.length > 0 ?
          fbResistanceLevel.join(' / ') : '?'
      ) : <>
        {foldCmp === "=" ? "" : foldCmp}
        {foldValue}
        {displayIQR ? <>
          {' '}
          <span className={style['supplement-info']}>
            ({p25}-{p75})
          </span>
        </> : null}
      </>)}
  </>;
}


function exportCellFold({
  fold,
  foldCmp,
  fbResistanceLevel,
  p25,
  p75,
  displayIQR,
  displayNN
}) {
  let foldValue = fold;
  if (foldValue && foldValue > 1000) {
    foldValue = 1000;
    foldCmp = '>';
  }
  else if (!isNaN(foldValue) && foldValue < 0.1) {
    foldValue = 0.1;
    foldCmp = '<';
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
  else if (!isNaN(foldValue)) {
    foldValue = foldValue.toFixed(1);
  }
  return {
    Cmp: foldCmp,
    Median: foldValue,
    IQR25: displayIQR ? p25.toFixed(1) : null,
    IQR75: displayIQR ? p75.toFixed(1) : null
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
           fold={fold.median}
           foldCmp={fold.cmp}
           fbResistanceLevel={uniq(row.fbResistanceLevel || []).sort()}
           displayNN={
             aggSum(row.cumulativeCount) ===
             Array.from(row.ineffective.entries())
               .filter(([, ie]) => ie === 'control' || ie === 'both')
               .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)
           }
           displayIQR={row.cumulativeCount.length > 1}
           p25={fold.p25}
           p75={fold.p75} />
        ),
        exportCell: ({median, cmp, p25, p75}, row) => exportCellFold({
          fold: median,
          foldCmp: cmp,
          fbResistanceLevel: uniq(row.fbResistanceLevel || []).sort(),
          displayNN: (
            aggSum(row.cumulativeCount) === Array
              .from(row.ineffective.entries())
              .filter(([, ie]) => ie === 'control' || ie === 'both')
              .reduce((acc, [idx]) => row.cumulativeCount[idx] + acc, 0)
          ),
          displayIQR: row.cumulativeCount.length > 1,
          p25,
          p75
        }),
        decorator: (fold, row) => {
          const {
            potency,
            cumulativeCount
          } = row;
          if (fold.every(f => f === null || f === undefined)) {
            return {};
          }
          let cmp = '=';
          const pot = aggPotency(potency, row);
          if (pot.length > 0 && pot.every(({ineffective}) => ineffective)) {
            cmp = '>';
          }
          const {foldCmp} = row;
          if (cmp === '=' && foldCmp.length > 0) {
            if (foldCmp.every(cmp => cmp === '>')) {
              cmp = '>';
            }
            else if (foldCmp.every(cmp => cmp === '<')) {
              cmp = '<';
            }
          }
          const [median, p25, p75] = aggWeightedPercentile(
            fold,
            cumulativeCount,
            [0.5, 0.25, 0.75]
          );
          return {cmp, median, p25, p75};
        },
        sort: rows => sortBy(
          rows,
          [
            ({ineffective}) => (
              ineffective !== null && ineffective !== 'experimental'
            ),
            ({fold, cumulativeCount}) => aggWeightedPercentile(
              fold,
              cumulativeCount,
              [0.5]
            )[0]
          ]
        )
      });
    },
    [columns, labels.fold, skip]
  );
}
