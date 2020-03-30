import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route,
} from 'found';

import Home from './views/home';
import Literature from './views/literature';
import Search from './views/search';
import SearchResult from './views/search-result';
import TermsOfUse from './views/terms-of-use';

import Layout from './components/layout';

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Home} />
      <Route Component={Literature} path="/literature/" />
      <Route Component={Search} path="/search/" />
      <Route Component={SearchResult} path="/search-result/" />
      <Route Component={TermsOfUse} path="/terms-of-use/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
