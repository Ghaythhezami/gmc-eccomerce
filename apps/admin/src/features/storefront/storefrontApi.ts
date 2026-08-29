// apps/admin/src/features/storefront/storefrontApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export const storefrontApi = createApi({
  reducerPath: 'storefrontApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['StorefrontAccess'],
  endpoints: (builder) => ({
    getStorefrontAccess: builder.query<{ allowedRoles: string[] }, void>({
      query: () => 'admin/storefront-access',
      providesTags: ['StorefrontAccess'],
    }),
    updateStorefrontAccess: builder.mutation<void, { allowedRoles: string[] }>({
      query: (body) => ({ url: 'admin/storefront-access', method: 'PUT', body }),
      invalidatesTags: ['StorefrontAccess'],
    }),
    // NEW: Fetch all roles
    getAllRoles: builder.query<string[], void>({
      query: () => 'admin/roles',
    }),
  }),
});

export const { 
  useGetStorefrontAccessQuery,
  useUpdateStorefrontAccessMutation,
  useGetAllRolesQuery, // <-- Export this
} = storefrontApi;