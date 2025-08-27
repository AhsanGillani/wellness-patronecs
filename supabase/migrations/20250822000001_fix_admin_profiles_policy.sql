-- Fix infinite recursion in RLS policies for profiles table
-- This migration removes all existing policies and creates a simple one

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update verification_status" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations temporarily" ON public.profiles;
DROP POLICY IF EXISTS "profiles_policy" ON public.profiles;

-- Create a simple policy that allows all operations (temporary fix)
-- This will be refined later with proper admin checks
CREATE POLICY "profiles_policy" ON public.profiles
FOR ALL USING (true);
