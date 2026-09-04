// apps/admin/src/features/storefront/storefrontApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthHandling } from '../../store/baseQuery';

export interface FlashSale {
  enabled: boolean;
  headline: string;
  endsAt: string | null;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

export interface NewsletterList {
  subscribers: NewsletterSubscriber[];
  active: number;
  total: number;
}

export const storefrontApi = createApi({
  reducerPath: 'storefrontApi',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['StorefrontAccess', 'FlashSale', 'Newsletter'],
  endpoints: (builder) => ({
    getStorefrontAccess: builder.query<{ allowedRoles: string[] }, void>({
      query: () => 'admin/storefront-access',
      providesTags: ['StorefrontAccess'],
    }),
    updateStorefrontAccess: builder.mutation<void, { allowedRoles: string[] }>({
      query: (body) => ({ url: 'admin/storefront-access', method: 'PUT', body }),
      invalidatesTags: ['StorefrontAccess'],
    }),
    getFlashSale: builder.query<FlashSale, void>({
      query: () => 'storefront/flash-sale',
      providesTags: ['FlashSale'],
    }),
    updateFlashSale: builder.mutation<FlashSale, FlashSale>({
      query: (body) => ({ url: 'storefront/flash-sale', method: 'PUT', body }),
      invalidatesTags: ['FlashSale'],
    }),
    getSubscribers: builder.query<NewsletterList, void>({
      query: () => 'newsletter/manage',
      providesTags: ['Newsletter'],
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
  useGetAllRolesQuery,
  useGetFlashSaleQuery,
  useUpdateFlashSaleMutation,
  useGetSubscribersQuery,
} = storefrontApi;