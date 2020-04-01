import React from 'react';
import {Link} from 'found';
import classnames from 'classnames';

import style from './header.module.scss';


export default class Header extends React.Component {

  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: null
    };
  }

  get lastUpdate() {
    const {lastUpdate} = this.state;
    if (lastUpdate === null) {
      (async () => {
        const resp = await fetch('/lastupdate.txt');
        const dateStr = (await resp.text()).trim();
        this.setState({lastUpdate: new Date(dateStr)});
      })();
    }
    return lastUpdate;
  }

  render() {
    const {lastUpdate} = this;
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
              <div className={style['brand-sitename-subtitle']}>
                <a
                 href="https://hivdb.stanford.edu/"
                 rel="noopener noreferrer"
                 target="_blank">
                  A Stanford HIVDB team website.
                </a>
                {lastUpdate === null ? null :
                  ` Last updated at ${lastUpdate.toLocaleString()}.`}
              </div>
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
                <Link to="/compound-target-list/">Targets</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/compound-list/">Compounds</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/virus-list/">Viruses</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/article-list/">References</Link>
              </li>
            </ul>
          </nav>
        </header>
      </>
    );
  }

}
