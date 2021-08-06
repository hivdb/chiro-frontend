import React from 'react';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import GitHubCorner from '../../components/github-corner';

import LocationParams, {useCleanQuery} from './hooks/location-params';
import {
  useArticles,
  useAntibodies,
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

  const {params: {formOnly}} = LocationParams.useMe();
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
    !isAbLookupPending &&
    !isVaccPending &&
    !isInfectedVariantPending &&
    !isVariantPending &&
    !isIsolatePending &&
    !isIsolateAggsPending
  );

  const resultLoaded = (
    !isRefNameListPending &&
    !isAbLookupPending &&
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
       formOnly={formOnly !== undefined}
       articles={articles}
       articleLookup={articleLookup}
       antibodies={antibodies}
       antibodyLookup={antibodyLookup}
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

  return <LocationParams.Provider>
    <SearchDRDB {...props} />
  </LocationParams.Provider>;
}
