-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

-- Update profiles table to include role and other necessary fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'patient',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'patient'::public.app_role
  );
$$;

-- Update professionals table to link with user profiles
ALTER TABLE public.professionals 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS price_per_session INTEGER DEFAULT 0;

-- Seed some sample professionals data
INSERT INTO public.professionals (
  id, profile_id, user_id, slug, profession, specialization, 
  bio, years_experience, verification, location, price_per_session
) VALUES 
(gen_random_uuid(), gen_random_uuid(), null, 'dr-jane-cooper', 'Cardiologist', 'Heart Health, Hypertension, Lifestyle', 
 'Board-certified cardiologist helping patients improve cardiovascular health.', 12, 'verified', 'New York, NY', 12000),
(gen_random_uuid(), gen_random_uuid(), null, 'alex-morgan', 'Nutritionist', 'Weight Loss, Diet Plans, Diabetes',
 'Registered nutritionist focusing on metabolic health and performance.', 8, 'verified', 'Los Angeles, CA', 8000),
(gen_random_uuid(), gen_random_uuid(), null, 'dr-priya-nair', 'Psychologist', 'Anxiety, Relationships, Stress',
 'Clinical psychologist with a focus on anxiety and relationship health.', 10, 'verified', 'Chicago, IL', 11000)
ON CONFLICT (slug) DO NOTHING;

-- Seed blog posts 
INSERT INTO public.blog_posts (
  title, slug, body, tags, visibility, author_user_id, cover_url
) VALUES 
('5 Morning Habits for Better Energy', '5-morning-habits-better-energy', 
 'Starting your day with intention can have a compounding effect on energy and focus. Hydration, sunlight exposure, and a short movement routine are simple wins. Try stacking new habits with existing ones so they''re easier to maintain.',
 ARRAY['Wellness', 'Morning', 'Energy', 'Habits'], 'published', null, '/article-1.jpg'),
('A Beginner''s Guide to Mindful Eating', 'beginners-guide-mindful-eating',
 'Mindful eating is about paying attention to hunger, fullness, and satisfaction cues. Slowing down and removing distractions can improve digestion and awareness. Begin with one mindful meal a day and notice changes in your experience.',
 ARRAY['Nutrition', 'Mindfulness', 'Eating', 'Health'], 'published', null, '/article-2.jpg'),
('How to Build a Sustainable Workout Routine', 'sustainable-workout-routine',
 'Consistency beats intensity. Start small and build gradually. Aim for a balanced blend of strength, cardio, and mobility across the week. Track your sessions and celebrate small wins to maintain momentum.',
 ARRAY['Fitness', 'Workout', 'Exercise', 'Health'], 'published', null, '/article-3.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Update events table and seed data
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
ADD COLUMN IF NOT EXISTS current_attendees INTEGER DEFAULT 0;

-- Seed events data
INSERT INTO public.events (
  title, slug, type, date, start_time, end_time, location, summary, details, 
  agenda, registration_url, ticket_price_cents, category_id, host_professional_id, status
) VALUES 
('Mindfulness for Better Sleep', 'mindfulness-better-sleep', 'Webinar', '2025-03-28', '18:00', '19:30', 
 'Online webinar', 'Learn practical breathing and mindfulness techniques to improve sleep quality and recovery.',
 'This live session covers the essentials of mindfulness and includes guided exercises you can practice immediately. Suitable for beginners.',
 '["Intro to mindfulness", "Breathing techniques", "Guided body scan", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved'),
('Heart Health 101', 'heart-health-101', 'Workshop', '2025-04-03', '17:00', '18:00',
 'City Wellness Center', 'A cardiologist explains risk factors, screenings, and lifestyle habits for a healthier heart.',
 'Understand key risk factors and how to manage them through diet, movement, and monitoring. Includes a short checklist to take home.',
 '["Risk factors overview", "Lifestyle changes", "Screenings & metrics", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved'),
('Fueling Performance: Nutrition Basics', 'nutrition-basics', 'Webinar', '2025-04-11', '16:30', '17:30',
 'Online webinar', 'Foundational strategies for meal timing, macros, and hydration for everyday athletes.',
 'We will walk through pre- and post-workout fueling strategies, hydration, and simple plate-building templates.',
 '["Macro basics", "Timing & portions", "Hydration", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved')
ON CONFLICT (slug) DO NOTHING;

-- Update services table and seed data
INSERT INTO public.services (
  name, slug, description, price_cents, duration_min, mode, professional_id,
  category_id, active, benefits
) 
SELECT 
  'Initial Consultation', 
  'initial-consultation-' || p.slug,
  'Comprehensive initial assessment and treatment planning',
  CASE 
    WHEN p.profession = 'Cardiologist' THEN 12000
    WHEN p.profession = 'Nutritionist' THEN 8000  
    WHEN p.profession = 'Psychologist' THEN 11000
    ELSE 10000
  END,
  CASE 
    WHEN p.profession = 'Psychologist' THEN 50
    ELSE 45
  END,
  'In-person'::service_mode,
  p.id,
  null,
  true,
  '["Personalized assessment", "Treatment plan", "Expert guidance"]'::jsonb
FROM public.professionals p
WHERE NOT EXISTS (
  SELECT 1 FROM public.services s WHERE s.professional_id = p.id
);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS policies
DROP POLICY IF EXISTS "profiles_user_write" ON public.profiles;
DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
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
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'patient'::app_role)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();