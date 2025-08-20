-- Fix security definer functions with proper search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
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
RETURNS public.user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'patient'::public.user_role
  );
$$;