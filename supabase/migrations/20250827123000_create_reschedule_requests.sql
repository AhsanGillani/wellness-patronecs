-- Create the reschedule_status enum type
DO $$ BEGIN
    CREATE TYPE public.reschedule_status AS ENUM ('pending', 'approved', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Reschedule requests table for patient -> professional flows
create table if not exists public.reschedule_requests (
  id bigint generated always as identity primary key,
  appointment_id integer not null references public.appointments(id) on delete cascade,
  patient_profile_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid not null references public.profiles(id) on delete cascade,
  current_appointment_date text not null,
  current_appointment_start_time text not null,
  current_appointment_end_time text not null,
  requested_appointment_date text not null,
  requested_appointment_start_time text not null,
  requested_appointment_end_time text not null,
  reason text,
  status public.reschedule_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reschedule_requests enable row level security;

-- Basic permissive RLS (tighten later):
drop policy if exists "reschedule_select" on public.reschedule_requests;
create policy "reschedule_select" on public.reschedule_requests for select using (true);

drop policy if exists "reschedule_insert" on public.reschedule_requests;
create policy "reschedule_insert" on public.reschedule_requests for insert with check (true);

drop policy if exists "reschedule_update" on public.reschedule_requests;
create policy "reschedule_update" on public.reschedule_requests for update using (true) with check (true);


