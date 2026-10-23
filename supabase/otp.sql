-- ═══════════════════════════════════════════════════════════════════
--  OTP Verifications Table
--  Paste into Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.otp_verifications (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  otp_hash     text not null,          -- bcrypt hash of the 6-digit code
  expires_at   timestamptz not null,   -- 10 minutes from creation
  attempts     integer not null default 0,
  verified     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Only keep the latest OTP per email (clean up old ones)
create index if not exists idx_otp_email on public.otp_verifications(email);
create index if not exists idx_otp_expires on public.otp_verifications(expires_at);

-- Allow service role full access (API routes use service role)
-- Anon/authenticated users cannot read OTPs directly
alter table public.otp_verifications enable row level security;

create policy "otp_no_public_access"
  on public.otp_verifications
  for all
  to authenticated, anon
  using (false);

-- Add email_verified column to profiles if not exists
alter table public.profiles
  add column if not exists email_verified boolean not null default false;

-- Auto-verify existing users so they aren't locked out
update public.profiles set email_verified = true where true;

-- Reload schema cache
notify pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════
