import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { JSX } from 'react/jsx-runtime';

export function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useAppSelector((s) => s.auth.user);
  
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  
  return children;
}