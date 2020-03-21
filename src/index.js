import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';

import './index.css';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import Header from './components/header';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(<>
  <Header />
  <ApolloProvider client={chiroClient}>
    <BrowserRouter />
  </ApolloProvider>
</>, document.getElementById('root'));

serviceWorker.unregister();
