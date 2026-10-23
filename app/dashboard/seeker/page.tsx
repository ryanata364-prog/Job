'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import { Bookmark, Calendar, FileText, MessageCircle } from 'lucide-react';
import { getApplications, getInterviews, getJobs, getMe } from '@/lib/api';
import type { Application, Interview, Job, User } from '@/lib/types';

export default function SeekerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), getApplications(), getInterviews(), getJobs()])
      .then(([currentUser, loadedApplications, loadedInterviews, loadedJobs]) => {
        setUser(currentUser);
        setApplications(loadedApplications);
        setInterviews(loadedInterviews);
        setJobs(loadedJobs);
      })
      .catch(() => setError('Sign in to load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="seeker">
      <div className="p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Job Seeker Dashboard</h1>
        <p className="mb-6 text-gray-500">Welcome back{user ? `, ${user.name}` : ''}. Here is your current overview.</p>
        {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard title="Applications" value={loading ? '—' : applications.length} icon={<FileText className="h-5 w-5" />} color="blue" />
          <StatCard title="Interviews" value={loading ? '—' : interviews.length} icon={<Calendar className="h-5 w-5" />} color="purple" />
          <StatCard title="Saved Jobs" value="—" icon={<Bookmark className="h-5 w-5" />} color="green" />
          <StatCard title="Messages" value="—" icon={<MessageCircle className="h-5 w-5" />} color="amber" />
        </div>

        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
            <Link href="/applications" className="text-sm font-medium text-brand hover:underline">View all</Link>
          </div>
          {loading ? <p className="py-4 text-center text-gray-500">Loading applications…</p> : applications.length ? (
            <div className="space-y-3">
              {applications.slice(0, 5).map((application) => (
                <Link key={application.id} href="/applications" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{application.jobTitle}</p>
                    <p className="text-sm text-gray-500">{application.company} · Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{application.status}</span>
                </Link>
              ))}
            </div>
          ) : <p className="py-4 text-center text-gray-500">No applications yet. Browse jobs to get started.</p>}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Open Jobs</h2>
            <Link href="/jobs" className="text-sm font-medium text-brand hover:underline">Browse all</Link>
          </div>
          {loading ? <p className="py-4 text-center text-gray-500">Loading jobs…</p> : jobs.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.slice(0, 3).map((job) => (
                <article key={job.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <span aria-hidden="true" className="text-2xl">{job.companyLogo || '🏢'}</span>
                    <div><h3 className="font-semibold text-gray-900">{job.title}</h3><p className="text-sm text-gray-500">{job.company}</p></div>
                  </div>
                  <p className="mb-3 text-sm text-gray-500">{job.salary} · {job.location}</p>
                  <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-brand hover:underline">View details</Link>
                </article>
              ))}
            </div>
          ) : <p className="py-4 text-center text-gray-500">No open jobs right now.</p>}
        </section>
      </div>
    </DashboardLayout>
  );
}
