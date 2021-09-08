import React from 'react';
import style from '../style.module.scss';


export function formatPotency({
  potency, ineffective, potencyType,
  potencyUnit, forceShowUnit, stdev
}) {
  let prefix, number, suffix;
  const isICxx = /^IC\d+$/.test(potencyType);
  const isNTxx = /^NT\d+$/.test(potencyType);
  if (ineffective) {
    if (isICxx) {
      prefix = '>';
    }
    else if (isNTxx) {
      prefix = '<';
    }
  }
  else {
    prefix = '';
  }
  if (potency < 1) {
    number = potency.toPrecision(1);
  }
  else if (potency < 10) {
    number = potency.toFixed(1);
  }
  else {
    number = potency.toFixed(0);
  }
  number = parseFloat(number).toLocaleString('en-US');
  if (
    potencyUnit &&
    (forceShowUnit || !isICxx || potencyUnit !== 'ng/ml')
  ) {
    suffix = ` ${potencyUnit}`;
  }
  else {
    suffix = '';
  }

  return <>
    {prefix}{number}
    {stdev && Math.abs(1 - stdev) > 1e-5 ? (
      <span className={style['supplement-info']}>
        <span className={style['mul-div-sign']}>
          ×÷
        </span>{stdev.toFixed(1)}
      </span>
    ) : null}
    {suffix}
  </>;
}


export default function CellPotency({
  potency,
  potencyUnit,
  potencyType,
  rxType,
  ineffective,
  stdev
}) {
  if (potency !== undefined && potency !== null) {
    let displayPotType = true;
    if (/^(conv|vacc)-plasma$/.test(rxType) && potencyType === 'NT50') {
      displayPotType = false;
    }
    else if (rxType === 'antibody' && potencyType === 'IC50') {
      displayPotType = false;
    }
    return <>
      {displayPotType ? `${potencyType}: ` : null}
      {formatPotency({potency, ineffective, potencyType, potencyUnit, stdev})}
    </>;
  }
  else {
    return <em>N.A.</em>;
  }
}
