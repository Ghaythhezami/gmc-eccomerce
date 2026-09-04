import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuthHandling } from '../../store/baseQuery';
import type { AppNotification, NotificationPage } from './types';

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Notifications', 'UnreadCount'],
  endpoints: (build) => ({
    getNotifications: build.query<NotificationPage, { skip?: number; take?: number }>({
      query: ({ skip = 0, take = 20 } = {}) => `notifications?skip=${skip}&take=${take}`,
      providesTags: ['Notifications'],
    }),
    getUnreadCount: build.query<{ unread: number }, void>({
      query: () => 'notifications/unread-count',
      providesTags: ['UnreadCount'],
    }),
    markRead: build.mutation<AppNotification, string>({
      query: (id) => ({ url: `notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),
    markAllRead: build.mutation<{ updated: number }, void>({
      query: () => ({ url: 'notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications', 'UnreadCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApi;
