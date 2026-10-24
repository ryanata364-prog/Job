import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/server/supabaseServer';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import type { Job, JobStatus, JobType, WorkplaceType } from '@/lib/types';

export const runtime = 'nodejs';

function rowToJob(row: Record<string, unknown>): Job {
  return {
    id:               String(row.id ?? ''),
    companyId:        String(row.company_id ?? ''),
    company:          String(row.company ?? ''),
    companyLogo:      String(row.company_logo ?? ''),
    title:            String(row.title ?? ''),
    location:         String(row.location ?? ''),
    salary:           String(row.salary ?? ''),
    type:             (row.type as JobType) ?? 'Full-time',
    workplaceType:    (row.workplace_type as WorkplaceType) ?? 'On-site',
    experience:       String(row.experience ?? ''),
    category:         String(row.category ?? ''),
    description:      String(row.description ?? ''),
    responsibilities: Array.isArray(row.responsibilities) ? (row.responsibilities as string[]) : [],
    requirements:     Array.isArray(row.requirements)     ? (row.requirements as string[])     : [],
    qualifications:   Array.isArray(row.qualifications)   ? (row.qualifications as string[])   : [],
    benefits:         Array.isArray(row.benefits)         ? (row.benefits as string[])         : [],
    skills:           Array.isArray(row.skills)           ? (row.skills as string[])           : [],
    vacancies:        Number(row.vacancies ?? 1),
    deadline:         String(row.deadline ?? ''),
    postedAt:         String(row.posted_at ?? row.postedAt ?? ''),
    status:           (row.status as JobStatus) ?? 'Active',
    views:            Number(row.views ?? 0),
    applications:     Number(row.application_count ?? row.applications ?? 0),
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = (params.get('search') ?? params.get('title') ?? '').toLowerCase();
  const location = params.get('location') ?? '';
  const category = params.get('category') ?? '';
  const type = params.get('type') ?? '';
  const workplaceType = params.get('workplaceType') ?? params.get('workplace') ?? '';
  const companyId = params.get('companyId') ?? '';
  const statusFilter = params.get('status') ?? 'Active';

  // Use admin client for public job listing (bypasses RLS for anonymous visitors)
  let query = supabaseAdmin.from('jobs_with_company').select('*');

  if (statusFilter) query = query.eq('status', statusFilter);
  if (location)     query = query.ilike('location', `%${location}%`);
  if (category)     query = query.eq('category', category);
  if (type)         query = query.eq('type', type);
  if (workplaceType) query = query.eq('workplace_type', workplaceType);
  if (companyId)    query = query.eq('company_id', companyId);
  if (search)       query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);

  const { data, error } = await query.order('posted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(r => rowToJob(r as Record<string, unknown>)));
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
    return NextResponse.json({ detail: 'Only recruiters can post jobs.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<Job> & { companyId?: string };
  const title = body.title?.trim();
  const companyId = body.companyId;
  if (!title || !companyId) {
    return NextResponse.json({ detail: 'Title and company are required.' }, { status: 400 });
  }

  const { data: company } = await supabase
    .from('companies').select('id').eq('id', companyId).single();
  if (!company) {
    return NextResponse.json({ detail: 'Company not found.' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id:      companyId,
      recruiter_id:    user.id,
      title,
      location:        body.location?.trim() ?? '',
      salary:          body.salary?.trim() ?? 'Competitive',
      type:            body.type ?? 'Full-time',
      workplace_type:  body.workplaceType ?? 'Hybrid',
      experience:      body.experience?.trim() ?? '',
      category:        body.category?.trim() ?? 'General',
      description:     body.description?.trim() ?? '',
      responsibilities: body.responsibilities ?? [],
      requirements:    body.requirements ?? [],
      qualifications:  body.qualifications ?? [],
      benefits:        body.benefits ?? [],
      skills:          body.skills ?? [],
      vacancies:       body.vacancies ?? 1,
      deadline:        body.deadline || null,
      status:          body.status ?? 'Active',
    })
    .select(`*, companies(name, logo)`)
    .single();

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const row = data as Record<string, unknown>;
  const co = row.companies as Record<string, unknown> | null;
  return NextResponse.json(rowToJob({ ...row, company: co?.name ?? '', company_logo: co?.logo ?? '' }), { status: 201 });
}
