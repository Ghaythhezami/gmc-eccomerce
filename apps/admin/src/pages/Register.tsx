import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useRegisterMutation } from '../features/auth/authApi';
import { 
  Lock, 
  Mail, 
  User, 
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

export function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-bg font-sans">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Dark Admin Panel */}
        <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-text text-surface">
          <div className="flex items-center gap-2 text-star">
            <Terminal size={20} />
            <span className="font-display font-bold uppercase tracking-widest text-xs">Prestige Operations</span>
          </div>

          <div className="space-y-4 my-auto">
            <GoMyCodeGamesLogo className="h-20 w-auto text-surface mb-2" />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-star/30 bg-star/10 px-3 py-1 text-xs font-semibold text-star">
                <ShieldCheck size={14} /> System Onboarding
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-surface leading-tight">
              Create Manager Portal
            </h1>
            <p className="text-sm text-border leading-relaxed">
              Register an authorized administrative profile to obtain store permissions and platform oversight.
            </p>
          </div>

          <div className="border-t border-surface/10 pt-4 text-xs text-border flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-400" /> Security Standard v2.4
            </span>
            <span>256-Bit Encrypted</span>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-surface">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            <div>
              <div className="mb-4 lg:hidden">
                <GoMyCodeGamesLogo className="h-9 w-auto text-text" />
              </div>
              <p className="eyebrow text-primary font-display font-bold text-xs uppercase tracking-widest mb-1">
                Create Admin
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-text font-display">
                Register Admin Account
              </h2>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle size={16} className="shrink-0" />
                <span>Registration failed. Email might already exist.</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                    First Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input 
                      type="text"
                      placeholder="First name" 
                      required 
                      value={form.firstName} 
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                      className="w-full rounded-md border border-border bg-bg pl-10 pr-3 py-2 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                    Last Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input 
                      type="text"
                      placeholder="Last name" 
                      required 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                      className="w-full rounded-md border border-border bg-bg pl-10 pr-3 py-2 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    required 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full rounded-md border border-border bg-bg pl-10 pr-4 py-2 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text font-display">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Password (min 8 chars)" 
                    required 
                    minLength={8} 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    className="w-full rounded-md border border-border bg-bg pl-10 pr-10 py-2 text-sm text-text placeholder:text-gray-400 transition focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
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
                className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-surface transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>Register</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-border/50 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}