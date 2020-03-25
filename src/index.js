import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';

import ReactGA from 'react-ga';

import './index.css';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import Header from './components/header';

import * as serviceWorker from './serviceWorker';

if (window.location.host === 'covrx.hivdb.org') {
  ReactGA.initialize('UA-443373-7');
} else {
  ReactGA.initialize('UA-443373-6');
}

ReactDOM.render(<>
  <Header />
  <ApolloProvider client={chiroClient}>
    <BrowserRouter />
  </ApolloProvider>
</>, document.getElementById('root'));

serviceWorker.unregister();
