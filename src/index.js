import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import BrowserRouter from './Routing';

import * as serviceWorker from './serviceWorker';

ReactDOM.render(<BrowserRouter />, document.getElementById('root'));

serviceWorker.unregister();
