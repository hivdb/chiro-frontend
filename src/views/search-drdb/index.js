import React from 'react';
import {useQuery} from '@apollo/client';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useArticles,
  useAntibodies,
  useVaccines,
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
    mutationText,
    mutationMatch,
    abNames,
    vaccineName,
    variantName,
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
    variantLookup,
    isPending: isVariantPending
  } = useVirusVariants();

  const {
    suscResults: abSuscResults,
    isPending: isAbResultPending
  } = useAbSuscResults({
    skip,
    refName,
    mutations,
    mutationMatch,
    variantName,
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
    variantName
  });
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    skip,
    refName,
    mutations,
    mutationMatch,
    variantName,
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
       variantName={variantName}
       onChange={onChange}
       formOnly={formOnly !== undefined}
       articles={articles}
       articleLookup={articleLookup}
       antibodies={antibodies}
       antibodyLookup={antibodyLookup}
       vaccines={vaccines}
       vaccineLookup={vaccineLookup}
       variants={variants}
       variantLookup={variantLookup}
       abSuscResults={abSuscResults}
       cpSuscResults={cpSuscResults}
       vpSuscResults={vpSuscResults}
       {...props}
       {...data} />
    );
  }
}
