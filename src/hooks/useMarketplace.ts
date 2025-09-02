import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { simpleSupabase } from "@/lib/simple-supabase";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string | null;
  role: "patient" | "professional" | "admin";
  slug: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  specialization?: string | null;
  years_experience?: number | null;
  verification_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  professional_id: string;
  slug: string;
  name: string;
  category_id?: number | null;
  duration_min: number;
  price_cents: number;
  mode: "In-person" | "Virtual";
  active: boolean;
  description?: string | null;
  benefits?: unknown;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
}

// Removed legacy Slot type (availability_slots table no longer exists)

// Removed legacy Booking type (bookings table replaced by appointments)

export interface Event {
  id: number;
  slug: string;
  title: string;
  type: string;
  date: string; // YYYY-MM-DD
  start_time?: string | null; // HH:MM:SS
  end_time?: string | null;   // HH:MM:SS
  location?: string | null;
  category_id?: number | null;
  summary?: string | null;
  details?: string | null;
  agenda?: unknown;
  registration_url?: string | null;
  image_url?: string | null;
  ticket_price_cents?: number | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export interface Ticket {
  // Tickets table is not present in the current schema; kept for backward-compat typing if needed
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  status: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  cover_url?: string;
  body: string;
  tags?: string[];
  author_user_id?: string;
  visibility: "draft" | "published";
  created_at: string;
}

// Profiles
export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useProfessional(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await simpleSupabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useProfessionals() {
  return useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      console.log('Fetching professionals...');
      
      // First, let's check what's in the profiles table
      const { data: allProfiles, error: allError } = await simpleSupabase
        .from("profiles")
        .select("id, role, first_name, last_name, email")
        .limit(100);
      
      console.log('All profiles:', allProfiles);
      
      // Get profiles with role 'professional'
      const { data: profilesData, error: profilesError } = await simpleSupabase
        .from("profiles")
        .select("*")
        .eq("role", "professional")
        .order("created_at", { ascending: false });
      
      console.log('Profiles with role professional:', profilesData);
      
      if (profilesError) throw profilesError;
      
      // For now, return just the profiles data
      // We'll add the professionals join later once we confirm the basic query works
      return profilesData || [];
    },
  });
}

