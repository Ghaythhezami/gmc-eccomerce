// apps/admin/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { storefrontApi } from '../features/storefront/storefrontApi';
import { catalogApi } from '../features/catalog/catalogApi';
import { adminNotificationsApi } from '../features/notifications/notificationsApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [adminNotificationsApi.reducerPath]: adminNotificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      storefrontApi.middleware,
      catalogApi.middleware,
      adminNotificationsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
