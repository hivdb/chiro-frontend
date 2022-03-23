import React from 'react';
import {useRouter} from 'found';


export function useGoBack() {
  const {router} = useRouter();
  const handleGoBack = React.useCallback(
    e => {
      e && e.preventDefault();
      router.go(-1);
    },
    [router]
  );
  return handleGoBack;
}
