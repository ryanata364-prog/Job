import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { createId, readDatabase, updateDatabase } from '@/lib/server/database';
import type { Application } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });

  const jobId = request.nextUrl.searchParams.get('job');
  const database = await readDatabase();
  let applications = database.applications;
  if (user.role === 'seeker') applications = applications.filter((application) => application.seekerId === user.id);
  if (jobId) applications = applications.filter((application) => application.jobId === jobId);
  return NextResponse.json(applications.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)));
}

type ApplicationBody = {
  job?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Please sign in before applying.' }, { status: 401 });
  if (user.role !== 'seeker') return NextResponse.json({ detail: 'Only job seekers can apply to jobs.' }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as ApplicationBody;
  if (!body.job) return NextResponse.json({ job: 'Select a job to apply for.' }, { status: 400 });

  const result = await updateDatabase((database) => {
    const job = database.jobs.find((item) => item.id === body.job && item.status === 'Active');
    if (!job) return { error: 'not-found' } as const;
    if (database.applications.some((application) => application.jobId === job.id && application.seekerId === user.id)) {
      return { error: 'duplicate' } as const;
    }
    const now = new Date().toISOString();
    const application: Application = {
      id: createId('a'),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      seekerId: user.id,
      seekerName: user.name,
      seekerEmail: user.email,
      appliedAt: now,
      updatedAt: now,
      status: 'Applied',
      coverLetter: body.coverLetter?.trim() || '',
      portfolioUrl: body.portfolioUrl?.trim() || '',
      linkedinUrl: body.linkedinUrl?.trim() || '',
    };
    database.applications.push(application);
    job.applications += 1;
    return { application } as const;
  });

  if ('error' in result) {
    const message = result.error === 'duplicate' ? 'You have already applied for this job.' : 'The job is no longer available.';
    return NextResponse.json({ detail: message }, { status: result.error === 'duplicate' ? 409 : 404 });
  }
  return NextResponse.json(result.application, { status: 201 });
}
