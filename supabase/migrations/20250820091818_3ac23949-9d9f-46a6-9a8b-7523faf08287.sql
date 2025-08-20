-- Update the function to include proper search path setting
CREATE OR REPLACE FUNCTION public.set_answer_professional_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is a professional
  IF NEW.author_user_id IS NOT NULL THEN
    SELECT CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = NEW.author_user_id 
        AND role IN ('doctor', 'professional')
      ) THEN true
      ELSE false
    END INTO NEW.is_professional;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;