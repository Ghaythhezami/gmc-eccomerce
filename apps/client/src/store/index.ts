import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { authSlice } from '../features/auth/authSlice';
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
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      notificationsApi.middleware,
      ordersApi.middleware,
      productsApi.middleware,
      reviewsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
