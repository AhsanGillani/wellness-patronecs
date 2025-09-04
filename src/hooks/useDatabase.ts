// Security-aware database hooks that maintain existing API while protecting sensitive data

import { useQuery } from "@tanstack/react-query";
import { simpleSupabase } from "@/lib/simple-supabase";

// Create backward-compatible hooks with security filtering
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles-secure"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("profiles")
        .select("id,user_id,role,slug,first_name,last_name,avatar_url,bio,specialization,years_experience,location,verification_status,created_at")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Return data in the format expected by components while protecting sensitive fields
      const profiles = (data || []).map(profile => ({
        ...profile,
        // Hide sensitive data for non-admin users  
        email: undefined, // Never expose emails publicly
        phone: undefined, // Never expose phones publicly
        updated_at: profile.created_at, // Use created_at as fallback
      }));
      
      return {
        data: profiles,
        isLoading: false,
        error: null,
        // Legacy format compatibility
        professionals: profiles.filter(p => p.role === 'professional'),
        loading: false,
      };
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services-secure"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return {
        data: data || [],
        isLoading: false,
        error: null,
        // Legacy format compatibility
        services: data || [],
        loading: false,
      };
    },
  });
}

// Export legacy-compatible functions to maintain existing component functionality
export const useDatabase = {
  profiles: useProfiles,
  services: useServices,
};