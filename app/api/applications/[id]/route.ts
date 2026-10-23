import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';
import type { AppStatus } from '@/lib/types';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };
const validStatuses = new Set<AppStatus>(['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Accepted', 'Rejected']);

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can update an application.' }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { status?: AppStatus };
  if (!body.status || !validStatuses.has(body.status)) return NextResponse.json({ status: 'Choose a valid status.' }, { status: 400 });
  const { id } = await context.params;
  const result = await updateDatabase((database) => {
    const application = database.applications.find((item) => item.id === id);
    if (!application) return null;
    application.status = body.status!;
    application.updatedAt = new Date().toISOString();
    return application;
  });
  if (!result) return NextResponse.json({ detail: 'Application not found.' }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  const { id } = await context.params;
  const deleted = await updateDatabase((database) => {
    const index = database.applications.findIndex((application) => application.id === id);
    if (index < 0) return false;
    const application = database.applications[index];
    if (user.role !== 'admin' && application.seekerId !== user.id) return false;
    database.applications.splice(index, 1);
    const job = database.jobs.find((item) => item.id === application.jobId);
    if (job) job.applications = Math.max(0, job.applications - 1);
    return true;
  });
  if (!deleted) return NextResponse.json({ detail: 'Application not found or cannot be removed.' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
