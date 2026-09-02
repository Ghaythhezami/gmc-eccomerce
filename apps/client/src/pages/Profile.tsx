// apps/client/src/pages/Profile.tsx
import { Link, Navigate } from 'react-router-dom';
import { Bell, LogOut, Mail, ShieldCheck, UserCircle } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { useMeQuery } from '../features/auth/authApi';
import { useGetUnreadCountQuery } from '../features/notifications/notificationsApi';

export function Profile() {
  const cached = useAppSelector((s) => s.auth.user);
  // Re-fetches from /auth/me so the page reflects the server, not just what was
  // cached at login - and proves the JWT is still valid.
  const { data: fresh, isLoading, isError } = useMeQuery(undefined, { skip: !cached });
  const { data: unread } = useGetUnreadCountQuery(undefined, { skip: !cached });

  if (!cached) return <Navigate to="/login" replace />;

  const user = fresh ?? cached;
  const joined = (fresh as { createdAt?: string } | undefined)?.createdAt;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <header className="mb-8">
        <p className="eyebrow">Account</p>
        <h1 className="text-3xl font-bold">Your profile</h1>
      </header>

      {isError && (
        <p role="alert" className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Your session could not be verified with the server. Sign out and back in if details look stale.
        </p>
      )}

      <section className="rounded-lg border border-[#c8c4b9] bg-white p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#f5f1e8] text-[#a34f32]">
            <UserCircle size={34} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Mail size={14} /> {user.email}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#a34f32]/10 px-3 py-1 text-xs font-bold text-[#a34f32]">
                <ShieldCheck size={12} /> {user.role}
              </span>
              {joined && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  Member since {new Date(joined).toLocaleDateString()}
                </span>
              )}
              {isLoading && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Refreshing…</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          to="/notifications"
          className="flex items-start gap-3 rounded-lg border border-[#c8c4b9] bg-white p-5 transition hover:shadow-md"
        >
          <Bell size={20} className="mt-0.5 shrink-0 text-[#a34f32]" />
          <span>
            <span className="block font-bold">Notifications</span>
            <span className="mt-0.5 block text-sm text-gray-600">
              {(unread?.count ?? 0) > 0
                ? `${unread!.count} unread — manage push alerts`
                : 'Manage browser push alerts'}
            </span>
          </span>
        </Link>

        <Link
          to="/orders"
          className="flex items-start gap-3 rounded-lg border border-[#c8c4b9] bg-white p-5 transition hover:shadow-md"
        >
          <LogOut size={20} className="mt-0.5 shrink-0 rotate-180 text-[#a34f32]" />
          <span>
            <span className="block font-bold">Order history</span>
            <span className="mt-0.5 block text-sm text-gray-600">Arrives with the orders feature</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
