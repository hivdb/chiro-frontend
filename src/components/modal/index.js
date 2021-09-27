import React from 'react';
import PropTypes from 'prop-types';
import {IoIosClose} from '@react-icons/all-files/io/IoIosClose';

import style from './style.module.scss';


Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  closeOnBlur: PropTypes.bool.isRequired,
  closeOnEsc: PropTypes.bool.isRequired,
  minHeight: PropTypes.oneOfType([
    PropTypes.number, PropTypes.string
  ]),
  width: PropTypes.oneOfType([
    PropTypes.number, PropTypes.string
  ]),
  children: PropTypes.node.isRequired
};

Modal.defaultProps = {
  closeOnBlur: true,
  closeOnEsc: true
};


export default function Modal({
  children,
  width,
  minHeight,
  onClose,
  closeOnBlur,
  closeOnEsc
}) {

  const handleModalClick = React.useCallback(
    e => {
      if (!closeOnBlur) {
        return;
      }
      if ('generalModal' in e.target.dataset) {
        // close on blur
        onClose();
      }
    },
    [onClose, closeOnBlur]
  );

  const handleGlobalKeydown = React.useCallback(
    e => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    },
    [onClose]
  );

  React.useEffect(
    () => {
      if (!closeOnEsc) {
        return;
      }
      window.addEventListener('keydown', handleGlobalKeydown, false);
      return () => {
        window.removeEventListener('keydown', handleGlobalKeydown, false);
      };
    },
    [closeOnEsc, handleGlobalKeydown]
  );

  const addStyle = {};
  if (width) {
    addStyle.width = width;
  }
  if (minHeight) {
    addStyle.minHeight = minHeight;
  }

  return (
    <div
     className={style['general-modal']}
     onClick={handleModalClick}
     data-general-modal>
      <div className={style.dialog} style={addStyle}>
        <button
         type="button"
         name="close" onClick={onClose}>
          <IoIosClose />
        </button>
        <div className={style['dialog-container']}>
          {children}
        </div>
      </div>
    </div>
  );

}
