import { useAppDispatch, useAppSelector } from './store/hooks';
import { logout } from './features/auth/authSlice';
import { authApi } from './features/auth/authApi';
import { Link, Route, Routes } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Placeholder } from './pages/Placeholder';
import { Users } from './pages/Users';

const pages = ['Products', 'Categories', 'Orders', 'Notifications'];

export function AdminLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  
  const signOut = () => {
    dispatch(logout());
    dispatch(authApi.util.resetApiState());
  };

  return (
    <main>
      <aside>
        <strong>ATELIER / ADMIN</strong>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/users">Users</Link>
          {pages.map((page) => (
            <Link key={page} to={`/${page.toLowerCase()}`}>{page}</Link>
          ))}
          <button onClick={signOut}>Log out</button>
        </nav>
      </aside>
      <article>
        <p className="eyebrow">Logged in as {user?.email}</p>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          {pages.map((page) => (
            <Route key={page} path={`/${page.toLowerCase()}`} element={<Placeholder name={page} />} />
          ))}
        </Routes>
      </article>
    </main>
  );
}