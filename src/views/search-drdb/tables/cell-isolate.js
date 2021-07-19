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
    type,
    mutations,
    expandable
  } = isolateLookup[isoName];
  const displayVarName = (
    synonyms.length > 0 ?
      `${varName} (${synonyms[0]})` : varName
  );

  if (type === 'named-variant') {
    // is a named variant, use variant name
    return displayVarName;
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
  isolateLookup
}) {
  const isolateDisplay = useIsolateDisplay({isoName, isolateLookup});
  if (enablePotency && potency !== null && potency !== undefined) {
    return <>
      {isolateDisplay}
      <div className={style['supplement-info']}>
        {potencyType}{': '}
        {parseFloat(potency.toFixed(1)).toLocaleString('en-US')}
        {' '}
        {potencyUnit}
      </div>
    </>;
  }
  else {
    return isolateDisplay;
  }
}
