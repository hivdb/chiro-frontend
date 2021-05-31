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
    type,
    mutations,
    expandable
  } = isolateLookup[isoName];
  if (type === 'named-variant') {
    // is a named variant, use isolate name
    return isoName;
  }
  else {
    const shortenMuts = shortenMutList(mutations);
    if (expandable && shortenMuts.length > 0) {
      return <>
        {shortenMuts.join(' + ')}
      </>;
    }
    else {
      // not expandable or no mutations; fallback to isoName
      return isoName;
    }
  }
}
