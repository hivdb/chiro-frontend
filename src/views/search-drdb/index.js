import React from 'react';
import FixedLoader from 'sierra-frontend/dist/components/fixed-loader';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {
  useProviders,
  useIsolateAggs,
  useAbSuscResults,
  useCPSuscResults,
  useVPSuscResults
} from './hooks';
import SearchDRDBLayout from './layout';


function SearchDRDB(props) {

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
    !isIsolateAggsPending
  );

  const resultLoaded = (
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
       isolateAggs={isolateAggs}
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

  const ComboProvider = useProviders('all');

  return <ComboProvider>
    <SearchDRDB {...props} />
  </ComboProvider>;
}
