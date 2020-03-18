import React from 'react';
import {
    createBrowserRouter,
    makeRouteConfig,
    Route,
  } from 'found';

import Home from './views/home/Home';
  
const BrowserRouter = createBrowserRouter({
    routeConfig: makeRouteConfig(
        <Route path="/" Component={Home}>
        </Route>,
    ),

    renderError: ({ error }) => (
        <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
    ),
});

export default BrowserRouter