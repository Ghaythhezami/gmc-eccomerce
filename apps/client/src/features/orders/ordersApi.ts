import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Orders'],
  endpoints: (build) => ({
    getMyOrders: build.query<Order[], void>({
      query: () => 'orders',
      providesTags: ['Orders'],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
  }),
});

export const { useGetMyOrdersQuery, useGetOrderQuery } = ordersApi;
