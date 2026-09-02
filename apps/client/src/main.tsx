import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { App } from './App';
import { registerServiceWorker } from './features/notifications/push';
import './styles.css';

// Registered up front so an already-subscribed browser keeps receiving push
// even before the user visits the notifications page.
registerServiceWorker().catch(() => {
  /* Push is optional; an unavailable service worker must not break the app. */
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
