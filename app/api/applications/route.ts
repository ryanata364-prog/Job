import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/server/supabaseServer';
import type { Application } from '@/lib/types';

export const runtime = 'nodejs';

function rowToApplication(row: Record<string, unknown>): Application {
  return {
    id:           String(row.id ?? ''),
    jobId:        String(row.job_id ?? ''),
    jobTitle:     String(row.job_title ?? row.jobTitle ?? ''),
    company:      String(row.company ?? ''),
    companyLogo:  String(row.company_logo ?? row.companyLogo ?? ''),
    seekerId:     String(row.seeker_id ?? ''),
    seekerName:   String(row.seeker_name ?? row.seekerName ?? ''),
    seekerEmail:  String(row.seeker_email ?? row.seekerEmail ?? ''),
    status:       (row.status as Application['status']) ?? 'Applied',
    coverLetter:  String(row.cover_letter ?? row.coverLetter ?? ''),
    portfolioUrl: String(row.portfolio_url ?? row.portfolioUrl ?? ''),
    linkedinUrl:  String(row.linkedin_url ?? row.linkedinUrl ?? ''),
    appliedAt:    String(row.applied_at ?? row.appliedAt ?? ''),
    updatedAt:    String(row.updated_at ?? row.updatedAt ?? ''),
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const jobId = request.nextUrl.searchParams.get('job');

  // Use the joined view that includes job title, company, seeker info
  let query = supabase.from('applications_full').select('*');

  // Seekers only see their own applications
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role === 'seeker') {
    query = query.eq('seeker_id', user.id);
  }
  if (jobId) {
    query = query.eq('job_id', jobId);
  }

  const { data, error } = await query.order('applied_at', { ascending: false });

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(r => rowToApplication(r as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Please sign in before applying.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'seeker') {
    return NextResponse.json({ detail: 'Only job seekers can apply to jobs.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    job?: string; coverLetter?: string; portfolioUrl?: string; linkedinUrl?: string;
  };
  if (!body.job) {
    return NextResponse.json({ job: 'Select a job to apply for.' }, { status: 400 });
  }

  const { data: job } = await supabase
    .from('jobs').select('id').eq('id', body.job).eq('status', 'Active').single();
  if (!job) {
    return NextResponse.json({ detail: 'The job is no longer available.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id:       body.job,
      seeker_id:    user.id,
      cover_letter: body.coverLetter?.trim() ?? '',
      portfolio_url: body.portfolioUrl?.trim() ?? '',
      linkedin_url: body.linkedinUrl?.trim() ?? '',
      status:       'Applied',
    })
    .select('*, jobs(title, companies(name, logo)), profiles(name)')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ detail: 'You have already applied for this job.' }, { status: 409 });
    }
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const row = data as Record<string, unknown>;
  const jobData = row.jobs as Record<string, unknown> | null;
  const companyData = jobData?.companies as Record<string, unknown> | null;
  const seekerProfile = row.profiles as Record<string, unknown> | null;

  return NextResponse.json(rowToApplication({
    ...row,
    job_title:    jobData?.title ?? '',
    company:      companyData?.name ?? '',
    company_logo: companyData?.logo ?? '',
    seeker_name:  seekerProfile?.name ?? '',
    seeker_email: user.email ?? '',
  }), { status: 201 });
}
