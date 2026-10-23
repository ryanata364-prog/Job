'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays, Clock3, ExternalLink,
  FileText, LoaderCircle, X, AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getMe } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

type AppStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Accepted' | 'Rejected';

type Application = {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  company_logo: string;
  seeker_id: string;
  seeker_name: string;
  seeker_email: string;
  status: AppStatus;
  cover_letter: string;
  portfolio_url: string;
  linkedin_url: string;
  applied_at: string;
  updated_at: string;
};

type Interview = {
  id: string;
  application_id: string;
  interview_date: string;
  interview_time: string;
  type: string;
  meeting_link: string;
  notes: string;
  status: string;
};

const STATUS_COLORS: Record<string, string> = {
  'Applied':       'bg-blue-100 text-blue-700',
  'Under Review':  'bg-amber-100 text-amber-700',
  'Shortlisted':   'bg-purple-100 text-purple-700',
  'Interview':     'bg-indigo-100 text-indigo-700',
  'Accepted':      'bg-green-100 text-green-700',
  'Rejected':      'bg-red-100 text-red-700',
};

const STATUS_STEPS: AppStatus[] = [
  'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted',
];

const ALL_STATUSES: AppStatus[] = [
  'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected',
];

function formatDate(value: string) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export default function ApplicationsPage() {
  const [user, setUser]                   = useState<User | null>(null);
  const [applications, setApplications]   = useState<Application[]>([]);
  const [interviews, setInterviews]       = useState<Interview[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState('');
  const [actionError, setActionError]     = useState('');
  const [busyId, setBusyId]               = useState('');
  const [scheduling, setScheduling]       = useState<Application | null>(null);
  const [interviewForm, setInterviewForm] = useState({
    interview_date: '', interview_time: '', type: 'In-person', meeting_link: '', notes: '',
  });

  const loadData = useCallback(async (currentUser: User) => {
    // Build query based on role
    let appQuery = supabase
      .from('applications_full')
      .select('*')
      .order('applied_at', { ascending: false });

    // Seeker only sees their own
    if (currentUser.role === 'seeker') {
      appQuery = appQuery.eq('seeker_id', currentUser.id);
    }
    // Recruiter sees applications for their jobs
    else if (currentUser.role === 'recruiter') {
      const { data: myJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', currentUser.id);
      const jobIds = (myJobs ?? []).map((j: { id: string }) => j.id);
      if (jobIds.length === 0) { setApplications([]); return; }
      appQuery = appQuery.in('job_id', jobIds);
    }
    // Admin sees all — no filter

    const [{ data: apps, error: appErr }, { data: ivs, error: ivErr }] = await Promise.all([
      appQuery,
      supabase.from('interviews').select('*'),
    ]);

    if (appErr) throw appErr;
    if (ivErr)  throw ivErr;

    setApplications((apps ?? []) as Application[]);
    setInterviews((ivs ?? []) as Interview[]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getMe();
      if (!currentUser) { setLoadError('Please sign in to view applications.'); return; }
      setUser(currentUser);
      await loadData(currentUser);
    };
    init()
      .catch((err: unknown) => {
        const e = err as { message?: string };
        setLoadError(e?.message ?? 'Failed to load applications.');
      })
      .finally(() => setLoading(false));
  }, [loadData]);

  const changeStatus = async (app: Application, status: AppStatus) => {
    if (app.status === 'Accepted') return;
    setBusyId(app.id);
    setActionError('');
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', app.id);
      if (error) throw error;
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Could not update status.');
    } finally {
      setBusyId('');
    }
  };

  const withdraw = async (app: Application) => {
    if (!window.confirm(`Withdraw your application for ${app.job_title}?`)) return;
    setBusyId(app.id);
    setActionError('');
    try {
      const { error } = await supabase.from('applications').delete().eq('id', app.id);
      if (error) throw error;
      setApplications(prev => prev.filter(a => a.id !== app.id));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Could not withdraw application.');
    } finally {
      setBusyId('');
    }
  };

  const scheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduling) return;
    setBusyId(scheduling.id);
    setActionError('');
    try {
      const { error: ivError } = await supabase.from('interviews').insert({
        application_id:  scheduling.id,
        candidate_name:  scheduling.seeker_name,
        candidate_avatar: '',
        job_title:       scheduling.job_title,
        ...interviewForm,
        status: 'Scheduled',
      });
      if (ivError) throw ivError;

      await supabase.from('applications').update({ status: 'Interview' }).eq('id', scheduling.id);
      if (user) await loadData(user);
      setScheduling(null);
      setInterviewForm({ interview_date: '', interview_time: '', type: 'In-person', meeting_link: '', notes: '' });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionError(e?.message ?? 'Could not schedule interview.');
    } finally {
      setBusyId('');
    }
  };

  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'recruiter' ? 'Received Applications'
              : user?.role === 'admin' ? 'All Applications'
              : 'My Applications'}
          </h1>
          <p className="mt-1 text-gray-500">
            {applications.length} {applications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>

        {/* Errors */}
        {loadError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {loadError}
          </div>
        )}
        {actionError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {actionError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading applications…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !loadError && applications.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
            <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700 mb-1">No applications yet</p>
            <p className="text-sm">
              {isRecruiter
                ? 'No applications have been submitted for your jobs yet.'
                : 'You have not applied to any jobs yet. '}
              {!isRecruiter && (
                <Link href="/jobs" className="text-blue-600 hover:underline font-medium">Browse jobs</Link>
              )}
            </p>
          </div>
        )}

        {/* Application cards */}
        <div className="space-y-4">
          {applications.map(app => {
            const interview = interviews.find(
              iv => iv.application_id === app.id && iv.status !== 'Cancelled'
            );
            const stepIndex = STATUS_STEPS.indexOf(app.status);

            return (
              <article key={app.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {app.company_logo || '🏢'}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{app.job_title}</h2>
                      <p className="text-sm text-gray-500">{app.company}</p>
                      {isRecruiter && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {app.seeker_name} · {app.seeker_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[app.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {app.status}
                  </span>
                </div>

                {/* Dates */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" /> Applied {formatDate(app.applied_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" /> Updated {formatDate(app.updated_at)}
                  </span>
                </div>

                {/* Progress steps (seeker only) */}
                {!isRecruiter && app.status !== 'Rejected' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {STATUS_STEPS.map((step, i) => (
                      <span key={step} className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        i <= stepIndex ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step}
                      </span>
                    ))}
                  </div>
                )}
                {!isRecruiter && app.status === 'Rejected' && (
                  <p className="mt-3 text-sm text-red-600">This application was not selected.</p>
                )}
                {!isRecruiter && app.status === 'Accepted' && (
                  <p className="mt-3 text-sm font-medium text-green-700">🎉 Congratulations! Your application was accepted.</p>
                )}

                {/* Interview info */}
                {interview && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <p className="flex items-center gap-2 font-medium text-indigo-900 text-sm">
                      <CalendarDays className="h-4 w-4" /> Interview {interview.status.toLowerCase()}
                    </p>
                    <p className="mt-1 text-sm text-indigo-800">
                      {formatDate(interview.interview_date)} at {interview.interview_time} · {interview.type}
                    </p>
                    {interview.meeting_link && (
                      <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-indigo-700 underline">
                        Join interview
                      </a>
                    )}
                    {interview.notes && (
                      <p className="mt-2 text-sm text-indigo-800">{interview.notes}</p>
                    )}
                  </div>
                )}

                {/* Cover letter */}
                {app.cover_letter && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="line-clamp-2 text-sm text-gray-600">{app.cover_letter}</p>
                  </div>
                )}

                {/* Actions row */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                  <Link href={`/jobs/${app.job_id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> View job
                  </Link>
                  {app.portfolio_url && (
                    <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline">Portfolio</a>
                  )}
                  {app.linkedin_url && (
                    <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline">LinkedIn</a>
                  )}

                  {/* Recruiter controls */}
                  {isRecruiter && (
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <select
                        value={app.status}
                        disabled={busyId === app.id || app.status === 'Accepted'}
                        onChange={e => void changeStatus(app, e.target.value as AppStatus)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {!interview && app.status !== 'Rejected' && app.status !== 'Accepted' && (
                        <button
                          onClick={() => { setScheduling(app); setActionError(''); }}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                          Schedule Interview
                        </button>
                      )}
                    </div>
                  )}

                  {/* Seeker withdraw */}
                  {user?.role === 'seeker' && (
                    <button
                      onClick={() => void withdraw(app)}
                      disabled={busyId === app.id || app.status === 'Accepted'}
                      className="ml-auto inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {busyId === app.id
                        ? <LoaderCircle className="h-4 w-4 animate-spin" />
                        : <X className="h-4 w-4" />}
                      Withdraw
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Schedule interview modal */}
      {scheduling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setScheduling(null)}>
          <form onSubmit={e => void scheduleInterview(e)}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900">Schedule Interview</h2>
            <p className="text-sm text-gray-500">{scheduling.seeker_name} · {scheduling.job_title}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Date
                <input type="date" required
                  min={new Date().toISOString().slice(0, 10)}
                  value={interviewForm.interview_date}
                  onChange={e => setInterviewForm({ ...interviewForm, interview_date: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Time
                <input type="time" required
                  value={interviewForm.interview_time}
                  onChange={e => setInterviewForm({ ...interviewForm, interview_time: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Type
                <select value={interviewForm.type}
                  onChange={e => setInterviewForm({ ...interviewForm, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white">
                  <option>Video</option>
                  <option>Phone</option>
                  <option>In-person</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Meeting Link
                <input type="url"
                  value={interviewForm.meeting_link}
                  onChange={e => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              </label>
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Notes
              <textarea rows={3}
                value={interviewForm.notes}
                onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                placeholder="Any preparation instructions..."
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none" />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setScheduling(null)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={busyId === scheduling.id}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {busyId === scheduling.id ? 'Scheduling…' : 'Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
