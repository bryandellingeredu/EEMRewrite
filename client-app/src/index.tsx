
import ReactDOM from 'react-dom/client';
import './app/layout/styles.css';
import reportWebVitals from './reportWebVitals';
import { Providers } from '@microsoft/mgt-element';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import App from './app/layout/App';
import { store, StoreContext } from './app/stores/store';
import { Router } from 'react-router-dom';
import {createBrowserHistory} from 'history';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-calendar/dist/Calendar.css';

export const history = createBrowserHistory();


/*const p2fb ={
  clientId: "bd7c447b-e640-4a8a-99b9-f31769b9ab66",
  tenantId: "0b23030e-3028-4f52-a8f1-a9898322c7fe"
};*/


const hossRob = {
  clientId: "7d102e0f-20f7-4883-84b7-c49b17645db0",
  tenantId: "44f5f615-327a-4d5a-86d5-c9251297d7e4"
}

Providers.globalProvider = new Msal2Provider({
  clientId: hossRob.clientId,
  authority: `https://login.microsoftonline.com/${hossRob.tenantId}`,
  redirectUri: "http://localhost:3000/",
  scopes: ['calendars.read',
            'Calendars.ReadWrite',
            'Group.ReadWrite.All',
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
    <StoreContext.Provider value={store}>
      <Router history={history}>
        <App />
      </Router>
    </StoreContext.Provider>  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