export function useServices(limit = 50) {
  return useQuery({
    queryKey: ["services", limit],
    queryFn: async () => {
      const { data, error } = await (simpleSupabase as any)
        .from("services")
        .select(`id, name, slug, duration_min, price_cents, mode, active, description, benefits, image_url, created_at, professional_id`)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .range(0, Math.max(0, limit - 1));
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      console.log('Fetching appointments...');
      
      // First, get basic appointments data
      const { data, error } = await simpleSupabase
        .from("appointments")
        .select(`
          *,
          services(
            id,
            name
          ),
          profiles(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order("date", { ascending: false });
      
      console.log('Appointments query result:', { data, error });
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useProfessionalServices(professionalId: string) {
  return useQuery({
    queryKey: ["professional-services", professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      console.log('Fetching services for professional:', professionalId);
      
      // First get the professional record for this profile
      const { data: professionalData, error: profError } = await simpleSupabase
        .from("professionals")
        .select("id")
        .eq("profile_id", professionalId)
        .single();
      
      if (profError || !professionalData) {
        console.log('No professional record found for profile:', professionalId);
        return [];
      }
      
      // Then get services for this professional
      const { data, error } = await simpleSupabase
        .from("services")
        .select(`
          *,
          categories(
            id,
            name,
            slug
          )
        `)
        .eq("professional_id", professionalData.id)
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      console.log('Professional services result:', { data, error });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId,
  });
}

export function useProfessionalAppointments(professionalId: string) {
  return useQuery({
    queryKey: ["professional-appointments", professionalId],
    queryFn: async () => {
      if (!professionalId) return [];
      
      console.log('Fetching appointments for professional:', professionalId);
      
      // First get the professional record for this profile
      const { data: professionalData, error: profError } = await simpleSupabase
        .from("professionals")
        .select("id")
        .eq("profile_id", professionalId)
        .single();
      
      if (profError || !professionalData) {
        console.log('No professional record found for profile:', professionalId);
        return [];
      }
      
      // Get all services for this professional
      const { data: servicesData, error: servicesError } = await simpleSupabase
        .from("services")
        .select("id")
        .eq("professional_id", professionalData.id);
      
      if (servicesError || !servicesData || servicesData.length === 0) {
        console.log('No services found for professional:', professionalData.id);
        return [];
      }
      
      const serviceIds = servicesData.map(s => s.id);
      
      // Then get appointments for these services
      const { data, error } = await simpleSupabase
        .from("appointments")
        .select(`
          *,
          services(
            id,
            name
          ),
          profiles(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .in("service_id", serviceIds)
        .order("date", { ascending: false });
      
      console.log('Professional appointments result:', { data, error });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!professionalId,
  });
}

// Removed legacy useSlots; scheduling is now represented via service availability json and appointments

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, date, startTime, endTime, locationAddress }: { serviceId: number; date: string; startTime: string; endTime: string; locationAddress?: string }) => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (!currentUserId) throw new Error("Sign in to book");

      const { data: patientProfile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("id")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!patientProfile) throw new Error("Profile not found");

      const { data: service, error: serviceError } = await simpleSupabase
        .from("services")
        .select("id, price_cents, mode")
        .eq("id", serviceId)
        .maybeSingle();
      if (serviceError) throw serviceError;
      if (!service) throw new Error("Service not found");

      const insertPayload = {
        service_id: service.id,
        patient_profile_id: patientProfile.id,
        mode: service.mode,
        date,
        start_time: startTime,
        end_time: endTime,
        price_cents: service.price_cents,
        location_address: locationAddress ?? null,
      } as const;

      const { data, error } = await simpleSupabase
        .from("appointments")
        .insert(insertPayload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("Appointment requested");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as Event[];
    },
  });
}

