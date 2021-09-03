import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'found';
import makeClassNames from 'classnames';

import SiteBrand from '../site-brand';
import style from './style.module.scss';

NavItem.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node.isRequired,
  currentPathName: PropTypes.string,
  checkIsCurrent: PropTypes.func,
  highlighted: PropTypes.bool.isRequired
};

NavItem.defaultProps = {
  highlighted: false
};


function NavItem(props) {
  const {
    to,
    checkIsCurrent,
    currentPathName, children, highlighted
  } = props;

  const isCurrent = React.useMemo(
    () => {
      let isCurrent = false;
      if (checkIsCurrent && currentPathName) {
        isCurrent = checkIsCurrent(currentPathName);
      }
      else if (to && currentPathName) {
        isCurrent = (
          to.split(/[?#]/)[0].replace(/\/+$/, '') ===
          currentPathName.replace(/\/+$/, '')
        );
      }
      return isCurrent;
    },
    [checkIsCurrent, currentPathName, to]
  );

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


Header.propTypes = {
  currentPathName: PropTypes.string.isRequired
};


export default function Header({currentPathName}) {

  const [showMenu, setShowMenu] = React.useState(false);

  const toggleMenu = React.useCallback(
    evt => {
      evt && evt.preventDefault() && evt.stopPropagation();
      setShowMenu(!showMenu);
    },
    [showMenu, setShowMenu]
  );

  const checkIsSierraCurrent = React.useCallback(
    curPath => /^\/sierra\/sars2/.test(curPath),
    []
  );

  const navItemProps = {currentPathName};
  return (
    <header className={style['chiro-header']}>
      <SiteBrand responsive />
      <nav className={style['nav-container']}>
        <a
         onTouchStart={toggleMenu}
         onTouchEnd={e => e.preventDefault()}
         onClick={toggleMenu}
         className={style['menu-toggle']}
         href="#menu-toggle">
          |||
        </a>
        <ul className={makeClassNames(
          style['nav'],
          showMenu ? style['show'] : null
        )}>
          <NavItem to="/" {...navItemProps}>Home</NavItem>
          <NavItem to="/page/susceptibility-data/" {...navItemProps}>
            Resistance
          </NavItem>
          <NavItem
           to="/sierra/sars2/"
           checkIsCurrent={checkIsSierraCurrent}
           {...navItemProps}>
            Analysis Program
          </NavItem>
          <NavItem to="/antiviral-portal/" {...navItemProps}>
            Drugs
          </NavItem>
          <NavItem to="/clinical-trials/" {...navItemProps}>
            Trials
          </NavItem>
          <NavItem {...navItemProps}>
            <a
             href="https://www.mdpi.com/1999-4915/12/9/1006"
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
