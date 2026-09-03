// apps/client/src/pages/Notifications.tsx
import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Check, Loader2 } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from '../features/notifications/notificationsApi';
import { currentState, subscribe, unsubscribe, type PushState } from '../features/notifications/push';
import { useToast } from '../components/Toast';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function Notifications() {
  const token = useAppSelector((s) => s.auth.accessToken);
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  const toast = useToast();
  const [pushState, setPushState] = useState<PushState>('unsubscribed');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    currentState().then(setPushState);
  }, []);

  const togglePush = async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      if (pushState === 'subscribed') {
        await unsubscribe(token);
      } else {
        await subscribe(token);
      }
      const next = await currentState();
      setPushState(next);
      toast.success(next === 'subscribed' ? 'Notifications enabled on this device.' : 'Notifications turned off.');
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Could not change your notification setting.';
      setError(detail);
      toast.error(detail);
    } finally {
      setBusy(false);
    }
  };

  const unread = notifications.filter((n) => n.readAt === null).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <header className="mb-6">
        <p className="eyebrow">Account</p>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">
          {unread > 0 ? `${unread} unread` : 'You are all caught up.'}
        </p>
      </header>

      {/* Push subscription control */}
      <section className="mb-8 rounded-lg border border-[#c8c4b9] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                pushState === 'subscribed' ? 'bg-[#a34f32] text-white' : 'bg-[#f5f1e8] text-[#a34f32]'
              }`}
            >
              {pushState === 'subscribed' ? <BellRing size={20} /> : <Bell size={20} />}
            </span>
            <div>
              <h2 className="font-bold">Browser notifications</h2>
              <p className="mt-0.5 max-w-md text-sm text-gray-600">
                {pushState === 'unsupported' && 'This browser does not support web push notifications.'}
                {pushState === 'denied' &&
                  'Notifications are blocked for this site. Re-enable them in your browser settings, then reload.'}
                {pushState === 'subscribed' && 'This device receives push notifications about deals and orders.'}
                {pushState === 'unsubscribed' && 'Get notified about flash sales and order updates, even when this tab is closed.'}
              </p>
            </div>
          </div>

          {pushState !== 'unsupported' && pushState !== 'denied' && (
            <button
              type="button"
              onClick={togglePush}
              disabled={busy || !token}
              className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                pushState === 'subscribed'
                  ? 'border border-[#c8c4b9] bg-white text-[#20231f] hover:bg-[#f5f1e8]'
                  : 'bg-[#a34f32] text-white hover:bg-[#8b3f25]'
              }`}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : pushState === 'subscribed' ? (
                <BellOff size={16} />
              ) : (
                <Bell size={16} />
              )}
              {pushState === 'subscribed' ? 'Turn off' : 'Enable notifications'}
            </button>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {/* Notification list */}
      {unread > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={async () => {
              const { updated } = await markAllRead().unwrap();
              toast.success(updated === 1 ? '1 notification marked as read.' : `${updated} notifications marked as read.`);
            }}
            disabled={isMarkingAll}
            className="text-sm font-semibold text-[#a34f32] hover:underline disabled:opacity-60"
          >
            Mark all as read
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-[#e8e4da]" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#c8c4b9] bg-white p-12 text-center">
          <Bell size={28} className="mx-auto mb-3 text-gray-400" />
          <h2 className="text-lg font-bold">Nothing here yet</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enable notifications above and we will let you know about sales and order updates.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`rounded-lg border p-4 transition ${
                notification.readAt === null
                  ? 'border-[#a34f32]/35 bg-[#fffdf8]'
                  : 'border-[#c8c4b9] bg-white opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {notification.readAt === null && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#a34f32] align-middle" />
                    )}
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                  <p className="mt-1.5 text-xs text-gray-500">{timeAgo(notification.createdAt)}</p>
                </div>
                {notification.readAt === null && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    aria-label={`Mark "${notification.title}" as read`}
                    className="shrink-0 rounded-md border border-[#c8c4b9] p-1.5 text-gray-500 transition hover:bg-[#f5f1e8] hover:text-[#a34f32]"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
