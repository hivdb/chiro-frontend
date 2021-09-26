import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {comparePotency} from './potency';
import {aggWeightedPercentile, aggSum} from './agg-funcs';
import style from './style.module.scss';

export {comparePotency};


CellFold.propTypes = {
  fbResistanceLevel: PropTypes.array.isRequired,
  fold: PropTypes.number,
  p25: PropTypes.number,
  p75: PropTypes.number,
  displayIQR: PropTypes.bool,
  displayNN: PropTypes.bool
};


function CellFold({fold, fbResistanceLevel, p25, p75, displayIQR, displayNN}) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  else if (!isNaN(foldValue) && foldValue < 0.1) {
    foldValue = 0.1;
    foldCmp = '<';
  }
  return <>
    {displayNN ? <em>N.N.</em> :
      (foldValue === undefined || foldValue === null ? (
        fbResistanceLevel.length > 0 ?
          fbResistanceLevel.join(' / ') : '?'
      ) : <>
        {foldCmp === "=" ? "" : foldCmp}
        {foldValue.toFixed(1)}
        {displayIQR ? <>
          {' '}
          <span className={style['supplement-info']}>
            ({p25.toFixed(1)}-{p75.toFixed(1)})
          </span>
        </> : null}
      </>)}
  </>;
}


function exportCellFold(
  {fold, fbResistanceLevel, p25, p75, displayIQR, displayNN}
) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
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
  else {
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
        exportCell: ({median, p25, p75}, row) => exportCellFold({
          fold: median,
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
        decorator: (fold, {cumulativeCount}) => {
          const [median, p25, p75] = aggWeightedPercentile(
            fold,
            cumulativeCount,
            [0.5, 0.25, 0.75]
          );
          return {median, p25, p75};
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
