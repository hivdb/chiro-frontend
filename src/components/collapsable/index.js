import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import Section from './section';
import style from './style.module.scss';


export default class Collapsable extends React.Component {

  static propTypes = {
    levels: PropTypes.arrayOf(
      PropTypes.oneOf(['h2', 'h3', 'h4', 'h5', 'h6']).isRequired
    ).isRequired,
    children: PropTypes.node
  }

  static defaultProps = {
    levels: ['h3']
  }

  static Section = Section;

  render() {
    const {levels, children} = this.props;
    const classNames = makeClassNames(
      style.collapsable,
      ...levels.map(level => style[`collapse-${level}`])
    );

    return <div className={classNames}>{children}</div>;
  }

}
