import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  imageUrl: string | null;
  stock: number;
  category?: { id: string; name: string; slug: string };
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  }),
  endpoints: (build) => ({
    getProducts: build.query<Product[], void>({ query: () => 'products' }),
    getProduct: build.query<Product, string>({ query: (id) => `products/${id}` }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = productsApi;
