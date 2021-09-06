import React from 'react';
import PropTypes from 'prop-types';
import style from '../style.module.scss';


CellFold.propTypes = {
  fold: PropTypes.number,
  stdev: PropTypes.number,
  displayNN: PropTypes.bool
};


export default function CellFold({fold, stdev, displayNN}) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  return <>
    {displayNN ? <em>N.N.</em> :
      (foldValue === null ? '?' : <>
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
