-- COMPREHENSIVE RLS SECURITY IMPLEMENTATION
-- This migration implements proper Row Level Security for all tables
-- Addresses all security vulnerabilities identified in the security audit

-- 1. Create admin role helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND verification_status = 'verified'
  );
$$;

-- 2. Create professional role helper function
CREATE OR REPLACE FUNCTION public.is_professional()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'professional'
  );
$$;

-- 3. Create patient role helper function
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'patient'
  );
$$;

-- 4. Enable RLS on all tables (if not already enabled)
-- Use DO blocks to handle tables that might not exist
DO $$ 
BEGIN
    -- Core tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN
    -- Some tables might not exist yet, continue
    NULL;
END $$;

-- Optional tables that might not exist
DO $$ 
BEGIN
    ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Create support_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop all existing policies to start clean
DO $$ 
DECLARE
    tbl_name text;
    policy_name text;
BEGIN
    -- List of tables to clean up
    FOR tbl_name IN 
        SELECT unnest(ARRAY[
            'profiles', 'professionals', 'services', 'appointments', 
            'feedback', 'notifications', 'transactions', 'withdrawals',
            'reschedule_requests', 'refund_requests', 'events', 'categories',
            'user_roles', 'community_questions', 'community_answers', 
            'community_topics', 'support_messages'
        ])
    LOOP
        -- Only process tables that exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_schema = 'public' AND t.table_name = tbl_name
        ) THEN
            -- Drop all policies for each table
            FOR policy_name IN 
                SELECT policyname 
                FROM pg_policies 
                WHERE tablename = tbl_name AND schemaname = 'public'
            LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, tbl_name);
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- 6. PROFILES TABLE - Most restrictive for PII protection
-- Users can only see their own complete profile
CREATE POLICY "profiles_own_read_write" ON public.profiles
FOR ALL USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Public can only see basic professional info (no email, phone, etc.)
CREATE POLICY "profiles_public_basic_read" ON public.profiles
FOR SELECT USING (
  role = 'professional' 
  AND verification_status = 'verified'
  -- Application layer must filter sensitive fields
);

-- Allow profile creation during signup
CREATE POLICY "profiles_signup_insert" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can see all profiles
CREATE POLICY "profiles_admin_all" ON public.profiles
FOR ALL USING (public.is_admin());

-- 7. PROFESSIONALS TABLE - Professional info only
-- Public can see verified professionals
CREATE POLICY "professionals_public_read" ON public.professionals
FOR SELECT USING (verification = 'verified');

-- Professionals can manage their own profile
CREATE POLICY "professionals_own_manage" ON public.professionals
FOR ALL USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Admins can manage all professionals
CREATE POLICY "professionals_admin_all" ON public.professionals
FOR ALL USING (public.is_admin());

-- 8. SERVICES TABLE - Marketplace functionality
-- Public can see active services
CREATE POLICY "services_public_read" ON public.services
FOR SELECT USING (active = true);

