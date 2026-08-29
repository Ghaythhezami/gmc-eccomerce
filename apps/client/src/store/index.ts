// apps/client/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { storefrontApi } from '../features/storefront/storefrontApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, storefrontApi.middleware), // <-- MUST ADD BOTH
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;