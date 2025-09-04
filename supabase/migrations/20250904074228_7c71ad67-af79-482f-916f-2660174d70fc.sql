-- Fix ERROR: RLS Disabled in Public - Enable RLS on all public tables that don't have it

-- Check and enable RLS on tables that might be missing it
ALTER TABLE public.professional_ratings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for professional_ratings table
CREATE POLICY "Professional ratings are publicly viewable" 
ON public.professional_ratings 
FOR SELECT 
USING (true);

-- Professionals and admins can manage ratings
CREATE POLICY "Professionals can manage their own ratings" 
ON public.professional_ratings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'professional' OR role = 'admin')
    AND (role = 'admin' OR id = professional_ratings.professional_id)
  )
);