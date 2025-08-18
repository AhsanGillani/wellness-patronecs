// Simple community data fetcher without complex types
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://pfixpubjbspokowydfty.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmaXhwdWJqYnNwb2tvd3lkZnR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODIzMjEsImV4cCI6MjA3MDU1ODMyMX0.a3GeDx7dG49f4aWDQ5a_mM5WhkwC9lYAZthkI_q1Xiw";

// Simple client without complex types
export const simpleSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});