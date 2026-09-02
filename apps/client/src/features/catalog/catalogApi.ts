// apps/client/src/features/catalog/catalogApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  imageUrl: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string; icon: string | null };
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface ProductQuery {
  category?: string;
  search?: string;
  featured?: boolean;
  onSale?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name';
  page?: number;
  limit?: number;
}

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api' }),
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
    }),
    getProducts: builder.query<ProductPage, ProductQuery | void>({
      query: (params) => ({ url: 'products', params: (params ?? {}) as Record<string, string | number | boolean> }),
    }),
    getProduct: builder.query<Product, string>({
      query: (slug) => `products/${slug}`,
    }),
  }),
});

export const { useGetCategoriesQuery, useGetProductsQuery, useGetProductQuery } = catalogApi;
