import React from 'react';
import {useSetLoading} from '../../../utils/set-loading';


export default function useOnChangeWithLoading(onChange, ref) {
  const setLoading = useSetLoading(ref);

  const handleChange = React.useCallback(
    (...args) => setLoading(() => onChange(...args)),
    [onChange, setLoading]
  );

  return handleChange;
}
