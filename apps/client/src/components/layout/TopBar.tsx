import { Link } from 'react-router-dom';
import { Home, ShieldCheck } from 'lucide-react';

// The admin panel is a separate Vite app, so this is a real navigation, not a route.
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:5174';

export function TopBar() {
  return (
    <div className="border-b border-gray-800 bg-gray-900 py-1.5 text-xs text-white sm:text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-1 px-4 sm:px-6 lg:px-8">
        <span className="text-gray-300">
          🎮 Free delivery on all digital game codes &amp; masterclasses over $50!
        </span>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-gray-300 transition-colors duration-200 hover:text-white"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          <Link to="/support" className="text-gray-300 transition-colors duration-200 hover:text-white">
            Support
          </Link>
          <a
            href={ADMIN_URL}
            className="flex items-center gap-1.5 text-gray-300 transition-colors duration-200 hover:text-white"
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </a>
        </div>
      </div>
    </div>
  );
}
