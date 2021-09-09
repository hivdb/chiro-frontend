import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {aggPotency, aggPotencySD} from './agg-funcs';
import {getPotencyCmp, formatPotency} from './potency';
import style from './style.module.scss';


function getDisplay({
  varName,
  variantLookup
}) {
  if (!(varName in variantLookup)) {
    return '?';
  }
  const synonyms = variantLookup[varName]?.synonyms;

  if (synonyms && synonyms.length > 0) {
    return `${varName} (${synonyms[0]})`;
  }
  else {
    return varName;
  }
}


CellVariant.propTypes = {
  varName: PropTypes.string,
  potency: PropTypes.number,
  potencyUnit: PropTypes.string,
  potencyType: PropTypes.string,
  enablePotency: PropTypes.bool,
  ineffective: PropTypes.bool,
  variantLookup: PropTypes.object
};


function exportCellVariant({
  varName,
  potency,
  potencyUnit,
  potencyType,
  stdev,
  enablePotency,
  ineffective,
  variantLookup
}) {
  const result = {
    '': getDisplay({
      varName,
      variantLookup
    })
  };
  if (enablePotency) {
    result['Potency Type'] = potencyType;
    result['Potency Cmp'] = getPotencyCmp({potencyType, ineffective});
    result['Potency GeoMean'] = potency && potency.toFixed(1);
    result['Potency Unit'] = potencyUnit;
    result['Potency GSD'] = stdev && stdev.toFixed(1);
    return result;
  }
  else {
    return result.Variant;
  }
}

function CellVariant({
  varName,
  potency,
  potencyUnit,
  potencyType,
  enablePotency,
  ineffective,
  variantLookup
}) {
  const isolateDisplay = getDisplay({
    varName,
    variantLookup
  });
  return (
    enablePotency && potency !== null && potency !== undefined ? <>
      {isolateDisplay}
      <div className={classNames(style['supplement-info'], style['small'])}>
        {potencyType}{': '}
        {formatPotency({
          potency,
          potencyType,
          ineffective,
          potencyUnit,
          forceShowUnit: true
        })}
      </div>
    </> : isolateDisplay
  );
}

export function useControlVarName({labels, variantLookup, columns, skip}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('controlVarName')) {
        return null;
      }
      return new ColumnDef({
        name: 'controlVarName',
        label: labels.controlVarName || 'Control',
        render: (varName, {
          controlPotency,
          potencyType,
          potencyUnit,
          ineffective,
          cumulativeCount
        }) => (
          <CellVariant
           {...{
             varName,
             potency: aggPotency(controlPotency, {cumulativeCount}),
             potencyType,
             potencyUnit,
             variantLookup
           }}
           enablePotency
           ineffective={
             ineffective.every(ie =>
               ie === 'control' ||
               ie === 'both')
           } />
        ),
        exportCell: (varName, {
          controlPotency,
          potencyType,
          potencyUnit,
          ineffective,
          cumulativeCount
        }) => {
          const avgPot = aggPotency(controlPotency, {cumulativeCount});
          return exportCellVariant(
            {
              varName,
              potency: avgPot,
              stdev: aggPotencySD(avgPot, {
                potency: controlPotency,
                cumulativeCount
              }),
              potencyType,
              potencyUnit,
              variantLookup,
              enablePotency: true,
              ineffective: ineffective.every(ie =>
                ie === 'control' ||
              ie === 'both')
            }
          );
        }
      });
    },
    [columns, labels.controlVarName, skip, variantLookup]
  );
}