// Generic events-by-status hook for Admin views
export function useEventsByStatus(status: "pending" | "approved" | "rejected" | "cancelled") {
  return useQuery({
    queryKey: ["events", status],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("events")
        .select(`
          *,
          professionals:host_professional_id(
            id,
            profile:profile_id(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq("status", status)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data || []) as Event[];
    },
  });
}

// Removed legacy useBuyTicket; no tickets table in current schema

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase.from("blog_posts").select("id, slug, title, body, cover_url, tags, visibility, created_at").eq("visibility", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlogPost[];
    },
  });
}

// Admin hook to get all blogs (draft and published)
export function useAllBlogs() {
  return useQuery({
    queryKey: ["all-blogs"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("blog_posts")
        .select("id, slug, title, body, cover_url, tags, visibility, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlogPost[];
    },
  });
}

// Notifications
export interface NotificationRow {
  id: string;
  recipient_profile_id: string | null;
  recipient_role: "patient" | "professional" | "admin" | null;
  title: string;
  body?: string | null;
  link_url?: string | null;
  data?: unknown;
  read_at?: string | null;
  created_at: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationRow[]> => {
      // Get current user's profile to filter notifications
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (!currentUserId) {
        return [];
      }

      // Get current user's profile
      const { data: profile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", currentUserId)
        .maybeSingle();
      
      if (profileError || !profile) {
        return [];
      }

      // Filter notifications by recipient_profile_id or recipient_role
      const { data, error } = await (simpleSupabase as any)
        .from("notifications")
        .select("id, recipient_profile_id, recipient_role, title, body, link_url, data, read_at, created_at")
        .or(`recipient_profile_id.eq.${profile.id},recipient_role.eq.${profile.role}`)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as NotificationRow[];
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      // Get current user's profile to ensure they can only mark their own notifications as read
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Get current user's profile
      const { data: profile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", currentUserId)
        .maybeSingle();
      
      if (profileError || !profile) {
        throw new Error("Profile not found");
      }

      // Update notification only if it belongs to the current user
      const { error } = await (simpleSupabase as any)
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .or(`recipient_profile_id.eq.${profile.id},recipient_role.eq.${profile.role}`);
      
      if (error) throw error;
      return true as const;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useNotification(id?: string) {
  return useQuery({
    queryKey: ["notification", id],
    enabled: Boolean(id),
    queryFn: async (): Promise<NotificationRow | null> => {
      if (!id) return null;
      
      // Get current user's profile to filter notifications
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (!currentUserId) {
        return null;
      }

      // Get current user's profile
      const { data: profile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", currentUserId)
        .maybeSingle();
      
      if (profileError || !profile) {
        return null;
      }

      // Filter notification by recipient_profile_id or recipient_role
      const { data, error } = await (simpleSupabase as any)
        .from("notifications")
        .select("id, recipient_profile_id, recipient_role, title, body, link_url, data, read_at, created_at")
        .eq("id", id)
        .or(`recipient_profile_id.eq.${profile.id},recipient_role.eq.${profile.role}`)
        .maybeSingle();
      
      if (error) throw error;
      return (data || null) as NotificationRow | null;
    },
  });
}

// Create notification for specific user (e.g., when booking appointments)
export function useCreateUserNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      recipientProfileId, 
      title, 
      body, 
      linkUrl, 
      notificationData 
    }: {
      recipientProfileId: string;
      title: string;
      body?: string;
      linkUrl?: string;
      notificationData?: unknown;
    }) => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await (simpleSupabase as any)
        .from("notifications")
        .insert({
          recipient_profile_id: recipientProfileId,
          recipient_role: null, // Specific to user, not role-based
          title,
          body,
          link_url: linkUrl,
          data: notificationData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Utility function to create common notification types
export const createNotificationHelpers = {
  // When a patient books an appointment with a professional
  appointmentBooked: async (professionalProfileId: string, patientName: string, serviceName: string, appointmentDate: string) => {
    const { data, error } = await (simpleSupabase as any)
      .from("notifications")
      .insert({
        recipient_profile_id: professionalProfileId,
        recipient_role: null,
        title: 'New appointment booked',
        body: `${patientName} has booked an appointment for ${serviceName} on ${appointmentDate}`,
        link_url: '/appointments',
        data: { type: 'appointment_booked', patientName, serviceName, appointmentDate }
      });
    
    if (error) throw error;
    return data;
  },

  // When a professional accepts/rejects an appointment
  appointmentStatusChanged: async (patientProfileId: string, professionalName: string, serviceName: string, status: 'accepted' | 'rejected', appointmentDate: string) => {
    const { data, error } = await (simpleSupabase as any)
      .from("notifications")
      .insert({
        recipient_profile_id: patientProfileId,
        recipient_role: null,
        title: `Appointment ${status}`,
        body: `Your appointment with ${professionalName} for ${serviceName} on ${appointmentDate} has been ${status}`,
        link_url: '/bookings',
        data: { type: 'appointment_status_changed', professionalName, serviceName, status, appointmentDate }
      });
    
    if (error) throw error;
    return data;
  },

  // When a reschedule request is made
  rescheduleRequested: async (professionalProfileId: string, patientName: string, serviceName: string, oldDate: string, newDate: string) => {
    const { data, error } = await (simpleSupabase as any)
      .from("notifications")
      .insert({
        recipient_profile_id: professionalProfileId,
        recipient_role: null,
        title: 'Reschedule request',
        body: `${patientName} has requested to reschedule ${serviceName} from ${oldDate} to ${newDate}`,
        link_url: '/appointments',
        data: { type: 'reschedule_requested', patientName, serviceName, oldDate, newDate }
      });
    
    if (error) throw error;
    return data;
  },

  // When a reschedule request is approved/rejected
  rescheduleResponse: async (patientProfileId: string, professionalName: string, serviceName: string, status: 'approved' | 'rejected', newDate?: string) => {
    const { data, error } = await (simpleSupabase as any)
      .from("notifications")
      .insert({
        recipient_profile_id: patientProfileId,
        recipient_role: null,
        title: `Reschedule ${status}`,
        body: status === 'approved' 
          ? `Your reschedule request for ${serviceName} with ${professionalName} has been approved. New date: ${newDate}`
          : `Your reschedule request for ${serviceName} with ${professionalName} has been rejected. Please choose another time.`,
        link_url: '/bookings',
        data: { type: 'reschedule_response', professionalName, serviceName, status, newDate }
      });
    
    if (error) throw error;
    return data;
  },

  // System-wide notifications for all users of a specific role
  systemNotification: async (role: 'patient' | 'professional' | 'admin', title: string, body: string, linkUrl?: string) => {
    const { data, error } = await (simpleSupabase as any)
      .from("notifications")
      .insert({
        recipient_profile_id: null,
        recipient_role: role,
        title,
        body,
        link_url: linkUrl,
        data: { type: 'system_notification', role }
      });
    
    if (error) throw error;
    return data;
  }
};

// Create notification (admin only)
export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      recipientProfileId, 
      recipientRole, 
      title, 
      body, 
      linkUrl, 
      notificationData 
    }: {
      recipientProfileId?: string;
      recipientRole?: "patient" | "professional" | "admin";
      title: string;
      body?: string;
      linkUrl?: string;
      notificationData?: unknown;
    }) => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUserId)
        .maybeSingle();
      
      if (profileError || profile?.role !== 'admin') {
        throw new Error("Only admins can create notifications");
      }

      const { data, error } = await (simpleSupabase as any)
        .from("notifications")
        .insert({
          recipient_profile_id: recipientProfileId || null,
          recipient_role: recipientRole || null,
          title,
          body,
          link_url: linkUrl,
          data: notificationData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Availability wishlist (notify when slots open for a service)
export function useWishlistStatus(serviceId?: number) {
  return useQuery({
    queryKey: ["wishlist", serviceId],
    enabled: Boolean(serviceId),
    queryFn: async () => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (!currentUserId || !serviceId) return { active: false } as { active: boolean };

      const { data: profile } = await simpleSupabase
        .from("profiles")
        .select("id")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (!profile) return { active: false } as { active: boolean };

      const { data, error } = await (simpleSupabase as any)
        .from("availability_wishlist")
        .select("id, active")
        .eq("patient_profile_id", profile.id)
        .eq("service_id", serviceId)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return { active: Boolean(data) } as { active: boolean };
    },
  });
}

export function useWishlistSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId }: { serviceId: number }) => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (!currentUserId) throw new Error("Sign in to save alerts");

      const { data: patientProfile, error: profileError } = await simpleSupabase
        .from("profiles")
        .select("id")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!patientProfile) throw new Error("Profile not found");

      // Upsert active subscription
      const { error } = await (simpleSupabase as any)
        .from("availability_wishlist")
        .upsert({ patient_profile_id: patientProfile.id, service_id: serviceId, active: true }, { onConflict: "patient_profile_id,service_id" });
      if (error) throw error;
      return true as const;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("You'll be notified when slots open");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message);
    }
  });
}

export function useWishlistUnsubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId }: { serviceId: number }) => {
      const { data: authData } = await simpleSupabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (!currentUserId) throw new Error("Sign in first");

      const { data: patientProfile } = await simpleSupabase
        .from("profiles")
        .select("id")
        .eq("user_id", currentUserId)
        .maybeSingle();
      if (!patientProfile) throw new Error("Profile not found");

      const { error } = await (simpleSupabase as any)
        .from("availability_wishlist")
        .update({ active: false })
        .eq("patient_profile_id", patientProfile.id)
        .eq("service_id", serviceId)
        .eq("active", true);
      if (error) throw error;
      return true as const;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Alert removed");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message);
    }
  });
}






















