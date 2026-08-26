// src/components/Shell.tsx
import { Link, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../features/auth/authSlice';
import { authApi } from '../features/auth/authApi';

export function Shell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  
  const signOut = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
  };

  // 🔒 SECURITY: If an ADMIN or SELLER tries to access the customer app, block them!
  if (user && (user.role === 'ADMIN' || user.role === 'CUSTOMER')) {
    return (
      <main>
        <nav style={{ justifyContent: 'center' }}>
          <strong>ATELIER / COMMERCE</strong>
        </nav>
        <section className="content" style={{ textAlign: 'center', marginTop: '10vh' }}>
          <p className="eyebrow">Unauthorized</p>
          <button className="button" onClick={signOut} style={{ marginTop: '20px' }}>
            Log out
          </button>
        </section>
      </main>
    );
  }

  // Normal customer flow
  return (
    <main>
      <nav>
        <strong>ATELIER / COMMERCE</strong>
        <span>
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <button onClick={signOut}>Log out</button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </span>
      </nav>
      {children}
    </main>
  );
}