import React from 'react';

export default function setLoading(ref, callback, delay = 20) {
  const target = ref.current;
  if (target) {
    target.dataset.loading = '';
    setTimeout(() => {
      callback();
      setTimeout(() => {
        delete target.dataset.loading;
      });
    }, delay);
  }
}


export function useSetLoading(ref, delay = 20) {
  const mountState = React.useRef(false);

  React.useEffect(
    () => {
      mountState.current = true;
      return () => {
        mountState.current = false;
      };
    },
    []
  );

  const safeSetLoading = React.useCallback(
    callback => {
      setLoading(ref, () => {
        if (mountState.current) {
          callback();
        }
      }, delay);
    },
    [ref, delay]
  );

  return safeSetLoading;
}
