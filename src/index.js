import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';

import {Container} from 'semantic-ui-react';
import ReactGA from 'react-ga';

import './index.css';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import Header from './components/header';

import * as serviceWorker from './serviceWorker';

import 'semantic-ui-css/semantic.min.css';
import globalStyle from './styles/global.module.scss';

if (window.location.host === 'covrx.hivdb.org') {
  ReactGA.initialize('UA-443373-7');
} else {
  ReactGA.initialize('UA-443373-6');
}

ReactDOM.render(<>
  <Header />
  <div className={globalStyle["main-content"]}>
    <Container className="he is dead jim">
      <ApolloProvider client={chiroClient}>
        <BrowserRouter />
      </ApolloProvider>
    </Container>
  </div>
</>, document.getElementById('root'));

serviceWorker.unregister();
