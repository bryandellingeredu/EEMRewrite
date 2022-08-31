import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Providers } from '@microsoft/mgt-element';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';

Providers.globalProvider = new Msal2Provider({
  clientId: "bd7c447b-e640-4a8a-99b9-f31769b9ab66",
  authority: "https://login.microsoftonline.com/0b23030e-3028-4f52-a8f1-a9898322c7fe",
  redirectUri: "http://localhost:3000/",
  scopes: ['calendars.read',
           'user.read',
           'user.read.all',
           'openid',
           'profile',
          'people.read',
          'user.readbasic.all',
          'group.read.all'
        ]
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
