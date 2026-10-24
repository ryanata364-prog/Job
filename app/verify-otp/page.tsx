'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle, RefreshCw,
  AlertCircle, ShieldCheck, ArrowLeft,
} from 'lucide-react';

function VerifyOTPContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') ?? '';
  const next         = searchParams.get('next') ?? '';  // 'login' = came from login flow

  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend cooldown on mount
  useEffect(() => {
    setCooldown(60);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Handle OTP digit input
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit code.'); return; }

    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Verification failed. Please try again.');
        return;
      }

      setVerified(true);
      // If we came from the login flow, redirect automatically after a moment
      if (next === 'login') {
        setTimeout(() => router.push('/'), 1500);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setResendMsg('');
    setError('');
    setOtp(['', '', '', '', '', '']);
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Failed to resend OTP.');
        return;
      }
      setResendMsg('A new code has been sent to your email.');
      setCooldown(60);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── Verified success screen ───────────────────────────────────
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-1 mb-8">
              {[
                { label: 'Registered', done: true },
                { label: 'Email Verified', done: true },
                { label: 'Login', done: false, active: true },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.done ? 'bg-green-500 text-white' :
                      step.active ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-1 whitespace-nowrap ${
                      step.done ? 'text-green-600' : step.active ? 'text-blue-600' : 'text-gray-400'
                    }`}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-6 h-px bg-gray-300 mx-1 mb-4" />}
                </div>
              ))}
            </div>

            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {next === 'login' ? 'Identity Verified!' : 'Email Verified!'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {next === 'login'
                ? 'Your identity has been confirmed. Redirecting you now…'
                : 'Your email has been verified successfully. You can now sign in to your account.'}
            </p>

            {next === 'login' ? (
              <div className="flex items-center justify-center gap-2 py-3 text-blue-600 text-sm font-medium">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Redirecting…
              </div>
            ) : (
              <Link href="/login"
                className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Continue to Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── OTP entry screen ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">HireFlow</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-500 text-sm">
              We sent a 6-digit code to
            </p>
            <p className="font-semibold text-gray-800 text-sm mt-0.5">{email}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendMsg && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 mb-5">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {resendMsg}
            </div>
          )}

          {/* OTP input boxes */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                  digit
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 focus:border-blue-500 focus:bg-blue-50'
                } ${error ? 'border-red-400 bg-red-50' : ''}`}
              />
            ))}
          </div>

          {/* Expiry notice */}
          <p className="text-center text-xs text-gray-400 mb-5">
            Code expires in <span className="font-medium text-gray-600">10 minutes</span>
          </p>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl
                       hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying…
              </span>
            ) : 'Verify Email'}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600
                         hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend Code'}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <Link href="/register" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
