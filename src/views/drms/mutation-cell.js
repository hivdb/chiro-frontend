import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


MutationCell.propTypes = {
  text: PropTypes.string.isRequired,
  varcons: PropTypes.number
};

export default function MutationCell({text, varcons}) {
  return (
    <span
     data-is-varcons={!!varcons}
     className={style['mutation-cell']}>
      {text}
    </span>
  );
}
