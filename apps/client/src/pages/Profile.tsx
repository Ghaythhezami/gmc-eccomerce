// src/pages/Profile.tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export function Profile() {
  const user = useAppSelector((s) => s.auth.user);
  
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <section className="content">
      <p className="eyebrow">Authenticated</p>
      <h2>{user.firstName} {user.lastName}</h2>
      <p>{user.email} · {user.role}</p>
    </section>
  );
}