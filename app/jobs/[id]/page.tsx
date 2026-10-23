'use client';
import { Suspense, use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft, MapPin, DollarSign, Clock,
  Briefcase, CheckCircle, AlertCircle, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMe } from '@/lib/auth';
import { Job } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import Navbar from '@/components/layout/Navbar';

interface Props { params: Promise<{ id: string }> }

function JobDetailContent({ params }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { id: jobId } = use(params);

  const [job, setJob]               = useState<Job | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [applied, setApplied]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [form, setForm]             = useState({
    cover_letter: '', portfolio_url: '', linkedin_url: '',
  });

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('jobs_with_company')
        .select('*')
        .eq('id', jobId)
        .single();
      if (error || !data) { setJob(null); }
      else {
        const j = data as Record<string, unknown>;
        setJob({
          id:              String(j.id),
          title:           String(j.title ?? ''),
          companyId:       String(j.company_id ?? ''),
          company:         String(j.company ?? ''),
          companyLogo:     String(j.company_logo ?? '🏢'),
          location:        String(j.location ?? ''),
          salary:          String(j.salary ?? ''),
          type:            String(j.type ?? 'Full-time') as Job['type'],
          workplaceType:   String(j.workplace_type ?? 'On-site') as Job['workplaceType'],
          experience:      String(j.experience ?? ''),
          category:        String(j.category ?? ''),
          description:     String(j.description ?? ''),
          responsibilities: (j.responsibilities as string[]) ?? [],
          requirements:    (j.requirements as string[]) ?? [],
          qualifications:  (j.qualifications as string[]) ?? [],
          benefits:        (j.benefits as string[]) ?? [],
          skills:          (j.skills as string[]) ?? [],
          vacancies:       Number(j.vacancies ?? 1),
          deadline:        String(j.deadline ?? ''),
          postedAt:        String(j.posted_at ?? ''),
          status:          String(j.status ?? 'Active') as Job['status'],
          views:           Number(j.views ?? 0),
          applications:    Number(j.application_count ?? 0),
        });
      }
      setLoading(false);
    };
    void load();
  }, [jobId]);

  // Auto-open apply modal if ?apply=true
  useEffect(() => {
    if (searchParams.get('apply') !== 'true') return;
    getMe().then(u => {
      if (u) setShowModal(true);
      else router.replace(`/login?next=${encodeURIComponent(`/jobs/${jobId}?apply=true`)}`);
    });
  }, [jobId, router, searchParams]);

  const handleApplyClick = async () => {
    const u = await getMe();
    if (!u) {
      router.push(`/login?next=${encodeURIComponent(`/jobs/${jobId}?apply=true`)}`);
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError('');
    setSubmitting(true);
    try {
      const u = await getMe();
      if (!u) throw new Error('Please sign in to apply.');

      const { error } = await supabase.from('applications').insert({
        job_id:        jobId,
        seeker_id:     u.id,
        cover_letter:  form.cover_letter,
        portfolio_url: form.portfolio_url,
        linkedin_url:  form.linkedin_url,
        status:        'Applied',
      });

      if (error) {
        // Unique constraint = already applied
        if (error.code === '23505') throw new Error('You have already applied for this job.');
        throw error;
      }

      setApplied(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setApplyError(e?.message ?? 'Your application could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500">Loading job…</p>
      </div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
        <p className="text-gray-500 mb-6">This job does not exist or has been removed.</p>
        <button onClick={() => router.push('/jobs')}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Back to Jobs
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.push('/jobs')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                {job.companyLogo?.startsWith('/') || job.companyLogo?.startsWith('http')
                  ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                  : job.companyLogo}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-500 mt-0.5">{job.company}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <StatusBadge status={job.type} />
                  <StatusBadge status={job.workplaceType} />
                </div>
              </div>
            </div>
            <button onClick={handleApplyClick}
              className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
              Apply Now
            </button>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" /> {job.salary}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" /> {job.experience}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" /> Deadline: {job.deadline || 'Open'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" /> Category: {job.category || '—'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4 text-gray-400" /> Vacancies: {job.vacancies}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" /> Posted: {job.postedAt || '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Qualifications</h2>
                <ul className="space-y-2">
                  {job.qualifications.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" /> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply CTA */}
            <div className="bg-blue-600 rounded-2xl p-5 text-white text-center">
              <h3 className="font-semibold mb-1">Interested in this role?</h3>
              <p className="text-blue-100 text-sm mb-4">Submit your application today</p>
              <button onClick={handleApplyClick}
                className="w-full py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => { if (!submitting) { setShowModal(false); setApplied(false); setApplyError(''); } }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Apply for this position</h2>
                <p className="text-sm text-gray-500">{job.title} · {job.company}</p>
              </div>
              <button onClick={() => { setShowModal(false); setApplied(false); setApplyError(''); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Success state */}
            {applied ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Your application for <strong>{job.title}</strong> has been sent to {job.company}.
                  We will notify you of any updates.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowModal(false); setApplied(false); }}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                    Close
                  </button>
                  <button onClick={() => { setShowModal(false); router.push('/applications'); }}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    View My Applications
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {applyError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {applyError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.cover_letter}
                    onChange={e => setForm({ ...form, cover_letter: e.target.value })}
                    placeholder="Tell the employer why you're a great fit for this role…"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Portfolio PDF URL <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => setForm({ ...form, portfolio_url: e.target.files?.[0]?.name ?? '' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    LinkedIn URL <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button"
                    onClick={() => { setShowModal(false); setApplyError(''); }}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-semibold">
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobDetailPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-20 text-center text-gray-500">Loading job…</div>
    }>
      <JobDetailContent params={params} />
    </Suspense>
  );
}
