import React from 'react';

const BLEED_BOUNDARY = 20;


export default function useMouseTrack({fixed, skip}) {
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

      const {width} = trackRef.current.getBoundingClientRect();
      const {innerWidth} = window;

      const overflowX = clientX + width + BLEED_BOUNDARY - innerWidth;
      if (width > innerWidth) {
        offsetX = BLEED_BOUNDARY;
      }
      else if (overflowX > 0) {
        offsetX -= overflowX;
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


