// apps/admin/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';
import { adminApi } from '../features/categories/categoriesApi';
import { storefrontApi } from '../features/storefront/storefrontApi';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [storefrontApi.reducerPath]: storefrontApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, adminApi.middleware, storefrontApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