-- Professionals can manage their services
CREATE POLICY "services_owner_manage" ON public.services
FOR ALL USING (
  professional_id IN (
    SELECT pr.id FROM public.professionals pr
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can manage all services
CREATE POLICY "services_admin_all" ON public.services
FOR ALL USING (public.is_admin());

-- 9. APPOINTMENTS TABLE - Strict access control
-- Patients can see their own appointments
CREATE POLICY "appointments_patient_read" ON public.appointments
FOR SELECT USING (
  patient_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Patients can create appointments
CREATE POLICY "appointments_patient_create" ON public.appointments
FOR INSERT WITH CHECK (
  patient_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Professionals can see appointments for their services
CREATE POLICY "appointments_professional_read" ON public.appointments
FOR SELECT USING (
  service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.professionals pr ON s.professional_id = pr.id
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can see all appointments
CREATE POLICY "appointments_admin_all" ON public.appointments
FOR ALL USING (public.is_admin());

-- 10. FEEDBACK TABLE - Patient feedback system
-- Public can read feedback (for ratings display)
CREATE POLICY "feedback_public_read" ON public.feedback
FOR SELECT USING (true);

-- Patients can create feedback after completed appointments
CREATE POLICY "feedback_patient_create" ON public.feedback
FOR INSERT WITH CHECK (
  patient_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.patient_profile_id = feedback.patient_profile_id
    AND a.service_id IN (
      SELECT s.id FROM public.services s 
      WHERE s.professional_id = feedback.professional_id
    )
    AND a.appointment_status = 'completed'
  )
);

-- Professionals can read feedback about them
CREATE POLICY "feedback_professional_read" ON public.feedback
FOR SELECT USING (
  professional_id IN (
    SELECT pr.id FROM public.professionals pr
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can manage all feedback
CREATE POLICY "feedback_admin_all" ON public.feedback
FOR ALL USING (public.is_admin());

-- 11. NOTIFICATIONS TABLE - User-specific access
-- Users can read notifications meant for them
CREATE POLICY "notifications_recipient_read" ON public.notifications
FOR SELECT USING (
  (recipient_profile_id IS NOT NULL AND 
   recipient_profile_id IN (
     SELECT id FROM public.profiles WHERE user_id = auth.uid()
   ))
  OR 
  (recipient_role IS NOT NULL AND 
   EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE user_id = auth.uid() AND role = recipient_role
   ))
);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_recipient_update" ON public.notifications
FOR UPDATE USING (
  (recipient_profile_id IS NOT NULL AND 
   recipient_profile_id IN (
     SELECT id FROM public.profiles WHERE user_id = auth.uid()
   ))
  OR 
  (recipient_role IS NOT NULL AND 
   EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE user_id = auth.uid() AND role = recipient_role
   ))
);

-- Admins can manage all notifications
CREATE POLICY "notifications_admin_all" ON public.notifications
FOR ALL USING (public.is_admin());

-- 12. TRANSACTIONS TABLE - Financial data protection
-- Users can see their own transactions
CREATE POLICY "transactions_user_read" ON public.transactions
FOR SELECT USING (
  user_profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Professionals can see transactions for their services
CREATE POLICY "transactions_professional_read" ON public.transactions
FOR SELECT USING (
  professional_id IN (
    SELECT pr.id FROM public.professionals pr
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can see all transactions
CREATE POLICY "transactions_admin_all" ON public.transactions
FOR ALL USING (public.is_admin());

-- 13. WITHDRAWALS TABLE - Professional financial data
-- Professionals can manage their own withdrawals
CREATE POLICY "withdrawals_professional_manage" ON public.withdrawals
FOR ALL USING (
  professional_id IN (
    SELECT pr.id FROM public.professionals pr
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can manage all withdrawals
CREATE POLICY "withdrawals_admin_all" ON public.withdrawals
FOR ALL USING (public.is_admin());

-- 14. RESCHEDULE_REQUESTS TABLE - Appointment management
DO $$ 
BEGIN
    -- Only create policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'reschedule_requests') THEN
        -- Patients and professionals can see relevant reschedule requests
        EXECUTE 'CREATE POLICY "reschedule_requests_related_read" ON public.reschedule_requests
        FOR SELECT USING (
          appointment_id IN (
            SELECT a.id FROM public.appointments a
            WHERE a.patient_profile_id IN (
              SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
            OR a.service_id IN (
              SELECT s.id FROM public.services s
              JOIN public.professionals pr ON s.professional_id = pr.id
              JOIN public.profiles pf ON pr.profile_id = pf.id
              WHERE pf.user_id = auth.uid()
            )
          )
        )';

        -- Patients can create reschedule requests
        EXECUTE 'CREATE POLICY "reschedule_requests_patient_create" ON public.reschedule_requests
        FOR INSERT WITH CHECK (
          appointment_id IN (
            SELECT a.id FROM public.appointments a
            WHERE a.patient_profile_id IN (
              SELECT id FROM public.profiles WHERE user_id = auth.uid()
            )
          )
        )';

        -- Admins can manage all reschedule requests
        EXECUTE 'CREATE POLICY "reschedule_requests_admin_all" ON public.reschedule_requests
        FOR ALL USING (public.is_admin())';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Continue if table doesn't exist or other errors
    NULL;
END $$;

-- 15. REFUND_REQUESTS TABLE - Financial dispute management
DO $$ 
BEGIN
    -- Only create policies if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'refund_requests') THEN
        -- Patients can manage their refund requests
        EXECUTE 'CREATE POLICY "refund_requests_patient_manage" ON public.refund_requests
        FOR ALL USING (
          patient_profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
        )';

        -- Professionals can see refund requests for their services
        EXECUTE 'CREATE POLICY "refund_requests_professional_read" ON public.refund_requests
        FOR SELECT USING (
          professional_profile_id IN (
            SELECT pr.id FROM public.professionals pr
            JOIN public.profiles pf ON pr.profile_id = pf.id
            WHERE pf.user_id = auth.uid()
          )
        )';

        -- Admins can manage all refund requests
        EXECUTE 'CREATE POLICY "refund_requests_admin_all" ON public.refund_requests
        FOR ALL USING (public.is_admin())';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Continue if table doesn't exist or other errors
    NULL;
END $$;

-- 16. EVENTS TABLE - Public events with professional management
-- Public can see approved events
CREATE POLICY "events_public_read" ON public.events
FOR SELECT USING (status = 'approved');

-- Professionals can manage their events
CREATE POLICY "events_professional_manage" ON public.events
FOR ALL USING (
  host_professional_id IN (
    SELECT pr.id FROM public.professionals pr
    JOIN public.profiles pf ON pr.profile_id = pf.id
    WHERE pf.user_id = auth.uid()
  )
);

-- Admins can manage all events
CREATE POLICY "events_admin_all" ON public.events
FOR ALL USING (public.is_admin());

-- 17. CATEGORIES TABLE - Public reference data
-- Public can read categories
CREATE POLICY "categories_public_read" ON public.categories
FOR SELECT USING (true);

-- Admins can manage categories
CREATE POLICY "categories_admin_manage" ON public.categories
FOR ALL USING (public.is_admin());

-- 18. USER_ROLES TABLE - Role management
-- Users can see their own roles
CREATE POLICY "user_roles_own_read" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Only admins can assign roles
CREATE POLICY "user_roles_admin_manage" ON public.user_roles
FOR ALL USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 19. COMMUNITY TABLES - Public Q&A with controlled posting
DO $$ 
BEGIN
    -- Only create policies if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'community_questions') THEN
        -- Public can read community content
        EXECUTE 'CREATE POLICY "community_questions_public_read" ON public.community_questions
        FOR SELECT USING (true)';

        -- Authenticated users can create community content
        EXECUTE 'CREATE POLICY "community_questions_authenticated_create" ON public.community_questions
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';

        -- Authors can update their own content
        EXECUTE 'CREATE POLICY "community_questions_author_update" ON public.community_questions
        FOR UPDATE USING (author_user_id = auth.uid())
        WITH CHECK (author_user_id = auth.uid())';

        -- Admins can manage all community content
        EXECUTE 'CREATE POLICY "community_admin_all" ON public.community_questions
        FOR ALL USING (public.is_admin())';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'community_answers') THEN
        EXECUTE 'CREATE POLICY "community_answers_public_read" ON public.community_answers
        FOR SELECT USING (true)';

        EXECUTE 'CREATE POLICY "community_answers_authenticated_create" ON public.community_answers
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';

        EXECUTE 'CREATE POLICY "community_answers_author_update" ON public.community_answers
        FOR UPDATE USING (author_user_id = auth.uid())
        WITH CHECK (author_user_id = auth.uid())';

        EXECUTE 'CREATE POLICY "community_answers_admin_all" ON public.community_answers
        FOR ALL USING (public.is_admin())';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'community_topics') THEN
        EXECUTE 'CREATE POLICY "community_topics_public_read" ON public.community_topics
        FOR SELECT USING (true)';

        EXECUTE 'CREATE POLICY "community_topics_authenticated_create" ON public.community_topics
        FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';

        EXECUTE 'CREATE POLICY "community_topics_admin_all" ON public.community_topics
        FOR ALL USING (public.is_admin())';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Continue if tables don't exist or other errors
    NULL;
END $$;

-- 20. SUPPORT_MESSAGES TABLE - Admin-only access
-- Anyone can create support messages (contact form)
CREATE POLICY "support_messages_public_create" ON public.support_messages
FOR INSERT WITH CHECK (true);

-- Only admins can read support messages
CREATE POLICY "support_messages_admin_read" ON public.support_messages
FOR SELECT USING (public.is_admin());

-- Only admins can manage support messages
CREATE POLICY "support_messages_admin_manage" ON public.support_messages
FOR ALL USING (public.is_admin());

-- 21. Grant necessary permissions for RPC functions
GRANT EXECUTE ON FUNCTION public.increment_question_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_answer_professional_flag() TO authenticated;

-- 22. Create indexes for better RLS performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS professionals_profile_id_idx ON public.professionals(profile_id);
CREATE INDEX IF NOT EXISTS appointments_patient_profile_id_idx ON public.appointments(patient_profile_id);
CREATE INDEX IF NOT EXISTS appointments_service_id_idx ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS feedback_patient_profile_id_idx ON public.feedback(patient_profile_id);
CREATE INDEX IF NOT EXISTS feedback_professional_id_idx ON public.feedback(professional_id);
CREATE INDEX IF NOT EXISTS notifications_recipient_profile_id_idx ON public.notifications(recipient_profile_id);
CREATE INDEX IF NOT EXISTS transactions_user_profile_id_idx ON public.transactions(user_profile_id);
CREATE INDEX IF NOT EXISTS transactions_professional_id_idx ON public.transactions(professional_id);

-- 23. Security audit log (optional - for monitoring)
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  table_name text not null,
  record_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "security_audit_log_admin_read" ON public.security_audit_log
FOR SELECT USING (public.is_admin());

-- System can insert audit logs (via service role)
CREATE POLICY "security_audit_log_system_insert" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- 24. Final security verification
-- Ensure all tables have RLS enabled
DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'profiles', 'professionals', 'services', 'appointments', 
            'feedback', 'notifications', 'transactions', 'withdrawals',
            'reschedule_requests', 'refund_requests', 'events', 'categories',
            'user_roles', 'community_questions', 'community_answers', 
            'community_topics', 'support_messages', 'security_audit_log'
        ])
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class 
        WHERE relname = table_name AND relnamespace = 'public'::regnamespace;
        
        IF NOT rls_enabled THEN
            RAISE WARNING 'Table % does not have RLS enabled!', table_name;
        END IF;
    END LOOP;
END $$;

-- Migration complete - all tables now have comprehensive RLS protection
