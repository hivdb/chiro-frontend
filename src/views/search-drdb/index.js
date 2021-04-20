import React from 'react';
import {useQuery} from '@apollo/client';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useAbSuscResults,
  useCPSuscResults,
  useVPSuscResults
} from './hooks';
import SearchDRDBLayout from './layout';


export default function SearchDRDB(props) {
  const {
    formOnly,
    refName,
    mutations,
    abNames
  } = useLocationParams();
  let {
    loading: isArticlePending,
    error,
    data
  } = useQuery(articleQuery, {
    variables: {
      articleNickname: refName
    },
    skip: formOnly !== undefined || !refName
  });
  const {
    suscResults: abSuscResults,
    isPending: isAbPending
  } = useAbSuscResults({
    refName,
    spikeMutations: mutations,
    abNames
  });
  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = useCPSuscResults({
    refName,
    spikeMutations: mutations,
  });
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    refName,
    spikeMutations: mutations,
  });

  const loaded = (
    !isArticlePending &&
    !isAbPending &&
    !isCPPending &&
    !isVPPending
  );

  if (error) {
    return `Error: ${error.message}`;
  }
  return (
    <SearchDRDBLayout
     refName={refName}
     mutations={mutations}
     abNames={abNames}
     loaded={loaded}
     formOnly={formOnly !== undefined}
     abSuscResults={abSuscResults}
     cpSuscResults={cpSuscResults}
     vpSuscResults={vpSuscResults}
     {...props}
     {...data} />
  );
}
