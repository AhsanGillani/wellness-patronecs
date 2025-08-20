-- Seed core data from existing mock content (pure SQL)

-- Categories (events)
insert into public.categories (slug, name, kind) values
  ('mental-health', 'Mental Health', 'event'),
  ('cardiology', 'Cardiology', 'event'),
  ('nutrition', 'Nutrition', 'event'),
  ('fitness', 'Fitness', 'event')
on conflict (lower(slug)) do nothing;

-- Categories (services)
insert into public.categories (slug, name, kind) values
  ('consultation', 'Consultation', 'service'),
  ('assessment', 'Assessment', 'service'),
  ('follow-up', 'Follow-up', 'service'),
  ('nutrition', 'Nutrition', 'service'),
  ('mental-health', 'Mental Health', 'service'),
  ('wellness', 'Wellness', 'service')
on conflict (lower(slug)) do nothing;

-- Profiles
insert into public.profiles (slug, role, first_name, last_name, email)
values
  ('jane-cooper', 'professional', 'Jane', 'Cooper', 'jane.cooper@example.com'),
  ('alex-morgan', 'professional', 'Alex', 'Morgan', 'alex.morgan@example.com'),
  ('priya-nair', 'professional', 'Priya', 'Nair', 'priya.nair@example.com')
on conflict (lower(slug)) do nothing;

-- Professionals (link by profile slug)
insert into public.professionals (profile_id, slug, profession, years_experience, specialization, verification, bio)
select p.id, 'dr-jane-cooper', 'Cardiologist', 12, 'Heart Health', 'verified', 'Board-certified cardiologist helping patients improve cardiovascular health.'
from public.profiles p where lower(p.slug) = 'jane-cooper'
on conflict (lower(slug)) do nothing;

insert into public.professionals (profile_id, slug, profession, years_experience, specialization, verification, bio)
select p.id, 'alex-morgan', 'Nutritionist', 8, 'Diet Plans', 'verified', 'Registered nutritionist focusing on metabolic health and performance.'
from public.profiles p where lower(p.slug) = 'alex-morgan'
on conflict (lower(slug)) do nothing;

insert into public.professionals (profile_id, slug, profession, years_experience, specialization, verification, bio)
select p.id, 'dr-priya-nair', 'Psychologist', 10, 'Anxiety & Relationships', 'verified', 'Clinical psychologist with a focus on anxiety and relationship health.'
from public.profiles p where lower(p.slug) = 'priya-nair'
on conflict (lower(slug)) do nothing;

-- Services (link by professional slug and category slug)
insert into public.services (professional_id, slug, name, category_id, duration_min, price_cents, mode, active, description, benefits)
select pr.id, 'general-consultation', 'General Consultation', c.id, 30, 5000, 'In-person', true, 'A comprehensive discussion about health concerns and wellness goals.', '["Personalized plan","Medical history review","Next steps"]'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'dr-jane-cooper' and c.kind='service' and lower(c.slug)='consultation'
on conflict (lower(slug)) do nothing;

insert into public.services (professional_id, slug, name, category_id, duration_min, price_cents, mode, active, description, benefits)
select pr.id, 'cardiac-assessment', 'Cardiac Assessment', c.id, 60, 12000, 'In-person', true, 'Detailed assessment for cardiac-related concerns.', '["Risk evaluation","Lifestyle guidance","Actionable plan"]'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'dr-jane-cooper' and c.kind='service' and lower(c.slug)='assessment'
on conflict (lower(slug)) do nothing;

insert into public.services (professional_id, slug, name, category_id, duration_min, price_cents, mode, active, description, benefits)
select pr.id, 'virtual-follow-up', 'Virtual Follow-up', c.id, 20, 3000, 'Virtual', true, 'Short virtual session to review progress and adjust plans.', '["Progress review","Plan adjustments","Q&A"]'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'alex-morgan' and c.kind='service' and lower(c.slug)='follow-up'
on conflict (lower(slug)) do nothing;

