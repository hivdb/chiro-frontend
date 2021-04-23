import React from 'react';
import {consecutiveGroupsBy} from 'sierra-frontend/dist/utils/array-groups';


function shortenMutationList(mutations) {
  const merged = [];
  const groups = consecutiveGroupsBy(
    mutations,
    (left, right) => (
      left.gene === right.gene &&
      left.aminoAcid === 'del' &&
      left.aminoAcid === right.aminoAcid &&
      left.position === right.position - 1
    )
  );
  for (const group of groups) {
    if (group.length === 1) {
      const [{position, aminoAcid, refAminoAcid}] = group;
      merged.push(
        aminoAcid === 'del' ?
          `Δ${position}` :
          `${refAminoAcid}${position}${aminoAcid}`
      );
    }
    else {
      const leftest = group[0];
      const rightest = group[group.length - 1];
      const {position: posStart} = leftest;
      const {position: posEnd} = rightest;
      if (posEnd - posStart === 1) {
        merged.push(`Δ${posStart}/${posEnd}`);
      }
      else {
        merged.push(`Δ${posStart}-${posEnd}`);
      }
    }
  }
  return merged;
}



export default function CellVariant({
  variantName,
  assay,
  variantLookup
}) {
  const {type, mutations} = variantLookup[variantName];
  if (type === 'named-variant') {
    return variantName;
  }
  else {
    const shortenMuts = shortenMutationList(mutations);
    return <>
      {shortenMuts.join(' + ')}
      <sup>{assay}</sup>
    </>;
  }
}
