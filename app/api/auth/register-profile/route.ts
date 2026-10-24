/**
 * POST /api/auth/register-profile
 * Creates the profile row after Supabase auth.signUp.
 * Uses service role if available, falls back to anon client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId, name, phone, role } =
      await req.json() as {
        userId?: string;
        name?: string;
        phone?: string;
        role?: string;
      };

    if (!userId || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Use service role if available, otherwise anon key
    const key    = serviceKey && serviceKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnNheWxvcnFrbmJlZ21oaWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg4MTgxNywiZXhwIjoyMTA3NDU3ODE3fQ.n4txNTA8XHX32M9jlOCf_03RBaOmMBIgFaTFxdaQWvk'
      ? serviceKey
      : anonKey;

    const client = createClient(supabaseUrl, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try upsert with all columns first
    const { error: fullError } = await client
      .from('profiles')
      .upsert({
        id:              userId,
        name:            name,
        phone:           phone ?? '',
        role:            role,
         approval_status: 'approved',
         email_verified:  false,
      });

    if (fullError) {
      // If approval_status column doesn't exist yet, try without it
      if (fullError.message.includes('approval_status') || fullError.message.includes('email_verified')) {
        const { error: fallbackError } = await client
          .from('profiles')
          .upsert({
            id:    userId,
            name:  name,
            phone: phone ?? '',
            role:  role,
          });

        if (fallbackError) {
          console.error('register-profile fallback error:', fallbackError);
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        // Try to update approval columns separately
         await client
           .from('profiles')
           .update({ approval_status: 'approved', email_verified: false })
           .eq('id', userId);

        return NextResponse.json({ success: true, fallback: true });
      }

      console.error('register-profile error:', fullError);
      return NextResponse.json({ error: fullError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('register-profile unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}


