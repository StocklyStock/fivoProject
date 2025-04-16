// 📄 src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
          <App />
      </Provider>
    </GoogleOAuthProvider>
  </>
);
