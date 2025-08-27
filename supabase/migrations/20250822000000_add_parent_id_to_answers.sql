-- Add parent_id field to community_answers for nested replies
ALTER TABLE public.community_answers 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.community_answers(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_community_answers_parent_id ON public.community_answers(parent_id);
