import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';

import ReactGA from 'react-ga';

import './index.css';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import * as serviceWorker from './serviceWorker';

import 'semantic-ui-css/semantic.min.css';

if (window.location.host === 'covdb.stanford.edu') {
  ReactGA.initialize('UA-443373-7');
} else {
  ReactGA.initialize('UA-443373-6');
}

ReactDOM.render(
  <ApolloProvider client={chiroClient}>
    <BrowserRouter />
  </ApolloProvider>,
  document.getElementById('root'));

serviceWorker.unregister();
