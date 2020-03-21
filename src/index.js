import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';

import './index.css';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <ApolloProvider client={chiroClient}>
    <BrowserRouter />
  </ApolloProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
