import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route,
} from 'found';

import Home from './views/home';
import Search from './views/search';
import CompoundList from './views/compound-list';
import CompoundTargetList from './views/compound-target-list';
import TermsOfUse from './views/terms-of-use';

import Layout from './components/layout';

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Home} />
      <Route Component={Search} path="/search/" />
      <Route Component={CompoundList} path="/compound-list/" />
      <Route Component={CompoundTargetList} path="/compound-target-list/" />
      <Route Component={TermsOfUse} path="/terms-of-use/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
