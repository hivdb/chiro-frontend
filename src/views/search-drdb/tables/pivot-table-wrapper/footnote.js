import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


FootNote.propTypes = {
  hasNA: PropTypes.bool.isRequired,
  hasNN: PropTypes.bool.isRequired,
  footnoteMean: PropTypes.bool
};


export default function FootNote({
  hasNN,
  hasNA,
  footnoteMean = false
}) {
  return <>
    {hasNA || hasNN || footnoteMean ? <p className={style.footnote}>
      {hasNA ? <>
        <strong><em>N.A.</em></strong>: data point not available
      </> : null}
      {hasNA && hasNN ? '; ' : null}
      {hasNN ? <>
        <strong><em>N.N.</em></strong>: control virus not neutralized
      </> : null}
      {(hasNA || hasNN) && footnoteMean ? '; ' : null}
      {footnoteMean ? <>
        <strong>GeoMean</strong>: geometric mean{'; '}
        <strong>GSD</strong>: geometric standard deviation{'; '}
        <strong>Mean</strong>: arithmetic mean{'; '}
        <strong>SD</strong>: arithmetic standard deviation
      </> : null}
      .
    </p> : null}
  </>;
}
