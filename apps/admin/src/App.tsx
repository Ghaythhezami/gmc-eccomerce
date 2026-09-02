// apps/admin/src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLayout } from './AdminLayout';

export function App() {
  return (
    <Routes>
      {/* Public routes for Admin Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />

      {/* AdminLayout owns the authenticated route table. */}
      <Route
        path="/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
