import React from 'react';
import makeClassNames from 'classnames';

import style from './style.module.scss';


export default function SubComponent(defaultAs, defaultClassName) {
  return function(props) {
    let {as, children, ...extras} = props;
    if (as === undefined) {
      as = defaultAs;
    }
    extras.className = makeClassNames(
      style[defaultClassName],
      extras.className
    );
    return (
      React.createElement(
        as,
        extras,
        children
      )
    );
  };
}
