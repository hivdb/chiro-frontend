import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'found';
import makeClassNames from 'classnames';

import style from './style.module.scss';


class NavItem extends React.Component {

  static propTypes = {
    to: PropTypes.string,
    children: PropTypes.node.isRequired,
    currentPathName: PropTypes.string,
    highlighted: PropTypes.bool.isRequired
  }

  static defaultProps = {
    highlighted: false
  }

  get isCurrent() {
    let {to, currentPathName} = this.props;
    let isCurrent = false;
    if (to && currentPathName) {
      to = to.split(/[?#]/)[0].replace(/\/+$/, '');
      isCurrent = (
        to === currentPathName.replace(/\/+$/, '')
      );
    }
    return isCurrent;
  }

  render() {
    const {to, children, highlighted} = this.props;
    const {isCurrent} = this;
    const classNames = [style['nav-item']];
    if (isCurrent) {
      classNames.push(style['current']);
    }
    if (highlighted) {
      classNames.push(style['highlight']);
    }
    return <li className={makeClassNames(classNames)}>
      {to ? <Link to={to}>{children}</Link> : children}
    </li>;
  }

}


export default class Header extends React.Component {

  static propTypes = {
    currentPathName: PropTypes.string.isRequired
  }

  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: null,
      showMenu: false
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

  toggleMenu = (e) => {
    e && e.preventDefault() && e.stopPropagation();
    this.setState({
      showMenu: !this.state.showMenu
    });
  }

  render() {
    const {lastUpdate} = this;
    const {showMenu} = this.state;
    const {currentPathName} = this.props;
    const navItemProps = {currentPathName};
    return (
      <>
        <header className={style['chiro-header']}>
          <div className={style['brand-container']}>
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
          </div>
          <nav className={style['nav-container']}>
            <a
             onTouchStart={this.toggleMenu}
             onTouchEnd={e => e.preventDefault()}
             onClick={this.toggleMenu}
             className={style['menu-toggle']}
             href="#menu-toggle">
              |||
            </a>
            <ul className={makeClassNames(
              style['nav'], showMenu ? style['show'] : null
            )}>
              <NavItem to="/" {...navItemProps}>Home</NavItem>
              <NavItem to="/search/?form_only" {...navItemProps}>
                Search
              </NavItem>
              <NavItem to="/compound-list/" {...navItemProps}>
                Drugs
              </NavItem>
              <NavItem to="/clinical-trials/" {...navItemProps}>
                Clinical Trials
              </NavItem>
              <NavItem highlighted>
                <a
                 href="https://makeagift.stanford.edu/goto/covid19antiviral"
                 target="_blank" rel="noopener noreferrer"
                 className={style.donation}>
                  Support CoVDB
                </a>
              </NavItem>
            </ul>
          </nav>
        </header>
      </>
    );
  }

}
