import React from 'react';
import {Link} from 'found';
import classnames from 'classnames';

import style from './style.module.scss';


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
                  ` Last updated at ${lastUpdate.toLocaleString('en-US')}.`}
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
                <Link to="/page/mission-statement/">Mission Statement</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/search/">Search</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/compound-target-list/">Drug Targets</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/clinical-trials/">Clinical Trials</Link>
              </li>
              {/*<li className={style['nav-item']}>
                <Link to="/compound-target-list/">Targets</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/compound-list/">Compounds</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/virus-list/">Viruses</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/cells-list/">Cells</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/animal-model-list/">Animal Models</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/cell-culture-measurement-list/">Measurements</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/article-list/">References</Link>
              </li>
              <li className={style['nav-item']}>
                <Link to="/news/">Coronavirus News</Link>
              </li>*/}

              <li className={style['nav-item']}>
                <a
                 href="https://makeagift.stanford.edu/goto/covid19antiviral"
                 target="_blank" rel="noopener noreferrer"
                 className={style.donation}>
                  Support CoVDB
                </a>
              </li>
            </ul>
          </nav>
        </header>
      </>
    );
  }

}
