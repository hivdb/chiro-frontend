import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'found';
import makeClassNames from 'classnames';

import SiteBrand from '../site-brand';
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
      showMenu: false
    };
  }

  toggleMenu = (e) => {
    e && e.preventDefault() && e.stopPropagation();
    this.setState({
      showMenu: !this.state.showMenu
    });
  }

  render() {
    const {showMenu} = this.state;
    const {currentPathName} = this.props;
    const navItemProps = {currentPathName};
    return (
      <header className={style['chiro-header']}>
        <SiteBrand responsive />
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
            <NavItem>
              <a
               href="https://www.preprints.org/manuscript/202007.0551/v1"
               target="_blank" rel="noopener noreferrer">
                Citation
              </a>
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
    );
  }

}
