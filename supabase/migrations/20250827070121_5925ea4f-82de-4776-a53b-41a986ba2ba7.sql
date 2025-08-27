-- Update the handle_new_user function to extract all form data from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
BEGIN
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
    specialization,
    years_experience,
    practice_name,
    practice_address,
    license_number,
    education_certifications,
    health_goals
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data ->> 'first_name', '') || '-' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '') || '-' || substring(NEW.id::text, 1, 8), ' ', '-')),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'patient'::user_role),
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'date_of_birth' IS NOT NULL AND NEW.raw_user_meta_data ->> 'date_of_birth' != '' 
      THEN (NEW.raw_user_meta_data ->> 'date_of_birth')::date 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'specialization',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'years_experience' IS NOT NULL AND NEW.raw_user_meta_data ->> 'years_experience' != '' 
      THEN (NEW.raw_user_meta_data ->> 'years_experience')::integer 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'practice_name',
    NEW.raw_user_meta_data ->> 'practice_address',
    NEW.raw_user_meta_data ->> 'license_number',
    NEW.raw_user_meta_data ->> 'education_certifications',
    NEW.raw_user_meta_data ->> 'health_goals'
  );
  RETURN NEW;
END;
$$;