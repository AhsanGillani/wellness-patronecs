import Header from "@/components/site/Header";
import { useState, useEffect, useMemo } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useProfiles, useProfessionals, useServices, useAppointments, useProfessionalServices, useProfessionalAppointments, useEventsByStatus, useAllBlogs } from "@/hooks/useMarketplace";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import {
  TrendingUp,
  Users,
  Stethoscope,
  FileText,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  X,
  CreditCard,
  Wallet
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

type AdminTab = "overview" | "users" | "professionals" | "services" | "events" | "blogs" | "earnings" | "withdrawals" | "reports" | "settings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [userModalTab, setUserModalTab] = useState<"profile" | "services">("profile");
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<typeof pros[0] | null>(null);
  const [professionalModalTab, setProfessionalModalTab] = useState<"profile" | "services">("profile");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [professionalToReject, setProfessionalToReject] = useState<typeof pros[0] | null>(null);
  const [professionalView, setProfessionalView] = useState<"verified" | "pending" | "rejected">("verified");
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    id: number;
    name: string;
    category: string;
    doctorName: string;
    doctorEmail: string;
    doctorAvatar: string;
    price: number;
    duration: string;
    mode: string;
    status: "active" | "pending" | "inactive";
    description: string;
    benefits: string;
    locationAddress: string;
    availableDays: string[];
    startTime: string;
    endTime: string;
    patientsServed: number;
    rating: number;
    createdAt: string;
    lastUpdated: string;
  } | null>(null);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceSortBy, setServiceSortBy] = useState<"newest" | "oldest" | "name" | "price">("newest");
  const [eventActionLoadingId, setEventActionLoadingId] = useState<number | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showBlogViewModal, setShowBlogViewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogBody, setBlogBody] = useState('');
  const [blogTags, setBlogTags] = useState([]);
  const [blogImage, setBlogImage] = useState(null);
  const [blogVisibility, setBlogVisibility] = useState('draft');

  // Query client for invalidating queries
  const queryClient = useQueryClient();
  
  // Database data
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useProfiles();
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: appointments, isLoading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const { data: blogs = [], isLoading: blogsLoading } = useAllBlogs();
  
  // Professional-specific data hooks
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const { data: professionalServices = [], isLoading: professionalServicesLoading } = useProfessionalServices(selectedProfessionalId || '');
  const { data: professionalAppointments = [], isLoading: professionalAppointmentsLoading } = useProfessionalAppointments(selectedProfessionalId || '');
  
  // Transform profiles to users format
  const [users, setUsers] = useState<Array<{ 
    id: string; 
      name: string; 
      email: string; 
      role: string; 
      phone: string;
    location: string;
      joinDate: string;
      lastActive: string;
  }>>([]);

  // Update users when profiles data changes
  useEffect(() => {
    if (profiles) {
      const transformedUsers = profiles.map(profile => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous User',
        email: profile.email || 'No email',
        role: profile.role,
        phone: profile.phone || 'No phone',
        location: profile.location || 'No location',
        joinDate: new Date(profile.created_at).toLocaleDateString(),
        lastActive: new Date(profile.updated_at).toLocaleDateString()
      }));
      setUsers(transformedUsers);
    }
  }, [profiles]);
  // Database professionals data
  const { data: professionalsData, isLoading: professionalsLoading, error: professionalsError } = useProfessionals();
  
  // Transform professionals data to match the expected format
  const [pros, setPros] = useState<Array<{ 
    id: string; 
      name: string; 
      profession: string;
      yearsOfExperience: string;
      specialization: string;
      email: string; 
      verification: "pending" | "verified" | "rejected";
      phone: string;
      address: string;
      joinDate: string;
      lastActive: string;
  }>>([]);

  // Update professionals when data changes
  useEffect(() => {
    if (professionalsData) {
      console.log('Professionals data:', professionalsData);
      const transformedProfessionals = professionalsData.map(profile => {
        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Anonymous Professional',
          profession: profile.specialization || 'Not specified',
          yearsOfExperience: profile.years_experience || '0',
          specialization: profile.specialization || 'Not specified',
          email: profile.email || 'No email',
          verification: (profile.verification_status as "pending" | "verified" | "rejected") || 'pending',
          phone: profile.phone || 'No phone',
          address: profile.location || 'No location',
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          lastActive: new Date(profile.updated_at).toLocaleDateString()
        };
      });
      console.log('Transformed professionals:', transformedProfessionals);
      setPros(transformedProfessionals);
    }
  }, [professionalsData]);



  const [servicesPending, setServicesPending] = useState(
    [
      { id: 201, provider: "Alex Morgan", name: "Nutrition Plan", submitted: "2025-03-20" },
      { id: 202, provider: "Jane Lee", name: "Therapy Session", submitted: "2025-03-22" }
    ] as Array<{ id: number; provider: string; name: string; submitted: string }>
  );

  // Transform real database services to AdminDashboard format
  const transformServicesToAdminFormat = (dbServices: any[], dbProfiles: any[], dbAppointments: any[]) => {
    console.log('transformServicesToAdminFormat called with:', { dbServices, dbProfiles });
    if (!dbServices || !dbProfiles) {
      console.log('No services or profiles data, returning empty array');
      return [];
    }
    
    return dbServices.map(service => {
      console.log('Processing service:', service);
      // Prefer nested professional.profile from services query; fallback to profiles list
      const nestedProfile = service.professionals?.profile || null;
      const professional = nestedProfile || dbProfiles.find(p => p.id === service.professional_id) || null;
      
      // Get professional name
      const doctorName = professional ? `Dr. ${professional.first_name || ''} ${professional.last_name || ''}`.trim() : 'Unknown Professional';
      const doctorEmail = professional?.email || 'No email';
      
      // Get category name
      const category = service.categories?.name || 'Uncategorized';
      
      // Determine status based on active field
      const status = service.active ? 'active' : 'inactive';
      
      // Convert price from cents to dollars
      const price = Math.round((service.price_cents || 0) / 100);
      
      // Convert duration from minutes to display format
      const duration = `${service.duration_min || 0} min`;
      
      // Get mode (In-person or Virtual)
      const mode = service.mode || 'Unknown';
      
      // Generate fallback avatar
      const doctorAvatar = professional?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctorName)}&background=random`;

      // Compute patients served from appointments for this service
      const patientsServed = (dbAppointments || []).filter((a: any) => a.service_id === service.id).length;
      // Compute average rating if available later; keep undefined-safe
      const rating = 0;
      
      // Availability and times are not yet modeled; omit placeholders
      const availableDays: string[] = [];
      const startTime = "";
      const endTime = "";
      
      return {
        id: service.id,
        name: service.name,
        category: category,
        doctorName: doctorName,
        doctorEmail: doctorEmail,
        doctorAvatar: doctorAvatar,
        price: price,
        duration: duration,
        mode: mode,
        status: status,
        description: service.description || 'No description available',
        benefits: Array.isArray(service.benefits) ? service.benefits.join(", ") : (typeof service.benefits === 'string' ? service.benefits : ''),
        locationAddress: service.location_address || (mode === 'Virtual' ? 'Virtual Session' : 'Location TBD'),
        availableDays: availableDays,
        startTime: startTime,
        endTime: endTime,
        patientsServed: patientsServed,
        rating: rating,
        createdAt: service.created_at ? new Date(service.created_at).toISOString().split('T')[0] : 'Unknown',
        lastUpdated: service.updated_at ? new Date(service.updated_at).toISOString().split('T')[0] : 'Unknown'
      };
    });
  };

  // All services from real database (transformed to AdminDashboard format)
  const allServices = useMemo(() => {
    console.log('AdminDashboard - services from database:', services);
    console.log('AdminDashboard - profiles from database:', profiles);
    
    // Handle loading states
    if (servicesLoading || profilesLoading) {
      console.log('Still loading data...');
      return [];
    }
    
    // Handle errors
    if (servicesError || profilesError) {
      console.error('Error loading data:', { servicesError, profilesError });
      return [];
    }
    
    const transformed = transformServicesToAdminFormat(services || [], profiles || [], appointments || []);
    console.log('AdminDashboard - transformed services:', transformed);
    return transformed;
  }, [services, profiles, appointments, servicesLoading, profilesLoading, servicesError, profilesError]);

  // All services from all doctors (keeping for now, will remove after testing)
  const [allServicesMockup, setAllServicesMockup] = useState(
    [
      {
        id: 1,
        name: "Nutrition Consultation",
        category: "Nutrition",
        doctorName: "Dr. Alex Morgan",
        doctorEmail: "alex.morgan@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec0?w=150&h=150&fit=crop&crop=face",
        price: 150,
        duration: "60 min",
        mode: "Virtual",
        status: "active",
        description: "Comprehensive nutrition assessment and personalized meal planning",
        benefits: "Weight management, improved energy, better digestion",
        locationAddress: "Virtual Session",
        availableDays: ["Monday", "Wednesday", "Friday"],
        startTime: "09:00 AM",
        endTime: "05:00 PM",
        patientsServed: 45,
        rating: 4.8,
        createdAt: "2024-12-15",
        lastUpdated: "2025-03-20"
      },
      {
        id: 2,
        name: "Cardiac Health Assessment",
        category: "Cardiology",
        doctorName: "Dr. Emily Davis",
        doctorEmail: "emily.davis@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1594824475544-3b0c0b2c0c0c?w=150&h=150&fit=crop&crop=face",
        price: 300,
        duration: "90 min",
        mode: "In-person",
        status: "active",
        description: "Comprehensive cardiac evaluation including ECG and stress test",
        benefits: "Early detection, prevention, peace of mind",
        locationAddress: "123 Medical Center Dr, Suite 200",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        startTime: "08:00 AM",
        endTime: "04:00 PM",
        patientsServed: 28,
        rating: 4.9,
        createdAt: "2024-11-20",
        lastUpdated: "2025-03-18"
      },
      {
        id: 3,
        name: "Therapy Session",
        category: "Mental Health",
        doctorName: "Dr. Jane Lee",
        doctorEmail: "jane.lee@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
        price: 120,
        duration: "50 min",
        mode: "In-person",
        status: "active",
        description: "Individual therapy sessions for anxiety, depression, and stress management",
        benefits: "Improved mental health, coping skills, self-awareness",
        locationAddress: "456 Wellness Ave, Floor 3",
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "10:00 AM",
        endTime: "06:00 PM",
        patientsServed: 67,
        rating: 4.7,
        createdAt: "2024-10-10",
        lastUpdated: "2025-03-25"
      },
      {
        id: 4,
        name: "Fitness Training",
        category: "Fitness",
        doctorName: "Dr. Mike Johnson",
        doctorEmail: "mike.johnson@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        price: 80,
        duration: "45 min",
        mode: "In-person",
        status: "active",
        description: "Personalized fitness training and workout plans",
        benefits: "Increased strength, flexibility, cardiovascular health",
        locationAddress: "789 Fitness Center Blvd",
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        startTime: "06:00 AM",
        endTime: "08:00 PM",
        patientsServed: 89,
        rating: 4.6,
        createdAt: "2024-09-15",
        lastUpdated: "2025-03-22"
      },
      {
        id: 5,
        name: "Meal Planning Service",
        category: "Nutrition",
        doctorName: "Dr. Sarah Chen",
        doctorEmail: "sarah.chen@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        price: 200,
        duration: "75 min",
        mode: "Virtual",
        status: "pending",
        description: "Customized meal plans based on dietary restrictions and health goals",
        benefits: "Structured eating, better nutrition, time savings",
        locationAddress: "Virtual Session",
        availableDays: ["Tuesday", "Thursday"],
        startTime: "11:00 AM",
        endTime: "03:00 PM",
        patientsServed: 23,
        rating: 4.5,
        createdAt: "2025-03-15",
        lastUpdated: "2025-03-15"
      },
      {
        id: 6,
        name: "Yoga Therapy",
        category: "Wellness",
        doctorName: "Dr. Priya Patel",
        doctorEmail: "priya.patel@wellness.com",
        doctorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        price: 95,
        duration: "60 min",
        mode: "Virtual",
        status: "active",
        description: "Therapeutic yoga sessions for stress relief and flexibility",
        benefits: "Stress reduction, improved flexibility, mental clarity",
        locationAddress: "321 Wellness Studio",
        availableDays: ["Monday", "Wednesday", "Friday", "Sunday"],
        startTime: "07:00 AM",
        endTime: "07:00 PM",
        patientsServed: 56,
        rating: 4.8,
        createdAt: "2024-08-20",
        lastUpdated: "2025-03-19"
      }
    ] as Array<{
      id: number;
      name: string;
      category: string;
      doctorName: string;
      doctorEmail: string;
      doctorAvatar: string;
      price: number;
      duration: string;
      mode: string;
      status: "active" | "pending" | "inactive";
      description: string;
      benefits: string;
      locationAddress: string;
      availableDays: string[];
      startTime: string;
      endTime: string;
      patientsServed: number;
      rating: number;
      createdAt: string;
      lastUpdated: string;
    }>
  );
  // Events data from database by status
  const { data: pendingEvents = [] } = useEventsByStatus("pending");
  const { data: approvedEventsDb = [] } = useEventsByStatus("approved");
  const { data: rejectedEventsDb = [] } = useEventsByStatus("rejected");
  const [reports, setReports] = useState(
    [
      { id: "RPT-5001", type: "content", subject: "Inappropriate post", status: "open", created: "2025-03-28" },
      { id: "RPT-5002", type: "user", subject: "Spam messages", status: "investigating", created: "2025-03-29" }
    ] as Array<{ id: string; type: string; subject: string; status: string; created: string }>
  );

  // Admin Events management
  type AdminEvent = {
    id: number;
    title: string;
    type?: string; // e.g., "Event" or "Session"
    category?: string;
    date: string; // YYYY-MM-DD or similar
    startTime?: string; // e.g., 05:00 PM
    endTime?: string;   // e.g., 06:00 PM
    time?: string; // legacy single time support
    host: string;
    status: "pending" | "approved" | "rejected";
    details?: string;
    summary?: string;
    agenda?: string[];
    registrationUrl?: string;
    imageUrl?: string;
    location?: string;
    ticketPrice?: number; // 0 for free
    rejectionReason?: string;
  };

  const [eventsView, setEventsView] = useState<"requests" | "approved" | "rejected">("requests");
  // Map DB rows to AdminEvent view model
  const mapEvent = (e: any): AdminEvent => ({
    id: e.id,
    title: e.title,
    type: e.type,
    category: e.category || undefined,
    date: e.date,
    startTime: e.start_time ? new Date(`1970-01-01T${e.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    endTime: e.end_time ? new Date(`1970-01-01T${e.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    time: undefined,
    host: e.host || (e.professionals?.profile ? `Dr. ${e.professionals.profile.first_name ?? ''} ${e.professionals.profile.last_name ?? ''}`.trim() : ""),
    status: e.status,
    details: e.details || undefined,
    summary: e.summary || undefined,
    agenda: Array.isArray(e.agenda) ? e.agenda : undefined,
    registrationUrl: e.registration_url || undefined,
    imageUrl: e.image_url || undefined,
    location: e.location || undefined,
    ticketPrice: typeof e.ticket_price_cents === 'number' ? Math.round(e.ticket_price_cents / 100) : undefined,
    rejectionReason: e.rejection_reason || undefined,
  });

  const eventRequests = pendingEvents.map(mapEvent);
  const approvedEvents = approvedEventsDb.map(mapEvent);
  const rejectedEvents = rejectedEventsDb.map(mapEvent);
  const [eventsDateFilter, setEventsDateFilter] = useState<"all" | "today">("all");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [showEventRejectModal, setShowEventRejectModal] = useState(false);
  const [eventRejectionReason, setEventRejectionReason] = useState("");

  // Withdrawals state and helpers
  type AdminWithdrawal = { id: string; date: string; professional: string; amount: number; method: "Bank" | "PayPal" | "Stripe"; status: "requested" | "approved" | "transferred" };
  const [withdrawalsView, setWithdrawalsView] = useState<"requests" | "approved">("requests");
  const [withdrawRequests, setWithdrawRequests] = useState<AdminWithdrawal[]>([
    { id: "WD-7005", date: "2025-04-02", professional: "Alex Morgan", amount: 480, method: "Bank", status: "requested" },
    { id: "WD-7006", date: "2025-04-03", professional: "Dr. Emily Davis", amount: 820, method: "Bank", status: "requested" }
  ]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<AdminWithdrawal[]>([
    { id: "WD-7003", date: "2025-03-29", professional: "Dr. Priya Patel", amount: 360, method: "PayPal", status: "approved" },
    { id: "WD-7004", date: "2025-03-30", professional: "Michael Chen", amount: 220, method: "Stripe", status: "transferred" }
  ]);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawal | null>(null);
  const payoutProfiles: Record<string, { method: "Bank" | "PayPal" | "Stripe"; details: Record<string, string> }> = {
    "Alex Morgan": { method: "Bank", details: { Bank: "Wells Fargo", "Account Name": "Alex Morgan", "Account No": "**** 4321", "Routing No": "121000248" } },
    "Dr. Emily Davis": { method: "Bank", details: { Bank: "Chase", "Account Name": "Emily Davis", "Account No": "**** 8899", "Routing No": "021000021" } },
    "Dr. Priya Patel": { method: "PayPal", details: { "PayPal Email": "priya.patel@example.com" } },
    "Michael Chen": { method: "Stripe", details: { "Stripe Account": "acct_1NXYZABC", "Reference": "Connected" } }
  };
  const openWithdrawalModal = (wd: AdminWithdrawal) => { setSelectedWithdrawal(wd); setShowWithdrawalModal(true); };
  const approveWithdrawal = (id: string) => {
    const item = withdrawRequests.find(w => w.id === id);
    if (!item) return;
    setWithdrawRequests(prev => prev.filter(w => w.id !== id));
    setApprovedWithdrawals(prev => [{ ...item, status: "approved" }, ...prev]);
    setShowWithdrawalModal(false);
  };
  const transferWithdrawal = (id: string) => {
    setApprovedWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: "transferred" } : w));
    // Persist a simple transfer record (optional)
    try {
      const list = JSON.parse(localStorage.getItem("wp_admin_transfers") || "[]");
      list.unshift({ id, at: new Date().toISOString() });
      localStorage.setItem("wp_admin_transfers", JSON.stringify(list));
    } catch {}
    setShowWithdrawalModal(false);
  };

  // Charts derived from database
  const lastSixMonthsLabels = useMemo(() => {
    const labels: string[] = [];
    const formatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      labels.push(formatter.format(d));
    }
    return labels;
  }, []);

  const chartData = useMemo(() => {
    const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    const keys: string[] = [];
    const base = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      keys.push(monthKey(d));
    }

    const init = Object.fromEntries(keys.map(k => [k, { users: 0, professionals: 0, services: 0, events: 0, revenue: 0 }]));

    // Users by created_at
    (profiles || []).forEach(p => {
      const d = new Date(p.created_at);
      const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (init[k]) {
        init[k].users += 1;
        if (p.role === 'professional') init[k].professionals += 1;
      }
    });

    // Services by created_at
    (services || []).forEach(s => {
      const d = new Date(s.created_at);
      const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (init[k]) init[k].services += 1;
    });

    // Events by date
    (approvedEvents || []).forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (init[k]) init[k].events += 1;
    });

    // Revenue from appointments.price_cents by appointment date
    (appointments || []).forEach(a => {
      if (!a.date) return;
      const d = new Date(a.date);
      const k = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
      if (init[k]) init[k].revenue += Math.round((a.price_cents || 0) / 100);
    });

    return keys.map((k, i) => ({
      month: lastSixMonthsLabels[i],
      users: init[k].users,
      professionals: init[k].professionals,
      services: init[k].services,
      events: init[k].events,
      revenue: init[k].revenue,
    }));
  }, [profiles, services, appointments, approvedEvents, lastSixMonthsLabels]);

  const userGrowthData = useMemo(() => {
    // Derive new users per month and approximate active users as cumulative
    let cumulative = 0;
    return chartData.map(row => {
      cumulative += row.users;
      return { month: row.month, newUsers: row.users, activeUsers: cumulative };
    });
  }, [chartData]);

  const serviceCategoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    (services || []).forEach((s: any) => {
      const name = s.categories?.name || 'Other';
      counts[name] = (counts[name] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const palette = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#22C55E", "#EAB308"];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value: Math.round((value / total) * 100), color: palette[i % palette.length] }));
  }, [services]);

  // Professional services and appointments data - now fetched from database

  // Patient services and appointments data
  const patientServices = [
    {
      patientId: 1,
      services: [
        {
          id: 1,
          serviceName: "Nutrition Consultation",
          doctorName: "Dr. Alex Morgan",
          date: "2025-03-25",
          time: "10:00 AM",
          duration: "60 min",
          amount: 150,
          status: "completed",
          type: "service"
        },
        {
          id: 2,
          serviceName: "Cardiology Checkup",
          doctorName: "Dr. Emily Davis",
          date: "2025-03-28",
          time: "2:30 PM",
          duration: "45 min",
          amount: 200,
          status: "scheduled",
          type: "appointment"
        }
      ]
    },
    {
      patientId: 2,
      services: [
        {
          id: 3,
          serviceName: "Therapy Session",
          doctorName: "Dr. Jane Lee",
          date: "2025-03-26",
          time: "11:00 AM",
          duration: "50 min",
          amount: 120,
          status: "completed",
          type: "service"
        }
      ]
    },
    {
      patientId: 3,
      services: [
        {
          id: 4,
          serviceName: "Fitness Assessment",
          doctorName: "Dr. Mike Wilson",
          date: "2025-03-20",
          time: "9:00 AM",
          duration: "30 min",
          amount: 80,
          status: "completed",
          type: "service"
        }
      ]
    }
  ];

  const approveProfessional = async (id: string) => {
    try {
      console.log('Approving professional with ID:', id);
      
      // First check if current user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        console.log('Current user role:', currentUserProfile?.role);
        
        if (currentUserProfile?.role !== 'admin') {
          console.error('Current user is not admin, cannot approve professionals');
          return;
        }
      }
      
      // First, let's check what the current profile looks like
      const { data: currentProfile, error: readError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('Current profile before update:', currentProfile);
      
      // Try updating the verification_status field
      const { data, error } = await supabase
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating verification_status:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        
        // If that fails, let's try updating a different field to see if it's a general issue
        console.log('Trying to update bio field as a test...');
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .update({ bio: 'Test update - ' + new Date().toISOString() })
          .eq('id', id)
          .select();
        
        console.log('Test update result:', { testData, testError });
        
        if (testError) {
          console.error('Even test update failed:', testError);
          return;
        } else {
          console.log('Test update succeeded, so the issue is with verification_status field');
        }
        return;
      }
      
      console.log('Successfully updated verification_status:', data);
      
      // Let's verify the update worked by reading the profile again
      const { data: updatedProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('Profile after update:', updatedProfile);
      
      // Update both local states to reflect the change immediately
      setPros(prev => prev.map(p => p.id === id ? { ...p, verification: "verified" } : p));
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'professional' } : u));
      
      // Invalidate and refetch the profiles data to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
      await queryClient.invalidateQueries({ queryKey: ["professionals"] });
      
      console.log('Professional approved successfully!');
    } catch (error) {
      console.error('Error approving professional:', error);
    }
  };
  const openRejectionModal = (professional: typeof pros[0]) => {
    setProfessionalToReject(professional);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const rejectProfessional = async (id: string) => {
    if (rejectionReason.trim()) {
      try {
        // Update the profiles table verification_status
        const { data, error } = await supabase
          .from('profiles')
          .update({ verification_status: 'rejected' })
          .eq('id', id)
          .select();
        
        if (error) {
          console.error('Error rejecting professional:', error);
          console.error('Error details:', error.message, error.details, error.hint);
          return;
        }
        
        console.log('Successfully updated database:', data);
        
        // Update both local states to reflect the change immediately
      setPros(prev => prev.map(p => p.id === id ? { ...p, verification: "rejected" } : p));
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'professional' } : u));
        
        // Invalidate and refetch the profiles data to ensure consistency
        await queryClient.invalidateQueries({ queryKey: ["profiles"] });
        await queryClient.invalidateQueries({ queryKey: ["professionals"] });
        
        console.log('Professional rejected successfully!');
        
      setShowRejectionModal(false);
      setRejectionReason("");
      setProfessionalToReject(null);
      } catch (error) {
        console.error('Error rejecting professional:', error);
      }
    }
  };

  const approveService = (id: number) => setServicesPending(prev => prev.filter(s => s.id !== id));
  const cancelEvent = (id: number) => {
    // Events data comes from queries, not local state - we'd need to call a mutation here
    console.log('Cancel event:', id);
  };
  const closeReport = (id: string) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'closed' } : r));

  const openUserModal = (user: typeof users[0]) => {
    setSelectedUser(user);
    setUserModalTab("profile");
    setShowUserModal(true);
  };

  const getUserServices = (userId: number) => {
    const userServiceData = patientServices.find(ps => ps.patientId === userId);
    return userServiceData ? userServiceData.services : [];
  };

  const openProfessionalModal = (professional: typeof pros[0]) => {
    setSelectedProfessional(professional);
    setSelectedProfessionalId(professional.id);
    setProfessionalModalTab("profile");
    setShowProfessionalModal(true);
  };

  const getProfessionalServices = (professionalId: string) => {
    // This will be replaced with real data from useProfessionalServices hook
    return [];
  };

  const getProfessionalAppointments = (professionalId: string) => {
    // This will be replaced with real data from useProfessionalAppointments hook
    return [];
  };

  const renderOverview = () => {
    if (profilesLoading) {
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100 animate-pulse">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    const totalUsers = users.length;
    const totalProfessionals = users.filter(u => u.role === 'professional').length;
    const totalPatients = users.filter(u => u.role === 'patient').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;
    const openReports = reports.filter(r => r.status !== "closed").length;
    const visitorsLastMonth = chartData.length > 0 ? chartData[chartData.length - 1].users : 0;

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50"><Users className="w-6 h-6 text-blue-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Professionals</p>
                <p className="text-2xl font-bold text-gray-900">{totalProfessionals}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50"><Stethoscope className="w-6 h-6 text-purple-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50"><Users className="w-6 h-6 text-green-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-900">{servicesLoading ? '...' : (services?.length || 0)}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50"><Settings className="w-6 h-6 text-indigo-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointmentsLoading ? '...' : (appointments?.length || 0)}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50"><CalendarDays className="w-6 h-6 text-amber-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Visitors (this month)</p>
                <p className="text-2xl font-bold text-gray-900">{visitorsLastMonth}</p>
              </div>
              <div className="p-3 rounded-full bg-rose-50"><Activity className="w-6 h-6 text-rose-600" /></div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Growth Trends Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Growth Trends
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="professionals" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="services" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="events" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Monthly Revenue
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth, Visitors and Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                User Growth
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="activeUsers" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Visitors Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                Visitors
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" name="Visitors" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Service Categories Chart */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-600" />
                Service Categories
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={serviceCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border">
            <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Upcoming Events</div>
            <div>
              {(approvedEvents || []).map(ev => (
                <div key={ev.id} className="px-6 py-4 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{ev.title}</div>
                    <div className="text-sm text-gray-600">{ev.date}{ev.startTime ? ` • ${ev.startTime}` : ''}{ev.host ? ` • Host: ${ev.host}` : ''}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${ev.status === 'rejected' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'}`}>{ev.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border">
            <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Recent Reports</div>
            <div>
              {reports.slice(0, 5).map(r => (
                <div key={r.id} className="px-6 py-4 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{r.subject}</div>
                    <div className="text-sm text-gray-600 uppercase">{r.type} • {r.created}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderProfessionalModal = () => {
    if (!selectedProfessional) return null;
    
    // Use the data from component-level hooks
    const servicesLoading = professionalServicesLoading;
    const appointmentsLoading = professionalAppointmentsLoading;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Professional Details: {selectedProfessional.name}</h2>
            <button 
              onClick={() => setShowProfessionalModal(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setProfessionalModalTab("profile")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                professionalModalTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setProfessionalModalTab("services")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                professionalModalTab === "services"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Services & Appointments ({professionalServices.length} services, {professionalAppointments.length} appointments)
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
            {professionalModalTab === "profile" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-gray-900">{selectedProfessional.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedProfessional.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{selectedProfessional.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                    <p className="text-gray-900">{selectedProfessional.profession}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <p className="text-gray-900">{selectedProfessional.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      selectedProfessional.verification === 'verified' ? 'bg-emerald-100 text-emerald-800' : 
                      selectedProfessional.verification === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedProfessional.verification}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <p className="text-gray-900">{selectedProfessional.specialization}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <p className="text-gray-900">{selectedProfessional.address}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <p className="text-gray-900">{selectedProfessional.joinDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Active</label>
                    <p className="text-gray-900">{selectedProfessional.lastActive}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Services Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
                  {servicesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading services...</p>
                    </div>
                  ) : professionalServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No services found for this professional.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {professionalServices.map((service: any) => (
                        <div key={service.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{service.name}</h4>
                              <p className="text-sm text-gray-600">Category: {service.categories?.name || 'Uncategorized'}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              service.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.active ? 'active' : 'inactive'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <p className="text-gray-900 font-medium">${(service.price_cents / 100).toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="text-gray-900">{service.duration_min} min</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Mode:</span>
                              <p className="text-gray-900">{service.mode}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Created:</span>
                              <p className="text-gray-900">{new Date(service.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointments Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading appointments...</p>
                    </div>
                  ) : professionalAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments found for this professional.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {professionalAppointments.map((appointment: any) => (
                        <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.services?.name || 'Unknown Service'}</h4>
                              <p className="text-sm text-gray-600">Patient: {appointment.profiles?.first_name} {appointment.profiles?.last_name}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p className="text-gray-900">{appointment.date}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Time:</span>
                              <p className="text-gray-900">{appointment.start_time} - {appointment.end_time}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <p className="text-gray-900 capitalize">{appointment.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (profilesLoading) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 rounded-lg border" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        </div>
      );
    }

    if (profilesError) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 rounded-lg border" />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-8">
            <div className="text-center text-red-600">
              <p>Error loading users: {profilesError.message}</p>
            </div>
          </div>
        </div>
      );
    }

    const filtered = users.filter(u => [u.name, u.email, u.role].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 rounded-lg border" />
            </div>
            <div className="text-sm text-gray-600">
              Total Users: {users.length}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          {filtered.map(u => (
            <div key={u.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3 font-medium text-gray-900">{u.name}</div>
              <div className="md:col-span-3 text-gray-700 break-all">{u.email}</div>
              <div className="md:col-span-2 text-gray-700 capitalize">{u.role}</div>
                <div className="md:col-span-2 text-gray-700 text-sm">{u.location}</div>
              <div className="md:col-span-2 flex gap-2 justify-center">
                <button 
                  onClick={() => openUserModal(u)} 
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">No users found.</div>}
        </div>
      </div>
    );
  };

  const renderPros = () => {
    if (professionalsLoading) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b text-sm font-medium text-gray-900">Loading Professionals...</div>
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading professionals data...</p>
            </div>
          </div>
        </div>
      );
    }

    if (professionalsError) {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b text-sm font-medium text-gray-900">Error Loading Professionals</div>
            <div className="px-6 py-8 text-center text-red-600">
              <p>Error loading professionals: {professionalsError.message}</p>
            </div>
          </div>
        </div>
      );
    }

    console.log('All pros:', pros);
    console.log('Professional view:', professionalView);
    
    const verifiedPros = pros.filter(p => p.verification === "verified");
    const pendingPros = pros.filter(p => p.verification === "pending");
    const rejectedPros = pros.filter(p => p.verification === "rejected");
    
    console.log('Verified pros:', verifiedPros);
    console.log('Pending pros:', pendingPros);
    console.log('Rejected pros:', rejectedPros);
    
    const currentPros = professionalView === "verified" ? verifiedPros : 
                       professionalView === "pending" ? pendingPros : rejectedPros;
    
    return (
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setProfessionalView("verified")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                professionalView === "verified"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Active Professionals ({verifiedPros.length})
            </button>
            <button
              onClick={() => setProfessionalView("pending")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                professionalView === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Join Requests ({pendingPros.length})
            </button>
            <button
              onClick={() => setProfessionalView("rejected")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                professionalView === "rejected"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Rejected ({rejectedPros.length})
            </button>
          </div>

          {/* Professionals Table */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {professionalView === "verified" ? "Active Professionals" : 
               professionalView === "pending" ? "Join Requests" : "Rejected Professionals"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {professionalView === "verified" 
                ? "Professionals who are verified and actively providing services on the platform"
                : professionalView === "pending"
                ? "New professionals requesting to join the platform and awaiting verification"
                : "Professionals whose applications were rejected and are not allowed on the platform"
              }
            </p>
              </div>
              <div className="text-sm text-gray-600">
                Total: {currentPros.length} professionals
              </div>
            </div>
          </div>
          
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-3">Name & Email</div>
            <div className="col-span-2">Profession</div>
            <div className="col-span-2">Experience</div>
            <div className="col-span-2">Specialization</div>
            <div className="col-span-3 text-center">
              {professionalView === "verified" ? "Status" : 
               professionalView === "pending" ? "Actions" : "Status"}
            </div>
          </div>
          
          {currentPros.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              {professionalView === "verified" 
                ? "No active professionals found." 
                : professionalView === "pending"
                ? "No join requests found."
                : "No rejected professionals found."
              }
            </div>
          ) : (
            currentPros.map(p => (
              <div key={p.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-3">
                  <h4 className="font-medium text-gray-900">{p.name}</h4>
                  <p className="text-sm text-gray-600">{p.email}</p>
                </div>
                <div className="md:col-span-2 text-gray-700">{p.profession}</div>
                <div className="md:col-span-2 text-gray-700">{p.yearsOfExperience} years</div>
                <div className="md:col-span-2 text-gray-700 text-sm">{p.specialization}</div>
                <div className="md:col-span-3 flex justify-end items-center pr-0">
                  {professionalView === "verified" ? (
                    <>
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                      <button 
                        onClick={() => openProfessionalModal(p)} 
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-2"
                      >
                        View
                      </button>
                    </>
                  ) : professionalView === "pending" ? (
                    <>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          p.verification === 'verified' ? 'bg-emerald-100 text-emerald-800' : 
                          p.verification === 'rejected' ? 'bg-rose-100 text-rose-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.verification}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openProfessionalModal(p)} 
                            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => approveProfessional(p.id)} 
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button 
                            onClick={() => openRejectionModal(p)} 
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-800">
                        Rejected
                      </span>
                      <button 
                        onClick={() => openProfessionalModal(p)} 
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-2"
                      >
                        View
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    const filteredServices = getFilteredServices();
    
    return (
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Total Services</p>
            <p className="text-2xl font-bold text-gray-900">{servicesLoading ? '...' : (services?.length || 0)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Active Services</p>
            <p className="text-2xl font-bold text-emerald-600">{servicesLoading ? '...' : (services?.filter(s => s.active).length || 0)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Total Appointments</p>
            <p className="text-2xl font-bold text-amber-600">{appointmentsLoading ? '...' : (appointments?.length || 0)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-blue-600">{servicesLoading ? '...' : (new Set(services?.map(s => s.categories?.name).filter(Boolean)).size || 0)}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={serviceSearchQuery}
                onChange={(e) => setServiceSearchQuery(e.target.value)}
                placeholder="Search services, doctors, or categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={serviceCategoryFilter}
              onChange={(e) => setServiceCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <select
              value={serviceStatusFilter}
              onChange={(e) => setServiceStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={serviceSortBy}
              onChange={(e) => setServiceSortBy(e.target.value as "newest" | "oldest" | "name" | "price")}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="price">Price High-Low</option>
            </select>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-3">Service & Doctor</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Timing & Availability</div>
            <div className="col-span-2">Pricing & Stats</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>
          
          {filteredServices.map(service => (
            <div key={service.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Service & Doctor */}
              <div className="md:col-span-3">
                <div className="flex items-center gap-3">
                  <img src={service.doctorAvatar} alt={service.doctorName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-600">{service.doctorName}</div>
                    <div className="text-xs text-gray-500">{service.doctorEmail}</div>
                  </div>
                </div>
              </div>
              
              {/* Category */}
              <div className="md:col-span-2">
                <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {service.category}
                </span>
                <div className="text-xs text-gray-500 mt-1">{service.mode}</div>
              </div>
              
              {/* Timing & Availability */}
              <div className="md:col-span-2">
                <div className="text-sm text-gray-900">{service.duration}</div>
                <div className="text-xs text-gray-500">
                  {service.availableDays.slice(0, 2).join(", ")}
                  {service.availableDays.length > 2 && "..."}
                </div>
                <div className="text-xs text-gray-500">
                  {service.startTime} - {service.endTime}
                </div>
              </div>
              
              {/* Pricing & Stats */}
              <div className="md:col-span-2">
                <div className="font-semibold text-gray-900">${service.price}</div>
                <div className="text-xs text-gray-500">
                  {service.patientsServed} patients • ⭐ {service.rating}
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(service.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {/* Status */}
              <div className="md:col-span-2">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getServiceStatusBadge(service.status)}`}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(service.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              {/* Actions */}
              <div className="md:col-span-1 flex justify-center">
                <button
                  onClick={() => openServiceModal(service)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {filteredServices.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No services match your filters.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const sortApproved = (list: AdminEvent[]) =>
      list.slice().sort((a, b) => {
        const aTop = eventsDateFilter === "today" && a.date === todayStr ? -1 : 0;
        const bTop = eventsDateFilter === "today" && b.date === todayStr ? -1 : 0;
        if (aTop !== bTop) return aTop - bTop;
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      });

    const openEventDetails = (ev: AdminEvent) => {
      setSelectedEvent(ev);
      setShowEventModal(true);
    };

    const approveEvent = async (id: number) => {
      try {
        setEventActionLoadingId(id);
        const { error } = await supabase.from('events').update({ status: 'approved' }).eq('id', id);
        if (error) {
          console.error('Approve event failed:', error);
          alert(`Failed to approve event: ${error.message}`);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ['events', 'pending'] });
        await queryClient.invalidateQueries({ queryKey: ['events', 'approved'] });
      setShowEventModal(false);
      } finally {
        setEventActionLoadingId(null);
      }
    };

    const openRejectEvent = (ev: AdminEvent) => {
      setSelectedEvent(ev);
      setEventRejectionReason("");
      setShowEventRejectModal(true);
    };

    const rejectEvent = async () => {
      if (!selectedEvent) return;
      try {
        setEventActionLoadingId(selectedEvent.id);
        const update: Record<string, unknown> = { status: 'rejected' };
        if (eventRejectionReason?.trim()) update.rejection_reason = eventRejectionReason.trim();
        const { error } = await supabase.from('events').update(update).eq('id', selectedEvent.id);
        if (error) {
          console.error('Reject event failed:', error);
          alert(`Failed to reject event: ${error.message}`);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ['events', 'pending'] });
        await queryClient.invalidateQueries({ queryKey: ['events', 'approved'] });
        await queryClient.invalidateQueries({ queryKey: ['events', 'rejected'] });
      setShowEventRejectModal(false);
      setShowEventModal(false);
      } finally {
        setEventActionLoadingId(null);
      }
    };

    const RequestsTab = () => (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b text-sm font-medium text-gray-900">Event Requests</div>
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Host</div>
          <div className="col-span-2">Schedule</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {eventRequests.map(ev => (
          <div key={ev.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 font-medium text-gray-900">{ev.title}</div>
            <div className="md:col-span-3 text-gray-700">{ev.host}</div>
            <div className="md:col-span-2 text-gray-700">{ev.date}{ev.startTime ? ` • ${ev.startTime}` : ''}</div>
            <div className="md:col-span-2 md:text-right flex md:justify-end gap-2 items-center">
              <button onClick={() => openEventDetails(ev)} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700" disabled={eventActionLoadingId === ev.id}>View</button>
              <button onClick={() => approveEvent(ev.id)} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 disabled:opacity-60" disabled={eventActionLoadingId === ev.id}>Approve</button>
              <button onClick={() => openRejectEvent(ev)} className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700 disabled:opacity-60" disabled={eventActionLoadingId === ev.id}>Reject</button>
            </div>
          </div>
        ))}
        {eventRequests.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">No event requests.</div>}
      </div>
    );

    const ApprovedTab = () => {
      const filtered = eventsDateFilter === "today"
        ? approvedEvents.filter(ev => ev.date === todayStr)
        : approvedEvents;
      const sorted = sortApproved(filtered);
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <select value={eventsDateFilter} onChange={(e) => setEventsDateFilter(e.target.value as "all" | "today")} className="rounded-lg border px-3 py-2">
                <option value="all">All</option>
                <option value="today">Today</option>
              </select>
              {eventsDateFilter === "today" && (
                <span className="text-sm text-gray-600">Today's activity first</span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
              <div className="col-span-5">Title</div>
              <div className="col-span-3">Host</div>
              <div className="col-span-2">Schedule</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {sorted.map(ev => (
              <div key={ev.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5 font-medium text-gray-900">{ev.title}</div>
                <div className="md:col-span-3 text-gray-700">{ev.host}</div>
                <div className="md:col-span-2 text-gray-700">{ev.date}{ev.startTime ? ` • ${ev.startTime}` : ''}</div>
                <div className="md:col-span-2 md:text-right flex md:justify-end gap-2 items-center">
                  <button onClick={() => openEventDetails(ev)} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">View</button>
                </div>
              </div>
            ))}
            {sorted.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">No approved events.</div>}
          </div>
        </div>
      );
    };

    const RejectedTab = () => (
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
          <div className="col-span-5">Title</div>
          <div className="col-span-3">Host</div>
          <div className="col-span-2">Schedule</div>
          <div className="col-span-2 text-right">Reason</div>
        </div>
        {rejectedEvents.map(ev => (
          <div key={ev.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 font-medium text-gray-900">{ev.title}</div>
            <div className="md:col-span-3 text-gray-700">{ev.host}</div>
            <div className="md:col-span-2 text-gray-700">{ev.date}{ev.startTime ? ` • ${ev.startTime}` : ''}</div>
            <div className="md:col-span-2 md:text-right text-sm text-gray-700">{(ev.rejectionReason || ev.summary || ev.details) ? (ev.rejectionReason || ev.summary || ev.details) : "—"}</div>
          </div>
        ))}
        {rejectedEvents.length === 0 && <div className="px-6 py-10 text-center text-sm text-gray-500">No rejected events.</div>}
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Events tabs */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => setEventsView("requests")} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${eventsView === "requests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Requests ({eventRequests.length})</button>
            <button onClick={() => setEventsView("approved")} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${eventsView === "approved" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Approved ({approvedEvents.length})</button>
            <button onClick={() => setEventsView("rejected")} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${eventsView === "rejected" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Rejected ({rejectedEvents.length})</button>
          </div>
        </div>

        {eventsView === "requests" && <RequestsTab />}
        {eventsView === "approved" && <ApprovedTab />}
        {eventsView === "rejected" && <RejectedTab />}

        {/* Event details modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Title</div>
                    <div className="font-medium text-gray-900">{selectedEvent.title}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Type</div>
                    <div className="font-medium text-gray-900">{selectedEvent.type || "Event"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Category</div>
                    <div className="font-medium text-gray-900">{selectedEvent.category || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Host</div>
                    <div className="font-medium text-gray-900">{selectedEvent.host}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Schedule</div>
                    <div className="font-medium text-gray-900">{selectedEvent.date} • {(selectedEvent.startTime || selectedEvent.time) || "--:-- --"}{selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ""}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium text-gray-900">{selectedEvent.location || "—"}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Summary</div>
                  <div className="text-gray-800 text-sm">{selectedEvent.summary || "—"}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="text-sm text-gray-600">Details</div>
                    <div className="text-gray-800 text-sm">{selectedEvent.details || "—"}</div>
                    {Array.isArray((selectedEvent as any).agenda) && (selectedEvent as any).agenda.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600">Agenda</div>
                        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                          {(selectedEvent as any).agenda.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cover Image</div>
                    {selectedEvent.imageUrl ? (
                      <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="mt-2 w-full h-40 object-cover rounded-lg border" />
                    ) : (
                      <div className="mt-2 text-xs text-gray-500">No image provided</div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Registration URL</div>
                        {selectedEvent.registrationUrl ? (
                          <a href={selectedEvent.registrationUrl} target="_blank" rel="noreferrer" className="text-blue-700 text-sm break-all underline">{selectedEvent.registrationUrl}</a>
                        ) : (
                          <div className="text-xs text-gray-500">—</div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Ticket Price ($)</div>
                        <div className="text-gray-800 text-sm">{typeof selectedEvent.ticketPrice === 'number' ? selectedEvent.ticketPrice : 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* View-only modal: actions removed per request */}
            </div>
          </div>
        )}

        {/* Event rejection reason modal */}
        {showEventRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reject Event</h3>
                <button onClick={() => setShowEventRejectModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Please provide a reason for rejection:</p>
                <textarea value={eventRejectionReason} onChange={(e) => setEventRejectionReason(e.target.value)} placeholder="Enter rejection reason..." className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowEventRejectModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={rejectEvent} disabled={!eventRejectionReason.trim()} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed">Reject Event</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlogs = () => {
    const BlogsList = () => {
      const { data: blogs, isLoading, error } = useAllBlogs();
      const [activeTab, setActiveTab] = useState('all');
      
      if (isLoading) return <div className="text-center py-8">Loading blogs...</div>;
      if (error) return <div className="text-center py-8 text-red-600">Error loading blogs: {error.message}</div>;
      if (!blogs || blogs.length === 0) return <div className="text-center py-8 text-gray-500">No blogs found. Create your first blog!</div>;
      
      const filteredBlogs = blogs.filter(blog => {
        if (activeTab === 'all') return true;
        return blog.visibility === activeTab;
      });
      
      return (
        <div className="space-y-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'all'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({blogs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('draft')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'draft'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Draft ({blogs?.filter(b => b.visibility === 'draft').length || 0})
            </button>
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'published'
                  ? 'text-violet-600 border-b-2 border-violet-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Published ({blogs?.filter(b => b.visibility === 'published').length || 0})
            </button>
          </div>
          
          <div className="grid gap-4">
            {/* Header Row */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-medium text-gray-700">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Slug</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Image</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
            
            {/* Blog Rows */}
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Name */}
                  <div className="col-span-3">
                    <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                  </div>
                  
                  {/* Date */}
                  <div className="col-span-2 text-sm text-gray-600">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  
                  {/* Slug */}
                  <div className="col-span-2 text-sm text-gray-600 font-mono">
                    {blog.slug}
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      blog.visibility === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.visibility}
                    </span>
                  </div>
                  
                  {/* Image */}
                  <div className="col-span-2">
                    {blog.cover_url ? (
                      <img 
                        src={blog.cover_url.startsWith('data:') ? blog.cover_url : `data:image/*;base64,${blog.cover_url}`}
                        alt={blog.title} 
                        className="w-16 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setSelectedBlog(blog);
                          setShowBlogViewModal(true);
                        }}
                        className="px-3 py-1 text-xs bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition-colors"
                      >
                        Preview
                      </button>
                      {(() => {
                        console.log('Rendering actions for blog:', { id: blog.id, title: blog.title, visibility: blog.visibility });
                        return blog.visibility === 'draft' ? (
                          <button
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('blog_posts')
                                  .update({ visibility: 'published' })
                                  .eq('id', blog.id);
                                if (error) throw error;
                                alert('Blog published successfully!');
                                queryClient.invalidateQueries({ queryKey: ['all-blogs'] });
                              } catch (error) {
                                console.error('Error publishing blog:', error);
                                alert('Failed to publish blog: ' + error.message);
                              }
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Publish
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const BlogCreateForm = () => {
      const [title, setTitle] = useState('');
      const [slug, setSlug] = useState('');
      const [bodyHtml, setBodyHtml] = useState('');
      const [tags, setTags] = useState([]);
      const [tagInput, setTagInput] = useState('');
      const [image, setImage] = useState(null);
      const [coverUrl, setCoverUrl] = useState(null);
      const [submitting, setSubmitting] = useState(false);
      
      // Auto-generate slug from title
      useEffect(() => {
        if (title) {
          const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          // Add timestamp to ensure uniqueness
          const timestamp = Date.now();
          const uniqueSlug = `${baseSlug}-${timestamp}`;
          setSlug(uniqueSlug);
        }
      }, [title]);
      
      const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
          e.preventDefault();
          if (!tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
          }
          setTagInput('');
        }
      };
      
      const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
      };
      
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setImage(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            setCoverUrl(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      
      const onSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !slug.trim() || !bodyHtml.trim() || !coverUrl) {
          alert('Please fill in all required fields: Title, Content, and Image are required');
          return;
        }
        setSubmitting(true);
        try {
          const { data: authData } = await supabase.auth.getUser();
          const author_user_id = authData?.user?.id ?? null;
          const { error } = await supabase
            .from('blog_posts')
            .insert({ title: title.trim(), slug: slug.trim(), body: bodyHtml.trim(), tags, visibility: 'draft', author_user_id, cover_url: coverUrl });
          if (error) throw error;
          
          alert('Blog post created successfully as draft!');
          setShowBlogModal(false);
          
          // Force refetch the blogs data
          await queryClient.invalidateQueries({ queryKey: ['all-blogs'] });
          queryClient.refetchQueries({ queryKey: ['all-blogs'] });
          
          setTitle("");
          setSlug("");
          setBodyHtml("");
          setTags([]);
          setImage(null);
          setCoverUrl(null);
        } catch (error) {
          console.error('Error creating blog post:', error);
          
          // Handle specific error types
          if (error.code === '23505' && error.message.includes('blog_posts_slug_unique')) {
            alert('A blog with this title already exists. Please use a different title.');
          } else {
            alert('Failed to create blog post: ' + error.message);
          }
        } finally {
          setSubmitting(false);
        }
      };
      
      return (
        <div className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                placeholder="Enter blog title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input 
                value={slug} 
                readOnly 
                placeholder="Slug (auto-generated)" 
                className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-50 text-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-200" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags *</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type tag and press Enter (at least one tag required)"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                required={tags.length === 0}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-violet-100 text-violet-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-violet-600 hover:text-violet-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                required
              />
              {coverUrl && (
                <div className="mt-2">
                  <img 
                    src={coverUrl} 
                    alt="Preview" 
                    className="w-32 h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <ReactQuill
                value={bodyHtml}
                onChange={setBodyHtml}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ align: [] }],
                    [{ color: [] }, { background: [] }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
                className="h-64 mb-12"
                placeholder="Write your blog content..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowBlogModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !slug.trim() || !bodyHtml.trim() || !coverUrl || tags.length === 0}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Blog as Draft'}
              </button>
            </div>
          </form>
        </div>
      );
    };
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Blogs</h3>
          <button onClick={() => setShowBlogModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">New Blog</button>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <BlogsList />
        </div>
        {showBlogModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Blog</h3>
                <button onClick={() => setShowBlogModal(false)} className="text-gray-500">Close</button>
              </div>
              <BlogCreateForm />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReports = () => (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
        <div className="col-span-3">Report ID</div>
        <div className="col-span-3">Type</div>
        <div className="col-span-4">Subject</div>
        <div className="col-span-2 text-right">Status</div>
      </div>
      {reports.map(r => (
        <div key={r.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-3 font-medium text-gray-900">{r.id}</div>
          <div className="md:col-span-3 text-gray-700 uppercase">{r.type}</div>
          <div className="md:col-span-4 text-gray-700">{r.subject}</div>
          <div className="md:col-span-2 md:text-right flex md:justify-end gap-2 items-center">
            <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">{r.status}</span>
            {r.status !== 'closed' && (
              <button onClick={() => closeReport(r.id)} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700">Close</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm text-gray-700">
            Require professional verification
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-700">
            Allow public event listings
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-700">
            Enable content reports
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between text-sm text-gray-700">
            Two-factor authentication
            <input type="checkbox" className="rounded" />
          </label>
          <label className="flex items-center justify-between text-sm text-gray-700">
            Auto suspend on multiple reports
            <input type="checkbox" className="rounded" />
          </label>
        </div>
      </div>
    </div>
  );

  // Earnings tab
  const renderEarnings = () => {
    // Aggregate mock earnings from chartData
    const totalRevenue = chartData.reduce((s, m) => s + m.revenue, 0);
    const totalUsers = chartData[chartData.length - 1]?.users ?? 0;
    const totalProfessionals = chartData[chartData.length - 1]?.professionals ?? 0;
    const totalServices = chartData[chartData.length - 1]?.services ?? 0;

    const transactions = [
      { id: "TX-10021", date: "2025-04-01", user: "Sarah Johnson", professional: "Alex Morgan", service: "Meal Planning", amount: 200, fee: 20, net: 180, method: "Card" },
      { id: "TX-10020", date: "2025-03-30", user: "Michael Chen", professional: "Dr. Emily Davis", service: "Cardiac Assessment", amount: 300, fee: 30, net: 270, method: "UPI" },
      { id: "TX-10019", date: "2025-03-29", user: "John Doe", professional: "Dr. Priya Patel", service: "Yoga Therapy", amount: 95, fee: 9.5, net: 85.5, method: "Card" }
    ];

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Total Revenue (YTD)</p>
            <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Professionals</p>
            <p className="text-2xl font-bold text-gray-900">{totalProfessionals}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Services</p>
            <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b text-sm font-medium text-gray-900">Recent Transactions</div>
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-2">Txn ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">User</div>
            <div className="col-span-2">Professional</div>
            <div className="col-span-2">Service</div>
            <div className="col-span-2 text-right">Amount / Net</div>
          </div>
          {transactions.map(tx => (
            <div key={tx.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-2 font-medium text-gray-900">{tx.id}</div>
              <div className="md:col-span-2 text-gray-700">{tx.date}</div>
              <div className="md:col-span-2 text-gray-700">{tx.user}</div>
              <div className="md:col-span-2 text-gray-700">{tx.professional}</div>
              <div className="md:col-span-2 text-gray-700">{tx.service}</div>
              <div className="md:col-span-2 md:text-right text-sm text-gray-800">${tx.amount} • <span className="text-emerald-700">${tx.net}</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Withdrawals tab
  const renderWithdrawals = () => {

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => setWithdrawalsView("requests")} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${withdrawalsView === "requests" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Requests ({withdrawRequests.length})</button>
            <button onClick={() => setWithdrawalsView("approved")} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${withdrawalsView === "approved" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>Approved & Transferred ({approvedWithdrawals.length})</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-2">Request ID</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Professional</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1 text-center">Status</div>
          </div>
          {(withdrawalsView === "requests" ? withdrawRequests : approvedWithdrawals).map(wd => (
            <div key={wd.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-2 font-medium text-gray-900">{wd.id}</div>
              <div className="md:col-span-2 text-gray-700">{wd.date}</div>
              <div className="md:col-span-3 text-gray-700">{wd.professional}</div>
              <div className="md:col-span-2 text-gray-700">{wd.method}</div>
              <div className="md:col-span-2 md:text-right text-sm text-gray-800">${wd.amount}</div>
              <div className="md:col-span-1 text-center">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${wd.status === 'requested' ? 'bg-amber-100 text-amber-800' : wd.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {wd.status}
                </span>
              </div>
            </div>
          ))}
          {(withdrawalsView === "requests" ? withdrawRequests : approvedWithdrawals).length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-gray-500">No records.</div>
          )}
        </div>

        {/* View/Approve/Transfer modal */}
        {showWithdrawalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal Details</h3>
                <button onClick={() => setShowWithdrawalModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-3">
                <div className="text-sm text-gray-600">Request ID</div>
                <div className="font-medium text-gray-900">{selectedWithdrawal.id}</div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-sm text-gray-600">Professional</div>
                    <div className="text-gray-900">{selectedWithdrawal.professional}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="text-gray-900">{selectedWithdrawal.date}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="text-gray-900">${selectedWithdrawal.amount}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Method</div>
                    <div className="text-gray-900">{selectedWithdrawal.method}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-900 mb-1">Payout Details</div>
                  <div className="text-sm text-gray-700 space-y-1">
                    {Object.entries(payoutProfiles[selectedWithdrawal.professional]?.details || {}).map(([k,v]) => (
                      <div key={k} className="flex justify-between"><span className="text-gray-600">{k}</span><span className="text-gray-900">{v}</span></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
                {selectedWithdrawal.status === 'requested' && (
                  <button onClick={() => approveWithdrawal(selectedWithdrawal.id)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Approve</button>
                )}
                {selectedWithdrawal.status !== 'transferred' && (
                  <button onClick={() => transferWithdrawal(selectedWithdrawal.id)} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Mark as Transferred</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUsers();
      case "professionals":
        return renderPros();
      case "services":
        return renderServices();
      case "events":
        return renderEvents();
      case "blogs":
        return renderBlogs();
      case "earnings":
        return renderEarnings();
      case "withdrawals":
        return renderWithdrawals();
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  const renderUserModal = () => {
    if (!selectedUser) return null;
    
    const userServices = getUserServices(Number(selectedUser.id));
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Patient Details: {selectedUser.name}</h2>
            <button 
              onClick={() => setShowUserModal(false)} 
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setUserModalTab("profile")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                userModalTab === "profile"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile Details
            </button>
            <button
              onClick={() => setUserModalTab("services")}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                userModalTab === "services"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Services & Appointments ({userServices.length})
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
            {userModalTab === "profile" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <p className="text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <p className="text-gray-900">{selectedUser.joinDate}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <p className="text-gray-900">{selectedUser.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Active</label>
                  <p className="text-gray-900">{selectedUser.lastActive}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No services or appointments found for this patient.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userServices.map((service) => (
                      <div key={service.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                            <p className="text-sm text-gray-600">Doctor: {service.doctorName}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            service.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 
                            service.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="text-gray-900">{service.date}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <p className="text-gray-900">{service.time}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="text-gray-900">{service.duration}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="text-gray-900 font-medium">${service.amount}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-gray-600 text-sm">Type: </span>
                          <span className="text-gray-900 text-sm capitalize">{service.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Services helper functions
  const getFilteredServices = () => {
    let filtered = allServices;

    // Category filter
    if (serviceCategoryFilter !== "all") {
      filtered = filtered.filter(service => service.category === serviceCategoryFilter);
    }

    // Status filter
    if (serviceStatusFilter !== "all") {
      filtered = filtered.filter(service => service.status === serviceStatusFilter);
    }

    // Search query
    if (serviceSearchQuery.trim()) {
      const query = serviceSearchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.doctorName.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (serviceSortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const openServiceModal = (service: any) => {
    const mappedService = {
      id: Number(service.id),
      name: service.name || '',
      category: service.category || '',
      doctorName: service.doctorName || '',
      doctorEmail: service.doctorEmail || '',
      doctorAvatar: service.doctorAvatar || '',
      price: Number(service.price) || 0,
      duration: service.duration || '',
      mode: service.mode || '',
      status: (service.status as "pending" | "active" | "inactive") || "pending",
      description: service.description || '',
      benefits: service.benefits || [],
      locationAddress: service.locationAddress || '',
      createdAt: service.createdAt || '',
      lastUpdated: service.lastUpdated || '',
      patient: service.patient || '',
      patientContact: service.patientContact || '',
      bookingDate: service.bookingDate || '',
      sessionNotes: service.sessionNotes || '',
      paymentStatus: service.paymentStatus || '',
      followUpRequired: service.followUpRequired || false,
      rating: Number(service.rating) || 0,
      feedback: service.feedback || '',
      availableDays: service.availableDays || [],
      startTime: service.startTime || '',
      endTime: service.endTime || '',
      patientsServed: Number(service.patientsServed) || 0
    };
    setSelectedService(mappedService);
    setShowServicesModal(true);
  };

  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUniqueCategories = () => {
    const categories = allServices.map(service => service.category);
    return ["all", ...Array.from(new Set(categories))];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar (fixed within layout) */}
        <aside className="w-64 bg-white shadow-lg h-full overflow-auto">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-700 text-xl font-semibold">Admin</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Platform Admin</h3>
                <p className="text-sm text-gray-500">Control Center</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab("overview")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "overview" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <TrendingUp className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button onClick={() => setActiveTab("users")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "users" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <Users className="w-5 h-5" />
                <span>Users</span>
              </button>
              <button onClick={() => setActiveTab("professionals")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "professionals" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <Stethoscope className="w-5 h-5" />
                <span>Professionals</span>
              </button>
              <button onClick={() => setActiveTab("services")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "services" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <FileText className="w-5 h-5" />
                <span>Services</span>
              </button>
              <button onClick={() => setActiveTab("events")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "events" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <CalendarDays className="w-5 h-5" />
                <span>Events</span>
              </button>
              <button onClick={() => setActiveTab("blogs")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "blogs" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <FileText className="w-5 h-5" />
                <span>Blogs</span>
              </button>
              <button onClick={() => setActiveTab("earnings")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "earnings" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <CreditCard className="w-5 h-5" />
                <span>Earnings</span>
              </button>
              <button onClick={() => setActiveTab("withdrawals")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "withdrawals" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <Wallet className="w-5 h-5" />
                <span>Withdraw Requests</span>
              </button>
              <button onClick={() => setActiveTab("reports")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "reports" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <AlertTriangle className="w-5 h-5" />
                <span>Reports</span>
              </button>
              <button onClick={() => setActiveTab("settings")} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "settings" ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700 hover:bg-gray-50"}`}>
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content (scrollable) */}
        <main className="flex-1 p-8 overflow-auto h-full">
          <div className="mb-6">
            <Breadcrumbs />
          </div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === "overview" ? "Admin Overview" :
                 activeTab === "users" ? "Users" :
                 activeTab === "professionals" ? "Professionals" :
                 activeTab === "services" ? "Services" :
                 activeTab === "events" ? "Events" :
                 activeTab === "earnings" ? "Earnings" :
                 activeTab === "withdrawals" ? "Withdraw Requests" :
                 activeTab === "reports" ? "Reports" :
                 activeTab === "settings" ? "Settings" : "Admin"}
              </h1>
              <p className="text-gray-600">Manage platform data, professionals, services, events, and reports</p>
            </div>
            {activeTab === 'users' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            )}
            {activeTab === 'services' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input value={serviceSearchQuery} onChange={e => setServiceSearchQuery(e.target.value)} placeholder="Search services..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            )}
          </div>

          {renderContent()}
        </main>
      </div>
      
      {/* User Details Modal */}
      {showUserModal && renderUserModal()}
      
      {/* Professional Details Modal */}
      {showProfessionalModal && renderProfessionalModal()}
      
      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reject Professional</h3>
              <button 
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Rejecting: <span className="font-medium text-gray-900">{professionalToReject?.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Please provide a reason for rejection:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => professionalToReject && rejectProfessional(professionalToReject.id)}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Professional
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServicesModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Service Details: {selectedService.name}</h2>
              <button 
                onClick={() => setShowServicesModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Service Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <p className="text-gray-900">{selectedService.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <span className="inline-flex px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                          {selectedService.category}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-gray-900">{selectedService.description}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                        <p className="text-gray-900">{selectedService.benefits}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <p className="text-gray-900">{selectedService.duration}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                          <p className="text-gray-900">{selectedService.mode}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <p className="text-gray-900 font-semibold">${selectedService.price}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getServiceStatusBadge(selectedService.status)}`}>
                            {selectedService.status.charAt(0).toUpperCase() + selectedService.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Timing & Availability</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Days</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedService.availableDays.map((day, index) => (
                            <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <p className="text-gray-900">{selectedService.startTime}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <p className="text-gray-900">{selectedService.endTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Doctor Info & Stats */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Doctor Information</h3>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img src={selectedService.doctorAvatar} alt={selectedService.doctorName} className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedService.doctorName}</h4>
                        <p className="text-sm text-gray-600">{selectedService.doctorEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600">Patients Served</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedService.patientsServed}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600">Rating</p>
                        <p className="text-2xl font-bold text-green-900">⭐ {selectedService.rating}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Location & Contact</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-gray-900">{selectedService.locationAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm text-gray-900">{new Date(selectedService.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm text-gray-900">{new Date(selectedService.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Blog View Modal */}
      {showBlogViewModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Blog Preview</h2>
              <div className="flex items-center space-x-3">
                {selectedBlog.visibility === 'draft' && (
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('blog_posts')
                          .update({ visibility: 'published' })
                          .eq('id', selectedBlog.id);
                        if (error) throw error;
                        alert('Blog published successfully!');
                        queryClient.invalidateQueries({ queryKey: ['all-blogs'] });
                        setShowBlogViewModal(false);
                      } catch (error) {
                        console.error('Error publishing blog:', error);
                        alert('Failed to publish blog: ' + error.message);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Publish Now
                  </button>
                )}
                <button
                  onClick={() => setShowBlogViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Blog Page Preview */}
            <div className="bg-white">
              {/* Hero Section */}
              <div className="relative bg-gradient-to-r from-violet-50 to-blue-50 py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="mb-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      selectedBlog.visibility === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBlog.visibility === 'published' ? 'Published' : 'Draft Preview'}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {selectedBlog.title}
                  </h1>
                  <div className="flex items-center justify-center space-x-4 text-gray-600 mb-8">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(selectedBlog.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(selectedBlog.created_at).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              {selectedBlog.cover_url && (
                <div className="max-w-4xl mx-auto px-6 -mt-8 mb-12">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <img 
                      src={selectedBlog.cover_url.startsWith('data:') ? selectedBlog.cover_url : `data:image/*;base64,${selectedBlog.cover_url}`}
                      alt={selectedBlog.title} 
                      className="w-full h-96 object-cover"
                    />
                  </div>
                </div>
              )}
              
              {/* Blog Content */}
              <div className="max-w-4xl mx-auto px-6 pb-16">
                <div className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedBlog.body }} />
                </div>
                
                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedBlog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-violet-100 text-violet-800 rounded-full text-sm font-medium hover:bg-violet-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Author Info */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Admin</p>
                      <p className="text-sm text-gray-600">Wellness Patronecs Team</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


