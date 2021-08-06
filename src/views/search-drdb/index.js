import React from 'react';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {
  useProviders,
  useAbSuscResults,
  useCPSuscResults,
  useVPSuscResults
} from './hooks';
import SearchDRDBLayout from './layout';


function SearchDRDB(props) {

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

  const resultLoaded = (
    !isAbResultPending &&
    !isCPPending &&
    !isVPPending
  );

  return <>
    <SearchDRDBLayout
     loaded={resultLoaded}
     abSuscResults={abSuscResults}
     cpSuscResults={cpSuscResults}
     vpSuscResults={vpSuscResults}
     {...props} />
    <GitHubCorner
     title="Download this database from GitHub"
     href="https://github.com/hivdb/covid-drdb-payload/releases" />
  </>;
  
}


export default function Wrapper(props) {
  useCleanQuery();

  const ComboProvider = useProviders('all');

  return <ComboProvider>
    <SearchDRDB {...props} />
  </ComboProvider>;
}
