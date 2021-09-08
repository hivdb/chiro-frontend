import React from 'react';
import PropTypes from 'prop-types';

import {AiOutlineTable} from '@react-icons/all-files/ai/AiOutlineTable';
import {AiOutlineCheck} from '@react-icons/all-files/ai/AiOutlineCheck';
import {AiOutlineClose} from '@react-icons/all-files/ai/AiOutlineClose';
import style from './style.module.scss';


CellDataAvailability.propTypes = {
  hasMultiple: PropTypes.bool.isRequired
};

export default function CellDataAvailability({hasMultiple}) {
  return (
    <div
     className={style['data-availability']}
     data-has-multiple={hasMultiple}>
      <AiOutlineTable />
      {hasMultiple ?
        <AiOutlineCheck className={style['yes']} /> :
        <AiOutlineClose className={style['no']} />}
      <div className={style.desc}>
        {hasMultiple ?
          'Individual data points available' :
          'Data published in only aggregate form'}
      </div>
    </div>
  );
}
