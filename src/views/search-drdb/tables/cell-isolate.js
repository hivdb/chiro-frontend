import React from 'react';
import shortenMutList from '../shorten-mutlist';


export default function CellIsolate({
  isoName,
  isolateLookup
}) {
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
