// apps/admin/src/features/auth/authApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface AdminStats {
  users: { total: number; admins: number; customers: number };
  products: { total: number; active: number; hidden: number; outOfStock: number; lowStock: number };
  categories: { total: number; active: number };
  orders: { total: number };
  push: { subscriptions: number };
  inventory: { unitsInStock: number; averagePrice: number };
  productsByCategory: { name: string; icon: string | null; count: number }[];
}

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
  tagTypes: ['Users', 'Stats'],
  endpoints: (builder) => ({
    // ADMIN LOGIN (different endpoint!)
    login: builder.mutation<{ user: any; accessToken: string }, { email: string; password: string }>({
      query: (body) => ({ url: 'admin/auth/login', method: 'POST', body }),
    }),
    // ADMIN REGISTER (different endpoint!)
    register: builder.mutation<{ user: any; accessToken: string }, any>({
      query: (body) => ({ url: 'admin/auth/register', method: 'POST', body }),
    }),
    getUsers: builder.query<any[], void>({
      query: () => 'admin/users',
      providesTags: ['Users'],
    }),
    getStats: builder.query<AdminStats, void>({
      query: () => 'admin/stats',
      providesTags: ['Stats'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users', 'Stats'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetStatsQuery,
} = authApi;