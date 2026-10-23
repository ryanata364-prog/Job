import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { readDatabase, toPublicUser } from '@/lib/server/database';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ detail: 'Admin access is required.' }, { status: 403 });
  }

  const role = request.nextUrl.searchParams.get('role') as User['role'] | null;
  const database = await readDatabase();
  const users = database.users
    .filter((user) => !role || user.role === role)
    .map(toPublicUser);
  return NextResponse.json(users);
}
