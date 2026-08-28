import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { logout } from './features/auth/authSlice';
import { authApi } from './features/auth/authApi';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';
import { Users } from './pages/Users';
import { Notifications } from './pages/Notifications';
import { NotificationBell } from './features/notifications/NotificationBell';
import { ToastHost } from './features/notifications/ToastHost';
import { useNotificationsSocket } from './features/notifications/useNotificationsSocket';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Gamepad2,
  Menu,
  X,
  UserCircle
} from 'lucide-react';

const pages = [
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/categories', icon: FolderTree },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
  { name: 'Notifications', path: '/notifications', icon: Bell },
];

/** Pages that have a real implementation rather than the ticket placeholder. */
const placeholderPages = pages.filter((page) => page.path !== '/notifications');

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const location = useLocation();

  // One authenticated Socket.IO connection for the admin (low-stock alerts).
  useNotificationsSocket();

  const signOut = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClasses = (path: string) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive(path) 
      ? 'bg-primary text-white font-semibold shadow-md' 
      : 'text-zinc-400 hover:text-white hover:bg-white/10'}
  `;

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row font-sans text-text">
      {/* Top Mobile Bar */}
      <header className="lg:hidden flex items-center justify-between bg-[#20231f] text-white px-4 py-3 border-b border-white/10 sticky top-0 z-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-md">
            <Gamepad2 size={18} />
          </div>
          <span className="font-display font-bold text-sm tracking-wider uppercase text-white">
            PRESTIGE <span className="text-amber-400 font-normal">ADMIN</span>
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-md hover:bg-white/10 text-white transition"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:sticky top-0 h-screen w-64 shrink-0 z-40
        bg-[#20231f] text-white p-6 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo Header */}
          <div className="hidden lg:flex items-center gap-3 pb-8 border-b border-white/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
              <Gamepad2 size={22} />
            </div>
            <div>
              <strong className="block font-display text-base tracking-wider uppercase text-white font-bold">
                PRESTIGE
              </strong>
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Operations Control
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses('/')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/users" 
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses('/users')}
            >
              <UsersIcon size={18} />
              <span>Users Management</span>
            </Link>

            {pages.map((page) => {
              const IconComponent = page.icon;
              return (
                <Link 
                  key={page.name} 
                  to={page.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClasses(page.path)}
                >
                  <IconComponent size={18} />
                  <span>{page.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Session Info & Sign Out */}
        <div className="pt-6 mt-6 border-t border-white/10 space-y-4 shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <UserCircle size={20} className="text-amber-400 shrink-0" />
            <div className="overflow-hidden text-xs">
              <p className="font-bold font-display text-white truncate">Admin Account</p>
              <p className="text-zinc-400 truncate">{user?.email || 'authenticated'}</p>
            </div>
          </div>

          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <article className="flex-1 w-full min-w-0 p-6 lg:p-10">
        <header className="mb-8 pb-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-primary font-display font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-star" /> System Privilege Verified
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text font-display tracking-tight">
              Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="text-xs text-text/70 bg-surface px-3.5 py-2 rounded-lg border border-border shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Connected as <strong className="text-text">{user?.email}</strong></span>
            </div>
          </div>
        </header>

        <main className="w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/notifications" element={<Notifications />} />
            {placeholderPages.map((page) => (
              <Route
                key={page.name}
                path={page.path}
                element={<Placeholder name={page.name} />}
              />
            ))}
          </Routes>
        </main>
      </article>

      <ToastHost />
    </div>
  );
}