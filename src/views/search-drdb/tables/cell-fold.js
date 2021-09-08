import React from 'react';
import PropTypes from 'prop-types';
import style from '../style.module.scss';


CellFold.propTypes = {
  fbResistanceLevel: PropTypes.array.isRequired,
  fold: PropTypes.number,
  stdev: PropTypes.number,
  displayNN: PropTypes.bool
};


export default function CellFold({fold, fbResistanceLevel, stdev, displayNN}) {
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
