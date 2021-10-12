import React from 'react';

export default function setLoading(ref, callback) {
  const target = ref.current;
  if (target) {
    target.dataset.loading = '';
    setTimeout(() => {
      callback();
      setTimeout(() => {
        delete target.dataset.loading;
      });
    });
  }
}


export function useSetLoading(ref) {
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
      });
    },
    [ref]
  );

  return safeSetLoading;
}
