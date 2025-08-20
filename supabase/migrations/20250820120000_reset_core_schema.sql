-- RESET AND REBUILD CORE APPLICATION SCHEMA
-- Safely drop previous app tables (do not touch auth schema)

-- 0) Disable RLS temporarily during rebuild
set check_function_bodies = off;

-- 1) Drop existing tables we manage (order matters for FKs)
drop table if exists public.transactions cascade;
drop table if exists public.withdrawals cascade;
drop table if exists public.feedback cascade;
drop table if exists public.appointments cascade;
drop table if exists public.services cascade;
drop table if exists public.events cascade;
drop table if exists public.categories cascade;
drop table if exists public.professionals cascade;
drop table if exists public.profiles cascade;

-- also drop earlier community demo if present
drop table if exists public.community_votes cascade;
drop table if exists public.community_answers cascade;
drop table if exists public.community_questions cascade;
drop table if exists public.community_topics cascade;

-- 2) Enums
do $$ begin
  create type public.user_role as enum ('admin', 'professional', 'patient');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_mode as enum ('In-person', 'Virtual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_status as enum ('pending', 'approved', 'rejected', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.withdraw_method as enum ('Bank', 'PayPal', 'Stripe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.withdraw_status as enum ('requested', 'approved', 'transferred');
exception when duplicate_object then null; end $$;

-- 3) Profiles (application-level profile linked to auth.users)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique, -- nullable for guest/legacy import; link to auth.users.id when available
  role public.user_role not null default 'patient',
  slug text not null,
  first_name text,
  last_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_slug_not_empty check (length(slug) > 0)
);

create unique index profiles_slug_unique on public.profiles (lower(slug));
create index profiles_role_idx on public.profiles (role);

-- 4) Professionals (extends profile)
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  profession text,
  years_experience int,
  specialization text,
  verification text default 'pending', -- 'verified'|'pending'|'rejected'
  bio text,
  created_at timestamptz not null default now(),

  constraint professionals_slug_not_empty check (length(slug) > 0)
);

create unique index professionals_slug_unique on public.professionals (lower(slug));
create index professionals_profile_idx on public.professionals(profile_id);

-- 5) Categories (services/events)
create table public.categories (
  id bigserial primary key,
  slug text not null,
  name text not null,
  kind text not null default 'service', -- 'service'|'event'
  created_at timestamptz not null default now(),

  constraint categories_slug_not_empty check (length(slug) > 0),
  constraint categories_name_not_empty check (length(name) > 0)
);
create unique index categories_slug_unique on public.categories (lower(slug));
create index categories_kind_idx on public.categories(kind);

-- 6) Services
create table public.services (
  id bigserial primary key,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  slug text not null,
  name text not null,
  category_id bigint references public.categories(id) on delete set null,
  duration_min int not null,
  price_cents int not null default 0,
  mode public.service_mode not null default 'In-person',
  active boolean not null default true,
  description text,
  benefits jsonb,
  image_url text,
  availability jsonb, -- stores scheduleType, slots, customSchedules
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_slug_not_empty check (length(slug) > 0),
  constraint services_name_not_empty check (length(name) > 0)
);
create unique index services_slug_unique on public.services (lower(slug));
create index services_prof_idx on public.services(professional_id);
create index services_category_idx on public.services(category_id);

-- 7) Appointments
create table public.appointments (
  id bigserial primary key,
  service_id bigint not null references public.services(id) on delete cascade,
  patient_profile_id uuid not null references public.profiles(id) on delete restrict,
  mode public.service_mode not null,
  date date not null,
  start_time time not null,
  end_time time not null,
  price_cents int not null,
  payment_status public.payment_status not null default 'pending',
  appointment_status public.appointment_status not null default 'scheduled',
  transaction_id text,
  location_address text,
  created_at timestamptz not null default now()
);
create index appointments_service_idx on public.appointments(service_id);
create index appointments_patient_idx on public.appointments(patient_profile_id);
create index appointments_date_idx on public.appointments(date);

