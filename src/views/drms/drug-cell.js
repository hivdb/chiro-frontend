import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


DrugCell.propTypes = {
  fold: PropTypes.number,
  pocket: PropTypes.number
};

export default function DrugCell({fold, pocket}) {
  const level = fold >= 10 ? 'R' : (
    fold >= 5 ? 'II' : (
      fold >= 2.5 ? 'I' : (
        fold >= 0 ? 'S' : 'U'
      )
    )
  );

  return (
    <span
     data-level={level}
     className={style['drug-cell']}>
      {pocket ? 'P' : null}
    </span>
  );
}
