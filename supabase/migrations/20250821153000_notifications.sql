-- Notifications per user and/or by role
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid references public.profiles(id) on delete cascade,
  recipient_role public.user_role,
  title text not null,
  body text,
  link_url text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Allow users to read notifications targeted to their profile or role
drop policy if exists "Notifications readable by recipient" on public.notifications;
create policy "Notifications readable by recipient" on public.notifications
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid()
      and (
        notifications.recipient_profile_id = p.id
        or notifications.recipient_role = p.role
      )
    )
  );

-- Allow admins to insert/update/delete notifications
drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications" on public.notifications
  for all to authenticated
  using (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
  );


