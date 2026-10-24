import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/server/supabaseServer';
import type { User } from '@/lib/types';

export const runtime = 'nodejs';

function profileToUser(profile: Record<string, unknown>, email: string): User {
  return {
    id:              String(profile.id ?? ''),
    name:            String(profile.name ?? ''),
    email,
    phone:           String(profile.phone ?? ''),
    role:            (profile.role as User['role']) ?? 'seeker',
    status:          (profile.status as User['status']) ?? 'Active',
    approvalStatus:  (profile.approval_status as User['approvalStatus']) ?? 'approved',
    rejectionReason: String(profile.rejection_reason ?? ''),
    avatar:          String(profile.avatar ?? ''),
    location:        String(profile.location ?? ''),
    title:           String(profile.title ?? ''),
    about:           String(profile.about ?? ''),
    skills:          Array.isArray(profile.skills) ? (profile.skills as string[]) : [],
    registeredAt:    String(profile.created_at ?? ''),
  };
}

export async function GET() {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ detail: 'Profile not found.' }, { status: 404 });
  }

  return NextResponse.json(profileToUser(profile as Record<string, unknown>, user.email ?? ''));
}

export async function PATCH(request: Request) {
  const supabase = await createRouteClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ detail: 'Authentication required.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const allowedFields = ['name', 'phone', 'location', 'title', 'about', 'skills', 'avatar'] as const;
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (typeof updates.name === 'string') updates.name = updates.name.trim();
  if (!updates.name && body.name !== undefined) {
    return NextResponse.json({ name: 'Full name is required.' }, { status: 400 });
  }
  if (updates.skills && (!Array.isArray(updates.skills) || updates.skills.some(s => typeof s !== 'string'))) {
    return NextResponse.json({ skills: 'Skills must be a list of text values.' }, { status: 400 });
  }

  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (updateError || !profile) {
    return NextResponse.json({ detail: updateError?.message ?? 'Failed to update profile.' }, { status: 500 });
  }

  return NextResponse.json(profileToUser(profile as Record<string, unknown>, user.email ?? ''));
}