insert into public.services (professional_id, slug, name, category_id, duration_min, price_cents, mode, active, description, benefits)
select pr.id, 'meal-planning', 'Meal Planning', c.id, 90, 20000, 'Virtual', true, 'Customized meal plans for goals.', '["Structured eating","Better nutrition","Time savings"]'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'alex-morgan' and c.kind='service' and lower(c.slug)='nutrition'
on conflict (lower(slug)) do nothing;

insert into public.services (professional_id, slug, name, category_id, duration_min, price_cents, mode, active, description, benefits)
select pr.id, 'yoga-therapy', 'Yoga Therapy', c.id, 60, 9500, 'In-person', true, 'Therapeutic yoga sessions for stress relief and flexibility.', '["Stress reduction","Improved flexibility","Mental clarity"]'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'dr-priya-nair' and c.kind='service' and lower(c.slug)='wellness'
on conflict (lower(slug)) do nothing;

-- Events (link by professional slug and category slug)
insert into public.events (host_professional_id, slug, title, type, category_id, date, start_time, end_time, location, summary, details, agenda, registration_url, ticket_price_cents, status)
select pr.id, 'mindfulness-for-better-sleep', 'Mindfulness for Better Sleep', 'Event', c.id, '2025-03-28', '18:00', '19:30', 'Online webinar',
  'Learn practical breathing and mindfulness techniques to improve sleep quality and recovery.',
  'This live session covers the essentials of mindfulness and includes guided exercises you can practice immediately. Suitable for beginners.',
  '["Intro to mindfulness","Breathing techniques","Guided body scan","Q&A"]',
  'https://example.com/register/mindfulness-sleep', 0, 'approved'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'dr-priya-nair' and c.kind='event' and lower(c.slug)='mental-health'
on conflict (lower(slug)) do nothing;

insert into public.events (host_professional_id, slug, title, type, category_id, date, start_time, end_time, location, summary, details, agenda, registration_url, ticket_price_cents, status)
select pr.id, 'heart-health-101', 'Heart Health 101', 'Event', c.id, '2025-04-03', '17:00', '18:00', 'City Wellness Center',
  'A cardiologist explains risk factors, screenings, and lifestyle habits for a healthier heart.',
  'Understand key risk factors and how to manage them through diet, movement, and monitoring.',
  '["Risk factors overview","Lifestyle changes","Screenings & metrics","Q&A"]',
  'https://example.com/register/heart-health-101', 2000, 'approved'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'dr-jane-cooper' and c.kind='event' and lower(c.slug)='cardiology'
on conflict (lower(slug)) do nothing;

insert into public.events (host_professional_id, slug, title, type, category_id, date, start_time, end_time, location, summary, details, agenda, registration_url, ticket_price_cents, status)
select pr.id, 'fueling-performance-nutrition-basics', 'Fueling Performance: Nutrition Basics', 'Event', c.id, '2025-04-11', '16:30', '17:30', 'Online webinar',
  'Foundational strategies for meal timing, macros, and hydration.',
  'We will walk through pre- and post-workout fueling strategies, hydration, and simple plate-building templates.',
  '["Macro basics","Timing & portions","Hydration","Q&A"]',
  'https://example.com/register/fuel-performance', 0, 'approved'
from public.professionals pr, public.categories c
where lower(pr.slug) = 'alex-morgan' and c.kind='event' and lower(c.slug)='nutrition'
on conflict (lower(slug)) do nothing;

-- Done seed

-- Additional patient profiles
insert into public.profiles (slug, role, first_name, last_name, email)
values
  ('john-doe', 'patient', 'John', 'Doe', 'john@example.com'),
  ('sarah-johnson', 'patient', 'Sarah', 'Johnson', 'sarah@example.com'),
  ('michael-chen', 'patient', 'Michael', 'Chen', 'mchen@example.com')
on conflict (lower(slug)) do nothing;

