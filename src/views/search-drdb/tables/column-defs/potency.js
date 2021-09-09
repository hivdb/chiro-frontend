import React from 'react';
import PropTypes from 'prop-types';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {aggPotency, aggGeoMeanWeighted} from './agg-funcs';
import style from './style.module.scss';


export function comparePotency(potA, potB) {
  const potAnum = aggGeoMeanWeighted(potA.potency, potA.cumulativeCount);
  const potBnum = aggGeoMeanWeighted(potB.potency, potB.cumulativeCount);
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
  potencyUnit, forceShowUnit, potencySD
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
    {potencySD && Math.abs(1 - potencySD) > 1e-5 ? (
      <span className={style['supplement-info']}>
        <span className={style['mul-div-sign']}>
          ×÷
        </span>{potencySD.toFixed(1)}
      </span>
    ) : null}
    {suffix}
  </>;
}


function exportCellPotency({
  potencyArray
}) {
  if (potencyArray.length > 0) {
    const result = {};
    for (const {
      potencyType,
      potency,
      potencyUnit,
      potencySD,
      ineffective
    } of potencyArray) {
      result[`${potencyType} Cmp`] = getPotencyCmp({potencyType, ineffective});
      result[`${potencyType} GeoMean`] = potency && potency.toFixed(1);
      result[`${potencyType} Unit`] = potencyUnit;
      result[`${potencyType} GSD`] = potencySD && potencySD.toFixed(1);
    }
    return result;
  }
}


CellPotency.propTypes = {
  rxType: PropTypes.string.isRequired,
  potencyArray: PropTypes.arrayOf(
    PropTypes.shape({
      potency: PropTypes.number.isRequired,
      potencyType: PropTypes.string.isRequired,
      ineffective: PropTypes.bool.isRequired,
      potencyUnit: PropTypes.string,
      potencySD: PropTypes.number.isRequired,
      cumulativeCount: PropTypes.number.isRequired
    }).isRequired
  ).isRequired
};

function CellPotency({
  rxType,
  potencyArray
}) {
  const hasMultiple = potencyArray.length > 1;
  return <ul className={style['potency']}>
    {potencyArray.map(({
      potency,
      potencyType,
      ineffective,
      potencyUnit,
      potencySD,
      cumulativeCount
    }) => {
      let displayPotType = true;
      if (!hasMultiple) {
        if (/^(conv|vacc)-plasma$/.test(rxType) && potencyType === 'NT50') {
          displayPotType = false;
        }
        else if (rxType === 'antibody' && potencyType === 'IC50') {
          displayPotType = false;
        }
      }
      return <li key={`${potencyType}$$${potencyUnit}`}>
        {displayPotType ? `${potencyType}: ` : null}
        {formatPotency({
          potency,
          potencyType,
          ineffective,
          potencyUnit,
          potencySD
        })}
        {hasMultiple ? <span className={style['supplement-info']}>
          {' '}(n={cumulativeCount && cumulativeCount.toLocaleString('en-US')})
        </span> : null}
      </li>;
    })}
    {potencyArray.length === 0 ? <li><em>N.A.</em></li> : null}
  </ul>;
}

export default function usePotency({labels}) {
  return React.useMemo(
    () => new ColumnDef({
      name: 'potency',
      label: labels.potency || 'Potency',
      exportLabel: 'Potency',
      decorator: aggPotency,
      render: (potencyArray, {
        rxType
      }) => (
        <CellPotency
         rxType={rxType}
         potencyArray={potencyArray} />
      ),
      exportCell: potencyArray => exportCellPotency({potencyArray}),
      sort: rows => [...rows].sort(comparePotency)
    }),
    [labels.potency]
  );
}
