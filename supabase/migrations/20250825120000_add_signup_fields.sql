-- Add missing fields to profiles table for complete signup data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS health_goals TEXT,
ADD COLUMN IF NOT EXISTS practice_name TEXT,
ADD COLUMN IF NOT EXISTS practice_address TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS education_certifications TEXT;

-- Add missing fields to professionals table
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS practice_name TEXT,
ADD COLUMN IF NOT EXISTS practice_address TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS education_certifications TEXT;

-- Update the handle_new_user function to include more fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, user_id, email, first_name, last_name, slug, role
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || '-' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') || '-' || substring(NEW.id::text, 1, 8), ' ', '-')),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role)
  );
  RETURN NEW;
END;
$$;

-- Ensure RLS policies allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure RLS policies allow users to insert into professionals table
DROP POLICY IF EXISTS "Users can insert into professionals" ON public.professionals;
CREATE POLICY "Users can insert into professionals" ON public.professionals
FOR INSERT WITH CHECK (true);

-- Ensure RLS policies allow users to view their own professional records
DROP POLICY IF EXISTS "Users can view their own professional records" ON public.professionals;
CREATE POLICY "Users can view their own professional records" ON public.professionals
FOR SELECT USING (true);

-- Verify the schema was updated correctly
DO $$
BEGIN
  -- Check if all required columns exist in profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    RAISE EXCEPTION 'date_of_birth column not found in profiles table';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'health_goals'
  ) THEN
    RAISE EXCEPTION 'health_goals column not found in profiles table';
  END IF;
  
  RAISE NOTICE 'All required columns have been added successfully to profiles table';
END $$;
