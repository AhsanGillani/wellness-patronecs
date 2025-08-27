-- Standardize role enum usage, fix functions, ensure user_roles table, and upsert admin profile post-reset

-- 1) Ensure user_role enum has all required values
do $$ begin
  alter type public.user_role add value if not exists 'admin';
exception when others then null; end $$;

do $$ begin
  alter type public.user_role add value if not exists 'doctor';
exception when others then null; end $$;

-- 2) Ensure user_roles table exists and role column uses public.user_role
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null,
  assigned_at timestamptz default now(),
  assigned_by uuid references auth.users(id),
  unique(user_id, role)
);

-- If role column exists with a different enum (e.g., app_role), convert it to user_role
do $$ begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'user_roles' and column_name = 'role'
      and udt_name <> 'user_role'
  ) then
    alter table public.user_roles
      alter column role type public.user_role using role::text::public.user_role;
  end if;
end $$;

-- 3) Enable RLS and policies for user_roles
alter table public.user_roles enable row level security;

do $$ begin
  create policy user_roles_self_select on public.user_roles
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy user_roles_admin_manage on public.user_roles
    for all using (public.has_role(auth.uid(), 'admin'));
exception when duplicate_object then null; end $$;

-- 4) Recreate role helper functions against public.user_role with proper search_path
create or replace function public.has_role(_user_id uuid, _role public.user_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
           select 1 from public.user_roles where user_id = _user_id and role = _role
         )
      or exists (
           select 1 from public.profiles where user_id = _user_id and role = _role
         );
$$;

create or replace function public.get_current_user_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'patient'::public.user_role);
$$;

-- 5) Drop legacy enum if still present and unused
do $$ begin
  if exists (
    select 1 from pg_type t
    where t.typnamespace = 'public'::regnamespace and t.typname = 'app_role'
  ) then
    -- Only drop if no columns depend on it
    if not exists (
      select 1 from pg_attribute a
      join pg_type ty on ty.oid = a.atttypid
      where ty.typname = 'app_role'
    ) then
      drop type public.app_role;
    end if;
  end if;
end $$;

-- 6) Upsert admin profile after reset (assumes user exists in auth.users)
insert into public.profiles (slug, role, first_name, last_name, email, user_id)
select 'admin-user', 'admin'::public.user_role, 'Admin', 'User', u.email, u.id
from auth.users u
where u.email = 'admin@wellness.com'
on conflict (user_id) do update set
  role = excluded.role,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  slug = excluded.slug;


