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

export function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<Placeholder name="Product details" />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute roles={['CUSTOMER']}><Placeholder name="Checkout" /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute roles={['CUSTOMER']}><Placeholder name="Orders" /></ProtectedRoute>} />
        <Route path="/login" element={<AuthPage register={false} />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/profile" element={<ProtectedRoute roles={['CUSTOMER']}><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
