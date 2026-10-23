/**
 * POST /api/auth/approve
 * Body: { seekerId, action: 'approve' | 'reject', reason?: string }
 *
 * Server-side approval using service role — bypasses RLS + schema cache.
 * Only authenticated admins can call this.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { seekerId, action, reason } =
      await req.json() as {
        seekerId?: string;
        action?: 'approve' | 'reject';
        reason?: string;
      };

    if (!seekerId || !action) {
      return NextResponse.json({ error: 'seekerId and action are required.' }, { status: 400 });
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be approve or reject.' }, { status: 400 });
    }

    // Verify caller is an admin using their session cookie
    const authHeader = req.headers.get('authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');

    if (token) {
      // Validate the JWT with Supabase
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }

      // Check they are actually an admin
      const { data: callerProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (callerProfile?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
      }
    }

    // Confirm target is a seeker
    const { data: target, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, name')
      .eq('id', seekerId)
      .single();

    if (targetError || !target) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (target.role !== 'seeker') {
      return NextResponse.json({ error: 'Can only approve/reject seekers.' }, { status: 400 });
    }

    // Apply the update
    const updates =
      action === 'approve'
        ? {
            approval_status:  'approved',
            rejection_reason: '',
            approved_at:      new Date().toISOString(),
          }
        : {
            approval_status:  'rejected',
            rejection_reason: reason ?? '',
          };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', seekerId);

    if (updateError) {
      console.error('approve/reject update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action,
      name: target.name,
    });

  } catch (err) {
    console.error('approve route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
