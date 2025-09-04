-- Final security fixes - address remaining RLS and function issues

-- Enable RLS on any remaining tables that don't have it
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions (financial data needs strict access)
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (
  user_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view their transactions"
ON public.transactions FOR SELECT
USING (
  professional_id = auth.uid()
);

-- Create policies for withdrawals (financial data needs strict access)
CREATE POLICY "Professionals can view their withdrawals"
ON public.withdrawals FOR SELECT
USING (professional_id = auth.uid());

CREATE POLICY "Professionals can request withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (professional_id = auth.uid());

-- Fix function search paths (security requirement)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select coalesce((select role from public.profiles where user_id = auth.uid()), 'patient'::public.user_role);
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
           select 1 from public.user_roles where user_id = _user_id and role = _role
         )
      or exists (
           select 1 from public.profiles where user_id = _user_id and role = _role
         );
$function$;

CREATE OR REPLACE FUNCTION public.increment_question_views(qid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  update public.community_questions
  set views = coalesce(views, 0) + 1
  where id = qid;
end;
$function$;

-- Update the set_answer_professional_flag function with proper search path
CREATE OR REPLACE FUNCTION public.set_answer_professional_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;