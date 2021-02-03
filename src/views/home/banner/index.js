import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import Slider from './slider';
import SubComponent from './sub-component';
import style from './style.module.scss';


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
  static ExtraSection = SubComponent('section', 'banner-extra-section');
  static Slider = Slider;
  static SideSection = SubComponent('section', 'banner-side-section');

  get titleElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Title);
  }

  get subtitleElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Subtitle);
  }

  get extraSectionElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.ExtraSection);
  }

  get sliderElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Slider);
  }

  get sideSectionElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.SideSection);
  }

  render() {
    const {bgImage, narrow} = this.props;
    const {
      titleElement, subtitleElement, extraSectionElement,
      sliderElement, sideSectionElement
    } = this;
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
        <div className={style['banner-left-sections']}>
          <header className={style['banner-header']}>
            {titleElement}
            {subtitleElement}
          </header>
          {extraSectionElement}
          {sliderElement}
        </div>
        <div className={style['banner-right-sections']}>
          {sideSectionElement}
        </div>
      </section>
    );
  }

}
