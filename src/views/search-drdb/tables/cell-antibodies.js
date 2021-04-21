import React from 'react';


export default function CellAntibodies({
  abNames,
  antibodyLookup
}) {
  return <>
    {abNames.map((abName, idx) => (
      <React.Fragment key={abName}>
        {idx === 0 ? '' : '+'}
        {antibodyLookup[abName].abbreviationName || abName}
      </React.Fragment>
    ))}
  </>;
}
