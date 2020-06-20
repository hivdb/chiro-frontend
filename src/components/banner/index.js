import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import style from './style.module.scss';


function SubComponent(defaultAs, defaultClassName) {
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

export default class Banner extends React.Component {

  static propTypes = {
    bgImage: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(
      PropTypes.node.isRequired
    ).isRequired
  }

  static Title = SubComponent('h1', 'banner-header-title');
  static Subtitle = SubComponent('div', 'banner-header-subtitle');
  static Sidebar = SubComponent('div', 'banner-sidebar');

  get titleElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Title);
  }

  get subtitleElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Subtitle);
  }

  get sidebarElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Sidebar);
  }

  render() {
    const {bgImage} = this.props;
    const {titleElement, subtitleElement, sidebarElement} = this;

    return(
      <section
       className={style['banner-section']}>
        <div className={style['banner-img-container']}>
          <img className={style['banner-img']} src={bgImage} alt={bgImage} />
        </div>
        <header className={style['banner-header']}>
          {titleElement}
          {subtitleElement}
        </header>
        {sidebarElement}
      </section>
    );
  }

}
