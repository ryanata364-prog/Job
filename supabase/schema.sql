-- ═══════════════════════════════════════════════════════════════════
--  HireFlow – Job Recruitment System
--  Supabase SQL Schema  (fully idempotent — safe to re-run)
--  Paste into Supabase → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. Extensions
-- ─────────────────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- 2. Helper: auto-update updated_at
-- ─────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 3. PROFILES
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text not null default '',
  role        text not null default 'seeker'
                check (role in ('seeker','recruiter','admin')),
  status      text not null default 'Active'
                check (status in ('Pending','Active','Suspended')),
  avatar      text not null default '',
  location    text not null default '',
  title       text not null default '',
  about       text not null default '',
  skills      text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Add columns that may be missing from earlier partial runs
alter table public.profiles add column if not exists name        text not null default '';
alter table public.profiles add column if not exists phone       text not null default '';
alter table public.profiles add column if not exists role        text not null default 'seeker';
alter table public.profiles add column if not exists status      text not null default 'Active';
alter table public.profiles add column if not exists avatar      text not null default '';
alter table public.profiles add column if not exists location    text not null default '';
alter table public.profiles add column if not exists title       text not null default '';
alter table public.profiles add column if not exists about       text not null default '';
alter table public.profiles add column if not exists skills      text[] not null default '{}';
alter table public.profiles add column if not exists created_at  timestamptz not null default now();
alter table public.profiles add column if not exists updated_at  timestamptz not null default now();
alter table public.profiles add column if not exists approval_status text not null default 'approved';
alter table public.profiles add column if not exists rejection_reason text not null default '';
alter table public.profiles add column if not exists email_verified boolean not null default false;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, role, avatar, approval_status, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case new.raw_user_meta_data->>'role'
      when 'recruiter' then 'recruiter'
      else 'seeker'
    end,
    coalesce(new.raw_user_meta_data->>'avatar', ''),
    'approved',
    'Active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 4. COMPANIES
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo        text not null default '🏢',
  industry    text not null default '',
  location    text not null default '',
  size        text not null default '',
  website     text not null default '',
  description text not null default '',
  benefits    text[] not null default '{}',
  founded     text not null default '',
  owner_id    uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_companies_updated on public.companies;
create trigger trg_companies_updated
  before update on public.companies
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 5. JOBS
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.jobs (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies(id) on delete cascade,
  recruiter_id     uuid references public.profiles(id) on delete set null,
  title            text not null,
  location         text not null default '',
  salary           text not null default '',
  type             text not null default 'Full-time'
                     check (type in ('Full-time','Part-time','Contract','Internship','Freelance')),
  workplace_type   text not null default 'On-site'
                     check (workplace_type in ('On-site','Remote','Hybrid')),
  experience       text not null default '',
  category         text not null default '',
  description      text not null default '',
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  qualifications   text[] not null default '{}',
  benefits         text[] not null default '{}',
  skills           text[] not null default '{}',
  vacancies        integer not null default 1,
  deadline         date,
  status           text not null default 'Draft'
                     check (status in ('Draft','Active','Paused','Closed')),
  views            integer not null default 0,
  posted_at        timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_jobs_company   on public.jobs(company_id);
create index if not exists idx_jobs_status    on public.jobs(status);
create index if not exists idx_jobs_category  on public.jobs(category);
create index if not exists idx_jobs_type      on public.jobs(type);
create index if not exists idx_jobs_workplace on public.jobs(workplace_type);

drop trigger if exists trg_jobs_updated on public.jobs;
create trigger trg_jobs_updated
  before update on public.jobs
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 6. APPLICATIONS
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  seeker_id     uuid not null references public.profiles(id) on delete cascade,
  status        text not null default 'Applied'
                  check (status in ('Applied','Under Review','Shortlisted','Interview','Accepted','Rejected')),
  cover_letter  text not null default '',
  portfolio_url text not null default '',
  linkedin_url  text not null default '',
  applied_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(job_id, seeker_id)
);

create index if not exists idx_applications_job    on public.applications(job_id);
create index if not exists idx_applications_seeker on public.applications(seeker_id);
create index if not exists idx_applications_status on public.applications(status);

