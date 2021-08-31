import React from 'react';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {useProviders} from './hooks';
import SearchDRDBLayout from './layout';


export default function SearchDRDB() {
  useCleanQuery();

  const ComboProvider = useProviders('all');

  return <ComboProvider>
    <SearchDRDBLayout />
    <GitHubCorner
     title="Download this database from GitHub"
     href="https://github.com/hivdb/covid-drdb-payload/releases" />
  </ComboProvider>;
}
