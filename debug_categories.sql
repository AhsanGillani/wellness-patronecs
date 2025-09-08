-- Debug categories and services data
-- Check what categories exist
SELECT 'Categories' as table_name, id, name, slug FROM public.categories;

-- Check what category_ids are in services
SELECT 'Services' as table_name, id, name, category_id FROM public.services;

-- Check if there are any matches
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.category_id,
  c.name as category_name
FROM public.services s
LEFT JOIN public.categories c ON s.category_id = c.id;
