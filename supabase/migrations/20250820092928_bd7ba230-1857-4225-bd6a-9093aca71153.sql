-- Create admin user profile
INSERT INTO auth.users (
  id,
  instance_id,
  email, 
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@wellness.com',
  crypt('Pakistan', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin", "first_name": "Admin", "last_name": "User"}',
  false,
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create admin profile (will be handled by trigger, but let's ensure it exists)
INSERT INTO public.profiles (
  id,
  user_id,
  email,
  first_name,
  last_name,
  role,
  slug
) 
SELECT 
  gen_random_uuid(),
  u.id,
  'admin@wellness.com',
  'Admin',
  'User', 
  'admin'::user_role,
  'admin-user'
FROM auth.users u 
WHERE u.email = 'admin@wellness.com'
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin'::user_role,
  first_name = 'Admin',
  last_name = 'User';