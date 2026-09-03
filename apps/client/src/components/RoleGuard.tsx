// src/components/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { JSX } from 'react/jsx-runtime';

interface RoleGuardProps {
  /** Array of allowed roles, e.g., ['ADMIN', 'SELLER'] */
  roles: string[];
  /** The protected component/page */
  children: JSX.Element;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const user = useAppSelector((s) => s.auth.user);

  // 1. If not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // 2. If logged in but doesn't have the required role, redirect to home
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  // 3. If logged in and has the correct role, show the page
  return children;
}