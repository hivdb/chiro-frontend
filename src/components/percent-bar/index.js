import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import PercentBarItem from './item';
import style from './style.module.scss';


PercentBar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

PercentBar.Item = PercentBarItem;

export default function PercentBar({className, children}) {

  return (
    <ul
     data-total={children.length}
     style={{
       '--total': children.length
     }}
     className={classNames(
       style['percent-bar'],
       className
     )}>
      {children}
    </ul>
  );

}
