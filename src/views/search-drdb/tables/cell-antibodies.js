import React from 'react';
// import {Popup} from 'semantic-ui-react';
// import style from '../style.module.scss';


export default function CellAntibodies({
  abNames/*,
  antibodyLookup*/
}) {
  return <>
    {abNames.map((abName, idx) => {
      // const {abbreviationName: abbr} = antibodyLookup[abName];

      return <React.Fragment key={abName}>
        {idx === 0 ? '' : ' + '}
        {abName}
      </React.Fragment>;
    })}
  </>;
}
