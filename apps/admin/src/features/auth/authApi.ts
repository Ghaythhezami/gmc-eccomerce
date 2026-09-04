// apps/admin/src/features/auth/authApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthHandling } from '../../store/baseQuery';

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
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Users', 'Stats'],
  endpoints: (builder) => ({
    // ADMIN LOGIN
    login: builder.mutation<{ user: any; accessToken: string }, { email: string; password: string }>({
      query: (body) => ({ url: 'admin/auth/login', method: 'POST', body }),
    }),
    // ADMIN REGISTER - admin-only; creates a colleague, so both lists go stale.
    register: builder.mutation<{ user: any; accessToken: string }, any>({
      query: (body) => ({ url: 'admin/auth/register', method: 'POST', body }),
      invalidatesTags: ['Users', 'Stats'],
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
    getStats: builder.query<AdminStats, void>({
      query: () => 'admin/stats',
      providesTags: ['Stats'],
    }),
    // Delete a user
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
  useGoogleLoginMutation,
  useMeQuery,
} = authApi;
