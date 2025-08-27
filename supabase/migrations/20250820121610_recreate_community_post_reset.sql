-- Recreate community schema (minimal) compatible with current core schema after reset

-- 1) Enums
do $$ begin
  create type public.community_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

-- 2) Tables
create table if not exists public.community_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text,
  author_user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  guest_fingerprint text,
  status public.community_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_topics_slug_not_empty check (length(slug) > 0)
);

create unique index if not exists community_topics_slug_unique on public.community_topics(lower(slug));

create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  title text not null,
  body text not null,
  author_user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  guest_fingerprint text,
  is_anonymous boolean not null default false,
  status public.community_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_questions_topic_idx on public.community_questions(topic_id);
create index if not exists community_questions_status_idx on public.community_questions(status);

create table if not exists public.community_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.community_questions(id) on delete cascade,
  body text not null,
  author_user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  guest_fingerprint text,
  is_professional boolean not null default false,
  status public.community_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_answers_question_idx on public.community_answers(question_id);
create index if not exists community_answers_status_idx on public.community_answers(status);

-- 3) RLS
alter table public.community_topics enable row level security;
alter table public.community_questions enable row level security;
alter table public.community_answers enable row level security;

do $$ begin
  create policy community_topics_read_all on public.community_topics for select using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_topics_insert_auth on public.community_topics for insert to authenticated with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_topics_insert_guest on public.community_topics for insert to anon with check (author_user_id is null and coalesce(guest_name,'') <> '' and coalesce(guest_fingerprint,'') <> '');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_topics_update_own on public.community_topics for update using (auth.uid() = author_user_id) with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_questions_read_all on public.community_questions for select using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_questions_insert_auth on public.community_questions for insert to authenticated with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_questions_insert_guest on public.community_questions for insert to anon with check (author_user_id is null and coalesce(guest_name,'') <> '' and coalesce(guest_fingerprint,'') <> '');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_questions_update_own on public.community_questions for update using (auth.uid() = author_user_id) with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_answers_read_all on public.community_answers for select using (status = 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_answers_insert_auth on public.community_answers for insert to authenticated with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_answers_insert_guest on public.community_answers for insert to anon with check (author_user_id is null and coalesce(guest_name,'') <> '' and coalesce(guest_fingerprint,'') <> '');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy community_answers_update_own on public.community_answers for update using (auth.uid() = author_user_id) with check (auth.uid() = author_user_id);
exception when duplicate_object then null; end $$;

-- 4) Function to set is_professional based on profile role
create or replace function public.set_answer_professional_flag()
returns trigger as $$
begin
  if new.author_user_id is not null then
    select case
      when exists (
        select 1 from public.profiles where user_id = new.author_user_id and role in ('doctor','professional')
      ) then true else false end
    into new.is_professional;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists set_answer_professional_flag_trigger on public.community_answers;
create trigger set_answer_professional_flag_trigger
  before insert or update on public.community_answers
  for each row execute function public.set_answer_professional_flag();


