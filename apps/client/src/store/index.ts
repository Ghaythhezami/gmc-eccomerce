import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';

export const store = configureStore({ reducer: { auth: authSlice.reducer, [authApi.reducerPath]: authApi.reducer }, middleware: (getDefault) => getDefault().concat(authApi.middleware) });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
