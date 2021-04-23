import React from 'react';
import capitalize from 'lodash/capitalize';


export default function CellFold({
  foldCmp,
  fold,
  // ineffective,
  fbResistanceLevel
}) {
  let foldValue = fold;
  if (foldValue && foldValue > 100) {
    foldValue = 100;
    foldCmp = '>';
  }
  if (foldValue !== null) {
    return <>
      {foldCmp === "=" ? "" : foldCmp}
      {foldValue}
      {/* ineffective ? <sup><em>ineffective</em></sup> : null */}
    </>;
  }
  if (fbResistanceLevel !== null) {
    return <em>{capitalize(fbResistanceLevel)}</em>;
  }
  return '?';
}
