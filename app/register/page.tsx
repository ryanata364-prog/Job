'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { register } from '@/lib/auth';

type FormValues = {
  name: string; email: string; phone: string; password: string; confirm: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]         = useState<FormValues>({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);

  const set = (field: keyof FormValues) => (val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                       e.name     = 'Full name is required.';
    if (!form.email)                             e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Invalid email address.';
    if (!form.phone)                             e.phone    = 'Phone number is required.';
    if (!form.password)                          e.password = 'Password is required.';
    else if (form.password.length < 8)           e.password = 'Minimum 8 characters.';
    if (form.password !== form.confirm)          e.confirm  = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await register({ ...form, role: 'seeker' });

      // Send OTP to their email
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const otpData = await otpRes.json().catch(() => ({})) as { error?: string };
      if (!otpRes.ok) {
        throw { detail: otpData.error ?? `Failed to send OTP (status ${otpRes.status}).` };
      }

      // Redirect to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err: unknown) {
      const detail = err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'detail' in err
          ? String(err.detail)
          : 'Registration failed. Please try again.';
      setErrors({ general: detail });
    } finally {
      setLoading(false);
    }
  };

  // ── Register form ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">HireFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errors.general}
              </div>
            )}

            <FormField label="Full Name" icon={User} placeholder="John Doe"
              value={form.name} onChange={set('name')} error={errors.name} />
            <FormField label="Email Address" type="email" icon={Mail} placeholder="you@example.com"
              value={form.email} onChange={set('email')} error={errors.email} />
            <FormField label="Phone Number" icon={Phone} placeholder="+1 555-0100"
              value={form.phone} onChange={set('phone')} error={errors.phone} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password')(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl outline-none transition-colors ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <FieldError msg={errors.password} />}
            </div>

            <FormField label="Confirm Password" type="password" icon={Lock}
              placeholder="Repeat your password"
              value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl
                         hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" /> {msg}
    </p>
  );
}

function FormField({ label, type = 'text', icon: Icon, placeholder, value, onChange, error }: {
  label: string; type?: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`} />
      </div>
      {error && <FieldError msg={error} />}
    </div>
  );
}
