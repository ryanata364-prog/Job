
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  return String(crypto.randomInt(100000, 1000000));
}

function hashOTP(otp: string, salt: string): string {
  return crypto
    .createHmac('sha256', salt)
    .update(otp)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Read and validate SMTP configuration.
    const smtpHost =
      process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';

    const smtpPort = Number(process.env.SMTP_PORT || 587);

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.replace(/\s/g, '');
    const fromEmail =
      process.env.FROM_EMAIL?.trim() || smtpUser;

    if (!smtpUser || !smtpPass || !fromEmail) {
      console.error(
        'SMTP configuration missing:',
        JSON.stringify({
          SMTP_HOST: Boolean(smtpHost),
          SMTP_PORT: Number.isFinite(smtpPort),
          SMTP_USER: Boolean(smtpUser),
          SMTP_PASS: Boolean(smtpPass),
          FROM_EMAIL: Boolean(fromEmail),
        })
      );

      return NextResponse.json(
        {
          error:
            'Email service is not configured. Please contact the administrator.',
        },
        { status: 500 }
      );
    }

    if (
      !Number.isInteger(smtpPort) ||
      smtpPort < 1 ||
      smtpPort > 65535
    ) {
      return NextResponse.json(
        { error: 'Invalid SMTP port configuration.' },
        { status: 500 }
      );
    }

    // 2. Create the transporter only after validating credentials.
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // 3. Validate the requested email address.
    const body = (await req.json()) as { email?: string };
    const email = body.email;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 4. Enforce the existing rate limit.
    const tenMinutesAgo = new Date(
      Date.now() - 10 * 60 * 1000
    ).toISOString();

    const { count, error: countError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', tenMinutesAgo);

    if (countError) {
      console.error('OTP rate-limit query failed:', countError);

      return NextResponse.json(
        { error: 'Unable to process OTP request. Please try again.' },
        { status: 500 }
      );
    }

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error:
            'Too many OTP requests. Please wait 10 minutes.',
        },
        { status: 429 }
      );
    }

    // 5. Generate a secure OTP and store only its salted hash.
    const otp = generateOTP();
    const salt = crypto.randomBytes(16).toString('hex');
    const storedHash = `${salt}:${hashOTP(otp, salt)}`;

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    // Remove older unverified OTPs for this email.
    const { error: deleteError } = await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('email', normalizedEmail)
      .eq('verified', false);

    if (deleteError) {
      console.error('OTP cleanup failed:', deleteError);

      return NextResponse.json(
        { error: 'Unable to generate OTP. Please try again.' },
        { status: 500 }
      );
    }

    const { data: insertedOTP, error: insertError } =
      await supabaseAdmin
        .from('otp_verifications')
        .insert({
          email: normalizedEmail,
          otp_hash: storedHash,
          expires_at: expiresAt,
          attempts: 0,
          verified: false,
        })
        .select('id')
        .single();

    if (insertError) {
      console.error('OTP insert error:', insertError);

      return NextResponse.json(
        { error: 'Failed to generate OTP.' },
        { status: 500 }
      );
    }

    // 6. Send the OTP to the user's actual email address.
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: normalizedEmail,
        subject: 'Your Verification Code',
        text: `Your verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
            <h2 style="color:#111827;">Verify your email</h2>
            <p style="color:#6b7280;">Enter this 6-digit verification code:</p>
            <div style="text-align:center;margin:24px 0;">
              <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#1d4ed8;">${otp}</span>
            </div>
            <p style="color:#9ca3af;font-size:12px;">
              This code expires in ${OTP_EXPIRY_MINUTES} minutes.
              Do not share it with anyone.
            </p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('OTP email delivery failed:', mailError);

      // Remove the unusable OTP if email delivery fails.
      const { error: cleanupError } = await supabaseAdmin
        .from('otp_verifications')
        .delete()
        .eq('id', insertedOTP.id);

      if (cleanupError) {
        console.error('Failed to clean up unsent OTP:', cleanupError);
      }

      return NextResponse.json(
        {
          error:
            'Unable to send the verification email. Check the email service configuration and try again.',
        },
        { status: 502 }
      );
    }

    // 7. Confirm that the email was accepted by the SMTP server.
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${normalizedEmail}`,
    });
  } catch (err) {
    console.error('send-otp error:', err);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
