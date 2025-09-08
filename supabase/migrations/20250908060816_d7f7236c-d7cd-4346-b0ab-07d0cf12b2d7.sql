-- Create test patient profiles for the existing appointments
INSERT INTO profiles (id, user_id, first_name, last_name, email, role, slug, avatar_url, created_at, updated_at)
VALUES 
  ('bea46f73-591b-4370-b30b-7b2d42316ca3', gen_random_uuid(), 'Sarah', 'Johnson', 'sarah.johnson@example.com', 'patient', 'sarah-johnson-' || substring(gen_random_uuid()::text, 1, 8), 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=256&auto=format&fit=crop', now(), now()),
  ('666cec93-2b83-483e-8fe2-00b95fb3bfc4', gen_random_uuid(), 'Michael', 'Chen', 'michael.chen@example.com', 'patient', 'michael-chen-' || substring(gen_random_uuid()::text, 1, 8), 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop', now(), now()),
  ('7eddadad-b62e-40d4-a075-c10cea932881', gen_random_uuid(), 'Emily', 'Davis', 'emily.davis@example.com', 'patient', 'emily-davis-' || substring(gen_random_uuid()::text, 1, 8), 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop', now(), now())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();