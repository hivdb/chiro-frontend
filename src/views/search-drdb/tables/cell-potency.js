import React from 'react';


export default function CellPotency({
  potency,
  potencyUnit,
  potencyType,
  rxType,
  ineffective
}) {
  if (potency !== undefined && potency !== null) {
    let displayPotType = true;
    if (/^(conv|vacc)-plasma$/.test(rxType) && potencyType === 'NT50') {
      displayPotType = false;
    }
    else if (rxType === 'antibody' && potencyType === 'IC50') {
      displayPotType = false;
    }
    return <>
      {displayPotType ? `${potencyType}: ` : null}
      {ineffective ? <em>N.N.</em> : (
        parseFloat(potency.toFixed(1)).toLocaleString('en-US') +
        (potencyUnit ? ` ${potencyUnit}` : '')
      )}
    </>;
  }
  else {
    return '?';
  }
}
