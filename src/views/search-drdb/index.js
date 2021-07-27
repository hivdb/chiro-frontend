import React from 'react';
import {useQuery} from '@apollo/client';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import GitHubCorner from '../../components/github-corner';

import articleQuery from './search.gql';

import {
  useLocationParams,
  useArticles,
  useAntibodies,
  useVaccines,
  useVariants,
  useIsolates,
  useCPCount,
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
    convPlasmaValue,
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
    cpSuscResultCount,
    isPending: isCPCountPending
  } = useCPCount();

  const {
    suscResults: abSuscResults,
    isPending: isAbResultPending
  } = useAbSuscResults({
    skip: skip || vaccineName || convPlasmaValue,
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
    skip: skip || (abNames && abNames.length > 0) || vaccineName,
    refName,
    mutations,
    mutationMatch,
    varName,
    cpOption: convPlasmaValue
  });
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults({
    skip: skip || (abNames && abNames.length > 0) || convPlasmaValue,
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
    !isVariantPending &&
    !isIsolatePending &&
    !isCPCountPending
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
    return <>
      <SearchDRDBLayout
       loaded={resultLoaded}
       refName={refName}
       mutations={mutations}
       mutationText={mutationText}
       mutationMatch={mutationMatch}
       abNames={abNames}
       vaccineName={vaccineName}
       convPlasmaValue={convPlasmaValue}
       varName={varName}
       onChange={onChange}
       formOnly={formOnly !== undefined}
       articles={articles}
       articleLookup={articleLookup}
       antibodies={antibodies}
       antibodyLookup={antibodyLookup}
       vaccines={vaccines}
       cpSuscResultCount={cpSuscResultCount}
       vaccineLookup={vaccineLookup}
       variants={variants}
       isolates={isolates}
       isolateLookup={isolateLookup}
       abSuscResults={abSuscResults}
       cpSuscResults={cpSuscResults}
       vpSuscResults={vpSuscResults}
       {...props}
       {...data} />
      <GitHubCorner
       title="Download this database from GitHub"
       href="https://github.com/hivdb/covid-drdb-payload/releases" />
    </>;
  }
}
