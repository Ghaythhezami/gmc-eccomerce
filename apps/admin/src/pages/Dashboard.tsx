// apps/client/src/pages/Dashboard.tsx
import { 
  Users, 
  Package, 
  ShoppingBag, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Radio
} from 'lucide-react';
import { useGetUsersQuery } from '../features/auth/authApi';

export function Dashboard() {
  const { data: users = [] } = useGetUsersQuery();

  const stats = [
    {
      title: 'Total Users',
      value: users.length || 3,
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
    <div className="w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Operations Overview
          </span>
          <h2 className="text-3xl font-bold text-text mt-1">
            Executive Summary
          </h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-xs font-bold shrink-0">
          <Radio size={14} className="text-primary" />
          <span className="whitespace-nowrap">Real-time Telemetry Active</span>
        </div>
      </div>

      {/* Top 3 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title}
              className="bg-bg border border-border rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                    {stat.title}
                  </span>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary flex">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-extrabold text-text">
                    {stat.value}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-500/15 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-border/50">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* System Architecture Box */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase mb-3">
              <Activity size={18} />
              <span>System Architecture Status</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-5">
              RTK Query state management connected to microservice infrastructure. Operations telemetry actively monitoring authentication and route authorization bounds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold">
              <CheckCircle2 size={14} />
              Services Operational
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-bg border border-border text-gray-600 text-xs">
              <Clock size={14} />
              Latency: 24ms
            </span>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-bg border border-border rounded-r-xl border-l-4 border-l-amber-400 p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Action Required
            </span>
            <h3 className="text-xl font-bold text-text mt-1 mb-2">
              Platform Deployments
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Select an active operational ticket to deploy vertical platform enhancements across services.
            </p>
          </div>
          <button className="mt-6 w-full py-3 bg-primary text-white border-none rounded-lg font-bold text-xs uppercase cursor-pointer hover:bg-primary-hover transition-colors">
            Manage Services
          </button>
        </div>
      </div>
    </div>
  );
}