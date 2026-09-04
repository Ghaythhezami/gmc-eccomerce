// apps/admin/src/pages/Dashboard.tsx
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BellRing,
  FolderTree,
  Package,
  PackageX,
  ShoppingBag,
  Users as UsersIcon,
  Warehouse,
} from 'lucide-react';
import { useGetStatsQuery } from '../features/auth/authApi';

const money = (value: number) => `$${value.toFixed(2)}`;

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Package;
  tone?: 'default' | 'warn' | 'danger';
}) {
  const tones = {
    default: 'bg-primary/10 text-primary',
    warn: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  } as const;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-admin-border bg-admin-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-admin-text/60">{label}</span>
        <span className={`flex rounded-lg p-2 ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="font-display text-3xl font-extrabold text-admin-text">{value}</div>
      <p className="mt-2 border-t border-admin-border/60 pt-2 text-xs text-admin-text/60">{detail}</p>
    </div>
  );
}

export function Dashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useGetStatsQuery();

  if (isLoading) {
    return (
      <section>
        <p className="eyebrow">Admin / Overview</p>
        <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-[132px] animate-pulse rounded-xl bg-admin-card" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !stats) {
    // A bare FETCH_ERROR means the request never reached the API; anything else came
    // back from it, so telling the admin to "check port 3000" would send them hunting
    // in the wrong place.
    const status = (error as { status?: number | string } | undefined)?.status;
    const unreachable = status === 'FETCH_ERROR';

    return (
      <section>
        <p className="eyebrow">Admin / Overview</p>
        <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-bold">Could not load dashboard statistics.</p>
          <p className="mt-1">
            {unreachable
              ? 'The API did not respond. Start it with pnpm --filter @ecommerce/server dev, and make sure the gmc-postgres container is running on port 5433 (the server exits at boot if the database is unreachable).'
              : `The API responded with an error${status ? ` (${status})` : ''}. Check the server logs for details.`}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const needsAttention = stats.products.outOfStock > 0 || stats.products.lowStock > 0;

  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow">Admin / Overview</p>
        <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
        <p className="mt-1 text-sm text-admin-text/70">Live counts straight from the database.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={stats.products.total}
          detail={`${stats.products.active} live · ${stats.products.hidden} hidden`}
          icon={Package}
        />
        <StatCard
          label="Categories"
          value={stats.categories.total}
          detail={`${stats.categories.active} visible on the storefront`}
          icon={FolderTree}
        />
        <StatCard
          label="Users"
          value={stats.users.total}
          detail={`${stats.users.admins} admin · ${stats.users.customers} customer`}
          icon={UsersIcon}
        />
        <StatCard
          label="Orders"
          value={stats.orders.total}
          detail="Placed at storefront checkout"
          icon={ShoppingBag}
        />
        <StatCard
          label="Units in stock"
          value={stats.inventory.unitsInStock}
          detail={`Average price ${money(stats.inventory.averagePrice)}`}
          icon={Warehouse}
        />
        <StatCard
          label="Low stock"
          value={stats.products.lowStock}
          detail="Products with 1–5 units left"
          icon={AlertTriangle}
          tone={stats.products.lowStock > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label="Out of stock"
          value={stats.products.outOfStock}
          detail="Shown as unavailable on the storefront"
          icon={PackageX}
          tone={stats.products.outOfStock > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Push devices"
          value={stats.push.subscriptions}
          detail="Browsers subscribed to notifications"
          icon={BellRing}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Catalog distribution */}
        <div className="rounded-xl border border-admin-border bg-admin-surface p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-base font-bold">Products per category</h2>
          {stats.productsByCategory.length === 0 ? (
            <p className="text-sm text-admin-text/60">No categories yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.productsByCategory.map((row) => {
                const max = Math.max(...stats.productsByCategory.map((c) => c.count), 1);
                return (
                  <li key={row.name} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm">
                      {row.icon} {row.name}
                    </span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-admin-card">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((row.count / max) * 100)}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-sm font-bold tabular-nums">{row.count}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Next actions */}
        <div className="rounded-xl border border-admin-border border-l-4 border-l-accent-gold bg-admin-surface p-5">
          <h2 className="mb-1 font-display text-base font-bold">
            {needsAttention ? 'Needs attention' : 'Everything looks healthy'}
          </h2>
          <p className="mb-4 text-sm text-admin-text/70">
            {needsAttention
              ? 'Some products are running out. Restock or hide them so the storefront stays accurate.'
              : 'No stock warnings across the catalog right now.'}
          </p>
          <div className="space-y-2">
            <Link
              to="/products"
              className="block rounded-lg bg-primary px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white transition hover:bg-primary-hover"
            >
              Manage products
            </Link>
            <Link
              to="/notifications"
              className="block rounded-lg border border-admin-border px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition hover:bg-admin-card"
            >
              Send a notification
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
