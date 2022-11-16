import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


IntegerCell.propTypes = {
  value: PropTypes.number
};

export default function IntegerCell({value}) {
  return value === null || value === undefined ? null : (
    <span className={style['integer-cell']}>
      {value > 100 ? "99+" : value}
    </span>
  );
}
