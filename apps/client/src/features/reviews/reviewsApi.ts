import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

export interface ReviewPage {
  items: Review[];
  total: number;
  averageRating: number;
  skip: number;
  take: number;
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Reviews', 'Eligibility'],
  endpoints: (build) => ({
    getProductReviews: build.query<
      ReviewPage,
      { productId: string; skip?: number; take?: number }
    >({
      query: ({ productId, skip = 0, take = 10 }) =>
        `products/${productId}/reviews?skip=${skip}&take=${take}`,
      providesTags: (_result, _error, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    getReviewEligibility: build.query<{ eligible: boolean }, string>({
      query: (productId) => `products/${productId}/reviews/me/eligibility`,
      providesTags: (_result, _error, productId) => [{ type: 'Eligibility', id: productId }],
    }),
    createReview: build.mutation<
      Review,
      { productId: string; rating: number; comment?: string }
    >({
      query: ({ productId, ...body }) => ({
        url: `products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetReviewEligibilityQuery,
  useCreateReviewMutation,
} = reviewsApi;
