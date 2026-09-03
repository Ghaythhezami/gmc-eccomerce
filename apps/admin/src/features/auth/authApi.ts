// apps/admin/src/features/auth/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // ADMIN LOGIN
    login: builder.mutation<{ user: any; accessToken: string }, { email: string; password: string }>({
      query: (body) => ({ url: 'admin/auth/login', method: 'POST', body }),
    }),
    // ADMIN REGISTER
    register: builder.mutation<{ user: any; accessToken: string }, any>({
      query: (body) => ({ url: 'admin/auth/register', method: 'POST', body }),
    }),
    // Google Login for Admin
    googleLogin: builder.mutation<{ user: any; accessToken: string }, { googleToken: string }>({
      query: (body) => ({ url: 'admin/auth/google', method: 'POST', body }),
    }),
    // Check if current admin exists
    me: builder.query<any, void>({
      query: () => 'admin/me',
    }),
    // Get Users with pagination
    getUsers: builder.query<{ data: any[]; total: number; page: number; limit: number; totalPages: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `admin/users?page=${page}&limit=${limit}`,
      providesTags: ['Users'],
    }),
    // Delete a user
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useGetUsersQuery, 
  useDeleteUserMutation, 
  useGoogleLoginMutation,
  useMeQuery
} = authApi;