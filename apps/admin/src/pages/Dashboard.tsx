// apps/admin/src/pages/Dashboard.tsx
import { Users, Package, ShoppingBag, Activity, TrendingUp, CheckCircle2, Clock, Radio } from 'lucide-react';
import { useGetUsersQuery } from '../features/auth/authApi';

export function Dashboard() {
  // ✅ Correctly pass arguments and access .data
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 10 });
  const users = usersData?.data ?? [];

  const stats = [
    {
      title: 'Total Users',
      value: users.length || 0,
      change: '+12.5%',
      description: 'Active administrative & customer profiles',
      icon: Users,
    },
    {
      title: 'Total Products',
      value: '0',
      change: '0.0%',
      description: 'Catalog items & inventory SKUs',
      icon: Package,
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '0.0%',
      description: 'Completed store transactions',
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c8c4b9] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#a34f32]">
            Operations Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#24251f]">
            Executive Summary
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#c8c4b9] bg-white px-4 py-2 text-xs font-bold">
          <Radio size={14} className="text-[#a34f32]" />
          <span>Real-time Telemetry Active</span>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="flex flex-col justify-between rounded-xl border border-[#c8c4b9] bg-white p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {stat.title}
                  </p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#a34f32]/10 text-[#a34f32]">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-[#24251f]">{stat.value}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    <TrendingUp size={12} />
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="mt-4 border-t border-[#c8c4b9]/50 pt-4 text-sm text-gray-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* System Architecture Box */}
        <div className="col-span-2 flex flex-col justify-between rounded-xl border border-[#c8c4b9] bg-white p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#a34f32]">
              <Activity size={18} />
              <span>System Architecture Status</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              RTK Query state management connected to microservice infrastructure. Operations telemetry actively monitoring authentication and route authorization bounds.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            <span className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
              <CheckCircle2 size={14} />
              Services Operational
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-[#c8c4b9] bg-[#f5f1e8] px-3 py-1.5 text-xs font-bold text-gray-600">
              <Clock size={14} />
              Latency: 24ms
            </span>
          </div>
        </div>

        {/* Action Card */}
        <div className="flex flex-col justify-between rounded-xl border border-[#c8c4b9] border-l-4 border-l-[#e3b85b] bg-white p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#a34f32]">
              Action Required
            </p>
            <h3 className="mt-2 text-xl font-bold text-[#24251f]">
              Platform Deployments
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Select an active operational ticket to deploy vertical platform enhancements across services.
            </p>
          </div>
          <button className="mt-6 w-full rounded-lg bg-[#a34f32] py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#8b3f25]">
            Manage Services
          </button>
        </div>
      </div>
    </div>
  );
}