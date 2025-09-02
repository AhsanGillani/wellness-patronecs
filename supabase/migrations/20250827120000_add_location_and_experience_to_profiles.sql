-- Add city/state/zip/years_experience to profiles for professional settings
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS years_experience TEXT;

-- Ensure RLS remains enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Optional: basic sanity check notices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN RAISE EXCEPTION 'profiles.city not created'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'years_experience'
  ) THEN RAISE EXCEPTION 'profiles.years_experience not created'; END IF;
END $$;


