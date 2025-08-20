import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { simpleSupabase } from "@/lib/simple-supabase";
import { toast } from "sonner";

export interface Profile {
  user_id: string;
  role: "patient" | "professional";
  name: string;
  bio?: string;
  avatar_url?: string;
  specialties?: string[];
  certifications?: string[];
  hourly_rate?: number;
  verified: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  duration_minutes: number;
  created_at: string;
}

export interface Slot {
  id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  patient_user_id: string;
  professional_user_id: string;
  service_id: string;
  slot_id: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  banner_url?: string;
  starts_at: string;
  location?: string;
  price: number;
  capacity?: number;
  created_at: string;
}

export interface Ticket {
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
      const { data, error } = await simpleSupabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });
}

export function useProfessional(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await simpleSupabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useServices(professionalId?: string) {
  return useQuery({
    queryKey: ["services", professionalId],
    queryFn: async () => {
      let q = simpleSupabase.from("services").select("*").order("created_at", { ascending: false });
      if (professionalId) q = q.eq("professional_id", professionalId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as Service[];
    },
  });
}

export function useSlots(professionalId: string) {
  return useQuery({
    queryKey: ["slots", professionalId],
    queryFn: async () => {
      const { data, error } = await simpleSupabase
        .from("availability_slots")
        .select("*")
        .eq("professional_id", professionalId)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data || []) as Slot[];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, slotId, professionalUserId, notes }: { serviceId: string; slotId: string; professionalUserId: string; notes?: string }) => {
      const { data: { user } } = await simpleSupabase.auth.getUser();
      if (!user) throw new Error("Sign in to book");
      const { data: slot, error: slotErr } = await simpleSupabase.from("availability_slots").select("*").eq("id", slotId).maybeSingle();
      if (slotErr) throw slotErr;
      if (!slot || slot.is_booked) throw new Error("Slot no longer available");
      const { data, error } = await simpleSupabase
        .from("bookings")
        .insert({
          patient_user_id: user.id,
          professional_user_id: professionalUserId,
          service_id: serviceId,
          slot_id: slotId,
          notes,
        })
        .select()
        .single();
      if (error) throw error;
      await simpleSupabase.from("availability_slots").update({ is_booked: true }).eq("id", slotId);
      return data as Booking;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Booking requested");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase.from("events").select("*").order("starts_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Event[];
    },
  });
}

export function useBuyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, quantity }: { eventId: string; quantity: number }) => {
      const { data: { user } } = await simpleSupabase.auth.getUser();
      if (!user) throw new Error("Sign in to buy tickets");
      const { data, error } = await simpleSupabase.from("tickets").insert({ event_id: eventId, user_id: user.id, quantity }).select().single();
      if (error) throw error;
      return data as Ticket;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); toast.success("Ticket purchased"); },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useBlogs() {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data, error } = await simpleSupabase.from("blog_posts").select("id, slug, title, cover_url, tags, created_at").eq("visibility", "published").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlogPost[];
    },
  });
}


