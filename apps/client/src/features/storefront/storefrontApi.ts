import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface FlashSale {
  enabled: boolean;
  headline: string;
  endsAt: string | null;
}

export const storefrontApi = createApi({
  reducerPath: 'storefrontApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  }),
  endpoints: (builder) => ({
    getStorefrontAccess: builder.query<{ allowedRoles: string[] }, void>({
      query: () => 'admin/storefront-access',
    }),
    getFlashSale: builder.query<FlashSale, void>({
      query: () => 'storefront/flash-sale',
    }),
    subscribeNewsletter: builder.mutation<{ email: string }, { email: string; source?: string }>({
      query: (body) => ({ url: 'newsletter/subscribe', method: 'POST', body }),
    }),
  }),
});

export const {
  useGetStorefrontAccessQuery,
  useGetFlashSaleQuery,
  useSubscribeNewsletterMutation,
} = storefrontApi;