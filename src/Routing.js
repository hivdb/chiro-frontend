import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route,
} from 'found';

import Home from './views/home/Home';
import Search from './views/search';
  
const BrowserRouter = createBrowserRouter({
  routeConfig: makeRouteConfig(
    <Route path="/">
      <Route Component={Home} />
      <Route Component={Search} path="/search" />
    </Route>,
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
