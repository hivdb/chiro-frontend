import React from 'react';
import {Link} from 'found';
import classnames from 'classnames';

import style from './header.module.scss';


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
            <Link className={style['brand-logo']} to="/" />
            <div className={style['brand-sitename']}>
              <Link className={style['brand-sitename-title']} to="/">
                Coronavirus Antiviral Research Database
              </Link>
              <a
               className={style['brand-sitename-subtitle']}
               href="https://hivdb.stanford.edu/"
               rel="noopener noreferrer"
               target="_blank">
                A Stanford HIVDB team website.
              </a>
            </div>
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
