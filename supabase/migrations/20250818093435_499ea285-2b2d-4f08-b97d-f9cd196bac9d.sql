
-- 1) Enums
create type public.post_status as enum ('published', 'hidden', 'deleted');
create type public.vote_target as enum ('question', 'answer');

-- 2) Topics
create table if not exists public.community_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text,
  user_id uuid, -- nullable for guest-created topics
  guest_name text,
  guest_fingerprint text,
  created_at timestamptz not null default now(),

  constraint community_topics_slug_not_empty check (length(slug) > 0),
  constraint community_topics_title_not_empty check (length(title) > 0),
  -- Require either a user_id or valid guest identity
  constraint community_topics_identity_check
    check (
      user_id is not null
      or (coalesce(guest_name, '') <> '' and coalesce(guest_fingerprint, '') <> '')
    )
);

-- Unique slug (case-insensitive) via expression index
create unique index if not exists community_topics_slug_unique on public.community_topics (lower(slug));

alter table public.community_topics enable row level security;

-- Read for everyone
create policy "Topics are readable by everyone"
  on public.community_topics
  for select
  using (true);

-- Authenticated users can insert their own topics
create policy "Users can insert their topics"
  on public.community_topics
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Guests can insert topics (no edits afterwards)
create policy "Guests can insert topics"
  on public.community_topics
  for insert
  to anon
  with check (
    user_id is null
    and coalesce(guest_name, '') <> ''
    and coalesce(guest_fingerprint, '') <> ''
  );

-- Authenticated users can update/delete their own topics
create policy "Users can update their own topics"
  on public.community_topics
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own topics"
  on public.community_topics
  for delete
  to authenticated
  using (user_id = auth.uid());

-- No update/delete policy for guests (moderation can be added later)

-- 3) Questions
create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.community_topics(id) on delete cascade,
  user_id uuid,
  guest_name text,
  guest_fingerprint text,
  title text not null,
  body text not null,
  is_anonymous boolean not null default false,
  status public.post_status not null default 'published',
  created_at timestamptz not null default now(),

  constraint community_questions_title_not_empty check (length(title) > 0),
  constraint community_questions_body_not_empty check (length(body) > 0),
  constraint community_questions_identity_check
    check (
      user_id is not null
      or (coalesce(guest_name, '') <> '' and coalesce(guest_fingerprint, '') <> '')
    )
);

alter table public.community_questions enable row level security;

create index if not exists community_questions_topic_idx on public.community_questions(topic_id);
create index if not exists community_questions_status_idx on public.community_questions(status);

create policy "Questions readable by everyone"
  on public.community_questions
  for select
  using (true);

create policy "Users can insert their questions"
  on public.community_questions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Guests can insert questions"
  on public.community_questions
  for insert
  to anon
  with check (
    user_id is null
    and coalesce(guest_name, '') <> ''
    and coalesce(guest_fingerprint, '') <> ''
  );

create policy "Users can update their own questions"
  on public.community_questions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own questions"
  on public.community_questions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 4) Answers
create table if not exists public.community_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.community_questions(id) on delete cascade,
  user_id uuid,
  guest_name text,
  guest_fingerprint text,
  body text not null,
  is_from_professional boolean not null default false,
  is_verified boolean not null default false,
  status public.post_status not null default 'published',
  created_at timestamptz not null default now(),

  constraint community_answers_body_not_empty check (length(body) > 0),
  constraint community_answers_identity_check
    check (
      user_id is not null
      or (coalesce(guest_name, '') <> '' and coalesce(guest_fingerprint, '') <> '')
    )
);

alter table public.community_answers enable row level security;

create index if not exists community_answers_question_idx on public.community_answers(question_id);
create index if not exists community_answers_status_idx on public.community_answers(status);

create policy "Answers readable by everyone"
  on public.community_answers
  for select
  using (true);

create policy "Users can insert their answers"
  on public.community_answers
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Guests can insert answers"
  on public.community_answers
  for insert
  to anon
  with check (
    user_id is null
    and coalesce(guest_name, '') <> ''
    and coalesce(guest_fingerprint, '') <> ''
  );

create policy "Users can update their own answers"
  on public.community_answers
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own answers"
  on public.community_answers
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 5) Votes (one per user OR per guest fingerprint per entity)
create table if not exists public.community_votes (
  id uuid primary key default gen_random_uuid(),
  target public.vote_target not null,
  entity_id uuid not null,
  user_id uuid,
  guest_fingerprint text,
  vote smallint not null,
  created_at timestamptz not null default now(),

  constraint community_votes_vote_valid check (vote in (-1, 1)),
  constraint community_votes_identity_check
    check (
      user_id is not null
      or (coalesce(guest_fingerprint, '') <> '')
    )
);

alter table public.community_votes enable row level security;

-- Partial unique indexes to ensure one vote per identity per entity
create unique index if not exists community_votes_unique_user
  on public.community_votes(target, entity_id, user_id)
  where user_id is not null;

create unique index if not exists community_votes_unique_guest
  on public.community_votes(target, entity_id, guest_fingerprint)
  where guest_fingerprint is not null;

create index if not exists community_votes_entity_idx
  on public.community_votes(target, entity_id);

create policy "Votes readable by everyone"
  on public.community_votes
  for select
  using (true);

create policy "Users can insert their votes"
  on public.community_votes
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Guests can insert votes"
  on public.community_votes
  for insert
  to anon
  with check (
    user_id is null
    and coalesce(guest_fingerprint, '') <> ''
  );

create policy "Users can update their own votes"
  on public.community_votes
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Guests cannot update/delete votes (simplifies abuse control); users can delete their own
create policy "Users can delete their own votes"
  on public.community_votes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- 6) Realtime
alter table public.community_topics replica identity full;
alter table public.community_questions replica identity full;
alter table public.community_answers replica identity full;
alter table public.community_votes replica identity full;

-- Add to supabase_realtime publication
-- Note: If these tables are already in the publication, these commands will no-op.
begin;
  -- Ignore errors for already added tables using exception-safe approach
  -- Supabase SQL editor may not support DO blocks with exception handling here,
  -- but adding the same table twice is harmless on recent setups.
  alter publication supabase_realtime add table public.community_topics;
  alter publication supabase_realtime add table public.community_questions;
  alter publication supabase_realtime add table public.community_answers;
  alter publication supabase_realtime add table public.community_votes;
commit;
