import React, {lazy} from 'react';
import {Route, matchShape} from 'found';
import PropTypes from 'prop-types';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {useProviders} from './hooks';

const MainLayout = lazy(() => import('./main-layout'));
const SelectionDataLayout = lazy(() => import('./selection-data'));


ProviderWrapper.propTypes = {
  children: PropTypes.node,
  match: matchShape.isRequired
};


function ProviderWrapper({children, match}) {
  const {location: {pathname}} = match;
  const formOnly = pathname.endsWith('selection-data/') ? false : 'auto';
  useCleanQuery({formOnly});
  const providerPreset = (
    pathname.endsWith('selection-data/') ? 'selectionData' : 'all'
  );

  const ComboProvider = useProviders(providerPreset, {
    locationParams: {formOnly}
  });
  // eslint-disable-next-line no-console
  console.debug('render <ProviderWrapper />');

  return <ComboProvider>
    {children}
    <GitHubCorner
     title="Download this database from GitHub"
     href="https://github.com/hivdb/covid-drdb-payload/releases" />
  </ComboProvider>;
}


export default function SearchDRDBRoutes(pathPrefix) {
  // eslint-disable-next-line no-console
  console.debug('render <SearchDRDBRoutes />');
  return <Route path={pathPrefix} Component={ProviderWrapper}>
    <Route Component={MainLayout} />
    <Route path="selection-data/" Component={SelectionDataLayout} />
  </Route>;
}