drop trigger if exists trg_applications_updated on public.applications;
create trigger trg_applications_updated
  before update on public.applications
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 7. INTERVIEWS
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.interviews (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid not null references public.applications(id) on delete cascade,
  candidate_name   text not null default '',
  candidate_avatar text not null default '',
  job_title        text not null default '',
  interview_date   date not null,
  interview_time   text not null default '',
  type             text not null default 'Video'
                     check (type in ('Video','Phone','In-person')),
  meeting_link     text not null default '',
  notes            text not null default '',
  status           text not null default 'Scheduled'
                     check (status in ('Scheduled','Completed','Cancelled','Rescheduled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_interviews_application on public.interviews(application_id);
create index if not exists idx_interviews_status      on public.interviews(status);
create index if not exists idx_interviews_date        on public.interviews(interview_date);

drop trigger if exists trg_interviews_updated on public.interviews;
create trigger trg_interviews_updated
  before update on public.interviews
  for each row execute function set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 8. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  message    text not null default '',
  type       text not null default 'system'
               check (type in ('application','interview','job','system')),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- Add columns that may be missing from earlier partial runs
alter table public.notifications add column if not exists read boolean not null default false;

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read  on public.notifications(read);

-- ═══════════════════════════════════════════════════════════════════
-- 9. MESSAGES
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Add columns that may be missing from earlier partial runs
alter table public.messages add column if not exists read boolean not null default false;

create index if not exists idx_messages_sender   on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_read     on public.messages(read);

-- ═══════════════════════════════════════════════════════════════════
-- 10. SAVED JOBS
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.saved_jobs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, job_id)
);

create index if not exists idx_saved_jobs_user on public.saved_jobs(user_id);
create index if not exists idx_saved_jobs_job  on public.saved_jobs(job_id);

-- ═══════════════════════════════════════════════════════════════════
-- 11. RLS HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_recruiter()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'recruiter');
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 12. ROW LEVEL SECURITY  (drop-then-create = idempotent)
-- ═══════════════════════════════════════════════════════════════════

-- ── PROFILES ──
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_all"  on public.profiles;
drop policy if exists "profiles_update_own"  on public.profiles;
drop policy if exists "profiles_delete_own"  on public.profiles;
create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id or public.is_admin());
create policy "profiles_delete_own" on public.profiles for delete to authenticated using (auth.uid() = id or public.is_admin());

-- ── COMPANIES ──
alter table public.companies enable row level security;
drop policy if exists "companies_select_all"       on public.companies;
drop policy if exists "companies_insert_recruiter" on public.companies;
drop policy if exists "companies_update_owner"     on public.companies;
drop policy if exists "companies_delete_owner"     on public.companies;
create policy "companies_select_all"       on public.companies for select to authenticated using (true);
create policy "companies_insert_recruiter" on public.companies for insert to authenticated with check (public.is_recruiter() or public.is_admin());
create policy "companies_update_owner"     on public.companies for update to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "companies_delete_owner"     on public.companies for delete to authenticated using (owner_id = auth.uid() or public.is_admin());

-- ── JOBS ──
alter table public.jobs enable row level security;
drop policy if exists "jobs_select_all"       on public.jobs;
drop policy if exists "jobs_insert_recruiter" on public.jobs;
drop policy if exists "jobs_update_recruiter" on public.jobs;
drop policy if exists "jobs_delete_recruiter" on public.jobs;
create policy "jobs_select_all"       on public.jobs for select to authenticated using (true);
create policy "jobs_insert_recruiter" on public.jobs for insert to authenticated with check (public.is_recruiter() or public.is_admin());
create policy "jobs_update_recruiter" on public.jobs for update to authenticated using (recruiter_id = auth.uid() or public.is_admin());
create policy "jobs_delete_recruiter" on public.jobs for delete to authenticated using (recruiter_id = auth.uid() or public.is_admin());

-- ── APPLICATIONS ──
alter table public.applications enable row level security;
drop policy if exists "applications_select_own"                  on public.applications;
drop policy if exists "applications_insert_seeker"               on public.applications;
drop policy if exists "applications_update_seeker_or_recruiter"  on public.applications;
drop policy if exists "applications_delete_own"                  on public.applications;
create policy "applications_select_own" on public.applications for select to authenticated using (
  seeker_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.jobs j where j.id = applications.job_id and j.recruiter_id = auth.uid())
);
create policy "applications_insert_seeker" on public.applications for insert to authenticated with check (seeker_id = auth.uid());
create policy "applications_update_seeker_or_recruiter" on public.applications for update to authenticated using (
  seeker_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.jobs j where j.id = applications.job_id and j.recruiter_id = auth.uid())
);
create policy "applications_delete_own" on public.applications for delete to authenticated using (seeker_id = auth.uid() or public.is_admin());

