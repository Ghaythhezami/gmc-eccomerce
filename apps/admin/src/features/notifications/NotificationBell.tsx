import { Bell } from 'lucide-react';
import { useState } from 'react';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
} from './notificationsApi';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [take, setTake] = useState(10);

  const { data: count } = useGetUnreadCountQuery(undefined, { pollingInterval: 60_000 });
  const { data: page, isFetching } = useGetNotificationsQuery({ take }, { skip: !open });
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const unread = count?.unread ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-text hover:bg-black/5"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-lg border border-border bg-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            <button onClick={() => markAllRead()} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          </div>

          {!page?.items.length && !isFetching && (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet.</p>
          )}

          <ul>
            {page?.items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => markRead(n.id)}
                  className={`block w-full px-4 py-3 text-left hover:bg-black/5 ${
                    n.readAt ? 'opacity-60' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {!n.readAt && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <span className="text-sm font-medium">{n.title}</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">{n.message}</span>
                  <span className="mt-1 block text-[10px] uppercase tracking-wide text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {page && page.items.length < page.total && (
            <button
              onClick={() => setTake((t) => t + 10)}
              className="w-full border-t border-border px-4 py-2 text-xs text-primary hover:bg-black/5"
            >
              {isFetching ? 'Loading…' : 'Load older'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
