-- Seed some sample professionals data
INSERT INTO public.professionals (
  id, profile_id, user_id, slug, profession, specialization, 
  bio, years_experience, verification, location, price_per_session
) VALUES 
(gen_random_uuid(), gen_random_uuid(), null, 'dr-jane-cooper', 'Cardiologist', 'Heart Health, Hypertension, Lifestyle', 
 'Board-certified cardiologist helping patients improve cardiovascular health.', 12, 'verified', 'New York, NY', 12000),
(gen_random_uuid(), gen_random_uuid(), null, 'alex-morgan', 'Nutritionist', 'Weight Loss, Diet Plans, Diabetes',
 'Registered nutritionist focusing on metabolic health and performance.', 8, 'verified', 'Los Angeles, CA', 8000),
(gen_random_uuid(), gen_random_uuid(), null, 'dr-priya-nair', 'Psychologist', 'Anxiety, Relationships, Stress',
 'Clinical psychologist with a focus on anxiety and relationship health.', 10, 'verified', 'Chicago, IL', 11000)
ON CONFLICT (slug) DO NOTHING;

-- Seed blog posts 
INSERT INTO public.blog_posts (
  title, slug, body, tags, visibility, author_user_id, cover_url
) VALUES 
('5 Morning Habits for Better Energy', '5-morning-habits-better-energy', 
 'Starting your day with intention can have a compounding effect on energy and focus. Hydration, sunlight exposure, and a short movement routine are simple wins. Try stacking new habits with existing ones so they''re easier to maintain.',
 ARRAY['Wellness', 'Morning', 'Energy', 'Habits'], 'published', null, '/article-1.jpg'),
('A Beginner''s Guide to Mindful Eating', 'beginners-guide-mindful-eating',
 'Mindful eating is about paying attention to hunger, fullness, and satisfaction cues. Slowing down and removing distractions can improve digestion and awareness. Begin with one mindful meal a day and notice changes in your experience.',
 ARRAY['Nutrition', 'Mindfulness', 'Eating', 'Health'], 'published', null, '/article-2.jpg'),
('How to Build a Sustainable Workout Routine', 'sustainable-workout-routine',
 'Consistency beats intensity. Start small and build gradually. Aim for a balanced blend of strength, cardio, and mobility across the week. Track your sessions and celebrate small wins to maintain momentum.',
 ARRAY['Fitness', 'Workout', 'Exercise', 'Health'], 'published', null, '/article-3.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Update events table and seed data
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS registration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
ADD COLUMN IF NOT EXISTS current_attendees INTEGER DEFAULT 0;

-- Seed events data
INSERT INTO public.events (
  title, slug, type, date, start_time, end_time, location, summary, details, 
  agenda, registration_url, ticket_price_cents, category_id, host_professional_id, status
) VALUES 
('Mindfulness for Better Sleep', 'mindfulness-better-sleep', 'Webinar', '2025-03-28', '18:00', '19:30', 
 'Online webinar', 'Learn practical breathing and mindfulness techniques to improve sleep quality and recovery.',
 'This live session covers the essentials of mindfulness and includes guided exercises you can practice immediately. Suitable for beginners.',
 '["Intro to mindfulness", "Breathing techniques", "Guided body scan", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved'),
('Heart Health 101', 'heart-health-101', 'Workshop', '2025-04-03', '17:00', '18:00',
 'City Wellness Center', 'A cardiologist explains risk factors, screenings, and lifestyle habits for a healthier heart.',
 'Understand key risk factors and how to manage them through diet, movement, and monitoring. Includes a short checklist to take home.',
 '["Risk factors overview", "Lifestyle changes", "Screenings & metrics", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved'),
('Fueling Performance: Nutrition Basics', 'nutrition-basics', 'Webinar', '2025-04-11', '16:30', '17:30',
 'Online webinar', 'Foundational strategies for meal timing, macros, and hydration for everyday athletes.',
 'We will walk through pre- and post-workout fueling strategies, hydration, and simple plate-building templates.',
 '["Macro basics", "Timing & portions", "Hydration", "Q&A"]'::jsonb,
 'https://example.com/register', 0, null, null, 'approved')
ON CONFLICT (slug) DO NOTHING;