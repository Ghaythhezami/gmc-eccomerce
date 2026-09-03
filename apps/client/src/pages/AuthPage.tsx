import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useLoginMutation, useRegisterMutation, useGoogleLoginMutation } from '../features/auth/authApi';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Gamepad2,
  Zap,
  Sparkles,
  Trophy
} from 'lucide-react';

export function AuthPage({ register }: { register: boolean }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering, error: registerError }] = useRegisterMutation();
  const [googleLoginMutation] = useGoogleLoginMutation();
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isLoading = isLoggingIn || isRegistering;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = register 
        ? await registerUser(form).unwrap() 
        : await login({ email: form.email, password: form.password }).unwrap();
      
      dispatch(setCredentials(result));
      navigate('/');
    } catch (err) {
      // Handled via RTK Query state
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

  const rawError = (register ? registerError : loginError) as any;
  const displayError = rawError?.data?.message || rawError?.message || 'Authentication failed. Please check your details and try again.';

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Visual Hero / Brand Banner */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-10 overflow-hidden bg-[var(--color-text)] text-white">
          {/* Background Decorative Image + Overlays */}
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" 
            alt="Gaming visual" 
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[var(--color-text)]" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-lg">
              <Gamepad2 size={22} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">PRESTIGE</span>
          </div>

          {/* Center Motivational Content */}
          <div className="relative z-10 space-y-4 my-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <ShieldCheck size={14} className="text-[#f5a623]" /> Verified Prestige Pass
            </span>
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">
              {register ? 'Elevate Your Digital Experience.' : 'Welcome Back to Excellence.'}
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed font-normal">
              {register 
                ? 'Unlock priority access to exclusive gaming masterclasses, pre-order bonuses, and developer releases.'
                : 'Access your library, track masterclass progress, and sync seamless gaming configurations.'
              }
            </p>
          </div>

          {/* Replacement Bottom Feature Highlights Grid */}
          <div className="relative z-10 border-t border-white/15 pt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
              <Zap size={16} className="text-[var(--color-primary)] shrink-0" />
              <div>
                <p className="font-bold font-display text-white">Instant Access</p>
                <p className="text-[11px] text-gray-400">Zero wait times</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 p-2.5 backdrop-blur-sm">
              <Sparkles size={16} className="text-[#f5a623] shrink-0" />
              <div>
                <p className="font-bold font-display text-white">VIP Rewards</p>
                <p className="text-[11px] text-gray-400">Earn pass XP</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-[var(--color-surface)]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Form Header */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] font-display mb-1">
                {register ? 'Create Account' : 'Security Checkpoint'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text)] font-display tracking-tight">
                {register ? 'Join the Elite Community' : 'Sign in to Your Account'}
              </h2>
            </div>

            {/* Error Notification Alert */}
            {rawError && (
              <div className="flex items-start gap-3 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3.5 text-xs sm:text-sm text-[var(--color-danger)]">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Main Interactive Form */}
            <form onSubmit={submit} className="space-y-4">
              {register && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-display">
                      First Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input 
                        type="text"
                        placeholder="John" 
                        required 
                        value={form.firstName} 
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 pl-10 pr-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      />
                    </div>
                  </div>

                  {/* Last Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-display">
                      Last Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input 
                        type="text"
                        placeholder="Doe" 
                        required 
                        value={form.lastName} 
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 pl-10 pr-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-display">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    required 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 pl-10 pr-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider font-display">
                    Password
                  </label>
                  {!register && (
                    <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    required 
                    minLength={8} 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 pl-10 pr-10 py-2.5 text-sm text-[var(--color-text)] placeholder:text-gray-400 transition-all focus:border-[var(--color-primary)] focus:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--color-text)] transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[var(--color-primary-hover)] hover:shadow-lg active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{register ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* CUSTOM GOOGLE LOGIN BUTTON (Full Width) */}
            <div className="flex items-center justify-center">
              <button 
                onClick={() => googleLogin()}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.49 12.27C23.49 11.48 23.42 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.39 17.24 16.25 18.07V21.06H19.95C22.22 18.94 23.49 15.9 23.49 12.27Z" fill="#4285F4"/>
                  <path d="M12 24C15.24 24 17.96 22.92 19.95 21.06L16.25 18.07C15.08 18.84 13.7 19.29 12 19.29C8.87 19.29 6.22 17.21 5.24 14.38H1.38V17.49C3.36 21.42 7.39 24 12 24Z" fill="#34A853"/>
                  <path d="M5.24 14.38C5.01 13.69 4.88 12.95 4.88 12.2C4.88 11.45 5.01 10.71 5.24 10.02V6.91H1.38C0.5 8.65 0 10.61 0 12.7C0 14.79 0.5 16.75 1.38 18.49L5.24 14.38Z" fill="#FBBC05"/>
                  <path d="M12 4.71C13.8 4.71 15.41 5.34 16.67 6.55L20.05 3.17C17.96 1.17 15.24 0 12 0C7.39 0 3.36 2.58 1.38 6.51L5.24 9.62C6.22 6.79 8.87 4.71 12 4.71Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Toggle Between Login/Register Link */}
            <div className="pt-4 border-t border-[var(--color-border)] text-center">
              <p className="text-sm text-gray-600">
                {register ? (
                  <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-bold text-[var(--color-primary)] hover:underline">
                      Sign in here
                    </Link>
                  </>
                ) : (
                  <>
                    Don't have an account yet?{' '}
                    <Link to="/register" className="font-bold text-[var(--color-primary)] hover:underline">
                      Create an account
                    </Link>
                  </>
                )}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}