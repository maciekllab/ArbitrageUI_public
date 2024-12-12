import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { HashRouter } from 'react-router-dom';
import { setupXHRInterceptor } from './interceptors/xhrInterceptor';

setupXHRInterceptor();

let theme = createTheme({
  palette: {
    mode:"dark",
    primary: {
      main: '#E2703A',
      contrastText: '#fff',
    },
    background: {
      default: '#393053',
      paper: '#443C68',
    },
    text: {
      primary: '#bebdbf'
    },
    action: {
      active: '#888888',
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <HashRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
  </HashRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
