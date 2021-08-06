import React from 'react';
import PropTypes from 'prop-types';
// import {Popup} from 'semantic-ui-react';
// import style from '../style.module.scss';


export default function CellAntibodies({
  abNames
}) {
  return <>
    {abNames.map((abName, idx) => {
      return <React.Fragment key={abName}>
        {idx === 0 ? '' : ' + '}
        {abName}
      </React.Fragment>;
    })}
  </>;
}

CellAntibodies.propTypes = {
  abNames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
};
