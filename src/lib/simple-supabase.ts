// Reuse the single Supabase client instance to avoid multiple GoTrueClient warnings
import { supabase } from '@/integrations/supabase/client';

export const simpleSupabase = supabase;