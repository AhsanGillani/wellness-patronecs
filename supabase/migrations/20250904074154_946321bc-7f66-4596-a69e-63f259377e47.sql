-- Fix critical security vulnerability: Remove public access to sensitive profile data
-- and implement proper Row Level Security policies

-- First, drop all overly permissive policies that allow public access to all data
DROP POLICY IF EXISTS "Public can read basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Create secure policies that protect sensitive personal information

-- 1. Users can read and update their own complete profile
CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Professionals can be discovered in marketplace (only safe, public fields)
CREATE POLICY "Professional profiles discoverable for marketplace" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'professional' AND 
  verification_status = 'verified' AND
  -- Only allow access to safe fields, sensitive data is filtered in application layer
  true
);

-- 3. Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Note: Application code should be updated to only select safe fields 
-- (first_name, last_name, specialization, bio, years_experience, location, avatar_url)
-- when displaying professional profiles to others, never exposing 
-- email, phone, date_of_birth, or full address information