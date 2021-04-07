import React, {lazy} from 'react';
import {
  createBrowserRouter,
  makeRouteConfig,
  Redirect,
  Route
} from 'found';

import SARS2Routes from 'sierra-frontend/dist/views/sars2';
import MutAnnotViewerRoutes from 'sierra-frontend/dist/views/mut-annot-viewer';
import GenomeViewerRoutes from 'sierra-frontend/dist/views/genome-viewer';

import {mutAnnotViewerConfig, mutationViewerConfig} from './config';
import style from './index.module.scss';

import Layout from './components/layout';
import refDataLoader from './components/refdata-loader';
import {getFullLink} from './utils/cms';

const Home = lazy(() => import('./views/home'));
const HomeStaging = lazy(() => import('./views/home-staging'));
const Archive = lazy(() => import('./views/archive'));
const Search = lazy(() => import('./views/search'));
const CompoundList = lazy(() => import('./views/compound-list'));
const CompoundTargetList = lazy(() => import('./views/compound-target-list'));
const VirusList = lazy(() => import('./views/virus-list'));
const CellsList = lazy(() => import('./views/cells-list'));
const AnimalModelList = lazy(() => import('./views/animal-model-list'));
const CellCultureMeasurementList = lazy(
  () => import('./views/cell-culture-measurement-list')
);
const ArticleList = lazy(() => import('./views/article-list'));
const Donation = lazy(() => import('./views/donation'));
const ClinicalTrialsV2 = lazy(() => import('./views/clinical-trials-v2'));
const SARS2RefSeq = lazy(() => import('./views/sars2-ref-seq'));
const News = lazy(() => import('./views/news'));
const Plots = lazy(() => import('./views/plots'));
const Page = lazy(() => import('./views/page'));
const MutAnnotViewerLayout = lazy(
  () => import('./views/mut-annot-viewer-layout')
);
const MutationViewerLayout = lazy(
  () => import('./views/mutation-viewer-layout')
);

const BrowserRouter = createBrowserRouter({

  routeConfig: makeRouteConfig(
    <Route path="/" Component={Layout}>
      <Route Component={Home} />
      <Route path="home-staging/" Component={HomeStaging} />
      <Route path="sierra/">
        {SARS2Routes({
          config: {
            configFromURL: getFullLink('pages/sierra-sars2.json'),
            graphqlURI: window.__NODE_ENV === 'production' ?
              '/sierra-sars2/graphql' :
              'http://localhost:8113/Sierra-SARS2/graphql',
            refDataLoader
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
      <Route render={({props}) => (
        <MutationViewerLayout
         {...props}
         {...mutationViewerConfig}
         pathPrefix="mutation-viewer/" />
      )}>
        {GenomeViewerRoutes({
          ...mutationViewerConfig,
          pathPrefix: 'mutation-viewer/',
          className: style['genome-viewer-ui']
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
      <Route Component={Page} path="/page/:pageName+/" />
      <Route Component={Archive} path="/archive/" />
      <Redirect from="/terms-of-use/" to="/page/terms-of-use/" />
      <Redirect from="/database-schema/" to="/page/database-schema/" />
    </Route>
  ),

  renderError: ({ error }) => (
    <div>{error.status === 404 ? 'Not found' : 'Error'}</div>
  ),
});

export default BrowserRouter;
