import React from 'react';
import {useQuery} from '@apollo/client';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useArticles,
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
    mutationMatch,
    abNames,
    onChange
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
    articleLookup,
    isPending: isRefNameListPending
  } = useArticles();
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
    mutationMatch,
    abNames
  });
  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = useCPSuscResults({
    refName,
    spikeMutations: mutations,
    mutationMatch
  });
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    refName,
    spikeMutations: mutations,
    mutationMatch
  });

  const loaded = (
    !isArticlePending &&
    !isRefNameListPending &&
    !isAbLookupPending &&
    !isVariantPending &&
    !isAbResultPending &&
    !isCPPending &&
    !isVPPending
  );

  if (error) {
    return `Error: ${error.message}`;
  }
  if (!loaded) {
    return <FixedLoader />;
  }
  else {
    return (
      <SearchDRDBLayout
       refName={refName}
       mutations={mutations}
       abNames={abNames}
       loaded={loaded}
       onChange={onChange}
       formOnly={formOnly !== undefined}
       articleLookup={articleLookup}
       antibodyLookup={antibodyLookup}
       variantLookup={variantLookup}
       abSuscResults={abSuscResults}
       cpSuscResults={cpSuscResults}
       vpSuscResults={vpSuscResults}
       {...props}
       {...data} />
    );
  }
}
