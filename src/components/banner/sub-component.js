import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import style from './style.module.scss';


export default function createSubComponent(defaultAs, defaultClassName) {

  function SubComponent(props) {
    let {as, children, ...extras} = props;
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
  }

  SubComponent.propTypes = {
    as: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired
    ]).isRequired,
    children: PropTypes.node
  };

  SubComponent.defaultProps = {
    as: defaultAs
  };

  return SubComponent;
}
