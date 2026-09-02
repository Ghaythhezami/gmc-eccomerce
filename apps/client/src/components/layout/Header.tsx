import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, HelpCircle, Search, LogOut, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';
import { GoMyCodeGamesLogo } from '../GoMyCodeGamesLogo';
import { useGetUnreadCountQuery } from '../../features/notifications/notificationsApi';

interface HeaderProps {
  user: any;
  cartCount: number;
  onSignOut: () => void;
}

export function Header({ user, cartCount, onSignOut }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  // Only signed-in users have notifications, so skip the request otherwise.
  const { data: unread } = useGetUnreadCountQuery(undefined, { skip: !user });

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const term = searchQuery.trim();
    navigate(term ? `/products?q=${encodeURIComponent(term)}` : '/products');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#fffdf8] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <GoMyCodeGamesLogo className="h-15 w-auto" />
          </Link>

          {/* Search Bar - Desktop Only */}
          <form onSubmit={runSearch} className="hidden md:flex flex-1 max-w-[500px] lg:max-w-[650px] mx-2 lg:mx-4">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-[#a34f32] border-r-0 rounded-l-md outline-none bg-[#fffdf8] text-sm focus:shadow-[0_0_0_3px_rgba(163,79,50,0.15)]"
              placeholder="Search games, genres, masterclasses..." 
            />
            <button type="submit" className="px-4 lg:px-7 bg-[#a34f32] text-white font-semibold rounded-r-md hover:bg-[#8b3f25] transition-colors flex items-center gap-1 lg:gap-2 whitespace-nowrap text-sm">
              <Search size={18} className="lg:w-5 lg:h-5" />
              <span className="hidden lg:inline">SEARCH</span>
            </button>
          </form>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 flex-shrink-0">
            
            {/* Desktop Actions (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-3 lg:gap-5">
              {user ? (
                <Link to="/profile" className="flex flex-col items-center text-xs font-medium text-[#20231f] hover:text-[#a34f32] transition-colors px-2">
                  <User size={20} className="lg:w-6 lg:h-6" />
                  <span>{user.firstName || 'Account'}</span>
                </Link>
              ) : (
                <Link to="/login" className="flex flex-col items-center text-xs font-medium text-[#20231f] hover:text-[#a34f32] transition-colors px-2">
                  <User size={20} className="lg:w-6 lg:h-6" />
                  <span>Sign In</span>
                </Link>
              )}
              
              {user && (
                <Link
                  to="/notifications"
                  className="relative flex flex-col items-center px-2 text-xs font-medium text-[#20231f] transition-colors hover:text-[#a34f32]"
                >
                  <Bell size={20} className="lg:w-6 lg:h-6" />
                  <span>Alerts</span>
                  {(unread?.count ?? 0) > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#c0392b] px-1 text-[10px] font-bold text-white">
                      {unread!.count > 99 ? '99+' : unread!.count}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/help" className="flex flex-col items-center text-xs font-medium text-[#20231f] hover:text-[#a34f32] transition-colors px-2">
                <HelpCircle size={20} className="lg:w-6 lg:h-6" />
                <span>Help</span>
              </Link>

              {user && (
                <button 
                  onClick={onSignOut} 
                  className="flex flex-col items-center text-xs font-medium text-[#20231f] hover:text-[#a34f32] transition-colors bg-transparent border-none cursor-pointer px-2"
                >
                  <LogOut size={20} className="lg:w-6 lg:h-6" />
                  <span>Logout</span>
                </button>
              )}
            </div>

            {/* Always Visible: Cart */}
            <Link to="/cart" className="flex flex-col items-center text-xs font-medium text-[#20231f] hover:text-[#a34f32] transition-colors px-1 sm:px-2 relative">
              <ShoppingCart size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c0392b] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-[#20231f] hover:text-[#a34f32] focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#c8c4b9] py-4 space-y-4">
            {/* Search Input */}
            <form onSubmit={runSearch} className="flex items-center">
              <input
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-[#a34f32] border-r-0 rounded-l-md outline-none bg-[#fffdf8] text-sm"
                placeholder="Search games..." 
              />
              <button type="submit" className="px-4 py-2 bg-[#a34f32] text-white rounded-r-md hover:bg-[#8b3f25] transition-colors flex items-center justify-center">
                <Search size={18} />
              </button>
            </form>

            {/* Navigation Links */}
            <nav className="flex justify-between space-y-2 pt-2">
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[#20231f] hover:bg-[#a34f32]/10 hover:text-[#a34f32]"
                  >
                    <User size={18} />
                    <span>{user.firstName || 'Account'}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      onSignOut();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md font-medium text-[#20231f] hover:bg-[#a34f32]/10 hover:text-[#a34f32]"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[#20231f] hover:bg-[#a34f32]/10 hover:text-[#a34f32]"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}

              <Link 
                to="/help" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[#20231f] hover:bg-[#a34f32]/10 hover:text-[#a34f32]"
              >
                <HelpCircle size={18} />
                <span>Help & Support</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}