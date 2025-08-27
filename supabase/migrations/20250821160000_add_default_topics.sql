-- Add default topics for community questions
INSERT INTO public.community_topics (id, title, slug, description, status, created_at, updated_at) VALUES
  (gen_random_uuid(), 'General', 'general', 'General health and wellness questions', 'published', now(), now()),
  (gen_random_uuid(), 'Nutrition', 'nutrition', 'Questions about diet, nutrition, and healthy eating', 'published', now(), now()),
  (gen_random_uuid(), 'Mental Health', 'mental-health', 'Mental health, psychology, and emotional wellness', 'published', now(), now()),
  (gen_random_uuid(), 'Fitness', 'fitness', 'Exercise, physical fitness, and workout questions', 'published', now(), now()),
  (gen_random_uuid(), 'Sleep', 'sleep', 'Sleep quality, sleep disorders, and rest optimization', 'published', now(), now()),
  (gen_random_uuid(), 'Women Health', 'women-health', 'Women-specific health and wellness topics', 'published', now(), now()),
  (gen_random_uuid(), 'Men Health', 'men-health', 'Men-specific health and wellness topics', 'published', now(), now())
ON CONFLICT (slug) DO NOTHING;
