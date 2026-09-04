// apps/admin/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { storefrontApi } from '../features/storefront/storefrontApi';
import { catalogApi } from '../features/catalog/catalogApi';
import { notificationsApi } from '../features/notifications/notificationsApi';
import { ordersApi } from '../features/orders/ordersApi';
import { toastSlice } from '../features/notifications/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    toast: toastSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      storefrontApi.middleware,
      catalogApi.middleware,
      notificationsApi.middleware,
      ordersApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;