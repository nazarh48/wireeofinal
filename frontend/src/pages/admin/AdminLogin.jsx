import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAdminAuth = useAuthStore((s) => s.setAdminAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const sessionExpired = location.state?.sessionExpired;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.auth.adminLogin(credentials);
      setAdminAuth({ token: response.token, user: response.user });
      navigate('/admin/dashboard');
    } catch (err) {
      const message = err?.response?.data?.message || 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-100">
      <div className="relative mx-auto flex h-full w-full max-w-[1600px] overflow-hidden bg-white shadow-[0_40px_120px_rgba(15,23,42,0.15)]">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden px-10 py-12 sm:px-14 sm:py-16 text-white animate-gradient-shift" style={{ backgroundImage: 'linear-gradient(160deg, #10b981 0%, #047857 48%, #0f172a 100%)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),transparent_20%)] pointer-events-none"></div>
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/15 via-transparent to-transparent opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),transparent_40%,rgba(255,255,255,0.04))] pointer-events-none"></div>
            <div className="absolute -right-24 top-[-4rem] h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-2xl animate-float"></div>
            <div className="relative z-10 flex animate-fade-in-left flex-col h-full justify-between">
              <div>
                <img src="/assets/Logowireeo.png" alt="Wireeo logo" className="mb-10 h-24 w-auto object-contain bg-white p-4 shadow-xl shadow-black/15 animate-float" />
                <h1 className="text-5xl font-semibold tracking-tight leading-tight mb-4 animate-fade-in-down">
                  Welcome Back!
                </h1>
                <p className="max-w-xl text-base text-white/85 animate-fade-in-up">
                  To stay connected with us please login with your personal info.
                </p>
              </div>

              <div className="mt-10 border border-white/10 bg-white/5 p-6 text-sm text-white/85 shadow-lg shadow-black/10">
                <h2 className="mb-3 text-lg font-semibold text-white">KNX Device Benefits</h2>
                <ul className="space-y-3 text-sm text-white/80">
                  <li>• Centralized control for lighting, HVAC and shading.</li>
                  <li>• Reliable KNX automation with energy-saving scenes.</li>
                  <li>• Scalable infrastructure for smart buildings and homes.</li>
                  <li>• Secure integration with Wireeo system management.</li>
                </ul>
              </div>

              <div className="mt-10 text-[10px] uppercase tracking-[0.25em] text-white/40">
                creator here | director here
              </div>
            </div>
          </div>

          <div className="relative flex items-center bg-white px-8 py-10 sm:px-12 sm:py-14 animate-fade-in-right">
            <div className="mx-auto w-full max-w-md">
              <div className="text-center mb-10">
                <p className="text-4xl font-bold text-emerald-800 ">Welcome to Wireeo</p>
                <p className="mt-3 text-sm text-slate-500">Login in to your account to continue</p>
              </div>
              <div className="mb-8 flex h-56 items-center justify-center border border-slate-200 bg-slate-50 shadow-lg shadow-slate-200/70 transition duration-500 hover:shadow-slate-300/80">
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shadow-inner shadow-emerald-200/70 animate-float">
                  <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                </div>
              </div>

              {sessionExpired && (
                <div className="mb-6 rounded-3xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Your session expired due to inactivity. Please sign in again.
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="w-full rounded-full border border-emerald-200 bg-emerald-100/80 px-6 py-4 text-slate-700 placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full rounded-full border border-emerald-200 bg-emerald-100/80 px-6 py-4 text-slate-700 placeholder-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'LOG IN'}
                </button>
              </form>

              {/*<p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account? <span className="font-semibold text-emerald-600">sign up</span>
              </p>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;