-- ── INTERVIEWS ──
alter table public.interviews enable row level security;
drop policy if exists "interviews_select_related"   on public.interviews;
drop policy if exists "interviews_insert_recruiter" on public.interviews;
drop policy if exists "interviews_update_recruiter" on public.interviews;
drop policy if exists "interviews_delete_recruiter" on public.interviews;
create policy "interviews_select_related" on public.interviews for select to authenticated using (
  public.is_admin()
  or exists (
    select 1 from public.applications a
    where a.id = interviews.application_id
      and (a.seeker_id = auth.uid()
           or exists (select 1 from public.jobs j where j.id = a.job_id and j.recruiter_id = auth.uid()))
  )
);
create policy "interviews_insert_recruiter" on public.interviews for insert to authenticated with check (public.is_recruiter() or public.is_admin());
create policy "interviews_update_recruiter" on public.interviews for update to authenticated using (public.is_recruiter() or public.is_admin());
create policy "interviews_delete_recruiter" on public.interviews for delete to authenticated using (public.is_recruiter() or public.is_admin());

-- ── NOTIFICATIONS ──
alter table public.notifications enable row level security;
drop policy if exists "notifications_select_own"  on public.notifications;
drop policy if exists "notifications_insert_admin" on public.notifications;
drop policy if exists "notifications_update_own"  on public.notifications;
drop policy if exists "notifications_delete_own"  on public.notifications;
create policy "notifications_select_own"   on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_insert_admin" on public.notifications for insert to authenticated with check (public.is_admin() or user_id = auth.uid());
create policy "notifications_update_own"   on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "notifications_delete_own"   on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ── MESSAGES ──
alter table public.messages enable row level security;
drop policy if exists "messages_select_own"  on public.messages;
drop policy if exists "messages_insert_own"  on public.messages;
drop policy if exists "messages_update_own"  on public.messages;
drop policy if exists "messages_delete_own"  on public.messages;
create policy "messages_select_own"  on public.messages for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "messages_insert_own"  on public.messages for insert to authenticated with check (sender_id = auth.uid());
create policy "messages_update_own"  on public.messages for update to authenticated using (receiver_id = auth.uid());
create policy "messages_delete_own"  on public.messages for delete to authenticated using (sender_id = auth.uid());

-- ── SAVED JOBS ──
alter table public.saved_jobs enable row level security;
drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_select_own" on public.saved_jobs for select to authenticated using (user_id = auth.uid());
create policy "saved_jobs_insert_own" on public.saved_jobs for insert to authenticated with check (user_id = auth.uid());
create policy "saved_jobs_delete_own" on public.saved_jobs for delete to authenticated using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════
-- 13. VIEWS
-- ═══════════════════════════════════════════════════════════════════
create or replace view public.jobs_with_company as
select
  j.id, j.title, j.company_id, c.name as company,
  c.logo as company_logo, j.location, j.salary, j.type,
  j.workplace_type, j.experience, j.category, j.description,
  j.responsibilities, j.requirements, j.qualifications, j.benefits,
  j.skills, j.vacancies, j.deadline, j.status, j.views,
  (select count(*) from public.applications a where a.job_id = j.id) as application_count,
  j.posted_at, j.updated_at
from public.jobs j
join public.companies c on c.id = j.company_id;

create or replace view public.applications_full as
select
  a.id, a.job_id, j.title as job_title, c.name as company,
  c.logo as company_logo, a.seeker_id, p.name as seeker_name,
  au.email as seeker_email, a.status, a.cover_letter,
  a.portfolio_url, a.linkedin_url, a.applied_at, a.updated_at
from public.applications a
join public.jobs j      on j.id = a.job_id
join public.companies c on c.id = j.company_id
join public.profiles p  on p.id = a.seeker_id
join auth.users au      on au.id = a.seeker_id;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════
-- DONE  — run supabase/seed.sql next to insert sample data
-- ═══════════════════════════════════════════════════════════════════
