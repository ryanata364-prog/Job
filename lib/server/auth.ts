import { cookies } from 'next/headers';
import { createId, readDatabase, updateDatabase, type StoredUser } from './database';

export const SESSION_COOKIE = 'hireflow_session';
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

export async function createSession(userId: string): Promise<string> {
  const token = createId('session');
  const expiresAt = new Date(Date.now() + sessionLifetimeSeconds * 1000).toISOString();

  await updateDatabase((database) => {
    database.sessions = database.sessions.filter((session) => new Date(session.expiresAt) > new Date());
    database.sessions.push({ token, userId, expiresAt });
  });

  return token;
}

export async function deleteSession(token?: string): Promise<void> {
  if (!token) return;
  await updateDatabase((database) => {
    database.sessions = database.sessions.filter((session) => session.token !== token);
  });
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const database = await readDatabase();
  const session = database.sessions.find((item) => item.token === token);
  if (!session || new Date(session.expiresAt) <= new Date()) return null;
  return database.users.find((user) => user.id === session.userId) ?? null;
}

export function sessionCookie(token: string, request: Request) {
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const isHttps = forwardedProtocol === 'https' || request.url.startsWith('https://');
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    // `secure` cookies are required over HTTPS in production, but would never
    // be sent by a browser to the local HTTP demo server.
    secure: isHttps,
    path: '/',
    maxAge: sessionLifetimeSeconds,
  };
}
