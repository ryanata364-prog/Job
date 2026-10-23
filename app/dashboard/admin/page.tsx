'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import {
  AlertCircle, Building, FileText, Users,
  CheckCircle, XCircle, Clock, ChevronDown,
  ChevronUp, Mail, Phone, Calendar, ShieldCheck,
  ShieldX, RefreshCw, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMe } from '@/lib/auth';
import type { User } from '@/lib/types';

// ── Types ────────────────────────────────────────────────────────
type ProfileRow = {
  id: string;
  name: string;
  phone: string;
  role: string;
  approval_status: string;
  email_verified: boolean;
  rejection_reason: string;
  created_at: string;
  // email comes from auth.users — fetched separately
  email?: string;
};

type JobRow     = { id: string; title: string; status: string; company?: string; application_count?: number };
type CompanyRow = { id: string; name: string; industry: string };

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

// ── Helper: call server-side approve/reject API ───────────────────
async function serverApproveReject(
  seekerId: string,
  action: 'approve' | 'reject',
  reason: string,
  token: string
): Promise<{ success?: boolean; error?: string; name?: string }> {
  const res = await fetch('/api/auth/approve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ seekerId, action, reason }),
  });
  return res.json() as Promise<{ success?: boolean; error?: string; name?: string }>;
}

// ── Component ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [adminUser, setAdminUser]       = useState<User | null>(null);
  const [token, setToken]               = useState('');
  const [profiles, setProfiles]         = useState<ProfileRow[]>([]);
  const [allProfileCount, setAllProfileCount] = useState(0);
  const [jobs, setJobs]                 = useState<JobRow[]>([]);
  const [companies, setCompanies]       = useState<CompanyRow[]>([]);
  const [appCount, setAppCount]         = useState(0);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState('');
  const [busyId, setBusyId]             = useState('');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [rejectModal, setRejectModal]   = useState<ProfileRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionMsg, setActionMsg]       = useState('');
  const [filterTab, setFilterTab]       = useState<FilterTab>('pending');
  const [searchTerm, setSearchTerm]     = useState('');

  // ── Load data ───────────────────────────────────────────────────
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token ?? token;
      if (tok && !token) setToken(tok);

      const [
        seekersRes,
        { data: jobsData },
        { data: companiesData },
        { count: appsCount },
      ] = await Promise.all([
        // Use the server API to get seekers with emails
        fetch('/api/auth/seekers', {
          headers: { Authorization: `Bearer ${tok}` },
        }).then(r => r.json()) as Promise<{ seekers?: ProfileRow[]; error?: string }>,
        supabase.from('jobs_with_company').select('id, title, status, company, application_count'),
        supabase.from('companies').select('id, name, industry'),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
      ]);

      // Also get non-seeker profiles for total count
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, role');

      setProfiles((seekersRes.seekers ?? []) as ProfileRow[]);
      setAllProfileCount((allProfiles ?? []).length);
      setJobs((jobsData ?? []) as JobRow[]);
      setCompanies((companiesData ?? []) as CompanyRow[]);
      setAppCount(appsCount ?? 0);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const me = await getMe();
      if (me) setAdminUser(me);

      // Get session token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const tok = session?.access_token ?? '';
      setToken(tok);

      // Load data with token directly (avoids stale closure)
      setRefreshing(true);
      try {
        const [
          seekersRes,
          { data: jobsData },
          { data: companiesData },
          { count: appsCount },
          { data: allProfiles },
        ] = await Promise.all([
          fetch('/api/auth/seekers', {
            headers: { Authorization: `Bearer ${tok}` },
          }).then(r => r.json()) as Promise<{ seekers?: ProfileRow[] }>,
          supabase.from('jobs_with_company').select('id, title, status, company, application_count'),
          supabase.from('companies').select('id, name, industry'),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('id'),
        ]);
        setProfiles((seekersRes.seekers ?? []) as ProfileRow[]);
        setAllProfileCount((allProfiles ?? []).length);
        setJobs((jobsData ?? []) as JobRow[]);
        setCompanies((companiesData ?? []) as CompanyRow[]);
        setAppCount(appsCount ?? 0);
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    };
    init().catch(() => {
      setError('Failed to load dashboard data.');
      setLoading(false);
    });
  }, []);

  // ── Real-time subscription for profiles changes ─────────────────
  useEffect(() => {
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => { void loadData(true); }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [loadData]);

  // ── Approve ─────────────────────────────────────────────────────
  const handleApprove = async (profile: ProfileRow) => {
    setBusyId(profile.id);
    setActionMsg('');
    setError('');
    const result = await serverApproveReject(profile.id, 'approve', '', token);
    if (result.error) {
      setError(result.error);
    } else {
      setActionMsg(`✓ ${profile.name}'s account has been approved. They can now log in.`);
      await loadData(true);
    }
    setBusyId('');
  };

  // ── Reject ──────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModal) return;
    setBusyId(rejectModal.id);
    setActionMsg('');
    setError('');
    const result = await serverApproveReject(rejectModal.id, 'reject', rejectReason, token);
    if (result.error) {
      setError(result.error);
    } else {
      setActionMsg(`✗ ${rejectModal.name}'s account has been rejected.`);
      setRejectModal(null);
      setRejectReason('');
      await loadData(true);
    }
    setBusyId('');
  };

  // ── Change job status ───────────────────────────────────────────
  const changeJobStatus = async (jobId: string, status: string) => {
    setBusyId(jobId);
    await supabase.from('jobs').update({ status }).eq('id', jobId);
    await loadData(true);
    setBusyId('');
  };

  // ── Computed values ─────────────────────────────────────────────
  const seekers         = profiles.filter(p => p.role === 'seeker');
  const pendingSeekers  = seekers.filter(p => p.approval_status === 'pending');
  const approvedSeekers = seekers.filter(p => p.approval_status === 'approved');
  const rejectedSeekers = seekers.filter(p => p.approval_status === 'rejected');

  const filteredSeekers = seekers.filter(p => {
    const matchTab =
      filterTab === 'all'      ? true :
      filterTab === 'pending'  ? p.approval_status === 'pending' :
      filterTab === 'approved' ? p.approval_status === 'approved' :
                                  p.approval_status === 'rejected';
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  // ── Badges ──────────────────────────────────────────────────────
  const statusBadge = (s: string) => {
    if (s === 'pending')  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full"><Clock className="w-3 h-3" />Pending</span>;
    if (s === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full"><CheckCircle className="w-3 h-3" />Approved</span>;
    if (s === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full"><XCircle className="w-3 h-3" />Rejected</span>;
    return null;
  };

  const emailBadge = (verified: boolean) =>
    verified
      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"><ShieldCheck className="w-3 h-3" />Verified</span>
      : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full"><ShieldX className="w-3 h-3" />Unverified</span>;

  const TABS: { key: FilterTab; label: string; count: number; color: string }[] = [
    { key: 'pending',  label: 'Pending',  count: pendingSeekers.length,  color: 'amber'  },
    { key: 'approved', label: 'Approved', count: approvedSeekers.length, color: 'green'  },
    { key: 'rejected', label: 'Rejected', count: rejectedSeekers.length, color: 'red'    },
    { key: 'all',      label: 'All',      count: seekers.length,         color: 'gray'   },
  ];

  // ── Render ──────────────────────────────────────────────────────
  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back{adminUser ? `, ${adminUser.name}` : ''}
            </p>
          </div>
          <button
            onClick={() => void loadData()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {actionMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 flex-shrink-0" /> {actionMsg}
            <button onClick={() => setActionMsg('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard title="Total Users"   value={loading ? '—' : allProfileCount}                                        icon={<Users    className="h-5 w-5" />} color="blue"   />
          <StatCard title="Pending"       value={loading ? '—' : pendingSeekers.length}                                    icon={<Clock    className="h-5 w-5" />} color="orange" />
          <StatCard title="Active Jobs"   value={loading ? '—' : jobs.filter(j => j.status === 'Active').length}           icon={<FileText className="h-5 w-5" />} color="purple" />
          <StatCard title="Applications"  value={loading ? '—' : appCount}                                                 icon={<FileText className="h-5 w-5" />} color="green"  />
        </div>

        {/* ── Pending banner ── */}
        {!loading && pendingSeekers.length > 0 && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">
                {pendingSeekers.length} account{pendingSeekers.length > 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Review pending registrations below and approve or reject each account.
              </p>
            </div>
            <button
              onClick={() => setFilterTab('pending')}
              className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors"
            >
              Review Now
            </button>
          </div>
        )}

        {/* ── Job Seekers section ── */}
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Job Seeker Registrations
              </h2>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email…"
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 w-64"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mt-4">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filterTab === tab.key
                      ? tab.color === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : tab.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200'
                      : tab.color === 'red'   ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    filterTab === tab.key ? 'bg-white/60' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Registered</div>
            <div className="col-span-1">Email</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading registrations…</p>
            </div>
          ) : filteredSeekers.length === 0 ? (
            <div className="py-14 text-center">
              <CheckCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">
                {filterTab === 'pending' ? 'No pending approvals — all caught up!' :
                 filterTab === 'approved' ? 'No approved accounts yet.' :
                 filterTab === 'rejected' ? 'No rejected accounts.' :
                 'No job seekers registered yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSeekers.map(p => (
                <div key={p.id}>
                  <div className="px-6 py-4 grid md:grid-cols-12 gap-3 items-center">

                    {/* Name */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 text-sm flex-shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                        {p.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3">
                      <p className="text-sm text-gray-600 flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {p.email ?? '—'}
                      </p>
                    </div>

                    {/* Registered */}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-300 ml-4">
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Email verified */}
                    <div className="col-span-1">
                      {emailBadge(p.email_verified)}
                    </div>

                    {/* Approval status */}
                    <div className="col-span-1">
                      {statusBadge(p.approval_status)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        {expandedId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {p.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => { setRejectModal(p); setRejectReason(''); }}
                            disabled={busyId === p.id}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors">
                            <XCircle className="w-3.5 h-3.5 inline mr-1" />Reject
                          </button>
                          <button
                            onClick={() => void handleApprove(p)}
                            disabled={busyId === p.id}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                            {busyId === p.id
                              ? <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />…</span>
                              : <><CheckCircle className="w-3.5 h-3.5 inline mr-1" />Approve</>}
                          </button>
                        </>
                      )}

                      {p.approval_status === 'approved' && (
                        <button
                          onClick={() => { setRejectModal(p); setRejectReason(''); }}
                          disabled={busyId === p.id}
                          className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors">
                          Revoke
                        </button>
                      )}

                      {p.approval_status === 'rejected' && (
                        <button
                          onClick={() => void handleApprove(p)}
                          disabled={busyId === p.id}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
                          Re-approve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail row */}
                  {expandedId === p.id && (
                    <div className="mx-6 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                          <p className="font-medium text-gray-700">{p.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                          <p className="font-medium text-gray-700">{p.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Email Verified</p>
                          <p className="font-medium">{p.email_verified ? '✓ Yes' : '✗ No'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Registered</p>
                          <p className="font-medium text-gray-700">{new Date(p.created_at).toLocaleString()}</p>
                        </div>
                        {p.approval_status === 'rejected' && p.rejection_reason && (
                          <div className="col-span-4">
                            <p className="text-xs text-gray-400 mb-0.5">Rejection Reason</p>
                            <p className="text-red-600 italic">"{p.rejection_reason}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Jobs & Companies ── */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Posts</h2>
              <Link href="/jobs" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            {loading ? <p className="py-4 text-center text-gray-400">Loading…</p> :
              jobs.length === 0 ? <p className="py-4 text-center text-gray-400">No jobs yet.</p> : (
              <div className="space-y-2">
                {jobs.slice(0, 8).map(job => (
                  <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.company} · {job.application_count ?? 0} applications</p>
                    </div>
                    <select value={job.status} disabled={busyId === job.id}
                      onChange={e => void changeJobStatus(job.id, e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs">
                      <option>Active</option><option>Paused</option><option>Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
              <Link href="/companies" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            {loading ? <p className="py-4 text-center text-gray-400">Loading…</p> :
              companies.length === 0 ? <p className="py-4 text-center text-gray-400">No companies yet.</p> : (
              <div className="grid gap-2 sm:grid-cols-2">
                {companies.slice(0, 8).map(c => (
                  <Link key={c.id} href={`/companies/${c.id}`}
                    className="rounded-lg border border-gray-100 p-3 hover:border-blue-200 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.industry || 'Industry not specified'}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Reject / Revoke modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {rejectModal.approval_status === 'approved' ? 'Revoke Account Access' : 'Reject Registration'}
                </h3>
                <p className="text-sm text-gray-500">{rejectModal.name}</p>
                {rejectModal.email && <p className="text-xs text-gray-400">{rejectModal.email}</p>}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason <span className="text-gray-400 font-normal">(optional — will be shown to the user)</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete information, duplicate account, suspicious activity…"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => void handleReject()}
                disabled={busyId === rejectModal.id}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
                {busyId === rejectModal.id
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
                  : rejectModal.approval_status === 'approved' ? 'Revoke Access' : 'Reject Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
