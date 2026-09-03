// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { JSX } from 'react/jsx-runtime';


interface AuthGuardProps {
  /** Optional: If provided, user must have one of these roles */
  roles?: string[];
  children: JSX.Element;
}

export function ProtectedRoute({ roles, children }: AuthGuardProps) {
  const user = useAppSelector((s) => s.auth.user);

  // 1. Basic login check
  if (!user) return <Navigate to="/login" replace />;

  // 2. Optional role check
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  
  return children;
}

