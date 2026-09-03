import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store';
import { App } from './App';
import { ToastProvider } from './components/Toast';
import { registerServiceWorker } from './features/notifications/push';
import './styles.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

// Registered up front so an already-subscribed browser keeps receiving push
// even before the user visits the notifications page.
registerServiceWorker().catch(() => {
  /* Push is optional; an unavailable service worker must not break the app. */
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
