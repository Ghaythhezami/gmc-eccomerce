// apps/admin/src/features/catalog/catalogApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';
import type { Category, CategoryInput, Product, ProductInput } from './types';

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Category', 'Product'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => 'categories/manage/all',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, CategoryInput>({
      query: (body) => ({ url: 'categories', method: 'POST', body }),
      // Product rows embed their category, so both lists go stale together.
      invalidatesTags: ['Category', 'Product'],
    }),
    updateCategory: builder.mutation<Category, { id: string; body: Partial<CategoryInput> }>({
      query: ({ id, body }) => ({ url: `categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Category', 'Product'],
    }),
    deleteCategory: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category', 'Product'],
    }),

    getProducts: builder.query<Product[], void>({
      query: () => 'products/manage/all',
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<Product, ProductInput>({
      query: (body) => ({ url: 'products', method: 'POST', body }),
      invalidatesTags: ['Product', 'Category'],
    }),
    updateProduct: builder.mutation<Product, { id: string; body: Partial<ProductInput> }>({
      query: ({ id, body }) => ({ url: `products/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Product', 'Category'],
    }),
    deleteProduct: builder.mutation<{ id: string }, string>({
      query: (id) => ({ url: `products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product', 'Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = catalogApi;
