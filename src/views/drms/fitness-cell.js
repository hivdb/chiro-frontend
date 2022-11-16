import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


FitnessCell.propTypes = {
  value: PropTypes.number
};

export default function FitnessCell({value}) {
  const level = value >= 0.8 ? 'OK' : (
    value >= 0.4 ? 'reduced' : (
      value >= 0.15 ? 'fair' : (
        value >= 0 ? 'poor' : 'U'
      )
    )
  );

  return level === 'U' ? null : (
    <span
     data-level={level}
     className={style['fitness-cell']}>
      {level === 'OK' ? 'OK' : null}
      {level === 'reduced' ? '↓' : null}
      {level === 'fair' ? '↓↓' : null}
      {level === 'poor' ? '↓↓↓' : null}
    </span>
  );
}
