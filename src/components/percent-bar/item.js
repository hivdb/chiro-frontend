import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {TiDelete} from '@react-icons/all-files/ti/TiDelete';

import useCTA from './use-cta';
import useMouseTrack from './use-mouse-track';
import style from './style.module.scss';


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
  clearButton: PropTypes.shape({
    href: PropTypes.string,
    to: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.object.isRequired
    ]),
    onClick: PropTypes.func
  }),
  className: PropTypes.string,
  title: PropTypes.node,
  index: PropTypes.number.isRequired,
  percent: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired
};

PercentBarItem.defaultProps = {
  isActive: false,
  fixedHoverDesc: false,
  disableHoverDesc: false
};


export default function PercentBarItem({
  className,
  isActive,
  disableHoverDesc,
  fixedHoverDesc,
  index,
  href,
  to,
  onClick,
  clearButton,
  percent,
  title,
  children
}) {

  const [barText, hasCTA] = useCTA({
    to, href, onClick, title, className
  });

  const [clearElement, hasClear] = useCTA({
    ...clearButton,
    className,
    title: <TiDelete />,
    defaultClassName: 'remove'
  });

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
      {hasClear ? clearElement : null}
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
