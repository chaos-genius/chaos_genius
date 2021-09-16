import React from 'react';

import { HashRouter } from 'react-router-dom';

import Routes from './routes';

import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';

const App = () => (
  <HashRouter>
    <Routes />
  </HashRouter>
);

export default App;