-- Appointments (sample)
insert into public.appointments (service_id, patient_profile_id, mode, date, start_time, end_time, price_cents, payment_status, appointment_status, transaction_id, location_address)
select s.id, p.id, s.mode, '2025-04-11', '16:30', '16:50', s.price_cents, 'paid', 'completed', 'TXN-7K3Q1Z', null
from public.services s, public.profiles p
where lower(s.slug) = 'virtual-follow-up' and lower(p.slug) = 'michael-chen';

insert into public.appointments (service_id, patient_profile_id, mode, date, start_time, end_time, price_cents, payment_status, appointment_status, transaction_id, location_address)
select s.id, p.id, s.mode, '2025-04-03', '17:00', '17:30', s.price_cents, 'paid', 'completed', 'TXN-3J9X2B', 'City Wellness Center'
from public.services s, public.profiles p
where lower(s.slug) = 'cardiac-assessment' and lower(p.slug) = 'john-doe';

insert into public.appointments (service_id, patient_profile_id, mode, date, start_time, end_time, price_cents, payment_status, appointment_status, transaction_id, location_address)
select s.id, p.id, s.mode, '2025-04-02', '10:00', '10:50', s.price_cents, 'paid', 'completed', 'TXN-ABCD1234', null
from public.services s, public.profiles p
where lower(s.slug) = 'meal-planning' and lower(p.slug) = 'sarah-johnson';

-- Transactions (derive professional from service)
insert into public.transactions (appointment_id, user_profile_id, professional_id, amount_cents, fee_cents, method, status)
select a.id, a.patient_profile_id, sv.professional_id, a.price_cents, 300, 'Card', 'succeeded'
from public.appointments a
join public.services sv on sv.id = a.service_id
where a.transaction_id in ('TXN-7K3Q1Z','TXN-3J9X2B','TXN-ABCD1234');

-- Feedback (for completed appointments)
insert into public.feedback (professional_id, patient_profile_id, appointment_id, rating, feedback_text, additional_comments, session_quality, would_recommend)
select sv.professional_id, a.patient_profile_id, a.id, 5, 'Great session, very helpful!', 'Will book again.', '{"videoQuality":5,"audioQuality":5,"connectionStability":5,"doctorProfessionalism":5,"overallExperience":5}'::jsonb, true
from public.appointments a
join public.services sv on sv.id = a.service_id
where a.transaction_id = 'TXN-7K3Q1Z'
union all
select sv.professional_id, a.patient_profile_id, a.id, 4, 'Thorough assessment.', null, '{"videoQuality":4,"audioQuality":5,"connectionStability":5,"doctorProfessionalism":5,"overallExperience":4}'::jsonb, true
from public.appointments a
join public.services sv on sv.id = a.service_id
where a.transaction_id = 'TXN-3J9X2B';

-- Withdrawals (sample)
insert into public.withdrawals (professional_id, amount_cents, method, status, payout_details, requested_at, approved_at, transferred_at)
select pr.id, 48000, 'Bank', 'requested', '{"Bank":"Wells Fargo","Account Name":"Alex Morgan","Account No":"**** 4321","Routing No":"121000248"}', now(), null, null
from public.professionals pr where lower(pr.slug)='alex-morgan';

insert into public.withdrawals (professional_id, amount_cents, method, status, payout_details, requested_at, approved_at, transferred_at)
select pr.id, 36000, 'PayPal', 'approved', '{"PayPal Email":"priya.patel@example.com"}', now() - interval '3 days', now() - interval '1 day', null
from public.professionals pr where lower(pr.slug)='dr-priya-nair';

insert into public.withdrawals (professional_id, amount_cents, method, status, payout_details, requested_at, approved_at, transferred_at)
select pr.id, 22000, 'Stripe', 'transferred', '{"Stripe Account":"acct_1NXYZABC","Reference":"Connected"}', now() - interval '5 days', now() - interval '4 days', now() - interval '3 days'
from public.professionals pr where lower(pr.slug)='alex-morgan';

