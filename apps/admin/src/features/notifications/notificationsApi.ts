// apps/admin/src/features/notifications/notificationsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../store';

export interface SentNotification {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  user: { email: string };
}

export interface BroadcastResult {
  recipients: number;
  sent: number;
  failed: number;
  pruned: number;
}

export const adminNotificationsApi = createApi({
  reducerPath: 'adminNotificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Sent'],
  endpoints: (builder) => ({
    getRecentNotifications: builder.query<SentNotification[], void>({
      query: () => 'notifications/manage/recent',
      providesTags: ['Sent'],
    }),
    broadcast: builder.mutation<BroadcastResult, { title: string; message: string; url?: string }>({
      query: (body) => ({ url: 'notifications/broadcast', method: 'POST', body }),
      invalidatesTags: ['Sent'],
    }),
  }),
});

export const { useGetRecentNotificationsQuery, useBroadcastMutation } = adminNotificationsApi;
