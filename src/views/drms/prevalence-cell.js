import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


PrevalenceCell.propTypes = {
  indel: PropTypes.bool,
  value: PropTypes.number
};

export default function PrevalenceCell({value, indel}) {
  return indel ? null : (
    <span
     data-is-usual={value >= 0.0001}
     className={style['prevalence-cell']}>

      {value ? (value * 100).toPrecision(
        value < 0.01 ? 1 : (
          value < 0.995 ? 2 : 3
        )
      ) : 0}%
    </span>
  );
}
