// Admin dashboard types
export interface AdminService {
  id: number;
  name: string;
  price_cents: number;
  professional_id: string;
  duration_min: number;
  professionals: {
    id: string;
    profile_id: string;
    profile: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface ServiceListItem {
  id: number;
  name: string;
  category: string;
  doctorName: string;
  doctorEmail: string;
  doctorAvatar: string;
  price: number;
  duration: string;
  mode: string;
  status: "pending" | "active" | "inactive";
  totalBookings: number;
  revenue: number;
  avgRating: number;
  lastBooking: string;
  lastUpdated: string;
  availabilityDetails?: {
    scheduleType: string;
    days: string[];
    timeSlots: Array<{ start: string; end: string }>;
  };
}

export interface AvailabilityJson {
  days?: string[];
  scheduleType?: string;
  customSchedules?: Record<string, {
    timeSlots?: Array<{ start: string; end: string }>;
    slots?: Array<{ start: string; end: string }>;
  }>;
  timeSlots?: Array<{ start: string; end: string }>;
  slots?: Array<{ start: string; end: string }>;
  numberOfSlots?: number;
}