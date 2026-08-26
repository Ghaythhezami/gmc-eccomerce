// apps/admin/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation } from '../features/auth/authApi';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(form).unwrap();
      dispatch(setCredentials(result));
      navigate('/');
    } catch (err) {
      // handled by RTK Query
    }
  };

  const errorMessage = error as any;

  return (
    <section className="form">
      <p className="eyebrow">Admin Access</p>
      <h2>Sign in to Admin</h2>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="button" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Sign in'}</button>
      </form>
      {errorMessage && <p className="error">Invalid credentials</p>}
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Don't have an admin account? <Link to="/signup" style={{ color: '#a34f32' }}>Sign up</Link>
      </p>
    </section>
  );
}