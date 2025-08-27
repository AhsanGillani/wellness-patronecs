-- Availability wishlist: patients can subscribe to a service to be notified when slots open
create table if not exists public.availability_wishlist (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id bigint not null references public.services(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (patient_profile_id, service_id)
);

alter table public.availability_wishlist enable row level security;

-- Policies: anyone can read active states (non-sensitive), patients can manage their own
drop policy if exists "Wishlist readable by everyone" on public.availability_wishlist;
create policy "Wishlist readable by everyone" on public.availability_wishlist
  for select
  using (true);

drop policy if exists "Patients insert their own wishlist" on public.availability_wishlist;
create policy "Patients insert their own wishlist" on public.availability_wishlist
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = patient_profile_id and p.user_id = auth.uid())
  );

drop policy if exists "Patients update their own wishlist" on public.availability_wishlist;
create policy "Patients update their own wishlist" on public.availability_wishlist
  for update to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = patient_profile_id and p.user_id = auth.uid())
  );

drop policy if exists "Patients delete their own wishlist" on public.availability_wishlist;
create policy "Patients delete their own wishlist" on public.availability_wishlist
  for delete to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = patient_profile_id and p.user_id = auth.uid())
  );


