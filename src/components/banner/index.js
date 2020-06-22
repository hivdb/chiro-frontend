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
    narrow: PropTypes.bool.isRequired,
    children: PropTypes.arrayOf(
      PropTypes.node.isRequired
    ).isRequired
  }

  static defaultProps = {
    bgImage: (
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQ' +
      'AAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='
    ),
    narrow: false
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
    const {bgImage, narrow} = this.props;
    const {titleElement, subtitleElement, sidebarElement} = this;
    const classNames = makeClassNames(
      style['banner-section'],
      narrow ? style['narrow'] : null
    );

    return(
      <section
       className={classNames}>
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
