-- Repair the profile trigger and backfill Auth users created before it existed.
-- Safe to run more than once: it only inserts profiles for Auth users missing one.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    case new.raw_user_meta_data ->> 'role'
      when 'recruiter' then 'recruiter'
      else 'seeker'
    end,
    coalesce(new.raw_user_meta_data ->> 'avatar', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, name, phone, role, avatar)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'name', ''),
  coalesce(u.raw_user_meta_data ->> 'phone', ''),
  case u.raw_user_meta_data ->> 'role'
    when 'recruiter' then 'recruiter'
    else 'seeker'
  end,
  coalesce(u.raw_user_meta_data ->> 'avatar', '')
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
)
on conflict (id) do nothing;
