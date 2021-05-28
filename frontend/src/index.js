import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom";

import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// core styles
import "./scss/theme.scss";

// vendor styles
import "@fortawesome/fontawesome-free/css/all.css";
import "react-datetime/css/react-datetime.css";



ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
