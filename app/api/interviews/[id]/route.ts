import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';
import type { Interview, InterviewStatus } from '@/lib/types';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };
const validStatuses = new Set<InterviewStatus>(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']);
const validTypes = new Set<Interview['type']>(['Video', 'Phone', 'In-person']);

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can update interviews.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<Pick<Interview, 'date' | 'time' | 'type' | 'meetingLink' | 'notes' | 'status'>>;
  if (body.status !== undefined && !validStatuses.has(body.status)) {
    return NextResponse.json({ status: 'Choose a valid interview status.' }, { status: 400 });
  }
  if (body.type !== undefined && !validTypes.has(body.type)) {
    return NextResponse.json({ type: 'Choose a valid interview type.' }, { status: 400 });
  }

  const { id } = await context.params;
  const updated = await updateDatabase((database) => {
    const interview = database.interviews.find((item) => item.id === id);
    if (!interview) return null;
    Object.assign(interview, body);
    return interview;
  });

  if (!updated) return NextResponse.json({ detail: 'Interview not found.' }, { status: 404 });
  return NextResponse.json(updated);
}
