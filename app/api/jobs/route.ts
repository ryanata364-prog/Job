import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { createId, readDatabase, updateDatabase } from '@/lib/server/database';
import type { Job, JobStatus, JobType, WorkplaceType } from '@/lib/types';

export const runtime = 'nodejs';

function filterJobs(jobs: Job[], searchParams: URLSearchParams): Job[] {
  const title = (searchParams.get('title') ?? searchParams.get('search') ?? '').toLowerCase();
  const location = (searchParams.get('location') ?? '').toLowerCase();
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const workplaceType = searchParams.get('workplaceType') ?? searchParams.get('workplace');
  const companyId = searchParams.get('companyId');
  const status = searchParams.get('status');

  return jobs.filter((job) => {
    const titleMatches = !title || [job.title, job.company, ...job.skills].some((value) => value.toLowerCase().includes(title));
    return titleMatches
      && (!location || job.location.toLowerCase().includes(location))
      && (!category || job.category === category)
      && (!type || job.type === type)
      && (!workplaceType || job.workplaceType === workplaceType)
      && (!companyId || job.companyId === companyId)
      && (!status || job.status === status);
  });
}

export async function GET(request: NextRequest) {
  const database = await readDatabase();
  const requestedStatus = request.nextUrl.searchParams.get('status');
  const jobs = filterJobs(database.jobs, request.nextUrl.searchParams)
    .filter((job) => requestedStatus || job.status === 'Active')
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  return NextResponse.json(jobs);
}

type JobInput = Partial<Job> & { companyId?: string };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can post jobs.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as JobInput;
  const title = body.title?.trim();
  const companyId = body.companyId;
  if (!title || !companyId) return NextResponse.json({ detail: 'Title and company are required.' }, { status: 400 });

  const result = await updateDatabase((database) => {
    const company = database.companies.find((item) => item.id === companyId);
    if (!company) return null;
    const job: Job = {
      id: createId('j'),
      title,
      companyId,
      company: company.name,
      companyLogo: company.logo,
      location: body.location?.trim() || company.location,
      salary: body.salary?.trim() || 'Competitive',
      type: (body.type ?? 'Full-time') as JobType,
      workplaceType: (body.workplaceType ?? 'Hybrid') as WorkplaceType,
      experience: body.experience?.trim() || 'Not specified',
      category: body.category?.trim() || 'General',
      description: body.description?.trim() || '',
      responsibilities: body.responsibilities ?? [],
      requirements: body.requirements ?? [],
      qualifications: body.qualifications ?? [],
      benefits: body.benefits ?? [],
      skills: body.skills ?? [],
      vacancies: body.vacancies ?? 1,
      deadline: body.deadline || '',
      postedAt: new Date().toISOString().slice(0, 10),
      status: (body.status ?? 'Active') as JobStatus,
      views: 0,
      applications: 0,
    };
    database.jobs.push(job);
    return job;
  });

  if (!result) return NextResponse.json({ detail: 'Company not found.' }, { status: 404 });
  return NextResponse.json(result, { status: 201 });
}
