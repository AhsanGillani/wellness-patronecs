-- Fix admin verification status
UPDATE public.profiles 
SET verification_status = 'verified' 
WHERE role = 'admin' AND verification_status = 'pending';

-- Verify the fix
SELECT id, first_name, last_name, role, verification_status 
FROM public.profiles 
WHERE role = 'admin';

