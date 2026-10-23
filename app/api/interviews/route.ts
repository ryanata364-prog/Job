import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { createId, readDatabase, updateDatabase } from '@/lib/server/database';
import type { Interview, InterviewStatus } from '@/lib/types';

export const runtime = 'nodejs';

const validStatuses = new Set<InterviewStatus>(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']);
const validTypes = new Set<Interview['type']>(['Video', 'Phone', 'In-person']);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });

  const database = await readDatabase();
  const applications = user.role === 'seeker'
    ? new Set(database.applications.filter((application) => application.seekerId === user.id).map((application) => application.id))
    : null;
  const interviews = database.interviews.filter((interview) => !applications || applications.has(interview.applicationId));
  return NextResponse.json(interviews);
}

type InterviewInput = Omit<Interview, 'id' | 'candidateName' | 'candidateAvatar' | 'jobTitle'>;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can schedule interviews.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<InterviewInput>;
  if (!body.applicationId || !body.date || !body.time || !body.type || !validTypes.has(body.type)) {
    return NextResponse.json({ detail: 'Application, date, time, and interview type are required.' }, { status: 400 });
  }
  if (body.status !== undefined && !validStatuses.has(body.status)) {
    return NextResponse.json({ status: 'Choose a valid interview status.' }, { status: 400 });
  }

  const created = await updateDatabase((database) => {
    const application = database.applications.find((item) => item.id === body.applicationId);
    if (!application) return null;
    const candidate = database.users.find((item) => item.id === application.seekerId);
    const interview: Interview = {
      id: createId('i'),
      applicationId: application.id,
      candidateName: application.seekerName,
      candidateAvatar: candidate?.avatar ?? '',
      jobTitle: application.jobTitle,
      date: body.date!,
      time: body.time!,
      type: body.type!,
      meetingLink: body.meetingLink ?? '',
      notes: body.notes ?? '',
      status: body.status ?? 'Scheduled',
    };
    database.interviews.push(interview);
    return interview;
  });

  if (!created) return NextResponse.json({ detail: 'Application not found.' }, { status: 404 });
  return NextResponse.json(created, { status: 201 });
}
