import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


import style from '../style.module.scss';


CellCumulativeCount.propTypes = {
  num: PropTypes.number.isRequired,
  numNN: PropTypes.number
};


export default function CellCumulativeCount({num, numNN}) {
  return <>
    {num}
    {numNN > 0 ? <>
      <br />
      <span className={classNames(
        style['supplement-info'],
        style['small']
      )}>
        (<em>N.N.</em>={numNN.toLocaleString('en-US')})
      </span>
    </> : null}
  </>;
}
