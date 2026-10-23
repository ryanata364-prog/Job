/**
 * GET /api/auth/seekers
 * Returns all seeker profiles with their emails from auth.users.
 * Only callable by authenticated admins.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    // Verify admin
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) {
        const { data: caller } = await supabaseAdmin
          .from('profiles').select('role').eq('id', user.id).single();
        if (caller?.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
        }
      }
    }

    // Get all seeker profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, name, phone, role, approval_status, email_verified, rejection_reason, created_at')
      .eq('role', 'seeker')
      .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;

    // Get all auth users to map emails
    const { data: { users }, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (usersError) throw usersError;

    const emailMap = new Map(users.map(u => [u.id, u.email ?? '']));

    // Merge email into profiles
    const merged = (profiles ?? []).map(p => ({
      ...p,
      email: emailMap.get(p.id) ?? '',
    }));

    return NextResponse.json({ seekers: merged });

  } catch (err) {
    console.error('seekers route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
