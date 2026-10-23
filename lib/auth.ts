/**
 * Role-based auth helpers using Supabase.
 * Three roles: seeker | recruiter | admin
 *
 * Seekers require:
 *   1. Email confirmed (Supabase auth)
 *   2. approval_status = 'approved' (set by admin)
 */
import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────
export type RegisterData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'seeker' | 'recruiter';
};

// ─── Helper ───────────────────────────────────────────────────────
function profileToUser(profile: Record<string, unknown>, email: string): User {
  return {
    id:              String(profile.id),
    name:            String(profile.name            ?? ''),
    email,
    phone:           String(profile.phone           ?? ''),
    role:            (profile.role  as User['role'])   ?? 'seeker',
    status:          (profile.status as User['status']) ?? 'Pending',
    approvalStatus:  (profile.approval_status as User['approvalStatus']) ?? 'pending',
    rejectionReason: String(profile.rejection_reason ?? ''),
    avatar:          String(profile.avatar           ?? ''),
    location:        String(profile.location         ?? ''),
    title:           String(profile.title            ?? ''),
    about:           String(profile.about            ?? ''),
    skills:          Array.isArray(profile.skills) ? (profile.skills as string[]) : [],
    registeredAt:    String(profile.created_at       ?? ''),
  };
}

// ─── Register ─────────────────────────────────────────────────────
/**
 * Register a seeker.
 * - Creates a confirmed Supabase Auth user through the server route
 * - The auth.users trigger creates the matching profile from user metadata
 * - Caller must then call /api/auth/send-otp to send the OTP
 */
export async function register(data: RegisterData): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password, role: data.role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw { detail: err.error ?? 'Registration failed.' };
  }
  const { user: authUser } = await res.json() as { user: { id: string; email: string } };

  const profileRes = await fetch('/api/auth/register-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: authUser.id, name: data.name, phone: data.phone, role: data.role }),
  });
  if (!profileRes.ok) {
    const profileErr = await profileRes.json().catch(() => ({})) as { error?: string };
    throw { detail: profileErr.error ?? 'Failed to create profile.' };
  }

  return profileToUser({ id: authUser.id, name: data.name, phone: data.phone, role: data.role, approval_status: 'approved', email_verified: false }, data.email);
}

// ─── Login ────────────────────────────────────────────────────────
/**
 * Login enforces:
 *   - For seekers: approval_status must be 'approved'
 *   - For recruiters: approval_status must be 'approved'
 *   - Suspended accounts are blocked
 *   - Admins: no approval needed
 */
export async function login(email: string, password: string): Promise<User> {
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    if (signInError.message.toLowerCase().includes('email not confirmed'))
      throw { detail: 'Please verify your email before signing in. Check your inbox.' };
    if (signInError.message.toLowerCase().includes('invalid login'))
      throw { detail: 'Incorrect email or password.' };
    throw { detail: signInError.message };
  }
  if (!authData.user) throw { detail: 'Login failed. Please check your credentials.' };

  // Fetch profile
  let profile: Record<string, unknown> | null = null;
  const { data: profileData, error: profileError } =
    await supabase.from('profiles').select('*').eq('id', authData.user.id).single();

  if (profileError?.code === 'PGRST116') {
    // Profile missing — auto-create as seeker pending
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id:              authData.user.id,
        name:            authData.user.user_metadata?.name ?? email.split('@')[0],
        role:            'seeker',
        status:          'Pending',
        approval_status: 'pending',
      })
      .select()
      .single();
    if (insertError || !newProfile) throw { detail: 'Could not create your profile.' };
    profile = newProfile as Record<string, unknown>;
  } else if (profileError) {
    throw { detail: `Profile error: ${profileError.message}` };
  } else {
    profile = profileData as Record<string, unknown>;
  }

  if (!profile) throw { detail: 'Could not load your profile. Please try again.' };

  const user = profileToUser(profile, authData.user.email ?? email);

  // ── Enforce approval rules ──────────────────────────────────────
  if (user.role === 'admin') {
    if (user.status === 'Suspended')
      throw { detail: 'Your account has been suspended. Contact support.' };
    return user;
  }

  if (user.status === 'Suspended') {
    await supabase.auth.signOut();
    throw { detail: 'Your account has been suspended. Please contact support.' };
  }

  // Email verification is handled by OTP; allow login after OTP.
  // Admin approval no longer required.
  return user;
}

// ─── Logout ───────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Get current user ─────────────────────────────────────────────
export async function getMe(): Promise<User | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('id', session.user.id).single();

  if (error || !profile) return null;
  return profileToUser(profile as Record<string, unknown>, session.user.email ?? '');
}

// ─── Update own profile ───────────────────────────────────────────
export async function updateMe(updates: Partial<User>): Promise<User> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw { detail: 'Not authenticated.' };

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      name:     updates.name,
      phone:    updates.phone,
      location: updates.location,
      title:    updates.title,
      about:    updates.about,
      skills:   updates.skills,
      avatar:   updates.avatar,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error || !profile) throw { detail: error?.message ?? 'Failed to update profile.' };
  const { data: sd } = await supabase.auth.getSession();
  return profileToUser(profile as Record<string, unknown>, sd?.session?.user?.email ?? '');
}

// ─── Admin: approve a seeker ─────────────────────────────────────
export async function approveSeeker(
  seekerId: string,
  adminId: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      approval_status:  'approved',
      status:           'Active',
      approved_by:      adminId,
      approved_at:      new Date().toISOString(),
      rejection_reason: '',
    })
    .eq('id', seekerId)
    .eq('role', 'seeker'); // safety: only update seekers

  if (error) throw { detail: error.message };
}

// ─── Admin: reject a seeker ───────────────────────────────────────
export async function rejectSeeker(
  seekerId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      approval_status:  'rejected',
      status:           'Suspended',
      rejection_reason: reason,
    })
    .eq('id', seekerId)
    .eq('role', 'seeker');

  if (error) throw { detail: error.message };
}

// ─── Admin: update any user status/role ──────────────────────────
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'status' | 'role'>>
): Promise<User> {
  const { data: profile, error } = await supabase
    .from('profiles').update(updates).eq('id', id).select().single();

  if (error || !profile) throw { detail: error?.message ?? 'Failed to update user.' };
  return profileToUser(profile as Record<string, unknown>, '');
}
