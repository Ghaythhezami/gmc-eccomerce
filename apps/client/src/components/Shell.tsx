import { useNavigate } from 'react-router-dom';
import { authApi } from '../features/auth/authApi';
import { logout } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { UnauthorizedView } from './auth/UnauthorizedView';
import { CategoryNav } from './layout/CategoryNav';
import { Footer } from './layout/Footer';
import { Header } from './layout/Header';
import { TopBar } from './layout/TopBar';
// 1. Import the API to fetch allowed roles
import { useGetStorefrontAccessQuery } from '../features/storefront/storefrontApi';

export function Shell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  
  // 2. DUMMY CART COUNT (since `s.cart` doesn't exist yet, we use 0)
  const cartCount = 0; 

  // 3. Fetch allowed roles dynamically from the backend
  const { data: accessData, isLoading: isAccessLoading } = useGetStorefrontAccessQuery();
  
  // Fallback to CUSTOMER while loading or if API fails
  const allowedRoles = accessData?.allowedRoles ?? ['CUSTOMER'];

  const signOut = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
    navigate('/login');
  };

  // 4. DYNAMIC CHECK: Block if user role is NOT in the allowed list (controlled by Admin)
  if (user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedView onSignOut={signOut} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)'
    }}>
      <TopBar />
      <Header user={user} cartCount={cartCount} onSignOut={signOut} />
      <CategoryNav />
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}