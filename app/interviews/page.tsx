'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, LoaderCircle, MapPin, Video } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getInterviews, getMe, updateInterview } from '@/lib/api';
import type { Interview, User } from '@/lib/types';

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    Promise.all([getMe(), getInterviews()])
      .then(([currentUser, loadedInterviews]) => {
        setUser(currentUser);
        setInterviews(loadedInterviews);
      })
      .catch(() => setError('Sign in to view interviews, or check that the service is available.'))
      .finally(() => setLoading(false));
  }, []);

  const setInterviewStatus = async (interview: Interview, status: Interview['status']) => {
    setBusyId(interview.id);
    setError('');
    try {
      const updated = await updateInterview(interview.id, { status });
      setInterviews((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch {
      setError('The interview could not be updated.');
    } finally {
      setBusyId('');
    }
  };

  const recruiterView = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <p className="mb-6 mt-2 text-gray-500">Scheduled and past interviews</p>

        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {loading && <p className="py-12 text-center text-gray-500">Loading interviews…</p>}
        {!loading && !error && interviews.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No interviews have been scheduled yet.
          </div>
        )}

        <div className="space-y-4">
          {interviews.map((interview) => (
            <article key={interview.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{interview.jobTitle}</h2>
                  <p className="mt-1 text-sm text-gray-500">{recruiterView ? `Candidate: ${interview.candidateName}` : 'Your interview for this role'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  interview.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  interview.status === 'Scheduled' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{interview.status}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(interview.date)}</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" />{interview.time}</span>
                <span className="inline-flex items-center gap-2">
                  {interview.type === 'Video' ? <Video className="h-4 w-4" /> : interview.type === 'In-person' ? <MapPin className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                  {interview.type}
                </span>
              </div>

              {interview.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{interview.notes}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {interview.meetingLink && (
                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-dark">
                    Join interview
                  </a>
                )}
                {recruiterView && interview.status === 'Scheduled' && (
                  <button
                    onClick={() => void setInterviewStatus(interview, 'Completed')}
                    disabled={busyId === interview.id}
                    className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                  >
                    {busyId === interview.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Mark completed'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
