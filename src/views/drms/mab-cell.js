import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


MAbCell.propTypes = {
  fold: PropTypes.number,
  dms: PropTypes.number
};

export default function MAbCell({fold, dms}) {
  const level = fold >= 25 ? 'R' : (
    fold >= 5 ? 'I' : (
      fold >= 0 ? 'S' : 'U'
    )
  );

  return (
    <span
     data-level={level}
     className={style['mab-cell']}>
      {dms >= 0.1 ? '+' : null}
    </span>
  );
}
