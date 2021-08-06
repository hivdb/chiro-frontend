import React from 'react';
import isEqual from 'lodash/isEqual';
import {useRouter} from 'found';

import {cleanQuery} from './funcs';


export default function useCleanQuery() {
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query
    }
  } = match;

  React.useEffect(
    () => {
      const cleanedQuery = cleanQuery(query);
      if (!isEqual(query, cleanedQuery)) {
        router.replace({
          ...loc,
          query: cleanedQuery
        });
      }
    },
    [/* eslint-disable-line react-hooks/exhaustive-deps */]
  );
}
