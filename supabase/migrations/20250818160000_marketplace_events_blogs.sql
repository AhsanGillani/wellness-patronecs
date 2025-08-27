-- Roles enum
create type public.user_role as enum ('patient','professional');
create type public.booking_status as enum ('pending','confirmed','cancelled');

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key,
  role public.user_role not null default 'patient',
  name text not null,
  bio text,
  avatar_url text,
  specialties text[] default '{}',
  certifications text[] default '{}',
  hourly_rate numeric(10,2),
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles readable by everyone" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own profile" on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Services (offered by professionals)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(user_id) on delete cascade,
  title text not null,
  description text,
  category text,
  price numeric(10,2) not null,
  duration_minutes integer not null default 60,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;
create index if not exists services_professional_idx on public.services(professional_id);
create policy "Services are readable by everyone" on public.services for select using (true);
create policy "Pros manage their services" on public.services for insert to authenticated with check (professional_id = auth.uid());
create policy "Pros update their services" on public.services for update to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());
create policy "Pros delete their services" on public.services for delete to authenticated using (professional_id = auth.uid());

-- Availability slots
create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(user_id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  constraint slot_time_valid check (end_time > start_time)
);
alter table public.availability_slots enable row level security;
create index if not exists slots_professional_idx on public.availability_slots(professional_id);
create index if not exists slots_time_idx on public.availability_slots(start_time);
create policy "Slots readable by everyone" on public.availability_slots for select using (true);
create policy "Pros manage their slots" on public.availability_slots for insert to authenticated with check (professional_id = auth.uid());
create policy "Pros update their slots" on public.availability_slots for update to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());
create policy "Pros delete their slots" on public.availability_slots for delete to authenticated using (professional_id = auth.uid());

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid not null,
  professional_user_id uuid not null,
  service_id uuid not null references public.services(id) on delete restrict,
  slot_id uuid not null references public.availability_slots(id) on delete restrict,
  status public.booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
create index if not exists bookings_patient_idx on public.bookings(patient_user_id);
create index if not exists bookings_professional_idx on public.bookings(professional_user_id);
create policy "Users can view own bookings (as patient or professional)" on public.bookings for select using (
  auth.uid() = patient_user_id or auth.uid() = professional_user_id
);
create policy "Patients can insert their bookings" on public.bookings for insert to authenticated with check (patient_user_id = auth.uid());
create policy "Participants can update their booking status" on public.bookings for update to authenticated using (
  auth.uid() = patient_user_id or auth.uid() = professional_user_id
) with check (
  auth.uid() = patient_user_id or auth.uid() = professional_user_id
);

-- Events & tickets
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  banner_url text,
  starts_at timestamptz not null,
  location text,
  price numeric(10,2) not null default 0,
  capacity integer,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "Events readable by everyone" on public.events for select using (true);
create policy "Authenticated can create events" on public.events for insert to authenticated with check (true);
create policy "Creators update their events" on public.events for update to authenticated using (true) with check (true);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  quantity integer not null default 1,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
alter table public.tickets enable row level security;
create index if not exists tickets_event_idx on public.tickets(event_id);
create index if not exists tickets_user_idx on public.tickets(user_id);
create policy "Users view own tickets" on public.tickets for select using (auth.uid() = user_id);
create policy "Users buy tickets" on public.tickets for insert to authenticated with check (user_id = auth.uid());

-- Blogs
create type public.post_visibility as enum ('draft','published');
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  cover_url text,
  body text not null,
  tags text[] default '{}',
  author_user_id uuid,
  visibility public.post_visibility not null default 'published',
  created_at timestamptz not null default now()
);
create unique index if not exists blog_posts_slug_unique on public.blog_posts(lower(slug));
alter table public.blog_posts enable row level security;
create policy "Published blogs readable by everyone" on public.blog_posts for select using (visibility = 'published');
create policy "Authenticated users can read all blogs" on public.blog_posts for select using (auth.role() = 'authenticated');
create policy "Authors manage their blogs" on public.blog_posts for insert to authenticated check (author_user_id = auth.uid());
create policy "Authors update their blogs" on public.blog_posts for update to authenticated using (author_user_id = auth.uid()) with check (author_user_id = auth.uid());


