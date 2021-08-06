import React from 'react';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {
  useProviders,
  useArticles,
  useVaccines,
  useInfectedVariants,
  useVariants,
  useIsolates,
  useIsolateAggs,
  useAbSuscResults,
  useCPSuscResults,
  useVPSuscResults
} from './hooks';
import SearchDRDBLayout from './layout';


function SearchDRDB(props) {

  const {
    articles,
    articleLookup,
    isPending: isRefNameListPending
  } = useArticles();
  const {
    vaccines,
    vaccineLookup,
    isPending: isVaccPending
  } = useVaccines();
  const {
    infectedVariants,
    isPending: isInfectedVariantPending
  } = useInfectedVariants();
  const {
    variants,
    isPending: isVariantPending
  } = useVariants();
  const {
    isolateLookup,
    isPending: isIsolatePending
  } = useIsolates();
  const {
    isolateAggs,
    isPending: isIsolateAggsPending
  } = useIsolateAggs();

  const {
    suscResults: abSuscResults,
    isPending: isAbResultPending
  } = useAbSuscResults();
  const {
    suscResults: cpSuscResults,
    isPending: isCPPending
  } = useCPSuscResults();
  const {
    suscResults: vpSuscResults,
    isPending: isVPPending
  } = useVPSuscResults();

  const searchBoxLoaded = (
    !isRefNameListPending &&
    !isVaccPending &&
    !isInfectedVariantPending &&
    !isVariantPending &&
    !isIsolatePending &&
    !isIsolateAggsPending
  );

  const resultLoaded = (
    !isRefNameListPending &&
    !isVaccPending &&
    !isInfectedVariantPending &&
    !isVariantPending &&
    !isIsolatePending &&
    !isAbResultPending &&
    !isCPPending &&
    !isVPPending
  );

  if (!searchBoxLoaded) {
    return <FixedLoader />;
  }
  else {
    return <>
      <SearchDRDBLayout
       loaded={resultLoaded}
       articles={articles}
       articleLookup={articleLookup}
       vaccines={vaccines}
       infectedVariants={infectedVariants}
       vaccineLookup={vaccineLookup}
       variants={variants}
       isolateAggs={isolateAggs}
       isolateLookup={isolateLookup}
       abSuscResults={abSuscResults}
       cpSuscResults={cpSuscResults}
       vpSuscResults={vpSuscResults}
       {...props} />
      <GitHubCorner
       title="Download this database from GitHub"
       href="https://github.com/hivdb/covid-drdb-payload/releases" />
    </>;
  }
}


export default function Wrapper(props) {
  useCleanQuery();

  const ComboProvider = useProviders();

  return <ComboProvider>
    <SearchDRDB {...props} />
  </ComboProvider>;
}
