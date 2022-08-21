import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import throttle from 'lodash/throttle';
import {IoIosArrowForward} from '@react-icons/all-files/io/IoIosArrowForward';
import {IoIosArrowBack} from '@react-icons/all-files/io/IoIosArrowBack';

import style from './style.module.scss';

function getDirection(evt) {
  const {dataset} = evt.currentTarget;
  let direction = 1;
  if (dataset.direction === 'prev') {
    direction = -1;
  }
  return direction;
}


export default class Slider extends React.Component {

  static propTypes = {
    title: PropTypes.node.isRequired,
    as: PropTypes.string.isRequired,
    children: PropTypes.node,
    endHref: PropTypes.string
  };

  static defaultProps = {
    as: 'section'
  };

  constructor() {
    super(...arguments);
    this.sectionsRef = createRef();
    this.state = {
      currentSectionIdx: 0,
      disablePrev: true,
      disableNext: false,
      touchX: null,
      diffX: 0
    };
  }

  handleSwipeStart = evt => {
    this.setState({
      touchX: evt.touches[0].clientX
    });
  };

  handleSwipeMove = throttle(evt => {
    if (!evt.touches || evt.touches.length === 0) {
      return;
    }
    const {touchX, currentSectionIdx} = this.state;
    const diffX = evt.touches[0].clientX - touchX;
    const offsetX = parseInt(diffX / 3);
    this.sectionsRef.current.style.transform = (
      `translateX(calc(${-100 * currentSectionIdx}% + ${offsetX}px))`
    );
    this.setState({diffX});
  }, 25);

  handleSwipeEnd = () => {
    const {diffX, currentSectionIdx} = this.state;
    if (diffX < 0) {
      this.handleSlide(1);
    }
    else if (diffX > 0) {
      this.handleSlide(-1);
    }
    this.sectionsRef.current.style.transform = (
      `translateX(${-100 * currentSectionIdx}%)`
    );
    this.setState({
      touchX: null,
      diffX: 0
    });
  };

  handleClick = evt => {
    const {disableNext} = this.state;
    const {endHref} = this.props;
    const direction = getDirection(evt);
    if (disableNext && endHref && direction === 1) {
      return;
    }
    evt.preventDefault() && evt.stopPropagation();
    this.handleSlide(direction);
  };

  handleSlide = direction => {
    let {currentSectionIdx} = this.state;
    currentSectionIdx += direction;
    const {sectionsRef: {current: target}} = this;
    const numSections = target.childElementCount;
    if (
      currentSectionIdx < 0 ||
      currentSectionIdx >= numSections
    ) {
      return;
    }
    this.setState({
      currentSectionIdx,
      disablePrev: currentSectionIdx === 0,
      disableNext: currentSectionIdx === numSections - 1,
      touchX: null,
      diffX: 0
    });
  };

  render() {
    const {currentSectionIdx, disablePrev, disableNext} = this.state;
    const {as, title, children, endHref, ...extras} = this.props;
    extras.className = makeClassNames(
      style['banner-slider'],
      extras.className
    );
    return (
      React.createElement(
        as,
        extras,
        <>
          <h2>{title}</h2>
          <div className={style['slider-container']}>
            <a
             disabled={disablePrev}
             data-direction="prev"
             className={style['arrow-prev']} href="#prev"
             onTouchStart={this.handleClick}
             onClick={this.handleClick}
             onTouchEnd={evt => evt.preventDefault()}>
              <IoIosArrowBack alt="Prev" />
            </a>
            <div
             onTouchStart={this.handleSwipeStart}
             onTouchMove={this.handleSwipeMove}
             onTouchEnd={this.handleSwipeEnd}
             className={style['slider-sections-overflow']}>
              <div
               ref={this.sectionsRef}
               style={{
                 transform: `translateX(${-100 * currentSectionIdx}%)`
               }}
               className={style['slider-sections']}>
                {children}
              </div>
            </div>
            <a
             disabled={!endHref && disableNext}
             href={endHref && disableNext ? endHref : '#next'}
             data-direction="next"
             className={style['arrow-next']}
             onTouchStart={this.handleClick}
             onClick={this.handleClick}
             onTouchEnd={evt => evt.preventDefault()}>
              <IoIosArrowForward alt="Next" />
            </a>
          </div>
        </>
      )
    );
  }
}
