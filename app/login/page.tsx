'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye, EyeOff, Mail, Lock, AlertCircle,
  Clock, XCircle, ShieldAlert, ArrowRight,
} from 'lucide-react';
import { login } from '@/lib/auth';

type ErrorType = 'generic' | 'pending' | 'rejected' | 'unverified';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('generic');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const validate = () => {
    if (!form.email)                       return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Invalid email address.';
    if (!form.password)                    return 'Password is required.';
    if (form.password.length < 6)         return 'Password must be at least 6 characters.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ve = validate();
    if (ve) { setError(ve); setErrorType('generic'); return; }

    setLoading(true);
    setError('');
    setResendDone(false);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin')          router.push('/dashboard/admin');
      else if (user.role === 'recruiter') router.push('/dashboard/recruiter');
      else                                router.push('/dashboard/seeker');
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e?.detail === 'unverified') {
        setErrorType('unverified');
        setError('Your email has not been verified yet.');
      } else if (e?.detail === 'pending') {
        setErrorType('pending');
        setError(String(e?.message ?? 'Your account is awaiting admin approval.'));
      } else if (e?.detail === 'rejected') {
        setErrorType('rejected');
        setError(String(e?.message ?? 'Your account has been rejected.'));
      } else {
        setErrorType('generic');
        setError(String(e?.detail ?? 'Login failed. Check your credentials.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP from the login page
  const handleResendOTP = async () => {
    if (!form.email) return;
    setResending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to send OTP.');
      } else {
        setResendDone(true);
        // Redirect to verify page
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
      }
    } finally {
      setResending(false);
    }
  };

  // ── Error boxes ──────────────────────────────────────────────────
  const errorBox = (() => {
    if (!error && errorType !== 'unverified') return null;

    if (errorType === 'unverified') return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
        <div className="flex items-start gap-3 mb-3">
          <ShieldAlert className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 mb-0.5">Email Not Verified</p>
            <p className="text-blue-700 text-xs">
              You need to verify your email address before you can sign in.
              Click below to receive a new verification code.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending || resendDone}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {resending ? 'Sending…' : resendDone ? 'Sent! Redirecting…' : <><Mail className="w-3.5 h-3.5" /> Send Verification Code</>}
          </button>
          {form.email && (
            <button
              type="button"
              onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)}
              className="flex items-center gap-1 px-3 py-2 border border-blue-300 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              Enter Code <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );

    if (errorType === 'pending') return (
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
        <div>
          <p className="font-semibold mb-0.5">Awaiting Admin Approval</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      </div>
    );

    if (errorType === 'rejected') return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
        <div>
          <p className="font-semibold mb-0.5">Account Rejected</p>
          <p className="text-xs mt-0.5">{error}</p>
          <p className="mt-1.5 text-xs text-red-600">
            Contact <a href="mailto:admin@hireflow.com" className="underline font-medium">admin@hireflow.com</a> for help.
          </p>
        </div>
      </div>
    );

    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        {error}
      </div>
    );
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">HireFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorBox}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl outline-none
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl
                         hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
