// apps/admin/src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Users } from './pages/Users';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';
import { StorefrontAccess } from './pages/StorefrontAccess'; // <-- Import
import { AdminLayout } from './AdminLayout';

const pages = ['Products', 'Categories', 'Orders', 'Notifications'];

export function App() {
  return (
    <Routes>
      {/* Public routes for Admin Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      
      {/* Protected routes for Admin Dashboard */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/storefront-access" element={<StorefrontAccess />} /> {/* <-- New */}
        {pages.map((page) => (
          <Route key={page} path={`/${page.toLowerCase()}`} element={<Placeholder name={page} />} />
        ))}
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}