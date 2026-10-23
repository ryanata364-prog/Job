'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getMe } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Data Science', 'Product', 'Sales', 'Finance', 'HR', 'Other'];

const initialForm = {
  title: '',
  company_id: '',
  category: 'Engineering',
  location: '',
  salary: '',
  type: 'Full-time',
  workplace_type: 'Hybrid',
  experience: '',
  description: '',
  skills: '',
  deadline: '',
};

type Company = { id: string; name: string; location: string };

export default function PostJobPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdJobId, setCreatedJobId] = useState('');

  useEffect(() => {
    const init = async () => {
      const currentUser = await getMe();
      if (!currentUser) { setAuthorized(false); return; }
      setUser(currentUser);

      const canPost = (currentUser.role === 'admin' || currentUser.role === 'recruiter')
        && currentUser.status === 'Active';
      setAuthorized(canPost);

      if (canPost) {
        const { data: comps } = await supabase
          .from('companies')
          .select('id, name, location')
          .order('name');
        if (comps && comps.length > 0) {
          setCompanies(comps);
          setForm(f => ({ ...f, company_id: comps[0].id, location: comps[0].location }));
        }
      }
    };
    init().catch(() => setAuthorized(false));
  }, []);

  const update = (field: keyof typeof initialForm, value: string) => {
    if (field === 'company_id') {
      const company = companies.find(c => c.id === value);
      setForm(f => ({ ...f, company_id: value, location: f.location || company?.location || '' }));
      return;
    }
    setForm(f => ({ ...f, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim())       { setError('Job title is required.');       return; }
    if (!form.company_id)         { setError('Please select a company.');      return; }
    if (!form.description.trim()) { setError('Job description is required.'); return; }

    setSubmitting(true);
    try {
      const skillsArray = form.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
          company_id:      form.company_id,
          recruiter_id:    user?.id,
          title:           form.title,
          location:        form.location,
          salary:          form.salary,
          type:            form.type,
          workplace_type:  form.workplace_type,
          experience:      form.experience,
          category:        form.category,
          description:     form.description,
          skills:          skillsArray,
          deadline:        form.deadline || null,
          status:          'Active',
          vacancies:       1,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      setCreatedJobId(job.id);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message ?? 'The job could not be published. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
          <p className="mt-2 text-gray-500">Create a listing that job seekers can discover and apply to immediately.</p>
        </div>

        {/* Loading */}
        {authorized === null && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Checking your account…</p>
          </div>
        )}

        {/* Not authorized */}
        {authorized === false && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-amber-900">Recruiter access required</h2>
                <p className="mt-1 text-sm text-amber-800">
                  Only recruiters and admins can post jobs. Sign in with a recruiter or admin account.
                </p>
                <Link href="/login"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Go to login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {authorized && createdJobId && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-xl font-bold text-green-900">Your job is live!</h2>
            <p className="mt-1 text-sm text-green-700">Job seekers can now find and apply to your listing.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href={`/jobs/${createdJobId}`}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                View Job
              </Link>
              <button
                onClick={() => { setCreatedJobId(''); setForm(initialForm); }}
                className="rounded-lg border border-green-300 px-5 py-2.5 text-sm font-medium text-green-800 hover:bg-green-100 transition-colors">
                Post Another
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {authorized && !createdJobId && (
          <form onSubmit={submit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Job Title *">
                <input value={form.title} onChange={e => update('title', e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>

              <Field label="Company *">
                <select value={form.company_id} onChange={e => update('company_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white">
                  {companies.length === 0 && <option value="">No companies found</option>}
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <Field label="Category">
                <select value={form.category} onChange={e => update('category', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Location">
                <input value={form.location} onChange={e => update('location', e.target.value)}
                  placeholder="City or Remote"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>

              <Field label="Salary">
                <input value={form.salary} onChange={e => update('salary', e.target.value)}
                  placeholder="e.g. $50,000 – $70,000/yr"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>

              <Field label="Experience">
                <input value={form.experience} onChange={e => update('experience', e.target.value)}
                  placeholder="e.g. 2+ years"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>

              <Field label="Job Type">
                <select value={form.type} onChange={e => update('type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Freelance</option>
                </select>
              </Field>

              <Field label="Workplace">
                <select value={form.workplace_type} onChange={e => update('workplace_type', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white">
                  <option>Hybrid</option>
                  <option>Remote</option>
                  <option>On-site</option>
                </select>
              </Field>

              <Field label="Application Deadline">
                <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>

              <Field label="Skills (comma-separated)">
                <input value={form.skills} onChange={e => update('skills', e.target.value)}
                  placeholder="React, TypeScript, CSS"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors" />
              </Field>
            </div>

            <Field label="Job Description *">
              <textarea value={form.description} onChange={e => update('description', e.target.value)}
                rows={6} placeholder="Describe the role, your team, and what the successful candidate will do."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-y" />
            </Field>

            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white
                         hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors">
              {submitting ? 'Publishing…' : 'Publish Job'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
