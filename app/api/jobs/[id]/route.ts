import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';
import type { Job } from '@/lib/types';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  const result = await updateDatabase((database) => {
    const job = database.jobs.find((item) => item.id === id);
    if (job) job.views += 1;
    return job ?? null;
  });
  if (!result) return NextResponse.json({ detail: 'Job not found.' }, { status: 404 });
  return NextResponse.json(result);
}

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can edit jobs.' }, { status: 403 });
  }
  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Partial<Job>;
  const immutableFields = new Set(['id', 'companyId', 'company', 'companyLogo', 'views', 'applications']);
  const result = await updateDatabase((database) => {
    const job = database.jobs.find((item) => item.id === id);
    if (!job) return null;
    for (const [key, value] of Object.entries(body)) {
      if (!immutableFields.has(key) && value !== undefined) {
        (job as unknown as Record<string, unknown>)[key] = value;
      }
    }
    return job;
  });
  if (!result) return NextResponse.json({ detail: 'Job not found.' }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can remove jobs.' }, { status: 403 });
  }
  const { id } = await context.params;
  const removed = await updateDatabase((database) => {
    const index = database.jobs.findIndex((job) => job.id === id);
    if (index < 0) return false;
    database.jobs.splice(index, 1);
    database.applications = database.applications.filter((application) => application.jobId !== id);
    return true;
  });
  if (!removed) return NextResponse.json({ detail: 'Job not found.' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
