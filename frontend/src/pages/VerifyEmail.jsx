import { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get('token');
  const emailFromState = location.state?.email || '';
  const [loading, setLoading] = useState(!!token);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      if (!emailFromState) setError('Invalid verification link.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        await apiService.auth.verifyEmail(token);
        setSuccess(true);
      } catch (err) {
        const msg = err?.response?.data?.message || 'Invalid or expired verification link.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, emailFromState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
            <p className="mt-3 text-gray-600">Your account is ready. You can now sign in.</p>
            <Link
              to="/login"
              className="mt-6 inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No token: show resend form (if email in state) or error
  return (
    <ResendVerificationUI
      initialEmail={emailFromState}
      error={error}
    />
  );
};

function ResendVerificationUI({ initialEmail, error }) {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiService.auth.resendVerification(email.trim());
      setSent(true);
    } catch {
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">Verification email sent</h2>
            <p className="mt-3 text-gray-600">Check your inbox at {email}</p>
            <Link to="/login" className="mt-6 inline-block text-green-600 hover:text-emerald-600 font-semibold">
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            {initialEmail ? 'Resend verification email' : 'Verification failed'}
          </h2>
          {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
          <form onSubmit={handleResend} className="mt-6 space-y-4">
            <input
              type="email"
              required
              placeholder="Your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>
          <p className="mt-4 text-center">
            <Link to="/login" className="text-sm text-green-600 hover:text-emerald-600">
              Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
