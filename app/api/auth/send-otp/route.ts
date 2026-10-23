import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabase-server';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});
const FROM_EMAIL = process.env.FROM_EMAIL ?? process.env.SMTP_USER!;
const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  return String(crypto.randomInt(100000, 999999));
}

function hashOTP(otp: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'Too many OTP requests. Please wait 10 minutes.' }, { status: 429 });
    }

    await supabaseAdmin.from('otp_verifications').delete().eq('email', normalizedEmail).eq('verified', false);

    const otp = generateOTP();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashOTP(otp, salt);
    const storedHash = `${salt}:${hash}`;
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin.from('otp_verifications').insert({
      email: normalizedEmail, otp_hash: storedHash, expires_at: expiresAt, attempts: 0, verified: false,
    });
    if (insertError) {
      console.error('OTP insert error:', insertError);
      return NextResponse.json({ error: 'Failed to generate OTP.' }, { status: 500 });
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: normalizedEmail,
      subject: 'Your Verification Code',
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;"><h2 style="color:#111827;">Verify your email</h2><p style="color:#6b7280;">Enter this 6-digit code:</p><div style="text-align:center;margin:24px 0;"><span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">${otp}</span></div><p style="color:#9ca3af;font-size:12px;">Expires in ${OTP_EXPIRY_MINUTES} minutes.</p></div>`,
    });

    return NextResponse.json({ success: true, message: `OTP sent to ${normalizedEmail}` });
  } catch (err) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
