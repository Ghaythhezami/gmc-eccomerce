// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Placeholder } from './pages/Placeholder';
import { Notifications } from './pages/Notifications';
import { NotFound } from './pages/NotFound';
import { Help } from './pages/Help';
import { AuthPage } from './pages/AuthPage';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
// 1. Import the hook to get allowed roles dynamically
import { useGetStorefrontAccessQuery } from './features/storefront/storefrontApi';

export function App() {
  // 2. Fetch allowed roles from the backend (controlled by Admin)
  const { data: accessData, isLoading } = useGetStorefrontAccessQuery();
  
  // Fallback to CUSTOMER while loading or if API fails
  const allowedRoles = accessData?.allowedRoles ?? ['CUSTOMER'];

  // Optional: Show a loading screen while fetching access roles
  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading storefront access...</div>;
  }

  return (
    <Shell>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        {/* Same catalog view, pinned to one category by slug. */}
        <Route path="/category/:slug" element={<Products />} />
        <Route path="/login" element={<AuthPage register={false} />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/help" element={<Help section="help" />} />
        <Route path="/support" element={<Help section="support" />} />
        <Route path="/sell" element={<Help section="sell" />} />

        {/* Protected Routes - DYNAMIC ROLE CHECK */}
        {/* Uses allowedRoles from the backend instead of hardcoded ['CUSTOMER'] */}
        <Route path="/checkout" element={<ProtectedRoute roles={allowedRoles}><Placeholder name="Checkout" /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={allowedRoles}><Placeholder name="Orders" /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={allowedRoles}><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={allowedRoles}><Notifications /></ProtectedRoute>} />

        {/* A real 404 - the old catch-all redirect hid genuine dead links. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}