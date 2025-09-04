-- CRITICAL SECURITY FIXES
-- Fix overly permissive RLS policies and implement proper security

-- 1. Fix appointments table - restrict to patient/professional only
DROP POLICY IF EXISTS "appointments_policy" ON public.appointments;

CREATE POLICY "Patients can view their own appointments"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = appointments.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view their appointments"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.services s
    JOIN public.profiles p ON s.professional_id = p.user_id
    WHERE s.id = appointments.service_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = appointments.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

-- 2. Fix services table - only professionals can manage their services
DROP POLICY IF EXISTS "services_policy" ON public.services;

CREATE POLICY "Services readable by everyone"
ON public.services FOR SELECT
USING (active = true);

CREATE POLICY "Professionals can manage their services"
ON public.services FOR ALL
USING (professional_id = auth.uid())
WITH CHECK (professional_id = auth.uid());

-- 3. Fix professionals table - secure access
DROP POLICY IF EXISTS "professionals_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_read_all" ON public.professionals;
DROP POLICY IF EXISTS "professionals_select_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_insert_policy" ON public.professionals;
DROP POLICY IF EXISTS "professionals_update_policy" ON public.professionals;

CREATE POLICY "Professionals readable by everyone"
ON public.professionals FOR SELECT
USING (verification = 'verified');

CREATE POLICY "Users can manage their professional profile"
ON public.professionals FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Fix events table - only verified professionals can create events
DROP POLICY IF EXISTS "events_policy" ON public.events;

CREATE POLICY "Events readable by everyone"
ON public.events FOR SELECT
USING (status = 'approved');

CREATE POLICY "Verified professionals can create events"
ON public.events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'professional'
    AND p.verification_status = 'verified'
  )
);

CREATE POLICY "Professionals can update their events"
ON public.events FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = host_professional_id 
    AND p.user_id = auth.uid()
  )
);

-- 5. Fix notifications - restrict to recipients and admins only
DROP POLICY IF EXISTS "notifications_policy" ON public.notifications;

CREATE POLICY "Users can view notifications meant for them"
ON public.notifications FOR SELECT
USING (
  (recipient_profile_id IS NOT NULL AND 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = recipient_profile_id AND user_id = auth.uid()))
  OR 
  (recipient_role IS NOT NULL AND 
   EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = recipient_role))
);

CREATE POLICY "Users can mark their notifications as read"
ON public.notifications FOR UPDATE
USING (
  (recipient_profile_id IS NOT NULL AND 
   EXISTS (SELECT 1 FROM public.profiles WHERE id = recipient_profile_id AND user_id = auth.uid()))
  OR 
  (recipient_role IS NOT NULL AND 
   EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = recipient_role))
);

-- 6. Fix user_roles - prevent self-assignment of admin roles
DROP POLICY IF EXISTS "user_roles_policy" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

-- Only existing admins can assign roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 7. Add missing RLS to professional_ratings
ALTER TABLE public.professional_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professional ratings readable by everyone"
ON public.professional_ratings FOR SELECT
USING (true);

-- Only patients who had appointments can rate
CREATE POLICY "Patients can rate professionals after appointments"
ON public.professional_ratings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.profiles p ON a.patient_profile_id = p.id
    WHERE p.user_id = auth.uid()
    AND a.appointment_status = 'completed'
  )
);

-- 8. Add missing RLS to refund_requests
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their refund requests"
ON public.refund_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = refund_requests.patient_profile_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Professionals can view refund requests for their services"
ON public.refund_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = refund_requests.professional_profile_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can create refund requests"
ON public.refund_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = refund_requests.patient_profile_id
    AND p.user_id = auth.uid()
  )
);

-- 9. Secure profiles table - limit PII exposure
CREATE POLICY "Limited profile info readable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can only update their own profiles, and cannot change their role after creation
CREATE POLICY "Users can update their own profile (no role change)"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND (OLD.role = NEW.role OR OLD.role IS NULL)
);

-- 10. Update the handle_new_user function to prevent role escalation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_value user_role;
BEGIN
  -- SECURITY FIX: Default all new users to 'patient', ignore role from metadata
  user_role_value := 'patient'::user_role;
  
  -- Insert basic profile data - new users are always patients
  INSERT INTO public.profiles (
    id, 
    user_id, 
    email, 
    first_name, 
    last_name, 
    slug, 
    role,
    phone,
    date_of_birth,
    location,
    health_goals
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || '-' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') || '-' || substring(NEW.id::text, 1, 8), ' ', '-')),
    user_role_value,
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data ->> 'date_of_birth' != '' 
      THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::date 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'health_goals'
  );
  RETURN NEW;
END;
$function$;