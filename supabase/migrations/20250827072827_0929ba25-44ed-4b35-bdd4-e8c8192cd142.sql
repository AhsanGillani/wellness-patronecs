-- Create missing profile for existing user
INSERT INTO public.profiles (
  id, 
  user_id, 
  email, 
  first_name, 
  last_name, 
  slug, 
  role
) VALUES (
  gen_random_uuid(),
  'd3e6cecd-72fc-4bac-bfd2-18571af3a469',
  'attaurrehman7708@gmail.com',
  'Test2',
  'test',
  'test2-test-' || substring('d3e6cecd-72fc-4bac-bfd2-18571af3a469'::text, 1, 8),
  'professional'::user_role
) ON CONFLICT (user_id) DO NOTHING;