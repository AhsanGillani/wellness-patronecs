-- Add views column to community_questions
alter table if exists public.community_questions
  add column if not exists views integer not null default 0;

-- Create an RPC to increment views atomically
create or replace function public.increment_question_views(qid uuid)
returns void
language sql
as $$
  update public.community_questions
  set views = coalesce(views, 0) + 1
  where id = qid;
$$;


