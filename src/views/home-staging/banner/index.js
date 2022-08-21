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
  };

  static defaultProps = {
    bgImage: (
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAA' +
      'AAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=='
    ),
    narrow: false
  };

  static SubSection = SubComponent('section', 'banner-sub-section');
  static Slider = Slider;

  get subSectionElement() {
    const {children} = this.props;
    return children
      .reduce((acc, child) => {
        if (child instanceof Array) {
          acc = [...acc, ...child];
        }
        return acc;
      }, [])
      .filter(node => node.type === this.constructor.SubSection);
  }

  get sliderElement() {
    const {children} = this.props;
    return children.filter(node => node.type === this.constructor.Slider);
  }

  render() {
    const {bgImage, narrow} = this.props;
    const {
      subSectionElement, sliderElement
    } = this;
    const classNames = makeClassNames(
      style['banner-section'],
      narrow ? style['narrow'] : null
    );

    return (
      <section
       className={classNames}>
        <div className={style['banner-img-container']}>
          <img className={style['banner-img']} src={bgImage} alt={bgImage} />
        </div>
        {subSectionElement}
        {sliderElement}
      </section>
    );
  }

}
