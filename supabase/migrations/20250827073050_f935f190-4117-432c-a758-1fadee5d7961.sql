-- Update the trigger function to handle patient vs professional data properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_value user_role;
BEGIN
  -- Get the user role from metadata, default to 'patient'
  user_role_value := COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role);
  
  -- Insert basic profile data for all users
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
    health_goals,
    -- Only insert professional fields if the user is a professional
    specialization,
    years_experience,
    practice_name,
    practice_address,
    license_number,
    education_certifications
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
    NEW.raw_user_meta_data ->> 'health_goals',
    -- Professional-specific fields (only insert if user is professional)
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'specialization' ELSE NULL END,
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'years_experience' ELSE NULL END,
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'practice_name' ELSE NULL END,
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'practice_address' ELSE NULL END,
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'license_number' ELSE NULL END,
    CASE WHEN user_role_value = 'professional' THEN NEW.raw_user_meta_data ->> 'education_certifications' ELSE NULL END
  );
  RETURN NEW;
END;
$function$;