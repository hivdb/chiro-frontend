import React from 'react';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {useProviders} from './hooks';
import SearchDRDBLayout from './layout';


export default function SearchDRDB(props) {
  useCleanQuery();

  const ComboProvider = useProviders('all');

  return <ComboProvider>
    <SearchDRDBLayout {...props} />
    <GitHubCorner
     title="Download this database from GitHub"
     href="https://github.com/hivdb/covid-drdb-payload/releases" />
  </ComboProvider>;
}
