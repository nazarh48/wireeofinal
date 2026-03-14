import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { apiService, API_BASE_URL, USER_TOKEN_KEY } from '../services/api';
import { useAuthStore } from '../store/authStore';

/** Official Google "G" logo SVG */
const GoogleLogo = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [twoFAEmail, setTwoFAEmail] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [step, setStep] = useState('login'); // 'login' | '2fa'
  const [error, setError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const setUserAuth = useAuthStore((s) => s.setUserAuth);
  const setAdminAuth = useAuthStore((s) => s.setAdminAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = location.state?.from || '/';
  const reason = location.state?.reason;
  const sessionExpired = location.state?.sessionExpired;

  // Handle Google OAuth callback: ?token=... or ?error=...
  useEffect(() => {
    const token = searchParams.get('token');
    const errMsg = searchParams.get('error');
    if (errMsg) {
      setError(decodeURIComponent(errMsg));
      setSearchParams({}, { replace: true });
      return;
    }
    if (!token) return;

    const run = async () => {
      try {
        localStorage.setItem(USER_TOKEN_KEY, token);
        const data = await apiService.auth.refreshSession();
        if (data?.token && data?.user) {
          setUserAuth({ token: data.token, user: data.user });
          setSearchParams({}, { replace: true });
          navigate(from, { replace: true });
        }
      } catch {
        setError('Sign-in failed. Please try again.');
        setSearchParams({}, { replace: true });
      }
    };
    run();
  }, [searchParams, setSearchParams, navigate, from, setUserAuth]);

  const handleChange = (e) => {
    if (step === '2fa') {
      setTwoFACode(e.target.value);
    } else {
      setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailNotVerified(false);

    try {
      const response = await apiService.auth.login(credentials);

      if (response.requires2FA) {
        setTwoFAEmail(response.email || credentials.email);
        setStep('2fa');
        setError('');
        return;
      }

      if (response.code === 'EMAIL_NOT_VERIFIED') {
        setError(response.message || 'Please verify your email before signing in.');
        return;
      }

      if (response.token) {
        if (response.user?.role === 'admin') {
          setAdminAuth({ token: response.token, user: response.user });
          navigate('/admin/dashboard', { replace: true });
        } else {
          setUserAuth({ token: response.token, user: response.user });
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.message || 'Invalid email or password';
      setError(msg);
      setEmailNotVerified(data?.code === 'EMAIL_NOT_VERIFIED');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFACode.trim()) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await apiService.auth.verify2FA({
        email: twoFAEmail,
        code: twoFACode.trim(),
      });

      if (response.token) {
        if (response.user?.role === 'admin') {
          setAdminAuth({ token: response.token, user: response.user });
          navigate('/admin/dashboard', { replace: true });
        } else {
          setUserAuth({ token: response.token, user: response.user });
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Invalid verification code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend2FA = async () => {
    setResending(true);
    setError('');
    try {
      await apiService.auth.resend2FA(twoFAEmail);
      setError('');
      setTwoFACode('');
    } catch {
      setError('Failed to resend code. Try again.');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('login');
    setTwoFACode('');
    setError('');
  };

  if (step === '2fa') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100/30 via-transparent to-emerald-100/30"></div>
        </div>
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Two-factor verification</h2>
              <p className="mt-2 text-sm text-gray-600">
                We sent a 6-digit code to <strong>{twoFAEmail}</strong>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handle2FASubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || twoFACode.length !== 6}
                className="w-full flex justify-center items-center px-6 py-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify and sign in'}
              </button>

              <button
                type="button"
                onClick={handleResend2FA}
                disabled={resending}
                className="w-full text-sm text-green-600 hover:text-emerald-600 font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-100/30 via-transparent to-emerald-100/30"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <Link to="/" className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">Wireeo</Link>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
            {sessionExpired && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
                Your session expired due to inactivity. Please sign in again.
              </div>
            )}
            {reason === 'configurable' && (
              <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
                Please sign in to access configurable products. Don&apos;t have an account?{' '}
                <Link to="/signup" state={{ from }} className="font-semibold underline">Create one</Link>.
              </div>
            )}
            <p className="mt-3 text-sm text-gray-600">Sign in to access your account</p>
            <p className="mt-2 text-sm text-gray-500">
              New to Wireeo?{' '}
              <Link to="/signup" className="font-semibold text-green-600 hover:text-emerald-600">Create an account</Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLoginSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-emerald-600 font-medium">
                Forgot your password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <span className="text-red-700 text-sm font-medium">{error}</span>
                {(emailNotVerified || error.toLowerCase().includes('verify') || error.toLowerCase().includes('verification')) && credentials.email && (
                  <Link to="/verify-email" state={{ email: credentials.email }} className="block mt-2 text-green-600 hover:text-emerald-600 text-sm font-medium">
                    Resend verification email
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-6 py-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <a
              href={`${API_BASE_URL}/auth/google`}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <GoogleLogo />
              Continue with Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
