-- Create refund_status enum
do $$ begin
  create type public.refund_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- Create refund_requests table
create table if not exists public.refund_requests (
  id bigserial primary key,
  appointment_id bigint not null references public.appointments(id) on delete cascade,
  patient_profile_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status public.refund_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_refund_requests_updated_at on public.refund_requests;
create trigger trg_refund_requests_updated_at
before update on public.refund_requests
for each row execute function public.set_updated_at();

-- Useful index
create index if not exists idx_refund_requests_professional on public.refund_requests (professional_profile_id, status);
create index if not exists idx_refund_requests_appointment on public.refund_requests (appointment_id);


