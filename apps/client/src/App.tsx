// src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Placeholder } from './pages/Placeholder';
import { AuthPage } from './pages/AuthPage';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CartPage } from './features/cart/CartPage';
import { CategoriesPage } from './features/catalog/CategoriesPage';
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
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products/:id" element={<Placeholder name="Product details" />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<AuthPage register={false} />} />
        <Route path="/register" element={<AuthPage register />} />

        {/* Protected Routes - DYNAMIC ROLE CHECK */}
        {/* Uses allowedRoles from the backend instead of hardcoded ['CUSTOMER'] */}
        <Route path="/checkout" element={<ProtectedRoute roles={allowedRoles}><Placeholder name="Checkout" /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={allowedRoles}><Placeholder name="Orders" /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={allowedRoles}><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
