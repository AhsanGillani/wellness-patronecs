-- Add bio field to profiles for professional description
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


