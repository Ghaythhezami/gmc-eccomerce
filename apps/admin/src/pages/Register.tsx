// apps/admin/src/pages/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useRegisterMutation } from '../features/auth/authApi';

export function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(form).unwrap();
      dispatch(setCredentials(result));
      navigate('/');
    } catch (err) {
      // handled by RTK Query
    }
  };

  const errorMessage = error as any;

  return (
    <section className="form">
      <p className="eyebrow">Create Admin</p>
      <h2>Register Admin Account</h2>
      <form onSubmit={submit}>
        <input placeholder="First name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <input placeholder="Last name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="button" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Register'}</button>
      </form>
      {errorMessage && <p className="error">Registration failed. Email might already exist.</p>}
      <p style={{ marginTop: '20px', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#a34f32' }}>Sign in</Link>
      </p>
    </section>
  );
}