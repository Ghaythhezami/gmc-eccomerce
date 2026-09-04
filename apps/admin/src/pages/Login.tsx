import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation, useGoogleLoginMutation } from '../features/auth/authApi';
import { useGoogleLogin } from '@react-oauth/google';
import { googleNotConfiguredMessage, isGoogleConfigured } from '../features/auth/googleConfig';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Terminal,
  Activity
} from 'lucide-react';
import { GoMyCodeGamesLogo } from '../components/GoMyCodeGamesLogo';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const [googleLoginMutation] = useGoogleLoginMutation();
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

  // Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const result = await googleLoginMutation({ 
          googleToken: tokenResponse.access_token 
        }).unwrap();
        dispatch(setCredentials(result));
        navigate('/');
      } catch (err) {
        console.error('Google Login Failed', err);
      }
    },
    onError: () => {
      console.error('Login Failed');
    },
  });

  const errorMessage = error as any;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-bg font-sans">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-140">
        
        {/* Left Dark Admin Panel */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-text text-surface">
          <div>
            <div className="flex items-center gap-2 text-star mb-6">
              <Terminal size={20} />
              <span className="font-display font-bold uppercase tracking-widest text-xs">Prestige Operations</span>
            </div>
            
          </div>

          <div className="space-y-4 my-auto">
            {/* Added logo to left sidebar for desktop views */}
            <div className="mb-4">
              <GoMyCodeGamesLogo className="h-20 w-auto text-surface" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/10 px-3 py-1 text-xs font-semibold text-star">
              <ShieldCheck size={14} /> Restricted Area
            </span>
            <h1 className="font-display text-3xl font-bold text-surface leading-tight">
              Control Panel Access
            </h1>
            <p className="text-sm text-border leading-relaxed">
              Sign in to manage inventory, process store orders, and review customer platform performance.
            </p>
          </div>

          <div className="border-t border-surface/10 pt-4 text-xs text-border flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" /> Systems Operational
            </span>
            <span>v2.4.0</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-surface">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div>
              <div className="mb-4 lg:hidden">
                <GoMyCodeGamesLogo className="h-9 w-auto text-text" />
              </div>
              <p className="eyebrow text-primary font-display font-bold text-xs uppercase tracking-widest mb-1">
                Admin Access
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text font-display">
                Sign in to Admin
              </h2>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle size={16} className="shrink-0" />
                <span>Invalid admin credentials. Please try again.</span>
              </div>
            )}

            {/* Regular Login Form */}
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type="email" 
                    placeholder="admin@prestige.com" 
                    required 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full rounded-md border border-border bg-bg pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    required 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    className="w-full rounded-md border border-border bg-bg pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-surface transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Google Login Button at the BOTTOM */}
            <div className="pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={!isGoogleConfigured}
                title={isGoogleConfigured ? undefined : googleNotConfiguredMessage}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.49 12.27C23.49 11.48 23.42 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.39 17.24 16.25 18.07V21.06H19.95C22.22 18.94 23.49 15.9 23.49 12.27Z" fill="#4285F4"/>
                  <path d="M12 24C15.24 24 17.96 22.92 19.95 21.06L16.25 18.07C15.08 18.84 13.7 19.29 12 19.29C8.87 19.29 6.22 17.21 5.24 14.38H1.38V17.49C3.36 21.42 7.39 24 12 24Z" fill="#34A853"/>
                  <path d="M5.24 14.38C5.01 13.69 4.88 12.95 4.88 12.2C4.88 11.45 5.01 10.71 5.24 10.02V6.91H1.38C0.5 8.65 0 10.61 0 12.7C0 14.79 0.5 16.75 1.38 18.49L5.24 14.38Z" fill="#FBBC05"/>
                  <path d="M12 4.71C13.8 4.71 15.41 5.34 16.67 6.55L20.05 3.17C17.96 1.17 15.24 0 12 0C7.39 0 3.36 2.58 1.38 6.51L5.24 9.62C6.22 6.79 8.87 4.71 12 4.71Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              {!isGoogleConfigured && (
                <p className="mt-2 text-center text-xs text-gray-500">
                  Google sign-in is not configured on this environment.
                </p>
              )}
            </div>

            <div className="pt-2 text-center text-sm text-gray-600">
              Admin accounts are created by an existing administrator.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}