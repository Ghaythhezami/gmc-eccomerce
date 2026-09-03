// apps/admin/src/pages/Notifications.tsx
import { useState } from 'react';
import { BellRing, Send } from 'lucide-react';
import {
  useBroadcastMutation,
  useGetRecentNotificationsQuery,
} from '../features/notifications/notificationsApi';
import { useGetStatsQuery } from '../features/auth/authApi';
import { Banner, Button, Field, Input, Textarea, errorMessage } from '../components/ui';
import { useToast } from '../components/Toast';

export function Notifications() {
  const { data: recent = [], isLoading } = useGetRecentNotificationsQuery();
  const { data: stats } = useGetStatsQuery();
  const [broadcast, { isLoading: isSending }] = useBroadcastMutation();

  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/products');
  const [error, setError] = useState('');

  const devices = stats?.push.subscriptions ?? 0;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const result = await broadcast({
        title: title.trim(),
        message: message.trim(),
        url: url.trim() || undefined,
      }).unwrap();
      toast.success(
        `Stored for ${result.recipients} user(s). Pushed to ${result.sent} device(s)` +
          (result.failed ? `, ${result.failed} failed` : '') +
          (result.pruned ? `, ${result.pruned} stale subscription(s) removed` : '') +
          '.',
      );
      setTitle('');
      setMessage('');
    } catch (err) {
      setError(errorMessage(err, 'Could not send the notification.'));
    }
  };

  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow">Admin / Notifications</p>
        <h1 className="font-display text-2xl font-extrabold">Notifications</h1>
        <p className="mt-1 text-sm text-admin-text/70">
          Sends a Web Push notification over VAPID to every browser that opted in, and stores a copy in each
          user's notification list.
        </p>
      </div>


      {error && <Banner tone="error">{error}</Banner>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Composer */}
        <form onSubmit={send} className="space-y-4 rounded-xl border border-admin-border bg-admin-surface p-5 lg:col-span-3">
          <div className="flex items-center gap-2.5 border-b border-admin-border pb-3">
            <span className="flex rounded-lg bg-primary/10 p-2 text-primary">
              <BellRing size={18} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold">Compose</h2>
              <p className="text-xs text-admin-text/60">
                {devices === 0
                  ? 'No browsers are subscribed yet — enable notifications on the storefront first.'
                  : `${devices} subscribed device${devices === 1 ? '' : 's'} will receive this.`}
              </p>
            </div>
          </div>

          <Field label="Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={80}
              placeholder="Flash sale live now"
            />
          </Field>

          <Field label="Message" required>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={300}
              placeholder="Up to 50% off across the catalog for the next 4 hours."
            />
          </Field>

          <Field label="Click destination" hint="Path on the storefront to open when the notification is clicked">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/products" />
          </Field>

          <div className="flex justify-end border-t border-admin-border pt-4">
            <Button type="submit" disabled={isSending || !title.trim() || !message.trim()}>
              <Send size={15} />
              {isSending ? 'Sending…' : 'Send to everyone'}
            </Button>
          </div>
        </form>

        {/* Preview */}
        <div className="lg:col-span-2">
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-admin-text/60">Preview</h2>
          <div className="rounded-xl border border-admin-border bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <BellRing size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{title || 'Notification title'}</p>
                <p className="mt-0.5 text-xs text-admin-text/70">
                  {message || 'Your message text appears here.'}
                </p>
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-admin-text/40">
                  localhost:5173{url || '/'}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-admin-text/55">
            Browsers render notifications slightly differently; this is an approximation.
          </p>
        </div>
      </div>

      {/* History */}
      <h2 className="mt-9 mb-1 font-display text-base font-bold">Recently sent</h2>
      {isLoading ? (
        <p className="text-sm text-admin-text/60">Loading…</p>
      ) : recent.length === 0 ? (
        <div className="rounded-xl border border-dashed border-admin-border bg-admin-surface p-8 text-center text-sm text-admin-text/60">
          Nothing has been sent yet.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Recipient</th>
              <th>Sent</th>
              <th>Read</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((item) => (
              <tr key={item.id}>
                <td className="font-semibold">{item.title}</td>
                <td className="max-w-xs truncate text-admin-text/75">{item.message}</td>
                <td className="text-xs">{item.user.email}</td>
                <td className="whitespace-nowrap text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      item.readAt ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {item.readAt ? 'Read' : 'Unread'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
