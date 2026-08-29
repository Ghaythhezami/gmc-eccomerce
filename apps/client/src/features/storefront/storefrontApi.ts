import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const storefrontApi = createApi({
  reducerPath: 'storefrontApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  }),
  endpoints: (builder) => ({
    getStorefrontAccess: builder.query<{ allowedRoles: string[] }, void>({
      query: () => 'admin/storefront-access',
    }),
  }),
});

export const { useGetStorefrontAccessQuery } = storefrontApi;