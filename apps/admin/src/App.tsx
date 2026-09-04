// apps/admin/src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLayout } from './AdminLayout';

export function App() {
  return (
    <Routes>
      {/* Login is the only public admin route. Creating an admin is an admin-only
          action (POST /admin/auth/register is guarded), so /signup sits behind the guard. */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/signup"
        element={
          <AdminRoute>
            <Register />
          </AdminRoute>
        }
      />

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
