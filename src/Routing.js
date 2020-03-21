import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route,
} from 'found';

import Home from './views/home/Home';
import Search from './views/search';
import SearchResult from './views/search-result';
  
const BrowserRouter = createBrowserRouter({
  routeConfig: makeRouteConfig(
    <Route path="/">
      <Route Component={Home} />
      <Route Component={Search} path="/search/" />
      <Route Component={SearchResult} path="/search-result/" />
    </Route>,
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
