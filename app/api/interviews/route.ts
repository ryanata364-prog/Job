import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/server/supabaseServer';
import type { Interview, InterviewStatus } from '@/lib/types';

export const runtime = 'nodejs';

const validStatuses = new Set<InterviewStatus>(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']);
const validTypes = new Set<Interview['type']>(['Video', 'Phone', 'In-person']);

function rowToInterview(row: Record<string, unknown>): Interview {
  return {
    id:              String(row.id ?? ''),
    applicationId:   String(row.application_id ?? ''),
    candidateName:   String(row.candidate_name ?? ''),
    candidateAvatar: String(row.candidate_avatar ?? ''),
    jobTitle:        String(row.job_title ?? ''),
    date:            String(row.interview_date ?? ''),
    time:            String(row.interview_time ?? ''),
    type:            (row.type as Interview['type']) ?? 'Video',
    meetingLink:     String(row.meeting_link ?? ''),
    notes:           String(row.notes ?? ''),
    status:          (row.status as InterviewStatus) ?? 'Scheduled',
  };
}

export async function GET() {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  let query = supabase.from('interviews').select(`
    *,
    applications!inner(
      seeker_id,
      jobs!inner(recruiter_id)
    )
  `);

  // Seekers: only interviews where they're the applicant
  if (profile?.role === 'seeker') {
    query = query.eq('applications.seeker_id', user.id);
  }
  // Recruiters: only interviews for their jobs
  if (profile?.role === 'recruiter') {
    query = query.eq('applications.jobs.recruiter_id', user.id);
  }
  // Admins: all interviews (no extra filter)

  const { data, error } = await query.order('interview_date', { ascending: true });

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(r => rowToInterview(r as Record<string, unknown>)));
}

export async function POST(request: Request) {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'recruiter' && profile?.role !== 'admin') {
    return NextResponse.json({ detail: 'Only recruiters can schedule interviews.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    applicationId?: string; date?: string; time?: string;
    type?: string; meetingLink?: string; notes?: string; status?: string;
  };

  if (!body.applicationId || !body.date || !body.time || !body.type || !validTypes.has(body.type as Interview['type'])) {
    return NextResponse.json({ detail: 'Application, date, time, and interview type are required.' }, { status: 400 });
  }
  if (body.status && !validStatuses.has(body.status as InterviewStatus)) {
    return NextResponse.json({ status: 'Choose a valid interview status.' }, { status: 400 });
  }

  // Fetch application + seeker info for candidate fields
  const { data: appRow } = await supabase
    .from('applications')
    .select('id, seeker_id, profiles(name, avatar), jobs(title)')
    .eq('id', body.applicationId)
    .single();

  if (!appRow) {
    return NextResponse.json({ detail: 'Application not found.' }, { status: 404 });
  }

  const app = appRow as Record<string, unknown>;
  const seekerProfile = app.profiles as Record<string, unknown> | null;
  const jobData = app.jobs as Record<string, unknown> | null;

  const { data, error } = await supabase
    .from('interviews')
    .insert({
      application_id:   body.applicationId,
      candidate_name:   String(seekerProfile?.name ?? ''),
      candidate_avatar: String(seekerProfile?.avatar ?? ''),
      job_title:        String(jobData?.title ?? ''),
      interview_date:   body.date,
      interview_time:   body.time,
      type:             body.type,
      meeting_link:     body.meetingLink ?? '',
      notes:            body.notes ?? '',
      status:           body.status ?? 'Scheduled',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToInterview(data as Record<string, unknown>), { status: 201 });
}
