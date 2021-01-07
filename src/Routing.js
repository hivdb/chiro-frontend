import React from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Redirect,
  Route
} from 'found';

import SARS2Routes from 'sierra-frontend/dist/views/sars2';
import MutAnnotViewerRoutes from 'sierra-frontend/dist/views/mut-annot-viewer';

import Home from './views/home';
import HomeStaging from './views/home-staging';
import Search from './views/search';
import CompoundList from './views/compound-list';
import CompoundTargetList from './views/compound-target-list';
import VirusList from './views/virus-list';
import CellsList from './views/cells-list';
import AnimalModelList from './views/animal-model-list';
import CellCultureMeasurementList from './views/cell-culture-measurement-list';
import ArticleList from './views/article-list';
import Donation from './views/donation';
import ClinicalTrialsV2 from './views/clinical-trials-v2';
import SARS2RefSeq from './views/sars2-ref-seq';
import News from './views/news';
import Plots from './views/plots';
import Page from './views/page';
import MutAnnotViewerLayout from './views/mut-annot-viewer-layout';

import {mutAnnotViewerConfig} from './config';
import style from './index.module.scss';

import Layout from './components/layout';

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Home} />
      <Route path="home-staging/" Component={HomeStaging} />
      <Route path="sierra/">
        {SARS2Routes({
          config: {
            graphqlURI: window.__NODE_ENV === 'production' ?
              '/sierra-sars2/graphql' :
              'http://localhost:8113/Sierra-SARS2/graphql'
          },
          className: style['sierra-sars2-webui']
        })}
      </Route>
      <Route render={({props}) => (
        <MutAnnotViewerLayout {...props} {...mutAnnotViewerConfig} />
      )}>
        {MutAnnotViewerRoutes({
          ...mutAnnotViewerConfig,
          pathPrefix: 'mut-annot-viewer/',
          className: style['mut-annot-editor-ui']
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
      <Route Component={Donation} path="/donation/" />
      <Route Component={News} path="/news/" />
      <Route Component={ClinicalTrialsV2} path="/clinical-trials/" />
      <Route Component={SARS2RefSeq} path='/sars2-ref-seq/' />
      <Route Component={Plots} path="/plots/" />
      <Route Component={Page} path="/page/:pageName/" />
      <Redirect from="/terms-of-use/" to="/page/terms-of-use/" />
      <Redirect from="/database-schema/" to="/page/database-schema/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
