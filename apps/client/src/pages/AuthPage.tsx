// src/pages/AuthPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';

export function AuthPage({ register }: { register: boolean }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = register 
        ? await registerUser(form).unwrap() 
        : await login({ email: form.email, password: form.password }).unwrap();
      
      dispatch(setCredentials(result));
      navigate('/profile');
    } catch (err) {
      // Error is handled automatically by RTK Query
    }
  };

  // Helper to extract error message from RTK Query error object
  const errorMessage = (register ? registerError : loginError) as any;
  const displayError = errorMessage?.data?.message || errorMessage?.message || 'Something went wrong. Please try again.';

  return (
    <section className="form">
      <p className="eyebrow">{register ? 'Create your account' : 'Welcome back'}</p>
      <h2>{register ? 'Join the platform' : 'Sign in to continue'}</h2>
      
      {errorMessage && (
        <p className="error">{displayError}</p>
      )}

      <form onSubmit={submit}>
        {register && (
          <>
            <input 
              placeholder="First name" 
              required 
              value={form.firstName} 
              onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
            />
            <input 
              placeholder="Last name" 
              required 
              value={form.lastName} 
              onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
            />
          </>
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          required 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          required 
          minLength={8} 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
        />
        
        <button className="button" disabled={isLoggingIn || isRegistering}>
          {isLoggingIn || isRegistering ? 'Please wait...' : register ? 'Register' : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: '24px', fontSize: '14px', color: '#555' }}>
        {register ? (
          <>Already have an account? <Link to="/login" style={{ color: '#a34f32', fontWeight: 'bold' }}>Sign in</Link></>
        ) : (
          <>New here? <Link to="/register" style={{ color: '#a34f32', fontWeight: 'bold' }}>Create an account</Link></>
        )}
      </p>
    </section>
  );
}