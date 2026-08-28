import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { notificationsApi } from './notificationsApi';
import { connectSocket, disconnectSocket } from './socket';
import { pushToast } from './toastSlice';
import type { AppNotification } from './types';

/**
 * Keeps one authenticated Socket.IO connection alive for the signed-in admin
 * and turns each `notification.created` push (e.g. a low-stock alert) into a
 * live cache refresh plus a toast.
 */
export function useNotificationsSocket() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);
    const onCreated = (notification: AppNotification) => {
      dispatch(notificationsApi.util.invalidateTags(['Notifications', 'UnreadCount']));
      dispatch(
        pushToast({
          id: notification.id,
          title: notification.title,
          message: notification.message,
        }),
      );
    };

    socket.on('notification.created', onCreated);
    return () => {
      socket.off('notification.created', onCreated);
    };
  }, [token, dispatch]);
}
