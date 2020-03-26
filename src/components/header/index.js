import React from 'react';
import classnames from 'classnames';

import style from './header.module.sass';


export default class MockHeader extends React.Component {

  render() {
    return (
      <>
        <header
         className={classnames(
           style['header-global'],
           style['header-logo']
         )}>
          <nav className={style['header-container']}>
            <a className={style['brand-sitename']} href="/">
              Coronavirus Antiviral Treatment Research Database
            </a>
          </nav>

        </header>
        <header className={style['header-bar']}>
          <nav className={style['header-container']}>
            <ul className={style['nav']}>
              <li className={style['nav-item']}>
                <a href="/">Home</a>
              </li>
              <li className={style['nav-item']}>
                <a href="/">Literatures</a>
              </li>
              <li className={style['nav-item']}>
                <a href="/search">Experiments</a>
              </li>
            </ul>
          </nav>
        </header>
      </>
    );
  }

}
