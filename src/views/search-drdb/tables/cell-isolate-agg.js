import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {formatPotency} from './cell-potency';
import style from './style.module.scss';


const MAX_DISPLAY_VARIANT_MUTATIONS = 2;


function useDisplay({
  numMutations,
  varNames,
  isoAggkey,
  isolateAggLookup,
  variantLookup
}) {
  const {
    isoAggDisplay,
    varName
  } = isolateAggLookup[isoAggkey] || {};
  let display;
  let mutNotShown = false;

  if (varName) {
    varNames = [varName];
  }

  if (varNames && varNames.length > 0) {
    if (numMutations > 0 && numMutations <= MAX_DISPLAY_VARIANT_MUTATIONS) {
      display = `${varNames.join(' / ')} (${isoAggDisplay})`;
    }
    else if (varNames.length > 1 && !isoAggDisplay) {
      display = `${varNames.join(' / ')} (Wild Type)`;
    }
    else {
      mutNotShown = numMutations > 0;
      display = varNames.map(
        varName => {
          const synonyms = variantLookup[varName]?.synonyms;
          if (synonyms && synonyms.length > 0) {
            return `${varName} (${synonyms[0]})`;
          }
          else {
            return varName;
          }
        }
      ).join(' / ');
    }
  }
  else if (isoAggDisplay) {
    display = isoAggDisplay;
  }
  else {
    mutNotShown = true;
    display = '?';
  }
  return [
    display,
    mutNotShown
  ];
}


CellIsolateAgg.propTypes = {
  numMutations: PropTypes.number,
  varNames: PropTypes.arrayOf(PropTypes.string.isRequired),
  isoAggkey: PropTypes.string,
  potency: PropTypes.number,
  potencyUnit: PropTypes.string,
  potencyType: PropTypes.string,
  enablePotency: PropTypes.bool,
  ineffective: PropTypes.bool,
  isolateAggLookup: PropTypes.object,
  variantLookup: PropTypes.object
};


export default function CellIsolateAgg({
  numMutations,
  varNames,
  isoAggkey,
  potency,
  potencyUnit,
  potencyType,
  enablePotency,
  ineffective,
  isolateAggLookup,
  variantLookup
}) {
  const [isolateDisplay, mutNotShown] = useDisplay({
    numMutations,
    varNames,
    isoAggkey,
    isolateAggLookup,
    variantLookup
  });
  return <div className={style['isolate-agg']}>
    {enablePotency && potency !== null && potency !== undefined ? <>
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
    </> : isolateDisplay}
    {mutNotShown ?
      <div className={style['mutation-list']}>
        {isolateAggLookup[isoAggkey]?.isoAggDisplay || 'Wild Type'}
      </div> : null}
  </div>;
}
