import React from 'react';
import PropTypes from 'prop-types';
import {IoIosClose} from '@react-icons/all-files/io/IoIosClose';

import style from './style.module.scss';


export default class Modal extends React.Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    closeOnBlur: PropTypes.bool.isRequired,
    minHeight: PropTypes.oneOfType([
      PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([
      PropTypes.number, PropTypes.string]),
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    closeOnBlur: true
  }

  handleModalClick(e) {
    const {onClose, closeOnBlur} = this.props;
    if (!closeOnBlur) {
      return;
    }
    if ('generalModal' in e.target.dataset) {
      // close on blur
      onClose();
    }
  }

  render() {
    let {children, onClose, width, minHeight} = this.props;

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
       onClick={this.handleModalClick.bind(this)}
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
}
