-- ═══════════════════════════════════════════════════════════════════
--  HireFlow – Seeker Approval System Migration
--  Paste into Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add approval columns to profiles
alter table public.profiles
  add column if not exists approval_status  text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approved_by      uuid references public.profiles(id) on delete set null,
  add column if not exists approved_at      timestamptz,
  add column if not exists rejection_reason text not null default '';

-- 2. Existing Active seekers → auto-approve so they aren't locked out
update public.profiles
set approval_status = 'approved',
    approved_at     = now()
where role = 'seeker' and status = 'Active';

-- 3. Admins and recruiters → mark approved (they use the status column, not approval_status)
update public.profiles
set approval_status = 'approved'
where role in ('admin', 'recruiter');

-- 4. RLS: only admin can update approval_status
--    (the existing profiles_update_own policy already covers admin via is_admin())
--    No extra policy needed — existing policy handles it.

-- 5. Index for fast pending queries
create index if not exists idx_profiles_approval
  on public.profiles(approval_status, role);

-- ═══════════════════════════════════════════════════════════════════
-- DONE — run this once then restart your Next.js dev server
-- ═══════════════════════════════════════════════════════════════════
