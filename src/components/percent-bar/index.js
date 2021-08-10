import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import PercentBarItem from './item';
import style from './style.module.scss';


PercentBar.propTypes = {
  scaleRatio: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

PercentBar.defaultProps = {
  scaleRatio: 0
};

PercentBar.Item = PercentBarItem;

export default function PercentBar({className, children, scaleRatio}) {

  return (
    <ul
     data-total={children.length}
     style={{
       '--total': children.length,
       '--scale': scaleRatio
     }}
     className={classNames(
       style['percent-bar'],
       className
     )}>
      {children}
    </ul>
  );

}
