'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { Calendar, CheckCircle2, FileText, ListChecks } from 'lucide-react';
import { getApplications, getInterviews, getMe } from '@/lib/api';
import type { Application, Interview, User } from '@/lib/types';

export default function RecruiterDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), getApplications(), getInterviews()])
      .then(([currentUser, loadedApplications, loadedInterviews]) => {
        setUser(currentUser);
        setApplications(loadedApplications);
        setInterviews(loadedInterviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const needReview = applications.filter((application) => application.status === 'Applied' || application.status === 'Under Review').length;
  const shortlisted = applications.filter((application) => application.status === 'Shortlisted').length;

  return (
    <DashboardLayout role="recruiter">
      <div className="p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="mb-6 text-gray-500">Welcome back{user ? `, ${user.name}` : ''}. Review your candidates and interviews.</p>
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Applications" value={loading ? '—' : applications.length} icon={<FileText className="h-5 w-5" />} color="blue" />
          <StatCard title="Needs Review" value={loading ? '—' : needReview} icon={<ListChecks className="h-5 w-5" />} color="amber" />
          <StatCard title="Shortlisted" value={loading ? '—' : shortlisted} icon={<CheckCircle2 className="h-5 w-5" />} color="green" />
          <StatCard title="Interviews" value={loading ? '—' : interviews.length} icon={<Calendar className="h-5 w-5" />} color="purple" />
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link href="/applications" className="text-sm font-medium text-brand hover:underline">Manage applications</Link>
          </div>
          {loading ? <p className="py-4 text-center text-gray-500">Loading applications…</p> : applications.length ? (
            <div className="space-y-3">
              {applications.slice(0, 6).map((application) => (
                <Link key={application.id} href="/applications" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{application.seekerName}</p>
                    <p className="text-sm text-gray-500">{application.jobTitle} · {application.seekerEmail}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{application.status}</span>
                </Link>
              ))}
            </div>
          ) : <p className="py-4 text-center text-gray-500">No applications have been submitted yet.</p>}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6">
          <div>
            <h2 className="font-semibold text-gray-900">Keep your hiring moving</h2>
            <p className="mt-1 text-sm text-gray-500">Publish roles, review candidates, and schedule interviews.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/interviews" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Interviews</Link>
            <Link href="/post-job" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">Post a job</Link>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
