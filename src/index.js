import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/client';

import ReactGA from 'react-ga';

import './index.module.scss';
import BrowserRouter from './Routing';
import chiroClient from './apollo';

import reportWebVitals from './reportWebVitals';

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
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const rootElem = document.querySelector('#root');
const resizeObserver = new ResizeObserver(([{contentRect: {height}}]) => {
  if (height > window.innerHeight * 1.7) {
    rootElem.setAttribute('data-back-to-top', '');
  }
  else {
    rootElem.removeAttribute('data-back-to-top');
  }
});
resizeObserver.observe(rootElem);
