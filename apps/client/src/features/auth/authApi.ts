// src/features/auth/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, User } from './types';
import type { RootState } from '../../store';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, { firstName: string; lastName: string; email: string; password: string }>({
      query: (body) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
    // NEW: Google Login mutation
    googleLogin: builder.mutation<{ user: any; accessToken: string }, { googleToken: string; email?: string; firstName?: string; lastName?: string }>({
      query: (body) => ({ url: 'auth/google', method: 'POST', body }),
    }),
    me: builder.query<User, void>({
      query: () => 'auth/me',
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useGoogleLoginMutation, useMeQuery } = authApi;