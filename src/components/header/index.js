import React from 'react';
import {Link} from 'found';
import classnames from 'classnames';

import style from './header.module.sass';


export default class Header extends React.Component {

  render() {
    return (
      <>
        <header
         className={classnames(
           style['header-global'],
           style['header-logo']
         )}>
          <nav className={style['header-container']}>
            <Link className={style['brand-sitename']} to="/">
              Coronavirus Antiviral Research Database
            </Link>
          </nav>

        </header>
        <header className={style['header-bar']}>
          <nav className={style['header-container']}>
            <ul className={style['nav']}>
              <li className={style['nav-item']}>
                <Link to="/">Home</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/">Literature</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/search/">Experiments</Link>
              </li>
            </ul>
          </nav>
        </header>
      </>
    );
  }

}
