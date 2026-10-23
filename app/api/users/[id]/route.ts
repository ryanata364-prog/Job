import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { toPublicUser, updateDatabase } from '@/lib/server/database';
import type { User, UserStatus } from '@/lib/types';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };
const validStatuses = new Set<UserStatus>(['Pending', 'Active', 'Suspended']);

export async function PATCH(request: Request, context: Context) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ detail: 'Admin access is required.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<User>;
  if (body.status !== undefined && !validStatuses.has(body.status)) {
    return NextResponse.json({ status: 'Choose a valid account status.' }, { status: 400 });
  }

  const { id } = await context.params;
  const updated = await updateDatabase((database) => {
    const user = database.users.find((item) => item.id === id);
    if (!user) return null;
    if (body.status !== undefined) user.status = body.status;
    return toPublicUser(user);
  });

  if (!updated) return NextResponse.json({ detail: 'User not found.' }, { status: 404 });
  return NextResponse.json(updated);
}
