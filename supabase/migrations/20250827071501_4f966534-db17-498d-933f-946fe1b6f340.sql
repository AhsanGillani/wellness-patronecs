-- Fix years_experience column to handle string ranges like "1-3", "0-1" etc.
ALTER TABLE public.profiles ALTER COLUMN years_experience TYPE text USING years_experience::text;