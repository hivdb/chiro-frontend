import React from 'react';
import isEqual from 'lodash/isEqual';
import {useRouter} from 'found';

import {cleanQuery} from './funcs';


export default function useCleanQuery({formOnly = 'auto'}) {
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query
    }
  } = match;

  React.useEffect(
    () => {
      const cleanedQuery = cleanQuery(query, formOnly);
      if (!isEqual(query, cleanedQuery)) {
        router.replace({
          ...loc,
          query: cleanedQuery
        });
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [formOnly]
  );
}
