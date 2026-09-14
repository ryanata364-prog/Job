'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, Briefcase, Search } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'seeker' | 'recruiter'>('seeker');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.phone) e.phone = 'Phone number is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    router.push(role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/seeker');
  };

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder }: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type={type} value={form[name as keyof typeof form]} onChange={e => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-colors ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`} />
      </div>
      {errors[name] && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">HireFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { value: 'seeker', label: 'Job Seeker', icon: Search, desc: 'Find your dream job' },
              { value: 'recruiter', label: 'Recruiter', icon: Briefcase, desc: 'Hire top talent' },
            ] as const).map(r => (
              <button key={r.value} type="button" onClick={() => setRole(r.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${role === r.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <r.icon className={`w-5 h-5 mb-2 ${role === r.value ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`font-semibold text-sm ${role === r.value ? 'text-blue-600' : 'text-gray-700'}`}>{r.label}</div>
                <div className="text-xs text-gray-500">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field name="name" label="Full Name" icon={User} placeholder="John Doe" />
            <Field name="email" label="Email Address" type="email" icon={Mail} placeholder="you@example.com" />
            <Field name="phone" label="Phone Number" icon={Phone} placeholder="+1 555-0100" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-colors ${errors.confirm ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-blue-500'}`} />
              </div>
              {errors.confirm && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
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
