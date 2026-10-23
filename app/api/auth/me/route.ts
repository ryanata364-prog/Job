import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { toPublicUser, updateDatabase } from '@/lib/server/database';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  return NextResponse.json(toPublicUser(user));
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });

  const updates: Record<string, unknown> = {};
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    const formData = await request.formData();
    const resume = formData.get('resume');
    if (!(resume instanceof File)) return NextResponse.json({ resume: ['Choose a resume file to upload.'] }, { status: 400 });

    const extension = path.extname(resume.name).toLowerCase();
    if (!new Set(['.pdf', '.doc', '.docx']).has(extension)) {
      return NextResponse.json({ resume: ['Upload a PDF, DOC, or DOCX file.'] }, { status: 400 });
    }
    if (resume.size > 5 * 1024 * 1024) {
      return NextResponse.json({ resume: ['Resume files must be 5 MB or smaller.'] }, { status: 400 });
    }

    const fileName = `${randomUUID()}${extension}`;
    const directory = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, fileName), Buffer.from(await resume.arrayBuffer()), { flag: 'wx' });
    updates.resumeUrl = `/uploads/resumes/${fileName}`;
  } else {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const allowedFields = ['name', 'email', 'phone', 'location', 'title', 'about', 'skills', 'avatar'] as const;
    for (const field of allowedFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (typeof updates.name === 'string') updates.name = updates.name.trim();
    if (typeof updates.email === 'string') updates.email = updates.email.trim().toLowerCase();
    if (!updates.name && body.name !== undefined) return NextResponse.json({ name: 'Full name is required.' }, { status: 400 });
    if (updates.email && (typeof updates.email !== 'string' || !/^\S+@\S+\.\S+$/.test(updates.email))) {
      return NextResponse.json({ email: 'Enter a valid email address.' }, { status: 400 });
    }
    if (updates.skills && (!Array.isArray(updates.skills) || updates.skills.some((skill) => typeof skill !== 'string'))) {
      return NextResponse.json({ skills: 'Skills must be a list of text values.' }, { status: 400 });
    }
  }

  const result = await updateDatabase((database) => {
    if (typeof updates.email === 'string' && database.users.some((user) => user.id !== currentUser.id && user.email === updates.email)) {
      return { duplicate: true } as const;
    }
    const user = database.users.find((item) => item.id === currentUser.id)!;
    Object.assign(user, updates);
    return { user: toPublicUser(user) } as const;
  });

  if ('duplicate' in result) return NextResponse.json({ email: 'An account with this email already exists.' }, { status: 409 });
  return NextResponse.json(result.user);
}
