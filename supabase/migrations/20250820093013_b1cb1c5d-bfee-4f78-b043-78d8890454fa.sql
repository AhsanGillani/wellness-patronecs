-- Update existing admin@wellness.com profile to admin role
UPDATE public.profiles 
SET role = 'admin'::user_role,
    first_name = 'Admin',
    last_name = 'User'
WHERE email = 'admin@wellness.com';