-- 8) Events / Workshops & Sessions
create table public.events (
  id bigserial primary key,
  host_professional_id uuid not null references public.professionals(id) on delete cascade,
  slug text not null,
  title text not null,
  type text not null default 'Event', -- 'Event'|'Session'
  category_id bigint references public.categories(id) on delete set null,
  date date not null,
  start_time time,
  end_time time,
  location text,
  summary text,
  details text,
  agenda jsonb,
  registration_url text,
  image_url text,
  ticket_price_cents int default 0,
  status public.event_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),

  constraint events_slug_not_empty check (length(slug) > 0),
  constraint events_title_not_empty check (length(title) > 0)
);
create unique index events_slug_unique on public.events (lower(slug));
create index events_host_idx on public.events(host_professional_id);
create index events_category_idx on public.events(category_id);
create index events_date_idx on public.events(date);

-- 9) Transactions (payments)
create table public.transactions (
  id bigserial primary key,
  appointment_id bigint references public.appointments(id) on delete set null,
  event_id bigint references public.events(id) on delete set null,
  user_profile_id uuid references public.profiles(id) on delete set null, -- payer
  professional_id uuid references public.professionals(id) on delete set null, -- payee
  amount_cents int not null,
  fee_cents int default 0,
  net_cents int generated always as (amount_cents - coalesce(fee_cents,0)) stored,
  method text, -- Card/UPI/etc.
  status text default 'succeeded',
  created_at timestamptz not null default now()
);
create index transactions_prof_idx on public.transactions(professional_id);
create index transactions_user_idx on public.transactions(user_profile_id);
create index transactions_created_idx on public.transactions(created_at);

-- 10) Withdrawals
create table public.withdrawals (
  id bigserial primary key,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  amount_cents int not null,
  method public.withdraw_method not null,
  status public.withdraw_status not null default 'requested',
  payout_details jsonb,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  transferred_at timestamptz
);
create index withdrawals_prof_idx on public.withdrawals(professional_id);
create index withdrawals_status_idx on public.withdrawals(status);

-- 11) Feedback / Ratings
create table public.feedback (
  id bigserial primary key,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  patient_profile_id uuid references public.profiles(id) on delete set null,
  appointment_id bigint references public.appointments(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  feedback_text text,
  additional_comments text,
  session_quality jsonb,
  would_recommend boolean,
  created_at timestamptz not null default now()
);
create index feedback_prof_idx on public.feedback(professional_id);
create index feedback_appt_idx on public.feedback(appointment_id);

-- 12) Helpful views
create or replace view public.professional_ratings as
select 
  professional_id,
  count(*)::int as reviews,
  round(avg(rating)::numeric, 1) as rating
from public.feedback
group by professional_id;

-- 13) Basic RLS (open read, restricted writes)
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.events enable row level security;
alter table public.transactions enable row level security;
alter table public.withdrawals enable row level security;
alter table public.feedback enable row level security;

-- Public read policies
create policy profiles_read_all on public.profiles for select using (true);
create policy professionals_read_all on public.professionals for select using (true);
create policy categories_read_all on public.categories for select using (true);
create policy services_read_all on public.services for select using (true);
create policy appointments_read_all on public.appointments for select using (true);
create policy events_read_all on public.events for select using (true);
create policy transactions_read_all on public.transactions for select using (true);
create policy withdrawals_read_all on public.withdrawals for select using (true);
create policy feedback_read_all on public.feedback for select using (true);

-- Example write policies (tighten as needed in production)
create policy profiles_user_write on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy profiles_user_update on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 14) Slug helpers: unique via lower(slug) done above for each entity

-- 15) Realtime publication (optional)
alter table public.profiles replica identity full;
alter table public.professionals replica identity full;
alter table public.services replica identity full;
alter table public.events replica identity full;
alter table public.appointments replica identity full;
alter table public.feedback replica identity full;

-- Add to publication if exists
do $$ begin
  execute 'alter publication supabase_realtime add table public.profiles';
  execute 'alter publication supabase_realtime add table public.professionals';
  execute 'alter publication supabase_realtime add table public.services';
  execute 'alter publication supabase_realtime add table public.events';
  execute 'alter publication supabase_realtime add table public.appointments';
  execute 'alter publication supabase_realtime add table public.feedback';
exception when others then null; end $$;

-- Done

