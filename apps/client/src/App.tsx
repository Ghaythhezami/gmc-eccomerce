// src/App.tsx
import { Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Placeholder } from './pages/Placeholder';
import { Notifications } from './pages/Notifications';
import { Cart } from './pages/Cart';
import { NotFound } from './pages/NotFound';
import { Help } from './pages/Help';
import { AuthPage } from './pages/AuthPage';
import { Profile } from './pages/Profile';
import { OrdersPage } from './features/orders/OrdersPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useGetStorefrontAccessQuery } from './features/storefront/storefrontApi';

export function App() {
  const { data: accessData, isLoading } = useGetStorefrontAccessQuery();
  const allowedRoles = accessData?.allowedRoles ?? ['CUSTOMER'];
  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading storefront access...</div>;
  }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/category/:slug" element={<Products />} />
        <Route path="/login" element={<AuthPage register={false} />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/help" element={<Help section="help" />} />
        <Route path="/support" element={<Help section="support" />} />
        <Route path="/sell" element={<Help section="sell" />} />
        <Route path="/cart" element={<ProtectedRoute roles={allowedRoles}><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute roles={allowedRoles}><Placeholder name="Checkout" /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={allowedRoles}><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute roles={allowedRoles}><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={allowedRoles}><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={allowedRoles}><Notifications /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}