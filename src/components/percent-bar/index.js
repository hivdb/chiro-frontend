import React from 'react';
import {Link} from 'found';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import style from './style.module.scss';

const BLEED_BOUNDARY = 20;


function useMouseTrack({fixed, skip}) {
  const trackRef = React.useRef();
  const [initPos, setInitPos] = React.useState({
    x: null,
    y: null
  });

  const onMouseEnter = React.useCallback(
    () => {
      if (skip) { return; }
      const {x, y} = trackRef.current.getBoundingClientRect();
      setInitPos({x, y});
    },
    [setInitPos, skip]
  );

  const onMouseMove = React.useCallback(
    evt => {
      if (skip) { return; }
      let offsetX = 0,
        offsetY = 0;

      const {x, y} = initPos;
      let {clientX, clientY} = evt;
      if (fixed) {
        clientX = x;
        clientY = y;
      }

      offsetX = clientX - x;
      offsetY = clientY - y;

      const {width, height} = trackRef.current.getBoundingClientRect();
      const {innerWidth, innerHeight} = window;

      const overflowX = clientX + width + BLEED_BOUNDARY - innerWidth;
      if (width > innerWidth) {
        offsetX = BLEED_BOUNDARY;
      }
      else if (overflowX > 0) {
        offsetX -= overflowX;
      }
      const overflowY = clientY + height + BLEED_BOUNDARY - innerHeight;
      if (height > innerHeight) {
        offsetY = - y;
      }
      else if (overflowY > 0) {
        offsetY -= overflowY;
      }

      trackRef.current.style.setProperty('--offset-x', `${offsetX}px`);
      trackRef.current.style.setProperty('--offset-y', `${offsetY}px`);

    },
    [initPos, skip, fixed]
  );

  const onMouseLeave = React.useCallback(
    () => {
      if (skip) { return; }
      trackRef.current.style.removeProperty('--offset-x');
      trackRef.current.style.removeProperty('--offset-y');
    },
    [skip]
  );

  return {
    trackRef,
    onMouseEnter,
    onMouseMove,
    onMouseLeave
  };

}


function PercentBarItem({
  className,
  isActive,
  disableHoverDesc,
  fixedHoverDesc,
  index,
  href,
  to,
  onClick,
  percent,
  title,
  children
}) {

  const {barText, hasCTA} = React.useMemo(
    () => {

      let barText;
      let hasCTA = true;
      const ctaClassName = classNames(
        style['cta'],
        className ? `${className}__cta` : null
      );
      if (href) {
        barText = (
          <a
           className={ctaClassName}
           href={href} onClick={onClick}>
            {title}
          </a>
        );
      }
      else if (to) {
        barText = (
          <Link 
           className={ctaClassName}
           to={to} onClick={onClick}>
            {title}
          </Link>
        );
      }
      else if (onClick) {
        barText = (
          <button 
           className={ctaClassName}
           onClick={onClick}>
            {title}
          </button>
        );
      }
      else {
        hasCTA = false;
        barText = (
          <span className={ctaClassName}>
            {title}
          </span>
        );
      }
      return {hasCTA, barText};
    },
    [className, href, onClick, title, to]
  );

  const {
    trackRef,
    onMouseEnter,
    onMouseMove,
    onMouseLeave
  } = useMouseTrack({
    fixed: fixedHoverDesc,
    skip: disableHoverDesc
  });

  return (
    <li
     className={classNames(
       style['percent-bar-item'],
       className
     )}
     style={{
       '--index': index,
       '--percent': percent
     }}
     onMouseEnter={onMouseEnter}
     onMouseMove={onMouseMove}
     onMouseLeave={onMouseLeave}
     data-is-active={isActive}
     data-fixed-hover-desc={fixedHoverDesc}
     data-disable-hover-desc={disableHoverDesc}
     data-has-cta={hasCTA}
     data-index={index}
     data-percent={percent}>
      {barText}
      <div
       ref={trackRef}
       className={classNames(
         style.desc,
         className ? `${className}__desc` : null
       )}>
        {children}
      </div>
    </li>
  );

}

PercentBarItem.propTypes = {
  isActive: PropTypes.bool,
  disableHoverDesc: PropTypes.bool,
  fixedHoverDesc: PropTypes.bool,
  href: PropTypes.string,
  to: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired
  ]),
  onClick: PropTypes.func,
  className: PropTypes.string,
  index: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired
};

PercentBarItem.defaultProps = {
  isActive: false,
  fixedHoverDesc: false,
  disableHoverDesc: false
};


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

PercentBar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

PercentBar.Item = PercentBarItem;
