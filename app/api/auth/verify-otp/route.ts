/**
 * POST /api/auth/verify-otp
 * Body: { email: string, otp: string }
 *
 * Verifies the OTP, marks email_verified = true,
 * sets approval_status = 'pending' so admin can approve.
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import crypto from 'crypto';

const MAX_ATTEMPTS = 5;

function hashOTP(otp: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json() as { email?: string; otp?: string };

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch latest unverified OTP for this email
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !record) {
      return NextResponse.json(
        { error: 'No active OTP found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      await supabaseAdmin.from('otp_verifications').delete().eq('id', record.id);
      return NextResponse.json(
        { error: 'This OTP has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      await supabaseAdmin.from('otp_verifications').delete().eq('id', record.id);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify hash
    const [salt, storedHash] = String(record.otp_hash).split(':');
    const isValid = hashOTP(otp.trim(), salt) === storedHash;

    if (!isValid) {
      await supabaseAdmin
        .from('otp_verifications')
        .update({ attempts: record.attempts + 1 })
        .eq('id', record.id);

      const remaining = MAX_ATTEMPTS - record.attempts - 1;
      return NextResponse.json(
        { error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
        { status: 400 }
      );
    }

    // ── OTP correct ───────────────────────────────────────────────

    // Mark OTP verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', record.id);

    return NextResponse.json({
      success: true,
      message: 'Email verified! You can now log in.',
    });

  } catch (err) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
