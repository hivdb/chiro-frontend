import React from 'react';
import {Icon} from 'semantic-ui-react';
import style from './style.module.scss';


export default class BackToTop extends React.Component {

  handleClick = (evt) => {
    evt && evt.preventDefault();
    window.scrollTo(0, 0);
  };

  render() {
    return <div className={style['back-to-top-container']}>
      <a
       href="#back-to-top"
       onClick={this.handleClick}
       className={style['back-to-top']}>
        <Icon name="arrow up" size="big" />
      </a>
    </div>;
  }

}
