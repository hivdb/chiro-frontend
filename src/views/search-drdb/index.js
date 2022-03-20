import React, {lazy} from 'react';
import {Route, matchShape} from 'found';
import PropTypes from 'prop-types';
import GitHubCorner from '../../components/github-corner';

import {useCleanQuery} from './hooks/location-params';
import {useProviders} from './hooks';

const MainLayout = lazy(() => import('./main-layout'));
const GenotypeRxLayout = lazy(() => import('./genotype-rx'));


ProviderWrapper.propTypes = {
  children: PropTypes.node,
  match: matchShape.isRequired
};


function ProviderWrapper({children, match}) {
  const {location: {pathname}} = match;
  const formOnly = pathname.endsWith('genotype-rx/') ? false : 'auto';
  useCleanQuery({formOnly});

  const ComboProvider = useProviders('all', {
    locationParams: {formOnly}
  });

  return <ComboProvider>
    {children}
    <GitHubCorner
     title="Download this database from GitHub"
     href="https://github.com/hivdb/covid-drdb-payload/releases" />
  </ComboProvider>;
}


export default function SearchDRDBRoutes(pathPrefix) {
  return <Route path={pathPrefix} Component={ProviderWrapper}>
    <Route Component={MainLayout} />
    <Route path="genotype-rx/" Component={GenotypeRxLayout} />
  </Route>;
}
