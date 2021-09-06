import React from 'react';
import style from '../style.module.scss';


export default function CellFold({fold, stdev}) {
  let foldCmp = '=';
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  if (foldValue !== null) {
    return <>
      {foldCmp === "=" ? "" : foldCmp}
      {foldValue.toFixed(1)}
      {stdev && stdev > 1e-5 ? (
        <span className={style['supplement-info']}>
          ±{stdev < 1 ? stdev.toPrecision(1) : stdev.toFixed(1)}
        </span>
      ) : null}
    </>;
  }
  return '?';
}
