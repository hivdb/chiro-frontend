import React from 'react';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {aggPotency, aggPotencySD} from './agg-funcs';
import style from './style.module.scss';


export function comparePotency(potA, potB) {
  if (potA.potencyType !== potB.potencyType) {
    return potA.potencyType.localeCompare(potB.potencyType);
  }
  if (potA.potencyUnit !== potB.potencyUnit) {
    return (potA.potencyUnit || '').localeCompare(potB.potencyUnit || '');
  }
  const potAnum = aggPotency(potA.potency, potA);
  const potBnum = aggPotency(potB.potency, potB);
  if (potAnum === null || potAnum === undefined) {
    return 1;
  }
  else if (potBnum === null || potBnum === undefined) {
    return -1;
  }
  return potAnum - potBnum;
}


export function getPotencyCmp({potencyType, ineffective, equal = '='}) {
  if (!ineffective) {
    return equal;
  }
  const isNTxx = /^NT\d+$/.test(potencyType);
  if (isNTxx) {
    return '<';
  }
  else {
    return '>';
  }
}

export function formatPotency({
  potency, ineffective, potencyType,
  potencyUnit, forceShowUnit, stdev
}) {
  let number, suffix;
  const isICxx = /^IC\d+$/.test(potencyType);
  const prefix = getPotencyCmp({potencyType, ineffective, equal: ''});
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


function exportCellPotency({
  potency,
  potencyUnit,
  potencyType,
  ineffective,
  stdev
}) {
  if (potency === undefined || potency === null) {
    return {GeoMean: 'N.A.'};
  }
  else {
    return {
      Type: potencyType,
      Cmp: getPotencyCmp({potencyType, ineffective}),
      GeoMean: potency && potency.toFixed(1),
      Unit: potencyUnit,
      GSD: stdev && stdev.toFixed(1)
    };
  }
}


function CellPotency({
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

export default function usePotency({labels}) {
  return React.useMemo(
    () => new ColumnDef({
      name: 'potency',
      label: labels.potency || 'Potency',
      exportLabel: 'Potency',
      decorator: aggPotency,
      render: (potency, {
        potencyUnit,
        potencyType,
        rxType,
        ineffective,
        ...row
      }) => (
        <CellPotency
         potencyUnit={potencyUnit}
         potencyType={potencyType}
         rxType={rxType}
         ineffective={
           ineffective.every(ie =>
             ie === 'experimental' ||
             ie === 'both')
         }
         stdev={aggPotencySD(potency, row)}
         potency={potency} />
      ),
      exportCell: (potency, {
        potencyUnit,
        potencyType,
        ineffective,
        ...row
      }) => exportCellPotency({
        potencyUnit,
        potencyType,
        ineffective: ineffective.every(ie =>
          ie === 'experimental' ||
          ie === 'both'),
        stdev: aggPotencySD(potency, row),
        potency
      }),
      sort: rows => [...rows].sort(comparePotency)
    }),
    [labels.potency]
  );
}
