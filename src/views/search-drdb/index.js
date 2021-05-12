import React from 'react';
import {useQuery} from '@apollo/client';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useArticles,
  useAntibodies,
  useVaccines,
  useVariants,
  useIsolates,
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
    mutationText,
    mutationMatch,
    abNames,
    vaccineName,
    varName,
    onChange
  } = useLocationParams();
  const skip = formOnly !== undefined;
  let {
    loading: isArticlePending,
    error,
    data
  } = useQuery(articleQuery, {
    variables: {
      articleNickname: refName
    },
    skip: skip || !refName
  });
  const {
    articles,
    articleLookup,
    isPending: isRefNameListPending
  } = useArticles();
  const {
    antibodies,
    antibodyLookup,
    isPending: isAbLookupPending
  } = useAntibodies();
  const {
    vaccines,
    vaccineLookup,
    isPending: isVaccPending
  } = useVaccines();
  const {
    variants,
    isPending: isVariantPending
  } = useVariants();
  const {
    isolates,
    isolateLookup,
    isPending: isIsolatePending
  } = useIsolates();

  const {
    suscResults: abSuscResults,
    isPending: isAbResultPending
  } = useAbSuscResults({
    skip,
    refName,
    mutations,
    mutationMatch,
    varName,
    abNames
  });
  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = useCPSuscResults({
    skip,
    refName,
    mutations,
    mutationMatch,
    varName
  });
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    skip,
    refName,
    mutations,
    mutationMatch,
    varName,
    vaccineName
  });

  const searchBoxLoaded = (
    !isArticlePending &&
    !isRefNameListPending &&
    !isAbLookupPending &&
    !isVaccPending &&
    !isVariantPending
  );

  const resultLoaded = (
    !isArticlePending &&
    !isRefNameListPending &&
    !isAbLookupPending &&
    !isVaccPending &&
    !isVariantPending &&
    !isIsolatePending &&
    !isAbResultPending &&
    !isCPPending &&
    !isVPPending
  );

  if (error) {
    return `Error: ${error.message}`;
  }
  if (!searchBoxLoaded) {
    return <FixedLoader />;
  }
  else {
    return (
      <SearchDRDBLayout
       loaded={resultLoaded}
       refName={refName}
       mutations={mutations}
       mutationText={mutationText}
       mutationMatch={mutationMatch}
       abNames={abNames}
       vaccineName={vaccineName}
       varName={varName}
       onChange={onChange}
       formOnly={formOnly !== undefined}
       articles={articles}
       articleLookup={articleLookup}
       antibodies={antibodies}
       antibodyLookup={antibodyLookup}
       vaccines={vaccines}
       vaccineLookup={vaccineLookup}
       variants={variants}
       isolates={isolates}
       isolateLookup={isolateLookup}
       abSuscResults={abSuscResults}
       cpSuscResults={cpSuscResults}
       vpSuscResults={vpSuscResults}
       {...props}
       {...data} />
    );
  }
}
