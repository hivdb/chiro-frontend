import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route,
} from 'found';

import Search from './views/search';
import SearchResult from './views/search-result';
import TermsOfUse from './views/terms-of-use';

import Layout from './components/layout';

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Search} />
      <Route Component={SearchResult} path="/search-result/" />
      <Route Component={TermsOfUse} path="/terms-of-use/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
