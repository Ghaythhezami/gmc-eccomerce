// apps/client/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { storefrontApi } from '../features/storefront/storefrontApi';
import { catalogApi } from '../features/catalog/catalogApi';
import { cartApi } from '../features/cart/cartApi';
import { notificationsApi } from '../features/notifications/notificationsApi';
import { toastSlice } from '../features/notifications/toastSlice';
import { ordersApi } from '../features/orders/ordersApi';
import { productsApi } from '../features/products/productsApi';
import { reviewsApi } from '../features/reviews/reviewsApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    toast: toastSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      storefrontApi.middleware,
      catalogApi.middleware,
      cartApi.middleware,
      notificationsApi.middleware,
      ordersApi.middleware,
      productsApi.middleware,
      reviewsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;