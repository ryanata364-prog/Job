import { NextResponse } from 'next/server';
import { createSession, sessionCookie } from '@/lib/server/auth';
import { readDatabase, toPublicUser } from '@/lib/server/database';
import { verifyPassword } from '@/lib/server/passwords';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !body.password) {
    return NextResponse.json({ detail: 'Email and password are required.' }, { status: 400 });
  }

  const database = await readDatabase();
  const user = database.users.find((item) => item.email.toLowerCase() === email);
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ detail: 'Incorrect email or password.' }, { status: 401 });
  }
  if (user.status === 'Suspended') {
    return NextResponse.json({ detail: 'This account has been suspended.' }, { status: 403 });
  }

  const token = await createSession(user.id);
  const response = NextResponse.json(toPublicUser(user));
  response.cookies.set(sessionCookie(token, request));
  return response;
}
