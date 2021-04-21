import React from 'react';
import {useQuery} from '@apollo/client';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useAntibodies,
  useVirusVariants,
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
    antibodyLookup,
    isPending: isAbLookupPending
  } = useAntibodies();
  const {
    variantLookup,
    isPending: isVariantPending
  } = useVirusVariants();
  const {
    suscResults: abSuscResults,
    isPending: isAbResultPending
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
    !isAbLookupPending &&
    !isVariantPending &&
    !isAbResultPending &&
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
     antibodyLookup={antibodyLookup}
     variantLookup={variantLookup}
     abSuscResults={abSuscResults}
     cpSuscResults={cpSuscResults}
     vpSuscResults={vpSuscResults}
     {...props}
     {...data} />
  );
}
