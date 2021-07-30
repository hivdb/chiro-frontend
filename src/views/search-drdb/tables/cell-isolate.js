import React from 'react';
import shortenMutList from '../shorten-mutlist';

import style from '../style.module.scss';


function useIsolateDisplay({isoName, isolateLookup}) {
  if (!(isoName in isolateLookup)) {
    return '?';
  }
  const {
    varName,
    synonyms,
    mutations,
    numMuts,
    expandable
  } = isolateLookup[isoName];
  const displayVarName = (
    synonyms.length > 0 ?
      `${varName} (${synonyms[0]})` : varName
  );
  const shortenMuts = shortenMutList(mutations);

  if (varName) {
    if (numMuts === 1) {
      return `${varName} (${shortenMuts.join(' + ')})`;
    }
    else {
      return displayVarName;
    }
  }
  else {
    const shortenMuts = shortenMutList(mutations);
    if (expandable && shortenMuts.length > 0) {
      return <>
        {shortenMuts.join(' + ')}
      </>;
    }
    else {
      // not expandable or no mutations; fallback to varName
      return displayVarName;
    }
  }
}


export default function CellIsolate({
  isoName,
  potency,
  potencyUnit,
  potencyType,
  enablePotency,
  ineffective,
  isolateLookup
}) {
  const isolateDisplay = useIsolateDisplay({isoName, isolateLookup});
  if (enablePotency && potency !== null && potency !== undefined) {
    return <>
      {isolateDisplay}
      <div className={style['supplement-info']}>
        {potencyType}{': '}
        {ineffective ? <em>N.N.</em> : (
          parseFloat(potency.toFixed(1)).toLocaleString('en-US') +
          (potencyUnit ? ` ${potencyUnit}` : '')
        )}
      </div>
    </>;
  }
  else {
    return isolateDisplay;
  }
}
