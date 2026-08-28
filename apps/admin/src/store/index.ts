import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../features/auth/authApi';
import { authSlice } from '../features/auth/authSlice';
import { notificationsApi } from '../features/notifications/notificationsApi';
import { toastSlice } from '../features/notifications/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    toast: toastSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, notificationsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
