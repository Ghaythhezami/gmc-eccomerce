// apps/client/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { storefrontApi } from '../features/storefront/storefrontApi';
import { catalogApi } from '../features/catalog/catalogApi';
import { notificationsApi } from '../features/notifications/notificationsApi';
import { cartApi } from '../features/cart/cartApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      storefrontApi.middleware,
      catalogApi.middleware,
      notificationsApi.middleware,
      cartApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
