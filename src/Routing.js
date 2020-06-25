import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Route
} from 'found';

import SARS2Routes from 'sierra-frontend/dist/views/sars2';

import Home from './views/home';
import Search from './views/search';
import CompoundList from './views/compound-list';
import CompoundTargetList from './views/compound-target-list';
import VirusList from './views/virus-list';
import CellsList from './views/cells-list';
import AnimalModelList from './views/animal-model-list';
import CellCultureMeasurementList from './views/cell-culture-measurement-list';
import ArticleList from './views/article-list';
import TermsOfUse from './views/terms-of-use';
import Donation from './views/donation';
import ClinicalTrialsV1 from './views/clinical-trials';
import ClinicalTrialsV2 from './views/clinical-trials-v2';
import News from './views/news';
import Plots from './views/plots';
import DatabaseSchema from './views/database-schema';
import Page from './views/page';

import style from './index.module.scss';

import Layout from './components/layout';

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Home} />
      <Route path="sierra/">
        {SARS2Routes({
          graphqlURI: window.__NODE_ENV === 'production' ?
            '/sierra-sars2/graphql' :
            'http://localhost:8113/Sierra-SARS2/graphql',
          className: style['sierra-sars2-webui']
        })}
      </Route>
      <Route Component={Search} path="/search/" />
      <Route Component={CompoundList} path="/compound-list/" />
      <Route Component={CompoundTargetList} path="/compound-target-list/" />
      <Route Component={VirusList} path="/virus-list/" />
      <Route Component={CellsList} path="/cells-list/" />
      <Route Component={AnimalModelList} path="/animal-model-list/" />
      <Route
       Component={CellCultureMeasurementList}
       path="/cell-culture-measurement-list/" />
      <Route Component={ArticleList} path="/article-list/" />
      <Route Component={TermsOfUse} path="/terms-of-use/" />
      <Route Component={Donation} path="/donation/" />
      <Route Component={News} path="/news/" />
      <Route Component={ClinicalTrialsV1} path="/clinical-trials-v1/" />
      <Route Component={ClinicalTrialsV2} path="/clinical-trials/" />
      <Route Component={Plots} path="/plots/" />
      <Route Component={DatabaseSchema} path="/database-schema/" />
      <Route Component={Page} path="/page/:pageName/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
