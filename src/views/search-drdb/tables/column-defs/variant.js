import React from 'react';
import uniq from 'lodash/uniq';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {ColumnDef} from 'sierra-frontend/dist/components/simple-table';

import {aggControlPotency} from './agg-funcs';
import {getPotencyCmp, formatPotency} from './potency';
import {getIsolateDisplay} from './isolate';
import style from './style.module.scss';


function getDisplay({
  varName,
  variantLookup,
  missing
}) {
  if (!varName) {
    return missing;
  }
  if (!(varName in variantLookup)) {
    return varName;
  }
  const synonyms = variantLookup[varName]?.synonyms;

  if (synonyms && synonyms.length > 0) {
    return `${varName} (${synonyms[0]})`;
  }
  else {
    return varName;
  }
}


function exportCellVariant({
  varName,
  potencyArray,
  enablePotency,
  variantLookup,
  varNameMissing = '?'
}) {
  const result = {
    '': getDisplay({
      varName,
      variantLookup,
      missing: varNameMissing
    })
  };
  if (enablePotency) {
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
  }
  return result;
}


CellVariant.propTypes = {
  varName: PropTypes.string,
  potencyArray: PropTypes.arrayOf(
    PropTypes.shape({
      potency: PropTypes.number.isRequired,
      potencyType: PropTypes.string.isRequired,
      ineffective: PropTypes.bool.isRequired,
      potencyUnit: PropTypes.string,
      potencySD: PropTypes.number.isRequired
    }).isRequired
  ),
  enablePotency: PropTypes.bool,
  variantLookup: PropTypes.object,
  varNameMissing: PropTypes.string
};


function CellVariant({
  varName,
  potencyArray,
  enablePotency,
  variantLookup,
  varNameMissing = '?'
}) {
  const varDisplay = getDisplay({
    varName,
    variantLookup,
    missing: varNameMissing
  });
  return (
    enablePotency && potencyArray.length > 0 ? <>
      {varDisplay}
      <div className={classNames(style['supplement-info'], style['small'])}>
        <ul className={style.potency}>
          {potencyArray.map(({
            potency,
            potencyType,
            ineffective,
            potencyUnit
          }) => <li key={`${potencyType}$$${potencyUnit}`}>
            {potencyType}{': '}
            {formatPotency({
              potency,
              potencyType,
              ineffective,
              potencyUnit,
              forceShowUnit: true
            })}
          </li>)}
        </ul>
      </div>
    </> : varDisplay
  );
}

export function useInfectedVarName({labels, variantLookup, columns, skip}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('infectedVarName')) {
        return null;
      }
      return new ColumnDef({
        name: 'infectedVarName',
        label: labels.infectedVarName || 'Infection (CP)',
        render: (varName, {rxType}) => (
          <CellVariant
           {...{
             varName,
             variantLookup,
             varNameMissing: rxType === 'conv-plasma' ? '?' : 'None'
           }} />
        ),
        exportCell: (varName, {rxType}) => {
          return exportCellVariant({
            varName,
            variantLookup,
            varNameMissing: rxType === 'conv-plasma' ? '?' : 'None'
          });
        }
      });
    },
    [columns, labels.infectedVarName, skip, variantLookup]
  );
}


export function useControlVarName({
  labels,
  isolateLookup,
  variantLookup,
  columns,
  skip
}) {
  return React.useMemo(
    () => {
      if (skip || !columns.includes('controlVarName')) {
        return null;
      }
      return new ColumnDef({
        name: 'controlVarName',
        label: labels.controlVarName || 'Control',
        render: (varName, row) => (
          <CellVariant
           {...{
             varName,
             potencyArray: aggControlPotency(null, row),
             variantLookup,
             varNameMissing: varName ? '?' : (uniq(row.controlIsoName)
               .sort()
               .map(
                 isoName => getIsolateDisplay({
                   isoName,
                   isolateLookup
                 })
               )
               .join(' / ') || '?')
           }}
           enablePotency />
        ),
        exportCell: (varName, row) => {
          return exportCellVariant({
            varName,
            potencyArray: aggControlPotency(null, row),
            variantLookup,
            enablePotency: true,
            varNameMissing: varName ? '?' : (uniq(row.controlIsoName)
              .sort()
              .map(
                isoName => getIsolateDisplay({
                  isoName,
                  isolateLookup
                })
              )
              .join(' / ') || '?')
          });
        }
      });
    },
    [columns, isolateLookup, labels.controlVarName, skip, variantLookup]
  );
}
