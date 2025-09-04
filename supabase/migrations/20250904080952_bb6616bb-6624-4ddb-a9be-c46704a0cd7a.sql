-- Second phase security fixes

-- Fix professional_ratings (it's a view, so create proper RLS for underlying tables)
-- Since professional_ratings is a view, we need to secure the underlying feedback table
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback readable by everyone (for ratings)"
ON public.feedback FOR SELECT
USING (true);

CREATE POLICY "Patients can create feedback after appointments"
ON public.feedback FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.profiles p ON a.patient_profile_id = p.id
    WHERE p.user_id = auth.uid()
    AND a.appointment_status = 'completed'
    AND a.service_id IN (
      SELECT s.id FROM public.services s WHERE s.professional_id = feedback.professional_id
    )
  )
);

-- Create admin role management policies (replace existing admin policies)
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a more secure admin role assignment policy
CREATE POLICY "Only existing verified admins can assign roles"
ON public.user_roles FOR INSERT
WITH CHECK (
  -- Only allow if the current user is already an admin
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
    AND p.verification_status = 'verified'
  )
);

CREATE POLICY "Only existing verified admins can modify roles"
ON public.user_roles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
    AND p.verification_status = 'verified'
  )
);

CREATE POLICY "Only existing verified admins can delete roles"
ON public.user_roles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
    AND p.verification_status = 'verified'
  )
);

-- Additional security: Prevent privilege escalation in signup
-- Update the profile creation to be more restrictive
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

CREATE POLICY "Allow secure profile creation during signup"
ON public.profiles FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND role = 'patient' -- Force all new signups to be patients only
);

-- Secure blog posts from XSS
CREATE POLICY "Only admins and verified professionals can create blogs"
ON public.blog_posts FOR INSERT
WITH CHECK (
  author_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND (p.role = 'admin' OR (p.role = 'professional' AND p.verification_status = 'verified'))
  )
);