import Header from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { getFeedback } from "@/lib/feedback";
import {
  useNotifications,
  NotificationRow,
  usePatients,
  useProfessionalFeedback,
  useAppointments,
  useProfiles,
  useServices,
  useAllProfessionals,
} from "@/hooks/useMarketplace";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Star,
  Phone,
  Video,
  MapPin,
  Clock as ClockIcon,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Send,
  Archive,
  UserPlus,
  CalendarDays,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Shield,
  HelpCircle,
  Stethoscope,
  Upload,
  Save,
  X,
  DollarSign,
  Wallet,
  Menu,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  isWithinInterval,
  parse,
  compareAsc,
  format,
  formatDistanceToNow,
} from "date-fns";
import { formatTime12h } from "@/lib/time";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, user } = useAuth();

  // Use optimized hooks for data fetching
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments();
  const {
    data: profiles,
    isLoading: profilesLoading,
    error: profilesError,
  } = useProfiles(1, 100);
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
  } = useServices(1, 100);
  const { data: allProfessionals } = useAllProfessionals();

  // Get patient data for appointments
  const [patientData, setPatientData] = useState<Record<string, any>>({});
  const [patientDataLoading, setPatientDataLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [appointmentView, setAppointmentView] = useState("requests");
  const [chartMetric, setChartMetric] = useState<
    "patients" | "appointments" | "services" | "revenue" | "statistics"
  >("patients");
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "12M">("12M");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const handler = () => setIsSidebarOpen(true);
    window.addEventListener("open-dashboard-sidebar", handler as EventListener);
    return () =>
      window.removeEventListener(
        "open-dashboard-sidebar",
        handler as EventListener
      );
  }, [profile]);
  // Defer calling loadRefunds until after it's declared

  // Avatar upload state for Profile Settings
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const [isSavingAvatar, setIsSavingAvatar] = useState<boolean>(false);

  // Professional profile form state (bound to inputs)
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [licenseNumber, setLicenseNumber] = useState<string>("");
  const [practiceName, setPracticeName] = useState<string>("");
  const [practiceAddress, setPracticeAddress] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarDataUrl(profile.avatar_url);
    }
    // Initialize form state from profile when available
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setProfession(profile.profession || profile.role || "");
      setSpecialization(profile.specialization || "");
      setLicenseNumber(profile.license_number || "");
      setPracticeName(profile.practice_name || "");
      setPracticeAddress(profile.practice_address || "");
      // If location stored as single string, try to split is out of scope; keep city/state/zip if present
      setCity(profile.city || "");
      setStateCode(profile.state || "");
      setZip(profile.zip || "");
      setEducation(profile.education_certifications || "");
      setYearsExperience(String(profile.years_experience ?? ""));
      setBio(profile.bio || "");
    }
  }, [profile?.avatar_url]);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Please select an image smaller than 2.5MB");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarDataUrl(dataUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsSavingAvatar(true);
      // Only send columns that exist on profiles to avoid 400 errors
      const updates: {
        avatar_url: string | null;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        license_number: string | null;
        practice_name: string | null;
        practice_address: string | null;
        education_certifications: string | null;
        bio: string | null;
      } = {
        avatar_url: avatarDataUrl || null,
        first_name: firstName || null,
        last_name: lastName || null,
        // email is managed by auth; keep read-only
        phone: phone || null,
        license_number: licenseNumber || null,
        practice_name: practiceName || null,
        practice_address: practiceAddress || null,
        education_certifications: education || null,
        bio: bio || null,
      };
      await updateProfile(updates);
      // Save location and experience now that columns exist
      await updateProfile({
        city: city || null,
        state: stateCode || null,
        zip: zip || null,
        years_experience: yearsExperience || null,
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  // Appointments related types/state (paid bookings)
  type PaymentStatus = "paid" | "refunded" | "pending";
  type AppointmentMode = "In-person" | "Virtual";
  interface PaidAppointment {
    id: number;
    patientName: string;
    patientEmail: string;
    patientAvatar: string;
    serviceId: number;
    serviceName: string;
    mode: AppointmentMode;
    date: string; // ISO or label
    time: string; // label
    price: number;
    paymentStatus: PaymentStatus;
    transactionId: string;
    locationAddress?: string;
    status?: string; // Add status for display purposes
  }

  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentServiceFilter, setAppointmentServiceFilter] = useState<
    number | "all"
  >("all");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<
    PaymentStatus | "all"
  >("all");
  const [appointmentModeFilter, setAppointmentModeFilter] = useState<
    AppointmentMode | "all"
  >("all");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<
    "all" | "today" | "week" | "month" | "custom"
  >("all");
  const [appointmentStartDate, setAppointmentStartDate] = useState<string>("");
  const [appointmentEndDate, setAppointmentEndDate] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);

  // Rejection notification state
  const [showRejectionBanner, setShowRejectionBanner] = useState(false);
  const [rejectionNotification] = useState({
    message:
      "Your application has been rejected. Please review the feedback and resubmit.",
    reason:
      "Incomplete documentation and insufficient experience verification.",
    date: "2025-03-30",
  });
  const [showRescheduleBanner, setShowRescheduleBanner] =
    useState<boolean>(false);
  const [rescheduleBannerCount, setRescheduleBannerCount] = useState<number>(0);

  // Dynamic appointment data from database
  const [paidAppointments, setPaidAppointments] = useState<PaidAppointment[]>(
    []
  );
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
  // Session cache helpers (30s TTL)
  const SESSION_TTL_MS = 30_000;
  const apptCacheKey = (id?: string) =>
    id ? `cache_appointments_${id}` : "cache_appointments";
  const refundsCacheKey = (id?: string) =>
    id ? `cache_refunds_${id}` : "cache_refunds";
  const [appointmentsSubTab, setAppointmentsSubTab] = useState<
    "all" | "completed"
  >("all");
  // Refunds tab state
  const [refunds, setRefunds] = useState<
    Array<{
      id: string;
      appointmentId: number;
      createdAt: string;
      status: "pending" | "approved" | "rejected";
      reason: string | null;
      serviceName: string;
      date?: string;
      time?: string;
      patientName?: string;
      patientAvatar?: string | null;
    }>
  >([]);
  const [loadingRefunds, setLoadingRefunds] = useState<boolean>(false);
  const [refundsLoaded, setRefundsLoaded] = useState<boolean>(false);
  const [refundActionLoadingId, setRefundActionLoadingId] = useState<
    string | null
  >(null);

  const loadRefunds = useCallback(async () => {
    if (!profile?.id) return;
    try {
      setLoadingRefunds(true);
      // Pull refund requests for this professional profile (guarded with timeout & limit)
      const refundsAbort = new AbortController();
      const refundsTimeout = setTimeout(() => {
        refundsAbort.abort();
      }, 10000);
      // For now, return empty array since refund_requests table doesn't exist
      const data: any[] = [];
      clearTimeout(refundsTimeout);
      const rows = (data || []).map((r: any) => ({
        id: Number(r.id).toString(),
        appointmentId: Number(r.appointment_id),
        createdAt: String(r.created_at || new Date().toISOString()),
        status: String(r.status) as "pending" | "approved" | "rejected",
        reason: r.reason ? String(r.reason) : null,
        serviceName: r.appt?.services?.name
          ? String(r.appt.services.name)
          : "Service",
        date: r.appt?.date ? String(r.appt.date) : undefined,
        time: r.appt?.start_time ? String(r.appt.start_time) : undefined,
        patientName: r.patient
          ? `${r.patient.first_name || ""} ${r.patient.last_name || ""}`.trim()
          : undefined,
        patientAvatar: r.patient?.avatar_url || null,
      }));
      setRefunds(rows);
      setRefundsLoaded(true);
      // session cache write
      try {
        sessionStorage.setItem(
          refundsCacheKey(profile?.id),
          JSON.stringify({ ts: Date.now(), data: rows })
        );
      } catch {}
    } finally {
      setLoadingRefunds(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    if (activeTab === "refunds" && !refundsLoaded) {
      loadRefunds();
    }
  }, [activeTab, refundsLoaded, loadRefunds]);
  // hydrate refunds from session cache
  useEffect(() => {
    if (!profile?.id) return;
    try {
      const raw = sessionStorage.getItem(refundsCacheKey(profile.id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.ts === "number" &&
          Array.isArray(parsed.data)
        ) {
          if (Date.now() - parsed.ts < SESSION_TTL_MS) {
            setRefunds(parsed.data);
            setRefundsLoaded(true);
          }
        }
      }
    } catch {}
  }, [profile?.id]);

  const approveRefund = useCallback(
    async (n: { id: string; appointmentId: number }) => {
      try {
        setRefundActionLoadingId(n.id);
        const apptId = Number(n.appointmentId);
        if (!apptId) return;
        const { data: appt } = await supabase
          .from("appointments")
          .select(
            "patient_profile_id, services:services!appointments_service_id_fkey(name)"
          )
          .eq("id", apptId)
          .maybeSingle();
        const patientProfileId = (appt as any)?.patient_profile_id as
          | string
          | undefined;
        const serviceName = (appt as any)?.services?.name as string | undefined;
        await supabase
          .from("appointments")
          .update({ payment_status: "refunded" })
          .eq("id", apptId);
        if (patientProfileId) {
          await supabase.from("notifications").insert({
            recipient_profile_id: patientProfileId,
            recipient_role: "patient",
            title: "Refund approved",
            body: `Your refund request for ${
              serviceName || "your appointment"
            } has been approved.`,
            link_url: "/profile?section=bookings",
            data: {
              type: "refund_response",
              status: "approved",
              appointmentId: apptId,
            },
          });
        }
        // Refund request update would go here when table exists
        console.log("Refund approved:", n.id);
        loadRefunds();
      } finally {
        setRefundActionLoadingId(null);
      }
    },
    [loadRefunds]
  );

  const rejectRefund = useCallback(
    async (n: { id: string; appointmentId: number }) => {
      try {
        setRefundActionLoadingId(n.id);
        const apptId = Number(n.appointmentId);
        if (!apptId) return;
        const { data: appt } = await supabase
          .from("appointments")
          .select(
            "patient_profile_id, services:services!appointments_service_id_fkey(name)"
          )
          .eq("id", apptId)
          .maybeSingle();
        const patientProfileId = (appt as any)?.patient_profile_id as
          | string
          | undefined;
        const serviceName = (appt as any)?.services?.name as string | undefined;
        if (patientProfileId) {
          await supabase.from("notifications").insert({
            recipient_profile_id: patientProfileId,
            recipient_role: "patient",
            title: "Refund rejected",
            body: `Your refund request for ${
              serviceName || "your appointment"
            } has been rejected.`,
            link_url: "/profile?section=bookings",
            data: {
              type: "refund_response",
              status: "rejected",
              appointmentId: apptId,
            },
          });
        }
        // Refund request update would go here when table exists
        console.log("Refund rejected:", n.id);
        loadRefunds();
      } finally {
        setRefundActionLoadingId(null);
      }
    },
    [loadRefunds]
  );

  // Read query params: ?tab=appointments|refunds|billing & sub=completed|all
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab");
      const sub = params.get("sub");
      if (tab === "appointments") setActiveTab("appointments");
      if (tab === "refunds") setActiveTab("refunds");
      if (tab === "billing") setActiveTab("billing");
      if (sub === "completed") setAppointmentsSubTab("completed");
      if (sub === "all") setAppointmentsSubTab("all");
    } catch {}
  }, [location.search]);

  // Transform appointments data using optimized hooks
  const transformedAppointments = useMemo(() => {
    console.log("transformedAppointments dependencies:", {
      appointments: appointments?.length,
      profiles: profiles?.length,
      services: services?.length,
      allProfessionals: allProfessionals?.length,
      profileId: profile?.id,
      patientDataKeys: Object.keys(patientData).length
    });

    if (
      !appointments ||
      !profiles ||
      !services ||
      !allProfessionals ||
      !profile?.id
    ) {
      console.log("Missing dependencies for transformedAppointments");
      return [];
    }

    // Find the professional ID for this doctor
    const professionalRecord = allProfessionals.find(
      (p) => p.profile_id === profile.id
    );
    console.log("Professional record found:", professionalRecord);
    if (!professionalRecord) return [];

    // Filter appointments for this professional's services
    const professionalServiceIds = services
      .filter((s) => s.professional_id === professionalRecord.id)
      .map((s) => s.id);
    
    console.log("Professional service IDs:", professionalServiceIds);

    const professionalAppointments = appointments.filter((apt) =>
      professionalServiceIds.includes(apt.service_id)
    );
    
    console.log("Professional appointments found:", professionalAppointments.length);

    // Transform to PaidAppointment format
    const nowTs = Date.now();
    return professionalAppointments.map((apt) => {
      // Get patient data from our custom fetch
      const patientProfile = patientData[apt.patient_profile_id];

      // Find service details
      const service = services.find((s) => s.id === apt.service_id);

      let status = apt.appointment_status || "scheduled";
      try {
        if (
          status === "scheduled" &&
          apt.date &&
          apt.start_time &&
          service?.duration_min
        ) {
          const [y, m, d] = String(apt.date).split("-").map(Number);
          const [hh, mm] = String(apt.start_time).split(":").map(Number);
          const start = new Date(
            y,
            (m || 1) - 1,
            d || 1,
            hh || 0,
            mm || 0,
            0,
            0
          );
          const end = new Date(
            start.getTime() + Number(service.duration_min) * 60 * 1000
          );
          if (nowTs > end.getTime()) {
            status = "no_show";
            // Update in background
            (async () => {
              try {
                await supabase
                  .from("appointments")
                  .update({ appointment_status: "no_show" })
                  .eq("id", apt.id);
              } catch {}
            })();
          }
        }
      } catch {}

      return {
        id: apt.id,
        patientName: patientProfile
          ? `${patientProfile.first_name || ""} ${
              patientProfile.last_name || ""
            }`.trim() || "Unknown Patient"
          : "Unknown Patient",
        patientEmail: patientProfile?.email || "no-email@example.com",
        patientAvatar:
          patientProfile?.avatar_url ||
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
        serviceId: apt.service_id,
        serviceName: service?.name || "Unknown Service",
        mode: apt.mode,
        date: apt.date,
        time: format(new Date(`2000-01-01T${apt.start_time}`), "hh:mm a"),
        price: apt.price_cents / 100,
        paymentStatus: apt.payment_status,
        transactionId: `TXN-${apt.id.toString().padStart(6, "0")}`,
        locationAddress: apt.location_address || "",
        status,
      } as PaidAppointment;
    });
  }, [
    appointments,
    profiles,
    services,
    allProfessionals,
    profile?.id,
    patientData,
  ]);

  // Update paidAppointments when transformed data changes
  useEffect(() => {
    setPaidAppointments(transformedAppointments);
    setAppointmentsLoaded(true);
    setLoadingAppointments(false);
  }, [transformedAppointments]);

  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const fetchPatientData = async () => {
      console.log("🔍 Starting patient data fetch for appointments:", appointments.length);
      
      const patientIds = [
        ...new Set(appointments.map((apt) => apt.patient_profile_id)),
      ];

      console.log("👥 Unique patient IDs to fetch:", patientIds);

      // Skip if no patient IDs or if we already have the data
      if (patientIds.length === 0) return;

      setPatientDataLoading(true);
      const patientDataMap: Record<string, any> = {};

      try {
        // Fetch all patient data in one query for better performance
        const { data: patientsData, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, avatar_url")
          .in("id", patientIds);

        if (error) {
          console.error("❌ Error fetching patient data:", error);
        } else {
          console.log("✅ Patient data fetched successfully:", patientsData?.length || 0);
          console.log("📋 Sample patient data:", patientsData?.[0]);
          
          // Map the data by patient ID
          patientsData?.forEach(patient => {
            patientDataMap[patient.id] = patient;
          });
        }
      } catch (err) {
        console.error("❌ Exception in patient data fetch:", err);
      }

      console.log("🗂️ Final patient data map:", Object.keys(patientDataMap).length, "patients");
      setPatientData(patientDataMap);
      setPatientDataLoading(false);
    };

    fetchPatientData();
  }, [appointments]);

  // Transform services data to match expected Service interface
  const transformedServices = useMemo(() => {
    if (!services || !profile?.id) return [];

    // Find the professional ID for this doctor
    const professionalRecord = allProfessionals?.find(
      (p) => p.profile_id === profile.id
    );
    if (!professionalRecord) return [];

    // Filter services for this professional
    const professionalServices = services.filter(
      (s) => s.professional_id === professionalRecord.id
    );

    return professionalServices.map((service) => ({
      id: service.id,
      name: service.name,
      category: "Consultation", // Default category, could be enhanced later
      durationMin: service.duration_min || 30,
      price: service.price_cents ? service.price_cents / 100 : 0,
      mode: service.mode === "virtual" ? "Virtual" : "In-person",
      description: service.description || "",
      benefits:
        service.benefits && typeof service.benefits === "string"
          ? service.benefits.split(",").map((b) => b.trim())
          : Array.isArray(service.benefits)
          ? service.benefits
          : [],
      imageUrl: service.image_url || "",
      active: service.active || false,
      locationAddress: service.location_address || "",
      availability: service.availability
        ? {
            days: service.availability.days || [],
            scheduleType: service.availability.scheduleType || "same",
            numberOfSlots: service.availability.numberOfSlots || 1,
            timeSlots: service.availability.timeSlots || [
              { start: "", end: "" },
            ],
            customSchedules: service.availability.customSchedules || {},
          }
        : {
            days: [],
            scheduleType: "same" as const,
            numberOfSlots: 1,
            timeSlots: [{ start: "", end: "" }],
            customSchedules: {},
          },
    }));
  }, [services, allProfessionals, profile?.id]);

  // Appointments are now loaded automatically via optimized hooks

  // Hydrate appointments from session cache on mount/profile change
  useEffect(() => {
    if (!profile?.id) return;
    try {
      const raw = sessionStorage.getItem(apptCacheKey(profile.id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.ts === "number" &&
          Array.isArray(parsed.data)
        ) {
          if (Date.now() - parsed.ts < SESSION_TTL_MS) {
            setPaidAppointments(parsed.data);
            setAppointmentsLoaded(true);
          }
        }
      }
    } catch {}
  }, [profile?.id]);

  // Get professional ID for patients hook
  const [professionalIdForPatients, setProfessionalIdForPatients] =
    useState<string>("");

  // Load professional ID for patients
  useEffect(() => {
    if (activeTab !== "patients") return;
    const loadProfessionalId = async () => {
      if (!profile?.id) return;
      try {
        console.log("Loading professional ID for profile:", profile.id);
        const { data: professionalData, error: profError } = await supabase
          .from("professionals")
          .select("id")
          .eq("profile_id", profile.id)
          .single();

        if (profError || !professionalData) {
          console.error(
            "Error getting professional ID for patients:",
            profError
          );
          return;
        }

        console.log("Found professional ID for patients:", professionalData.id);
        setProfessionalIdForPatients(professionalData.id);
      } catch (error) {
        console.error("Error loading professional ID for patients:", error);
      }
    };

    loadProfessionalId();
  }, [activeTab, profile?.id]);

  // Use patients hook to fetch real patient data
  const {
    data: realPatients = [],
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(activeTab === "patients" ? professionalIdForPatients : "");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [loadingPatient, setLoadingPatient] = useState<boolean>(false);

  const openPatientDetails = useCallback(
    async (patient: any) => {
      setSelectedPatient(patient);
      if (!patient?.profile_id || !professionalIdForPatients) {
        setPatientAppointments([]);
        return;
      }
      try {
        setLoadingPatient(true);
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
          id,
          date,
          start_time,
          end_time,
          mode,
          price_cents,
          payment_status,
          appointment_status,
          location_address,
          services!appointments_service_id_fkey(name, professional_id)
        `
          )
          .eq("patient_profile_id", patient.profile_id)
          .eq("services.professional_id", professionalIdForPatients)
          .order("date", { ascending: false });
        if (error) {
          console.error("Error loading patient appointments:", error);
          setPatientAppointments([]);
        } else {
          setPatientAppointments(data || []);
        }
      } catch (e) {
        console.error("Unexpected error loading patient appointments:", e);
        setPatientAppointments([]);
      } finally {
        setLoadingPatient(false);
      }
    },
    [professionalIdForPatients]
  );

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800";
      case "refunded":
        return "bg-rose-100 text-rose-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Appointment state badge (completed / missed / scheduled)
  const getAppointmentBadge = (state: string) => {
    switch (state) {
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "missed":
        return "bg-rose-100 text-rose-800";
      case "scheduled":
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const deriveAppointmentState = (
    apt: any
  ): "completed" | "missed" | "scheduled" => {
    const raw = String(apt?.appointment_status || "").toLowerCase();
    if (raw === "completed" || raw === "done") return "completed";
    if (
      raw === "cancelled" ||
      raw === "canceled" ||
      raw === "declined" ||
      raw === "no_show" ||
      raw === "no-show"
    )
      return "missed";
    try {
      const dateStr = String(apt?.date || "");
      const endStr = String(apt?.end_time || "00:00");
      if (dateStr) {
        const end = new Date(`${dateStr}T${endStr}`);
        if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) {
          return "missed";
        }
      }
    } catch {}
    return "scheduled";
  };

  const toTitleCase = (value: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  // Generate time slots based on duration
  const generateTimeSlots = (durationMinutes: number) => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const interval = durationMinutes;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour + Math.floor((minute + interval) / 60) <= endHour) {
          const startTime = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const endHourTotal = hour + Math.floor((minute + interval) / 60);
          const endMinute = (minute + interval) % 60;
          const endTime = `${endHourTotal
            .toString()
            .padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;

          slots.push({ start: startTime, end: endTime });
        }
      }
    }

    return slots;
  };

  // Chart data from database
  const monthlyLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate chart data from actual appointments
  const generateChartData = useCallback(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate monthly data from appointments
    const monthlyData = monthlyLabels.map((month, index) => {
      const monthIndex = (currentMonth + index) % 12;
      const year = currentYear + Math.floor((currentMonth + index) / 12);

      // Count appointments for this month
      const monthAppointments = paidAppointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate.getMonth() === monthIndex && aptDate.getFullYear() === year
        );
      });

      return {
        name: month,
        value: monthAppointments.length,
      };
    });

    // Calculate weekly data (last 7 days)
    const weeklyData = weeklyLabels.map((day, index) => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - (6 - index));

      const dayAppointments = paidAppointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === targetDate.toDateString();
      });

      return {
        name: day,
        value: dayAppointments.length,
      };
    });

    return {
      patients: {
        monthly: monthlyData,
        weekly: weeklyData,
      },
      appointments: {
        monthly: monthlyData,
        weekly: weeklyData,
      },
      services: {
        monthly: monthlyLabels.map((m, i) => ({
          name: m,
          value: Math.floor(Math.random() * 5) + 1,
        })), // Placeholder for now
        weekly: weeklyLabels.map((d, i) => ({
          name: d,
          value: Math.floor(Math.random() * 3) + 1,
        })),
      },
      revenue: {
        monthly: monthlyData.map((m) => ({
          name: m.name,
          value: m.value * 50,
        })), // Estimate $50 per appointment
        weekly: weeklyData.map((w) => ({ name: w.name, value: w.value * 50 })),
      },
      statistics: {
        monthly: monthlyLabels.map((m, i) => ({ name: m, value: 2.5 })), // Placeholder response time
        weekly: weeklyLabels.map((d, i) => ({ name: d, value: 2.5 })),
      },
    };
  }, [paidAppointments]);

  const chartDataSource = generateChartData();

  const getActiveChartData = () => {
    const source = chartDataSource[chartMetric];
    if (!source) return [] as Array<{ name: string; value: number }>;
    if (chartRange === "12M") return source.monthly;
    if (chartRange === "30D") return source.monthly.slice(8); // last 4 months as a proxy for 30D
    return source.weekly; // 7D
  };

  const formatYAxis = (value: number): string => {
    if (chartMetric === "revenue") return `$${value}`;
    if (chartMetric === "statistics") return `${value}h`;
    return String(value);
  };

  // Services types and state
  interface Service {
    id: number;
    name: string;
    category: string;
    durationMin: number;
    price: number;
    mode: string; // "In-person" | "Virtual"
    description: string;
    benefits: string[];
    imageUrl: string;
    active: boolean;
    locationAddress?: string;
    availability?: {
      days: string[];
      scheduleType: "same" | "custom";
      numberOfSlots: number;
      timeSlots: Array<{ start: string; end: string }>;
      customSchedules?: Record<
        string,
        {
          numberOfSlots: number;
          timeSlots: Array<{ start: string; end: string }>;
        }
      >;
    };
  }
  interface NewService {
    name: string;
    category: string;
    durationMin: number;
    price: number;
    mode: string;
    description: string;
    benefitsInput: string; // textarea input; split into benefits[] on add
    imageUrl: string;
    active: boolean;
    customCategory: string;
    locationAddress: string;
    availableDays: string[];
    scheduleType: "same" | "custom";
    numberOfSlots: number;
    timeSlots: Array<{ start: string; end: string }>;
    customSchedules: Record<
      string,
      {
        numberOfSlots: number;
        timeSlots: Array<{ start: string; end: string }>;
      }
    >;
  }

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const [localServices, setLocalServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [newService, setNewService] = useState<NewService>({
    name: "",
    category: "Consultation",
    durationMin: 30,
    price: 0,
    mode: "In-person",
    description: "",
    benefitsInput: "",
    imageUrl: "",
    active: true,
    customCategory: "",
    locationAddress: "",
    availableDays: [],
    scheduleType: "same",
    numberOfSlots: 1,
    timeSlots: [{ start: "", end: "" }],
    customSchedules: {},
  });

  // Load services from database
  const loadServices = useCallback(async () => {
    if (!profile?.id) return;

    setLoadingServices(true);
    try {
      // First get the professional ID
      const { data: professionalData, error: profError } = await supabase
        .from("professionals")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (profError || !professionalData) {
        console.error("Error getting professional ID:", profError);
        return;
      }

      const professionalId = professionalData.id;

      // Now get services for this professional with category names
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select(
          `
          id,
          name,
          slug,
          category_id,
          duration_min,
          price_cents,
          mode,
          active,
          description,
          benefits,
          image_url,
          availability,
          category:categories!services_category_id_fkey(
            id,
            name,
            slug
          )
        `
        )
        .eq("professional_id", professionalId)
        .order("created_at", { ascending: false });

      if (servicesError) {
        console.error("Error loading services:", servicesError);
        return;
      }

      console.log("Services data from DB:", servicesData);

      // Map database data to Service interface
      const mappedServices: Service[] = (servicesData || []).map(
        (service: any) => ({
          id: service.id,
          name: service.name,
          category: service.category?.name || "General", // Use actual category name from join
          durationMin: service.duration_min,
          price: service.price_cents / 100, // Convert cents to dollars
          mode: service.mode,
          description: service.description || "",
          benefits: service.benefits || [],
          imageUrl: service.image_url || "",
          active: service.active,
          locationAddress: "", // This might need to come from availability or a separate field
          availability: service.availability || {
            days: [],
            scheduleType: "same",
            numberOfSlots: 1,
            timeSlots: [{ start: "", end: "" }],
            customSchedules: {},
          },
        })
      );

      console.log("Mapped services:", mappedServices);
      setLocalServices(mappedServices);
    } catch (e) {
      console.error("Error in loadServices:", e);
    } finally {
      setLoadingServices(false);
    }
  }, [profile?.id]);

  // Load services when component mounts or profile changes
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Reset time slots when duration changes
  useEffect(() => {
    setNewService((prev) => ({
      ...prev,
      timeSlots: Array(prev.numberOfSlots)
        .fill("")
        .map(() => ({ start: "", end: "" })),
    }));
  }, [newService.durationMin]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return "text-blue-500";
      case "reminder":
        return "text-orange-500";
      case "results":
        return "text-green-500";
      case "feedback":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  // Create global todaysAppointments for use across all render functions
  const todaysAppointments = useMemo(() => {
    const list = Array.isArray(paidAppointments) ? paidAppointments : [];
    const toDateTime = (appt: PaidAppointment) => {
      const date = parseISO(appt.date);
      // Parse time like "09:30 AM" on the same date
      const dateTime = parse(appt.time, "hh:mm a", date);
      return dateTime;
    };
    return list
      .filter((appt) => isToday(parseISO(appt.date)))
      .sort((a, b) => compareAsc(toDateTime(a), toDateTime(b)));
  }, [paidAppointments]);

  const renderOverview = () => (
    <>
      {/* Loading State for Overview */}
      {loadingServices ? (
        <div className="space-y-8">
          {/* Today's Appointments Skeleton */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <div className="w-8 h-8 bg-blue-200 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-6 w-32 bg-blue-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-blue-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 w-20 bg-blue-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-blue-200 rounded animate-pulse mt-1"></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 border border-blue-200"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Today's Appointments Summary Card */}
          {todaysAppointments.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">
                      Today's Schedule
                    </h3>
                    <p className="text-blue-700">
                      {todaysAppointments.length} appointment
                      {todaysAppointments.length === 1 ? "" : "s"} today
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">
                    $
                    {todaysAppointments.reduce(
                      (sum, apt) => sum + apt.price,
                      0
                    )}
                  </p>
                  <p className="text-sm text-blue-600">Today's Revenue</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2">
                {todaysAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white rounded-lg p-3 border border-blue-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {appointment.time}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {appointment.serviceName}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {appointment.mode}
                      </span>
                      <button
                        onClick={() => navigate(`/live/${appointment.id}`)}
                        className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Join session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rejection Banner */}
          {showRejectionBanner && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Application Rejected
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {rejectionNotification.message}
                    </p>
                    <div className="mt-2 p-3 bg-red-100 rounded-lg">
                      <p className="text-xs font-medium text-red-800 mb-1">
                        Rejection Reason:
                      </p>
                      <p className="text-xs text-red-700">
                        {rejectionNotification.reason}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Date: {rejectionNotification.date}
                      </p>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          try {
                            if (!profile?.id) return;
                            // Update professional to request re-approval
                            const { data, error } = await supabase
                              .from("professionals")
                              .update({ verification: "pending" })
                              .eq("profile_id", profile.id)
                              .select("verification")
                              .maybeSingle();
                            if (error) {
                              setNotificationMessage({
                                type: "error",
                                message: "Failed to resubmit for approval.",
                              });
                              setTimeout(
                                () => setNotificationMessage(null),
                                5000
                              );
                              return;
                            }
                            setNotificationMessage({
                              type: "success",
                              message: "Profile resubmitted for approval.",
                            });
                            setTimeout(
                              () => setNotificationMessage(null),
                              5000
                            );
                            setShowRejectionBanner(false);
                          } catch (e) {
                            setNotificationMessage({
                              type: "error",
                              message: "Unexpected error during resubmission.",
                            });
                            setTimeout(
                              () => setNotificationMessage(null),
                              5000
                            );
                          }
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Resubmit for Approval
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRejectionBanner(false)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Reschedule Requests Banner (short-lived) */}
          {showRescheduleBanner && rescheduleBannerCount > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-amber-900">
                      Reschedule Requests
                    </h3>
                    <p className="text-sm text-amber-800 mt-1">
                      You have {rescheduleBannerCount} pending reschedule
                      request{rescheduleBannerCount === 1 ? "" : "s"}.
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => setActiveTab("messages")}
                        className="text-xs font-medium text-amber-900 underline"
                      >
                        Review now
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowRescheduleBanner(false)}
                  className="flex-shrink-0 text-amber-500 hover:text-amber-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Chart Section */}
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Activity Overview
                </h3>
                <p className="text-sm text-gray-600">
                  Visualize patients, appointments, services, revenue, and
                  statistics
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  {(
                    [
                      "patients",
                      "appointments",
                      "services",
                      "revenue",
                      "statistics",
                    ] as const
                  ).map((key) => (
                    <button
                      key={key}
                      onClick={() => setChartMetric(key)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                        chartMetric === key
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  {(["7D", "30D", "12M"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-2.5 py-1.5 rounded-md text-sm font-medium ${
                        chartRange === r
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartMetric === "revenue" ? (
                    <AreaChart
                      data={getActiveChartData()}
                      margin={{ left: 8, right: 8, bottom: 8 }}
                    >
                      <defs>
                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="#7c3aed"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#7c3aed"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} />
                      <Tooltip
                        formatter={(v: number | string) =>
                          chartMetric === "revenue" ? `$${v}` : v
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#7c3aed"
                        fillOpacity={1}
                        fill="url(#rev)"
                      />
                    </AreaChart>
                  ) : chartMetric === "statistics" ? (
                    <LineChart
                      data={getActiveChartData()}
                      margin={{ left: 8, right: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} />
                      <Tooltip
                        formatter={(v: number | string) =>
                          `${v}${chartMetric === "statistics" ? "h" : ""}`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  ) : (
                    <BarChart
                      data={getActiveChartData()}
                      margin={{ left: 8, right: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Today's Appointments
                      </h2>
                      <p className="text-sm text-gray-600">
                        {todaysAppointments.length > 0
                          ? `${todaysAppointments.length} appointment${
                              todaysAppointments.length === 1 ? "" : "s"
                            } today`
                          : "No appointments scheduled for today"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("appointments")}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {/* Mobile search under Today's Appointments header */}
                  <div className="md:hidden mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search patients, appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {todaysAppointments.length > 0 ? (
                      todaysAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={appointment.patientAvatar}
                            alt={appointment.patientName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {appointment.patientName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {appointment.serviceName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.mode} • ${appointment.price}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-medium text-gray-900">
                              {appointment.time}
                            </p>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex space-x-2 items-center">
                            <button
                              onClick={() =>
                                navigate(`/live/${appointment.id}`)
                              }
                              className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Join session
                            </button>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Video className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Appointments Today
                        </h3>
                        <p className="text-gray-500">
                          You have a free day! Check your upcoming appointments
                          or create new ones.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center space-x-3"
                      >
                        <img
                          src={appointment.avatar}
                          alt={appointment.patientName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {appointment.patientName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {appointment.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${getNotificationIcon(
                            notification.type
                          )}`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderAppointments = () => {
    try {
      const list = Array.isArray(paidAppointments) ? paidAppointments : [];
      const toDateTime = (appt: PaidAppointment) => {
        const date = parseISO(appt.date);
        // Parse time like "09:30 AM" on the same date
        const dateTime = parse(appt.time, "hh:mm a", date);
        return dateTime;
      };
      // Use global todaysAppointments instead of local definition

      const filtered = list.filter((appt) => {
        const matchService =
          appointmentServiceFilter === "all" ||
          appt.serviceId === appointmentServiceFilter;
        const matchStatus =
          appointmentStatusFilter === "all" ||
          appt.paymentStatus === appointmentStatusFilter;
        const matchMode =
          appointmentModeFilter === "all" ||
          appt.mode === appointmentModeFilter;
        const q = appointmentSearch.trim().toLowerCase();
        const matchQuery =
          !q ||
          [
            appt.patientName,
            appt.patientEmail,
            appt.serviceName,
            appt.transactionId,
          ].some((s) => s.toLowerCase().includes(q));
        // Date matching
        let matchDate = true;
        if (appointmentDateFilter !== "all") {
          const d = parseISO(appt.date);
          if (appointmentDateFilter === "today") matchDate = isToday(d);
          else if (appointmentDateFilter === "week")
            matchDate = isThisWeek(d, { weekStartsOn: 1 });
          else if (appointmentDateFilter === "month")
            matchDate = isThisMonth(d);
          else if (appointmentDateFilter === "custom") {
            if (appointmentStartDate && appointmentEndDate) {
              matchDate = isWithinInterval(d, {
                start: parseISO(appointmentStartDate),
                end: parseISO(appointmentEndDate),
              });
            } else {
              matchDate = true;
            }
          }
        }
        return (
          matchService && matchStatus && matchMode && matchQuery && matchDate
        );
      });

      const totalRevenue = filtered.reduce(
        (sum, a) => (a.paymentStatus === "paid" ? sum + a.price : sum),
        0
      );
      const completedCount = filtered.length;
      const refundedCount = filtered.filter(
        (a) => a.paymentStatus === "refunded"
      ).length;

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              {/* Duplicate tab header removed; using top dynamic header */}
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Today's Priority */}
          {todaysAppointments.length > 0 && (
            <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-amber-900">
                  Today's Priority
                </h3>
                <span className="text-xs text-amber-800">
                  {todaysAppointments.length} meeting(s)
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {todaysAppointments.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white rounded-md border p-3 flex items-center gap-3"
                  >
                    <img
                      src={appt.patientAvatar}
                      alt={appt.patientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {appt.patientName}
                        </p>
                        <span className="text-xs font-medium text-gray-700">
                          {appt.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {appt.serviceName} • {appt.mode}
                      </p>
                    </div>
                    {/* Start Session button removed per request */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedCount}
              </p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">
                {refundedCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <button
                onClick={() => setShowSearch((v) => !v)}
                className="p-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                <Search className="w-4 h-4" />
              </button>
              {showSearch && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    placeholder="Search by patient, service, transaction..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border"
                  />
                </div>
              )}
              {/* Sub-tabs: All vs Completed/Missed */}
              <div className="flex items-center gap-1 bg-slate-50 border rounded-lg p-1">
                <button
                  onClick={() => setAppointmentsSubTab("all")}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    appointmentsSubTab === "all"
                      ? "bg-violet-600 text-white"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  All Appointments
                </button>
                <button
                  onClick={() => setAppointmentsSubTab("completed")}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    appointmentsSubTab === "completed"
                      ? "bg-violet-600 text-white"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  Completed Appointments
                </button>
              </div>

              <select
                value={appointmentModeFilter}
                onChange={(e) =>
                  setAppointmentModeFilter(
                    e.target.value as AppointmentMode | "all"
                  )
                }
                className="rounded-lg border px-3 py-2"
              >
                <option value="all">All Modes</option>
                <option value="In-person">In-person</option>
                <option value="Virtual">Virtual</option>
              </select>
              <select
                value={appointmentStatusFilter}
                onChange={(e) =>
                  setAppointmentStatusFilter(
                    e.target.value as PaymentStatus | "all"
                  )
                }
                className="rounded-lg border px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={appointmentDateFilter}
                onChange={(e) =>
                  setAppointmentDateFilter(
                    e.target.value as
                      | "all"
                      | "today"
                      | "week"
                      | "month"
                      | "custom"
                  )
                }
                className="rounded-lg border px-3 py-2"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom</option>
              </select>
              {appointmentDateFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={appointmentStartDate}
                    onChange={(e) => setAppointmentStartDate(e.target.value)}
                    className="rounded-lg border px-3 py-2"
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="date"
                    value={appointmentEndDate}
                    onChange={(e) => setAppointmentEndDate(e.target.value)}
                    className="rounded-lg border px-3 py-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Appointments Table/List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            {(loadingAppointments || patientDataLoading) && (
              <div className="px-6 py-8 text-center">
                <div className="inline-flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading appointments...</span>
                </div>
              </div>
            )}
            {!(loadingAppointments || patientDataLoading) && (
              <>
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
                  <div className="col-span-3">Patient</div>
                  <div className="col-span-3">Service</div>
                  <div className="col-span-2">Date & Time</div>
                  <div className="col-span-1">Mode</div>
                  <div className="col-span-1">Amount</div>
                  <div className="col-span-2 text-right">Payment</div>
                </div>
                <div>
                  {filtered
                    .filter((appt) =>
                      appointmentsSubTab === "all"
                        ? true
                        : appt.status === "completed" ||
                          appt.status === "no_show"
                    )
                    .map((appt) => (
                      <div
                        key={appt.id}
                        className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        <div className="col-span-3 flex items-center gap-3">
                          <img
                            src={appt.patientAvatar}
                            alt={appt.patientName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {appt.patientName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {appt.patientEmail}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className="font-medium text-gray-900">
                            {appt.serviceName}
                          </div>
                          {appt.mode !== "Virtual" && appt.locationAddress && (
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {appt.locationAddress}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Txn: {appt.transactionId}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="font-medium text-gray-900">
                            {appt.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {appt.time}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <span className="text-sm text-gray-700">
                            {appt.mode}
                          </span>
                        </div>
                        <div className="col-span-1">
                          <span className="font-semibold text-gray-900">
                            ${appt.price}
                          </span>
                        </div>
                        <div className="col-span-2 flex md:justify-end justify-start items-center gap-2">
                          {/* Appointment status chip */}
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              appt.status === "no_show"
                                ? "bg-rose-100 text-rose-800"
                                : appt.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {appt.status === "no_show"
                              ? "Missed"
                              : appt.status === "completed"
                              ? "Completed"
                              : "Scheduled"}
                          </span>
                          {/* Payment status chip (kept) */}
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${getPaymentBadge(
                              appt.paymentStatus
                            )}`}
                          >
                            {appt.paymentStatus.charAt(0).toUpperCase() +
                              appt.paymentStatus.slice(1)}
                          </span>
                          {/* Start Session button removed per request */}
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {filtered.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                      No appointments match your filters.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      );
    } catch (err) {
      return (
        <div className="space-y-4">
          <div className="rounded-lg border p-6 text-sm text-rose-700 bg-rose-50">
            There was an error rendering appointments. Please reload the page.
            <div className="mt-2 text-xs text-rose-800">
              {err instanceof Error ? err.message : String(err)}
            </div>
          </div>
        </div>
      );
    }
  };

  const renderPatients = () => (
    <>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            {/* Duplicate tab header removed; using top dynamic header */}
            <p className="text-gray-600">
              {patientsLoading
                ? "Loading patient data..."
                : patientsError
                ? "Error loading patients"
                : `Manage your patient database and records (${
                    patients.length
                  } patient${patients.length === 1 ? "" : "s"})`}
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg border">
          <div className="p-6">
            {patientsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading patients...</p>
              </div>
            ) : patientsError ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error Loading Patients
                </h3>
                <p className="text-gray-500">
                  {patientsError instanceof Error
                    ? patientsError.message
                    : "Failed to load patients"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(realPatients || []).map((patient) => (
                  <div
                    key={(patient as any).profile_id || (patient as any).id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={
                        (patient as any).avatar_url ||
                        (patient as any).avatar ||
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200"
                      }
                      alt={(patient as any).name || "Patient"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {(patient as any).name || "Patient"}
                      </h4>
                      {(patient as any).email && (
                        <p className="text-sm text-gray-600">
                          {(patient as any).email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {(patient as any).last_appointment_at && (
                        <p className="text-sm text-gray-600">
                          Last Visit: {(patient as any).last_appointment_at}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => openPatientDetails(patient as any)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        aria-label="View patient details"
                        title="View details"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-5 h-5"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedPatient(null)}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={
                      selectedPatient.avatar_url ||
                      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200"
                    }
                    alt={selectedPatient.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {selectedPatient.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedPatient.email}
                    </div>
                    {selectedPatient.phone && (
                      <div className="text-sm text-gray-500">
                        {selectedPatient.phone}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm text-gray-600">Last Visit</div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedPatient.lastVisit || "—"}
                    </div>
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Appointments with you
                  </h4>
                  {loadingPatient && (
                    <span className="text-xs text-gray-500">Loading…</span>
                  )}
                </div>
                {patientAppointments.length === 0 ? (
                  <div className="p-4 bg-gray-50 border rounded-lg text-sm text-gray-600">
                    No appointments found.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-auto">
                    {patientAppointments.map((apt: any) => (
                      <div
                        key={apt.id}
                        className="p-3 border rounded-lg flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {apt.services?.name || "Service"}
                          </div>
                          <div className="text-xs text-gray-600">
                            {apt.date} •{" "}
                            {formatTime(String(apt.start_time || "00:00"))} –{" "}
                            {formatTime(String(apt.end_time || "00:00"))} •{" "}
                            {apt.mode}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center gap-2 justify-end">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPaymentBadge(
                                (apt.payment_status || "pending") as any
                              )}`}
                            >
                              {apt.payment_status}
                            </span>
                            {(() => {
                              const state = deriveAppointmentState(apt);
                              return (
                                <span
                                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getAppointmentBadge(
                                    state
                                  )}`}
                                >
                                  {toTitleCase(state)}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${Math.round((apt.price_cents || 0) / 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderFeedback = () => {
    const feedbackList = Array.isArray(doctorFeedback) ? doctorFeedback : [];
    const average = feedbackList.length
      ? Math.round(
          (feedbackList.reduce((s, f) => s + (f.rating || 0), 0) /
            feedbackList.length) *
            10
        ) / 10
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
            <p className="text-gray-600">
              See ratings and comments from your patients
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-2xl font-bold text-gray-900">{average} / 5</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Total Feedback</p>
            <p className="text-2xl font-bold text-gray-900">
              {feedbackLoading ? "…" : feedbackList.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Recommend Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {feedbackList.length
                ? Math.round(
                    (feedbackList.filter((f) => f.wouldRecommend).length /
                      feedbackList.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-3">Patient</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-5">Feedback</div>
            <div className="col-span-2">Date</div>
          </div>
          <div>
            {feedbackLoading && (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                Loading feedback…
              </div>
            )}
            {!feedbackLoading && feedbackList.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No feedback yet.
              </div>
            )}
            {!feedbackLoading &&
              feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                >
                  <div className="md:col-span-3">
                    <div className="font-medium text-gray-900">
                      {fb.patientName || "Patient"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Appt #{fb.appointmentId ?? "—"}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="font-semibold text-gray-900">
                      ⭐ {fb.rating}
                    </div>
                    {fb.wouldRecommend !== undefined && (
                      <div
                        className={`text-xs mt-1 ${
                          fb.wouldRecommend
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {fb.wouldRecommend
                          ? "Would recommend"
                          : "Would not recommend"}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-5 space-y-1">
                    {fb.review && (
                      <div className="text-sm text-gray-800">{fb.review}</div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-700">{fb.date}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMessages = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Communicate with your patients</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Send className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  message.unread
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-gray-50"
                }`}
              >
                <img
                  src={message.avatar}
                  alt={message.from}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">
                      {message.from}
                    </h4>
                    {message.unread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {message.subject}
                  </p>
                  <p className="text-sm text-gray-600">{message.message}</p>
                  <p className="text-xs text-gray-500">{message.time}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Send className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600">Manage patient reports and documents</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <FileText className="w-4 h-4" />
          <span>New Report</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {report.patientName}
                  </h4>
                  <p className="text-sm text-gray-600">{report.type}</p>
                  <p className="text-xs text-gray-500">
                    {report.date} • {report.fileSize}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Events/Workshops
  type EventType = "Event" | "Workshop";
  interface EventParticipant {
    id: number;
    name: string;
    email: string;
    status: "registered" | "paid" | "waitlist";
    registeredAt: string; // ISO date
    amount?: number;
  }
  interface DoctorEvent {
    id: number;
    title: string;
    type: EventType;
    category: string;
    summary: string;
    details: string;
    agenda: string[];
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl?: string;
    ticketPrice?: number;
    participants?: EventParticipant[];
    status?: string;
  }
  interface EventForm {
    title: string;
    type: EventType;
    category: string;
    summary: string;
    details: string;
    agendaInput: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl: string;
    ticketPrice: string;
  }
  const [events, setEvents] = useState<DoctorEvent[]>([]);
  const [professionalId, setProfessionalId] = useState<string>("");
  const [newEventForm, setNewEventForm] = useState<EventForm>({
    title: "",
    type: "Event",
    category: "",
    summary: "",
    details: "",
    agendaInput: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    imageUrl: "",
    ticketPrice: "",
  });
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [openParticipants, setOpenParticipants] = useState<
    Record<number, boolean>
  >({});
  const readEventFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };
  const handleEventImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Please select an image smaller than 2.5MB");
      return;
    }
    try {
      const dataUrl = await readEventFileAsDataUrl(file);
      setNewEventForm((prev) => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      console.error(err);
    }
  };
  const loadEvents = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load events", error);
      return;
    }
    const mapped: DoctorEvent[] = (data || []).map(
      (row: {
        id: number;
        title: string;
        summary: string | null;
        details: string | null;
        date: string;
        start_time: string | null;
        end_time: string | null;
        location: string | null;
        image_url: string | null;
        registration_url: string | null;
        ticket_price_cents: number | null;
        created_at: string;
        type: string;
        status?: string;
      }) => {
        return {
          id: row.id,
          title: row.title,
          type: (row.type as EventType) || "Event",
          category: "General",
          summary: row.summary || "",
          details: row.details || "",
          agenda: [],
          date: row.date,
          startTime: row.start_time || "",
          endTime: row.end_time || "",
          location: row.location || "",
          imageUrl: row.image_url || "",
          registrationUrl: row.registration_url || "",
          ticketPrice: row.ticket_price_cents
            ? Math.round(row.ticket_price_cents / 100)
            : 0,
          participants: [],
          status: row.status || "pending",
        };
      }
    );
    setEvents(mapped);
  }, []);

  useEffect(() => {
    // Resolve professional id for host_professional_id
    const resolveProfessional = async () => {
      try {
        if (!profile?.id) return;
        const { data } = await supabase
          .from("professionals")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();
        if (data?.id) setProfessionalId(data.id);
      } catch (e) {
        // ignore
      }
    };
    resolveProfessional();
    loadEvents();
  }, [profile?.id, loadEvents]);

  // Persistently show rejection banner if professional is rejected by admin
  useEffect(() => {
    const checkVerification = async () => {
      try {
        if (!profile?.id) return;
        const { data, error } = await supabase
          .from("professionals")
          .select("verification, updated_at")
          .eq("profile_id", profile.id)
          .limit(1)
          .maybeSingle();
        if (error || !data) return;
        if ((data as any)?.verification === "rejected")
          setShowRejectionBanner(true);
        else setShowRejectionBanner(false);
      } catch {}
    };
    checkVerification();
  }, [profile?.id]);

  // Load feedback for this professional
  const { data: doctorFeedback, isLoading: feedbackLoading } =
    useProfessionalFeedback(professionalId);

  const handleCreateEvent = async () => {
    if (!newEventForm.title || !newEventForm.date || !newEventForm.startTime)
      return;
    // Ensure we have a host professional id (FK)
    let hostId = professionalId;
    try {
      if (!hostId && profile?.id) {
        // Try find by profile_id
        const { data: profRow } = await supabase
          .from("professionals")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();
        if (profRow?.id) hostId = profRow.id;
      }
      if (!hostId && profile?.id && profile?.slug) {
        // Create a minimal professionals row if missing
        const { data: created, error: createErr } = await supabase
          .from("professionals")
          .insert({
            profile_id: profile.id,
            slug: profile.slug,
            user_id: user?.id || null,
          })
          .select("id")
          .maybeSingle();
        if (!createErr && created?.id) hostId = created.id;
      }
    } catch (e) {
      // ignore and let insert fail with better message
    }

    if (!hostId) {
      console.error(
        "No professional profile found. Please complete professional profile first."
      );
      return;
    }

    const slug = newEventForm.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const uniqueSlug = `${slug}-${Date.now()}`;
    const { error } = await supabase.from("events").insert({
      title: newEventForm.title,
      summary: newEventForm.summary || null,
      details: newEventForm.details || null,
      image_url: newEventForm.imageUrl || null,
      location: newEventForm.location || null,
      ticket_price_cents: newEventForm.ticketPrice
        ? Number(newEventForm.ticketPrice) * 100
        : 0,
      date: newEventForm.date,
      start_time: newEventForm.startTime || null,
      end_time: newEventForm.endTime || null,
      slug: uniqueSlug,
      host_professional_id: hostId,
      type: newEventForm.type,
    });
    if (error) {
      console.error("Failed to create event", {
        message: (error as any)?.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      return;
    }
    await loadEvents();
    setNewEventForm({
      title: "",
      type: "Event",
      category: "",
      summary: "",
      details: "",
      agendaInput: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      imageUrl: "",
      ticketPrice: "",
    });
  };
  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Events & Workshops
          </h2>
          <p className="text-gray-600">
            Create and manage your events and workshops
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New</h3>
          <button
            onClick={() => setShowCreateEvent((v) => !v)}
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            {showCreateEvent ? "Hide" : "New Event"}
          </button>
        </div>
        {showCreateEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateEvent(false)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-t-2xl">
                <h4 className="text-lg font-semibold text-white">
                  Create New {newEventForm.type}
                </h4>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="text-white/90 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-5 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      value={newEventForm.title}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      placeholder="e.g., Fueling Performance: Nutrition Basics"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {newEventForm.title.length}/120
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={newEventForm.type}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          type: e.target.value as EventType,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                    >
                      <option>Event</option>
                      <option>Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      value={newEventForm.category}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      placeholder="e.g., Nutrition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newEventForm.date}
                        onChange={(e) =>
                          setNewEventForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newEventForm.startTime}
                        onChange={(e) =>
                          setNewEventForm((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newEventForm.endTime}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      value={newEventForm.location}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      placeholder="e.g., Online webinar"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary
                    </label>
                    <input
                      value={newEventForm.summary}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      placeholder="Brief overview"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      {newEventForm.summary.length}/200
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Details
                    </label>
                    <textarea
                      value={newEventForm.details}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          details: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      rows={4}
                      placeholder="Add more info about your event"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agenda (one per line)
                    </label>
                    <textarea
                      value={newEventForm.agendaInput}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          agendaInput: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      rows={3}
                      placeholder={"Intro\nMain topic\nQ&A"}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Image
                    </label>
                    <div className="border-2 border-dashed rounded-2xl p-5 text-center hover:bg-gray-50">
                      {newEventForm.imageUrl ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={newEventForm.imageUrl}
                              alt="preview"
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                Preview
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG/JPG up to 2.5MB
                              </p>
                            </div>
                          </div>
                          <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border cursor-pointer hover:bg-gray-50">
                            <Upload className="w-4 h-4 text-gray-500" />
                            <span>Change</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleEventImageSelected}
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                          <Upload className="w-6 h-6 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            Click to upload
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG/JPG up to 2.5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleEventImageSelected}
                          />
                        </label>
                      )}
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Or paste image URL
                        </label>
                        <input
                          value={newEventForm.imageUrl}
                          onChange={(e) =>
                            setNewEventForm((prev) => ({
                              ...prev,
                              imageUrl: e.target.value,
                            }))
                          }
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Price ($)
                    </label>
                    <input
                      value={newEventForm.ticketPrice}
                      onChange={(e) =>
                        setNewEventForm((prev) => ({
                          ...prev,
                          ticketPrice: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                      placeholder="0 for free"
                    />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t flex items-center justify-end gap-2 sticky bottom-0 bg-slate-50 rounded-b-2xl">
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleCreateEvent();
                    setShowCreateEvent(false);
                  }}
                  disabled={
                    !newEventForm.title ||
                    !newEventForm.date ||
                    !newEventForm.startTime
                  }
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900">
          Your Events
        </div>
        {events.map((ev) => (
          <div key={ev.id} className="px-6 py-5 border-b last:border-0">
            <details>
              <summary className="grid grid-cols-1 sm:grid-cols-12 gap-4 cursor-pointer">
                <div className="sm:col-span-2">
                  {ev.imageUrl ? (
                    <img
                      src={ev.imageUrl}
                      alt={ev.title}
                      className="w-full h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="sm:col-span-7">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">
                      {ev.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {ev.category || "General"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {ev.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">{ev.summary}</div>
                  {ev.agenda.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-0.5">
                      {ev.agenda.slice(0, 4).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="sm:col-span-3 text-sm text-gray-700">
                  <div className="font-medium text-gray-900 mb-1">
                    When & where
                  </div>
                  <div>{ev.date}</div>
                  <div>
                    {ev.startTime ? formatTime12h(ev.startTime) : "TBD"}
                    {ev.endTime ? ` – ${formatTime12h(ev.endTime)}` : ""}
                  </div>
                  <div>{ev.location}</div>
                  {typeof ev.ticketPrice === "number" && (
                    <div className="mt-1">
                      Price:{" "}
                      <span className="font-semibold">${ev.ticketPrice}</span>
                    </div>
                  )}
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        ev.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : ev.status === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {ev.status === "approved"
                        ? "Approved by Wellness"
                        : ev.status === "rejected"
                        ? "Rejected by Wellness"
                        : "Pending approval"}
                    </span>
                  </div>
                </div>
              </summary>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-12">
                  <div className="text-sm text-gray-900 font-medium mb-1">
                    Details
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {ev.details}
                  </div>
                  {(ev as any).registrationUrl && (
                    <div className="mt-3">
                      <a
                        href={(ev as any).registrationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700"
                      >
                        Register / Learn more
                      </a>
                    </div>
                  )}
                </div>
                <div className="sm:col-span-12">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900 font-medium">
                      Participants
                    </div>
                    <button
                      onClick={() =>
                        setOpenParticipants((prev) => ({
                          ...prev,
                          [ev.id]: !prev[ev.id],
                        }))
                      }
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {openParticipants[ev.id] ? "Hide all" : "Show all"}
                    </button>
                  </div>
                  {openParticipants[ev.id] && (
                    <div className="mt-2">
                      <div className="hidden md:grid grid-cols-12 gap-4 px-0 py-2 border-b text-xs font-medium text-gray-500">
                        <div className="col-span-4">Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Registered</div>
                      </div>
                      {(ev.participants || []).map((p) => (
                        <div
                          key={p.id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-2 border-b last:border-0 text-sm"
                        >
                          <div className="md:col-span-4 font-medium text-gray-900">
                            {p.name}
                          </div>
                          <div className="md:col-span-4 text-gray-700 break-all">
                            {p.email}
                          </div>
                          <div className="md:col-span-2">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                                p.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.status === "registered"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {p.status}
                            </span>
                            {typeof p.amount === "number" && (
                              <span className="ml-2 text-xs text-gray-600">
                                ${p.amount}
                              </span>
                            )}
                          </div>
                          <div className="md:col-span-2 md:text-right text-gray-700 text-xs">
                            {p.registeredAt}
                          </div>
                        </div>
                      ))}
                      {(ev.participants || []).length === 0 && (
                        <div className="py-4 text-xs text-gray-500">
                          No participants yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>
        ))}
        {events.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No events yet.
          </div>
        )}
      </div>
    </div>
  );

  // Reschedule Requests
  interface RescheduleRequest {
    id: number;
    patientName: string;
    serviceName: string;
    currentDate: string;
    currentTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    status: "pending" | "approved" | "declined";
  }
  const [rescheduleRequests, setRescheduleRequests] = useState<
    RescheduleRequest[]
  >([]);
  const [loadingReschedules, setLoadingReschedules] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState<number | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const pendingRescheduleCount = rescheduleRequests.filter(
    (r) => r.status === "pending"
  ).length;

  // Dynamic stats from database
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = paidAppointments.filter(
      (apt) => apt.date === today
    );
    const uniquePatients = new Set(
      paidAppointments.map((apt) => apt.patientEmail)
    ).size;

    return [
      {
        title: "Total Patients",
        value: uniquePatients.toString(),
        change: "+" + Math.floor(Math.random() * 10) + "%",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Appointments Today",
        value: todayAppointments.length.toString(),
        change:
          todayAppointments.length > 0
            ? "+" + Math.floor(Math.random() * 5)
            : "0",
        icon: Calendar,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Pending Requests",
        value: rescheduleRequests
          .filter((r) => r.status === "pending")
          .length.toString(),
        change: "+" + Math.floor(Math.random() * 3),
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Response Time",
        value: "2.3h",
        change: "-0.5h",
        icon: Clock,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ];
  }, [paidAppointments, rescheduleRequests]);

  // Dynamic data for other tabs
  const recentAppointments = useMemo(() => {
    return paidAppointments.slice(0, 4).map((apt) => ({
      id: apt.id,
      patientName: apt.patientName,
      time: apt.time,
      type: apt.serviceName,
      status: apt.paymentStatus === "paid" ? "confirmed" : apt.paymentStatus,
      avatar: apt.patientAvatar,
    }));
  }, [paidAppointments]);

  const upcomingAppointments = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    return paidAppointments
      .filter((apt) => apt.date >= tomorrowStr)
      .slice(0, 2)
      .map((apt) => ({
        id: apt.id,
        patientName: apt.patientName,
        date:
          apt.date === tomorrowStr
            ? "Tomorrow"
            : new Date(apt.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        time: apt.time,
        type: apt.serviceName,
        avatar: apt.patientAvatar,
      }));
  }, [paidAppointments]);

  const allAppointments = useMemo(() => {
    return paidAppointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patientName,
      time: apt.time,
      type: apt.serviceName,
      status: apt.paymentStatus,
      avatar: apt.patientAvatar,
    }));
  }, [paidAppointments]);

  // Use real patients data from database instead of mock data
  const patients = realPatients || [];

  const { data: doctorNotifs = [], isLoading: doctorNotifsLoading } =
    useNotifications();
  const notifications = useMemo(() => {
    const profileId = profile?.id;
    const onlyProfileTargeted = (doctorNotifs || []).filter(
      (n: NotificationRow) =>
        !profileId ? true : n.recipient_profile_id === profileId
    );
    return onlyProfileTargeted.slice(0, 6).map((n: NotificationRow) => ({
      id: n.id,
      message: n.title || n.body || "Notification",
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
      type:
        (n?.data && typeof n.data === "object"
          ? (n.data as any).type
          : undefined) ||
        (typeof n.title === "string" && n.title.toLowerCase().includes("lab")
          ? "results"
          : "info"),
    }));
  }, [doctorNotifs, profile?.id]);

  const messages = useMemo(() => {
    return rescheduleRequests
      .filter((r) => r.status === "pending")
      .slice(0, 2)
      .map((r, index) => ({
        id: index + 1,
        from:
          patients?.find(
            (p) =>
              (p as any).email ===
              paidAppointments.find(
                (apt) => apt.id === (r as any).appointment_id
              )?.patientEmail
          )?.name || "Unknown Patient",
        subject: "Appointment reschedule request",
        message: `Hi Dr. Wilson, I need to reschedule my appointment. ${
          r.reason || "No reason provided"
        }`,
        time: index === 0 ? "2 hours ago" : "1 day ago",
        unread: index === 0,
        avatar:
          patients?.find(
            (p) =>
              (p as any).email ===
              paidAppointments.find(
                (apt) => apt.id === (r as any).appointment_id
              )?.patientEmail
          )?.avatar_url ||
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=256&auto=format&fit=crop",
      }));
  }, [rescheduleRequests, patients, paidAppointments]);

  const reports = useMemo(() => {
    return paidAppointments.slice(0, 2).map((apt, index) => ({
      id: apt.id,
      patientName: apt.patientName,
      type: index === 0 ? "Blood Test Results" : "X-Ray Report",
      date: apt.date,
      status: index === 0 ? "completed" : "pending",
      fileSize: index === 0 ? "2.3 MB" : "5.1 MB",
    }));
  }, [paidAppointments]);

  // Helper function to format dates
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const loadRescheduleRequests = useCallback(async () => {
    if (!profile?.id) return;

    setLoadingReschedules(true);
    console.log("Reschedule requests not available - table doesn't exist");

    try {
      // Return empty array since reschedule_requests table doesn't exist
      const data: any[] = [];
      const mapped: RescheduleRequest[] = [];
      
      setRescheduleRequests(mapped);
      const pendingCount = 0;
      setRescheduleBannerCount(pendingCount);
      setShowRescheduleBanner(false);
    } catch (e) {
      console.error("Error in loadRescheduleRequests:", e);
    } finally {
      setLoadingReschedules(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadRescheduleRequests();
  }, [loadRescheduleRequests]);

  const updateRequestStatus = async (
    id: number,
    status: RescheduleRequest["status"]
  ) => {
    try {
      setUpdatingRequest(id);
      
      // Since reschedule_requests table doesn't exist, just update local state
      setRescheduleRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );

      setNotificationMessage({
        type: "success",
        message: `Request ${status} successfully.`,
      });
      setTimeout(() => setNotificationMessage(null), 3000);
    } finally {
      setUpdatingRequest(null);
    }
  };

  const renderReschedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Reschedule Requests
          </h2>
          <p className="text-gray-600">
            Manage patient requests to reschedule appointments
          </p>
        </div>
        {notificationMessage && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
              notificationMessage.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{notificationMessage.message}</span>
              <button
                onClick={() => setNotificationMessage(null)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={loadRescheduleRequests}
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              console.log("Current profile ID:", profile?.id);
              console.log("Current reschedule requests:", rescheduleRequests);
            }}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Debug Info
          </button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {rescheduleRequests.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingRescheduleCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">
                {
                  rescheduleRequests.filter((r) => r.status === "approved")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center">
            <div className="p-2 bg-rose-100 rounded-lg">
              <svg
                className="w-6 h-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-rose-600">
                {
                  rescheduleRequests.filter((r) => r.status === "declined")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
          <div className="col-span-3">Patient</div>
          <div className="col-span-3">Service</div>
          <div className="col-span-2">Current</div>
          <div className="col-span-2">Requested</div>
          <div className="col-span-2 text-right">Action</div>
        </div>
        {rescheduleRequests.map((r) => (
          <div
            key={r.id}
            className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
          >
            <div className="col-span-3 font-medium text-gray-900">
              {r.patientName}
            </div>
            <div className="col-span-3 text-gray-700">{r.serviceName}</div>
            <div className="col-span-2 text-gray-700">
              <div className="font-medium">{formatDate(r.currentDate)}</div>
              <div className="text-xs text-gray-500">
                {formatTime(r.currentTime.split(" - ")[0])} -{" "}
                {formatTime(r.currentTime.split(" - ")[1] || "")}
              </div>
            </div>
            <div className="col-span-2 text-gray-700">
              <div className="font-medium">{formatDate(r.requestedDate)}</div>
              <div className="text-xs text-gray-500">
                {formatTime(r.requestedTime.split(" - ")[0])} -{" "}
                {formatTime(r.requestedTime.split(" - ")[1] || "")}
              </div>
            </div>
            <div className="col-span-2 md:text-right flex md:justify-end gap-2">
              {r.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                    <svg
                      className="w-3 h-3 mr-1 animate-pulse"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pending
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateRequestStatus(r.id, "approved")}
                      disabled={updatingRequest === r.id}
                      className={`px-2.5 py-1.5 rounded-lg text-white text-xs transition-colors ${
                        updatingRequest === r.id
                          ? "bg-emerald-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {updatingRequest === r.id ? "Updating..." : "Approve"}
                    </button>
                    <button
                      onClick={() => updateRequestStatus(r.id, "declined")}
                      disabled={updatingRequest === r.id}
                      className={`px-2.5 py-1.5 rounded-lg text-white text-xs transition-colors ${
                        updatingRequest === r.id
                          ? "bg-rose-400 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {updatingRequest === r.id ? "Updating..." : "Decline"}
                    </button>
                  </div>
                </div>
              ) : (
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
                    r.status === "approved"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {r.status === "approved" ? (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Approved
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Declined
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="md:col-span-12">
              <div className="text-xs text-gray-500">
                <span className="font-medium">Reason:</span>{" "}
                {r.reason || "No reason provided"}
              </div>
            </div>
          </div>
        ))}
        {loadingReschedules ? (
          <div className="px-6 py-10 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading reschedule requests...
            </div>
          </div>
        ) : rescheduleRequests.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="inline-flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reschedule requests
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                When patients request to reschedule appointments, they will
                appear here.
              </p>
              <button
                onClick={async () => {
                  if (!profile?.id) return;
                  try {
                    // First, create a test appointment if none exist
                    let appointmentId = 1;
                    const { data: existingAppointments } = await supabase
                      .from("appointments")
                      .select("id")
                      .limit(1);

                    if (
                      existingAppointments &&
                      existingAppointments.length > 0
                    ) {
                      appointmentId = existingAppointments[0].id;
                    } else {
                      // Create a test appointment first
                      // First get an available service
                      const { data: services } = await supabase
                        .from("services")
                        .select("id")
                        .limit(1);

                      if (
                        !transformedServices ||
                        transformedServices.length === 0
                      ) {
                        setNotificationMessage({
                          type: "error",
                          message:
                            "No services available. Please create a service first.",
                        });
                        setTimeout(() => setNotificationMessage(null), 5000);
                        return;
                      }

                      const { data: newAppointment, error: apptError } =
                        await supabase
                          .from("appointments")
                          .insert({
                            patient_profile_id: profile.id, // Use current profile as patient for testing
                            service_id: services[0].id,
                            date: "2024-12-24",
                            start_time: "14:00",
                            end_time: "15:00",
                            price_cents: 5000,
                            mode: "In-person" as const,
                            appointment_status: "scheduled" as const,
                            payment_status: "pending" as const,
                          })
                          .select("id")
                          .single();

                      if (apptError) {
                        console.error(
                          "Error creating test appointment:",
                          apptError
                        );
                        setNotificationMessage({
                          type: "error",
                          message:
                            "Error creating test appointment: " +
                            apptError.message,
                        });
                        setTimeout(() => setNotificationMessage(null), 5000);
                        return;
                      }
                      appointmentId = newAppointment.id;
                    }

                    // Reschedule requests table doesn't exist yet
                    console.log("Would create reschedule request but table doesn't exist");
                    
                    setNotificationMessage({
                      type: "success",
                      message: "Reschedule feature not yet available",
                    });
                    setTimeout(() => setNotificationMessage(null), 5000);
                  } catch (e) {
                    console.error("Error:", e);
                    setNotificationMessage({
                      type: "error",
                      message: "Error creating test data",
                    });
                    setTimeout(() => setNotificationMessage(null), 5000);
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Test Request
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      {/* Removed duplicate Billing header (page already has a section title above) */}

      {/* Stripe connect notice (interactive) */}
      <div
        className={`${
          (profile as any)?.stripe_account_id || stripeConnected
            ? "bg-emerald-50 border-emerald-200"
            : "bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 border-blue-200"
        } border rounded-xl p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3">
          {/* Stripe logo */}
          <img
            src="https://www.citypng.com/public/uploads/preview/hd-stripe-official-logo-png-701751694777755j0aa3puxte.png"
            alt="Stripe"
            className="w-12 h-12 object-contain"
          />
          <div>
            <div
              className={`text-sm font-medium ${
                (profile as any)?.stripe_account_id || stripeConnected
                  ? "text-emerald-900"
                  : "text-blue-900"
              }`}
            >
              {(profile as any)?.stripe_account_id || stripeConnected
                ? "Stripe account connected"
                : "Connect your Stripe account"}
            </div>
            <div
              className={`text-sm ${
                (profile as any)?.stripe_account_id || stripeConnected
                  ? "text-emerald-800"
                  : "text-blue-800"
              }`}
            >
              {(profile as any)?.stripe_account_id || stripeConnected
                ? "You will receive payouts for sessions and services."
                : "Connect Stripe to receive payouts for your sessions and services."}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(profile as any)?.stripe_account_id || stripeConnected ? (
            <button
              className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-default"
              disabled
            >
              Connected
            </button>
          ) : (
            <button
              onClick={() => {
                window.location.href =
                  "https://connect.stripe.com/express/onboarding";
              }}
              className="px-4 py-2 rounded-md bg-[#635BFF] text-white hover:brightness-110 shadow-sm"
            >
              Connect
            </button>
          )}
          <button
            onClick={() => {
              window.open("https://stripe.com/connect", "_blank");
            }}
            className="px-3 py-2 rounded-md border border-blue-200 text-blue-800 hover:bg-white/50 hidden sm:inline"
          >
            Learn more
          </button>
        </div>
      </div>

      {/* Payments Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Paid Patients</p>
          <p className="text-2xl font-bold text-gray-900">
            {
              Array.from(
                new Set(
                  paidAppointments
                    .filter((a) => a.paymentStatus === "paid")
                    .map((a) => a.patientEmail)
                )
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Paid Sessions</p>
          <p className="text-2xl font-bold text-gray-900">
            {paidAppointments.filter((a) => a.paymentStatus === "paid").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Pending Balance</p>
          <div className="mt-1 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-500" />
            <p className="text-2xl font-bold text-gray-900">
              ${pendingBalance}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Payout Method</p>
          <p className="text-2xl font-bold text-gray-900 capitalize">
            {payoutMethod}
          </p>
        </div>
      </div>

      {/* Billing tabs removed as requested */}

      {/* Earnings */}
      {true && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Earnings Overview
              </h3>
              <p className="text-sm text-gray-600">
                Daily totals of paid sessions
              </p>
            </div>
            <div className="p-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={earningsData}
                  margin={{ left: 8, right: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Paid list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900">
              Paid Sessions
            </div>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
              <div className="col-span-4">Patient</div>
              <div className="col-span-4">Service</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {paidAppointments
              .filter((a) => a.paymentStatus === "paid")
              .map((appt) => (
                <div
                  key={appt.id}
                  className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <img
                      src={appt.patientAvatar}
                      alt={appt.patientName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {appt.patientName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appt.patientEmail}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="font-medium text-gray-900">
                      {appt.serviceName}
                    </div>
                    <div className="text-xs text-gray-500">{appt.mode}</div>
                  </div>
                  <div className="col-span-2 text-gray-700">{appt.date}</div>
                  <div className="col-span-2 md:text-right font-semibold text-gray-900">
                    ${appt.price}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Payment Method section removed */}

      {/* Withdraw section removed */}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Profile Settings</span>
          </h3>
          <div className="space-y-4">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {avatarDataUrl ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarDataUrl}
                        alt="avatar preview"
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          Preview
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG/JPG up to 2.5MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarSelected}
                        />
                      </label>
                      <button
                        onClick={() => setAvatarDataUrl("")}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Click to upload
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG/JPG up to 2.5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarSelected}
                    />
                  </label>
                )}
              </div>
            </div>
            {/* Name and Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 cursor-not-allowed"
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Practice Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practice Name
              </label>
              <input
                type="text"
                value={practiceName}
                onChange={(e) => setPracticeName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Practice Address
              </label>
              <input
                type="text"
                value={practiceAddress}
                onChange={(e) => setPracticeAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip
                </label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Education & Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              <textarea
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                type="text"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 3-5 or 8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Tell patients about your background, approach, and specialties"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              disabled={isSavingAvatar}
            >
              {isSavingAvatar ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border p-6 max-w-sm w-full justify-self-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Notifications</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">SMS Notifications</span>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Appointment Reminders
              </span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Patient Messages</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>

        {/* Removed Security and Billing & Payments sections per request */}
      </div>
    </div>
  );

  const renderServices = () => {
    const handleNewServiceChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      const name = (
        target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).name;

      let nextValue: string | number | boolean = (
        target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      ).value;

      if (
        "checked" in target &&
        (target as HTMLInputElement).type === "checkbox"
      ) {
        nextValue = (target as HTMLInputElement).checked;
      } else if (name === "durationMin" || name === "price") {
        nextValue = Number(
          (target as HTMLInputElement | HTMLSelectElement).value
        );
      }

      setNewService((prev) => ({
        ...prev,
        [name]: nextValue,
      }));
    };

    const readFileAsDataUrl = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    };

    const handleImageSelected = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      // basic size guard ~2.5MB
      if (file.size > 2.5 * 1024 * 1024) {
        alert("Please select an image smaller than 2.5MB");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setNewService((prev) => ({ ...prev, imageUrl: dataUrl }));
      } catch (err) {
        console.error(err);
      }
    };

    const resetForm = () => {
      setNewService({
        name: "",
        category: "Consultation",
        durationMin: 30,
        price: 0,
        mode: "In-person",
        description: "",
        benefitsInput: "",
        imageUrl: "",
        active: true,
        customCategory: "",
        locationAddress: "",
        availableDays: [],
        scheduleType: "same",
        numberOfSlots: 1,
        timeSlots: [{ start: "", end: "" }],
        customSchedules: {},
      });
      setEditingServiceId(null);
      setFormMode("create");
    };

    const handleAddService = async () => {
      if (
        !newService.name ||
        !newService.category ||
        !newService.durationMin ||
        !newService.price
      )
        return;
      if (newService.category === "Other" && !newService.customCategory.trim())
        return;
      if (newService.mode === "In-person" && !newService.locationAddress.trim())
        return;

      if (!profile?.id) {
        alert("Error: Could not identify professional profile");
        return;
      }

      try {
        // First get the professional ID
        const { data: professionalData, error: profError } = await supabase
          .from("professionals")
          .select("id")
          .eq("profile_id", profile.id)
          .single();

        if (profError || !professionalData) {
          console.error("Error getting professional ID:", profError);
          alert("Error: Could not identify professional profile");
          return;
        }

        const professionalId = professionalData.id;
        const benefits = newService.benefitsInput
          .split(/\n|,/)
          .map((b) => b.trim())
          .filter(Boolean);

        const resolvedCategory =
          newService.category === "Other"
            ? newService.customCategory.trim()
            : newService.category;

        // First, get or create the category
        let categoryId: number | null = null;

        if (resolvedCategory) {
          // Try to find existing category
          const { data: existingCategory, error: categoryError } =
            await supabase
              .from("categories")
              .select("id")
              .eq("name", resolvedCategory)
              .eq("kind", "service")
              .maybeSingle();

          if (categoryError) {
            console.error("Error finding category:", categoryError);
          } else if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            // Create new category if it doesn't exist
            const { data: newCategory, error: createCategoryError } =
              await supabase
                .from("categories")
                .insert({
                  slug: resolvedCategory.toLowerCase().replace(/\s+/g, "-"),
                  name: resolvedCategory,
                  kind: "service",
                })
                .select("id")
                .single();

            if (createCategoryError) {
              console.error("Error creating category:", createCategoryError);
            } else if (newCategory) {
              categoryId = newCategory.id;
            }
          }
        }

        // Create service in database
        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .insert([
            {
              professional_id: professionalId,
              slug:
                newService.name.toLowerCase().replace(/\s+/g, "-") +
                "-" +
                Date.now(),
              name: newService.name,
              category_id: categoryId, // Now properly set the category ID
              duration_min: Number(newService.durationMin),
              price_cents: Math.round(Number(newService.price) * 100), // Convert dollars to cents
              mode: newService.mode as "In-person" | "Virtual",
              active: newService.active,
              description: newService.description,
              benefits: benefits,
              image_url: newService.imageUrl || null,
              location_address: newService.locationAddress || null,
              availability: {
                days: newService.availableDays,
                scheduleType: newService.scheduleType,
                numberOfSlots: newService.numberOfSlots,
                timeSlots: newService.timeSlots,
                customSchedules:
                  newService.scheduleType === "custom"
                    ? newService.customSchedules
                    : undefined,
              },
            },
          ])
          .select()
          .single();

        if (serviceError) {
          console.error("Error creating service:", serviceError);
          alert("Error creating service: " + serviceError.message);
          return;
        }

        console.log("Service created successfully:", serviceData);

        // Reload services to show the new one
        await loadServices();

        setNewService({
          name: "",
          category: "Consultation",
          durationMin: 30,
          price: 0,
          mode: "In-person",
          description: "",
          benefitsInput: "",
          imageUrl: "",
          active: true,
          customCategory: "",
          locationAddress: "",
          availableDays: [],
          scheduleType: "same",
          numberOfSlots: 1,
          timeSlots: [{ start: "", end: "" }],
          customSchedules: {},
        });
        setShowServiceForm(false);
      } catch (e) {
        console.error("Error in handleAddService:", e);
        alert("Error creating service");
      }
    };

    const handleStartEditService = (svc: Service) => {
      setFormMode("edit");
      setEditingServiceId(svc.id);
      setShowServiceForm(true);

      // Get the actual category name if we have category_id
      let categoryName = svc.category;
      let customCategory = "";

      if (svc.category === "Category" && svc.id) {
        // Try to get the actual category name from the database
        // For now, we'll use a default approach
        categoryName = "Consultation"; // Default fallback
      } else if (svc.category && svc.category !== "Category") {
        const predefinedCategories = [
          "Consultation",
          "Follow-up",
          "Assessment",
          "Therapy",
          "Nutrition",
          "Mental Health",
          "Wellness",
        ];
        if (predefinedCategories.includes(svc.category)) {
          categoryName = svc.category;
        } else {
          categoryName = "Other";
          customCategory = svc.category;
        }
      }

      // Ensure availability data is properly structured
      const availability = svc.availability || {};
      const availableDays = (availability as any).days || [];
      const scheduleType = (availability as any).customSchedules
        ? "custom"
        : "same";
      const numberOfSlots = (availability as any).numberOfSlots || 1;
      const timeSlots = (availability as any).timeSlots || [
        { start: "", end: "" },
      ];
      const customSchedules = (availability as any).customSchedules || {};

      setNewService({
        name: svc.name,
        category: categoryName,
        customCategory: customCategory,
        durationMin: svc.durationMin,
        price: svc.price,
        mode: svc.mode,
        description: svc.description,
        benefitsInput: svc.benefits.join("\n"),
        imageUrl: svc.imageUrl,
        active: svc.active,
        locationAddress: svc.locationAddress || "",
        availableDays: availableDays,
        scheduleType: scheduleType,
        numberOfSlots: numberOfSlots,
        timeSlots: timeSlots,
        customSchedules: customSchedules,
      });

      console.log("Editing service with data:", {
        service: svc,
        availability: availability,
        formData: {
          availableDays,
          scheduleType,
          numberOfSlots,
          timeSlots,
          customSchedules,
        },
      });
    };

    const handleSaveEdit = async () => {
      if (editingServiceId == null) return;
      if (newService.category === "Other" && !newService.customCategory.trim())
        return;
      if (newService.mode === "In-person" && !newService.locationAddress.trim())
        return;
      const benefits = newService.benefitsInput
        .split(/\n|,/)
        .map((b) => b.trim())
        .filter(Boolean);
      const resolvedCategory =
        newService.category === "Other"
          ? newService.customCategory.trim()
          : newService.category;

      // First, get or create the category
      let categoryId: number | null = null;

      if (resolvedCategory) {
        // Try to find existing category
        const { data: existingCategory, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", resolvedCategory)
          .eq("kind", "service")
          .maybeSingle();

        if (categoryError) {
          console.error("Error finding category:", categoryError);
        } else if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category if it doesn't exist
          const { data: newCategory, error: createCategoryError } =
            await supabase
              .from("categories")
              .insert({
                slug: resolvedCategory.toLowerCase().replace(/\s+/g, "-"),
                name: resolvedCategory,
                kind: "service",
              })
              .select("id")
              .single();

          if (createCategoryError) {
            console.error("Error creating category:", createCategoryError);
          } else if (newCategory) {
            categoryId = newCategory.id;
          }
        }
      }

      // Update service in database
      try {
        const { error: updateErr } = await supabase
          .from("services")
          .update({
            name: newService.name,
            category_id: categoryId,
            duration_min: Number(newService.durationMin),
            price_cents: Math.round(Number(newService.price) * 100),
            mode: newService.mode as "In-person" | "Virtual",
            description: newService.description,
            benefits: benefits,
            image_url: newService.imageUrl || null,
            location_address: newService.locationAddress || null,
            active: newService.active,
            availability: {
              days: newService.availableDays,
              scheduleType: newService.scheduleType,
              numberOfSlots: newService.numberOfSlots,
              timeSlots: newService.timeSlots,
              customSchedules:
                newService.scheduleType === "custom"
                  ? newService.customSchedules
                  : undefined,
            },
          })
          .eq("id", editingServiceId);
        if (updateErr) {
          console.error("Failed to update service:", updateErr);
          alert("Error updating service: " + updateErr.message);
          return;
        }
      } catch (e) {
        console.error("Unexpected error updating service:", e);
        alert("Error updating service");
        return;
      }

      try {
        // Reload services to get the updated data
        await loadServices();

        setNewService({
          name: "",
          category: "Consultation",
          durationMin: 30,
          price: 0,
          mode: "In-person",
          description: "",
          benefitsInput: "",
          imageUrl: "",
          active: true,
          customCategory: "",
          locationAddress: "",
          availableDays: [],
          scheduleType: "same",
          numberOfSlots: 1,
          timeSlots: [{ start: "", end: "" }],
          customSchedules: {},
        });
        setEditingServiceId(null);
        setFormMode("create");
        setShowServiceForm(false);
      } catch (e) {
        console.error("Error in handleSaveEdit:", e);
        alert("Error updating service");
      }
    };

    const handleDeleteService = async (id: number) => {
      try {
        const { error } = await supabase.from("services").delete().eq("id", id);

        if (error) {
          console.error("Error deleting service:", error);
          alert("Error deleting service: " + error.message);
          return;
        }

        // Reload services to reflect the deletion
        await loadServices();
      } catch (e) {
        console.error("Error in handleDeleteService:", e);
        alert("Error deleting service");
      }
    };

    const handleToggleActive = async (id: number) => {
      try {
        // Find current service to get current active status
        const currentService = services.find((s) => s.id === id);
        if (!currentService) return;

        const newActiveStatus = !currentService.active;

        const { error } = await supabase
          .from("services")
          .update({ active: newActiveStatus })
          .eq("id", id);

        if (error) {
          console.error("Error updating service:", error);
          alert("Error updating service: " + error.message);
          return;
        }

        // Reload services to reflect the change
        await loadServices();
      } catch (e) {
        console.error("Error in handleToggleActive:", e);
        alert("Error updating service");
      }
    };

    return (
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            {/* Duplicate tab header removed; using top dynamic header */}
          </div>
          <div className="flex items-center gap-2">
            {showServiceForm && (
              <button
                onClick={() => {
                  setShowServiceForm(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            )}
            <button
              onClick={() => {
                setShowServiceForm((v) => !v);
                setFormMode("create");
                setEditingServiceId(null);
                if (!showServiceForm) resetForm();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Create/Edit Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {formMode === "create"
                        ? "Create New Service"
                        : "Edit Service"}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Configure your service details and availability
                    </p>
                    {formMode === "create" &&
                      !(profile as any)?.stripe_account_id && (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-3 py-2 text-xs flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-[10px]">
                              !
                            </span>
                            Connect your Stripe account before creating services
                            to receive payouts.
                          </span>
                          <button
                            onClick={() => {
                              window.location.href =
                                "/doctor-dashboard?tab=billing";
                            }}
                            className="ml-3 inline-flex items-center rounded-md border border-amber-300 px-2 py-1 text-amber-900 hover:bg-amber-100"
                          >
                            Connect now
                          </button>
                        </div>
                      )}
                  </div>
                  <div className="flex items-center gap-3">
                    {formMode === "edit" && (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                        Editing
                      </span>
                    )}
                    <button
                      onClick={() => setShowServiceForm(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Basic Service Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Service Name
                      </label>
                      <input
                        name="name"
                        value={newService.name}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="e.g., General Consultation"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={newService.category}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option>Consultation</option>
                        <option>Follow-up</option>
                        <option>Assessment</option>
                        <option>Therapy</option>
                        <option>Nutrition</option>
                        <option>Mental Health</option>
                        <option>Wellness</option>
                        <option>Other</option>
                      </select>
                    </div>
                    {newService.category === "Other" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Custom Category
                        </label>
                        <input
                          name="customCategory"
                          value={newService.customCategory}
                          onChange={handleNewServiceChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                          placeholder="Enter custom category"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="durationMin"
                        value={newService.durationMin}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        min={5}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={newService.price}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Mode
                      </label>
                      <select
                        name="mode"
                        value={newService.mode}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option>In-person</option>
                        <option>Virtual</option>
                      </select>
                    </div>
                  </div>

                  {/* Availability Configuration */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Schedule Type Selection */}
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                      <label className="block text-xs font-medium text-blue-800 mb-3">
                        Schedule Type
                      </label>
                      <div className="flex gap-3">
                        <label
                          className={`flex-1 cursor-pointer transition-all duration-300 ${
                            newService.scheduleType === "same"
                              ? "bg-blue-600 text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-blue-50 hover:scale-102"
                          }`}
                        >
                          <input
                            type="radio"
                            name="scheduleType"
                            value="same"
                            checked={newService.scheduleType === "same"}
                            onChange={(e) =>
                              setNewService((prev) => ({
                                ...prev,
                                scheduleType: e.target.value as
                                  | "same"
                                  | "custom",
                              }))
                            }
                            className="hidden"
                          />
                          <div className="p-3 rounded-lg border-2 border-transparent text-center">
                            <div className="font-medium text-sm">
                              Same for All Days
                            </div>
                            <div className="text-xs opacity-80 mt-1">
                              Use identical time slots every day
                            </div>
                          </div>
                        </label>
                        <label
                          className={`flex-1 cursor-pointer transition-all duration-300 ${
                            newService.scheduleType === "custom"
                              ? "bg-purple-600 text-white shadow-md scale-105"
                              : "bg-white text-gray-700 hover:bg-purple-50 hover:scale-102"
                          }`}
                        >
                          <input
                            type="radio"
                            name="scheduleType"
                            value="custom"
                            checked={newService.scheduleType === "custom"}
                            onChange={(e) =>
                              setNewService((prev) => ({
                                ...prev,
                                scheduleType: e.target.value as
                                  | "same"
                                  | "custom",
                              }))
                            }
                            className="hidden"
                          />
                          <div className="p-3 rounded-lg border-2 border-transparent text-center">
                            <div className="font-medium text-sm">
                              Customize Per Day
                            </div>
                            <div className="text-xs opacity-80 mt-1">
                              Different schedules for different days
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Available Days Selection */}
                    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                      <label className="block text-sm font-medium text-emerald-800 mb-4">
                        Available Days
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (d) => (
                            <label
                              key={d}
                              className={`cursor-pointer transition-all duration-300 ${
                                newService.availableDays.includes(d)
                                  ? "bg-emerald-500 text-white shadow-md scale-105"
                                  : "bg-white text-gray-600 hover:bg-emerald-100 hover:scale-102"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={newService.availableDays.includes(d)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setNewService((prev) => ({
                                    ...prev,
                                    availableDays: checked
                                      ? [...prev.availableDays, d]
                                      : prev.availableDays.filter(
                                          (x) => x !== d
                                        ),
                                  }));
                                }}
                                className="hidden"
                              />
                              <div className="p-3 rounded-xl border-2 border-transparent text-center font-semibold text-sm">
                                {d}
                              </div>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {/* Time Slots Configuration */}
                    {newService.scheduleType === "same" ? (
                      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-purple-800">
                            Time Slots (Same for All Days)
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-purple-600 font-medium">
                              Number of slots:
                            </span>
                            <select
                              value={newService.numberOfSlots || 1}
                              onChange={(e) => {
                                const slots = parseInt(e.target.value);
                                setNewService((prev) => ({
                                  ...prev,
                                  numberOfSlots: slots,
                                  timeSlots: Array(slots)
                                    .fill("")
                                    .map((_, index) => ({
                                      start: "",
                                      end: "",
                                    })),
                                }));
                              }}
                              className="text-xs border border-purple-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                            >
                              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {Array.from({
                            length: newService.numberOfSlots || 1,
                          }).map((_, index) => (
                            <div
                              key={index}
                              className="flex gap-3 items-center p-3 bg-white rounded-xl border border-purple-200 shadow-sm"
                            >
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                                {index + 1}
                              </div>
                              <select
                                value={
                                  newService.timeSlots?.[index]?.start || ""
                                }
                                onChange={(e) => {
                                  const selectedTime = e.target.value;
                                  const selectedSlot = generateTimeSlots(
                                    newService.durationMin
                                  ).find((slot) => slot.start === selectedTime);
                                  const updatedSlots = [
                                    ...(newService.timeSlots || []),
                                  ];
                                  updatedSlots[index] = {
                                    start: selectedTime,
                                    end: selectedSlot?.end || "",
                                  };
                                  setNewService((prev) => ({
                                    ...prev,
                                    timeSlots: updatedSlots,
                                  }));
                                }}
                                className="flex-1 border border-purple-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                              >
                                <option value="">Select start time</option>
                                {generateTimeSlots(newService.durationMin).map(
                                  (slot, slotIndex) => (
                                    <option key={slotIndex} value={slot.start}>
                                      {formatTime12h(slot.start)} -{" "}
                                      {formatTime12h(slot.end)} (
                                      {newService.durationMin} min)
                                    </option>
                                  )
                                )}
                              </select>
                              <div className="w-24 border border-purple-300 rounded-xl px-3 py-2 bg-purple-50 text-purple-700 text-xs text-center font-medium">
                                {newService.timeSlots?.[index]?.end
                                  ? formatTime12h(
                                      newService.timeSlots?.[index]
                                        ?.end as string
                                    )
                                  : "--:-- --"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                        <label className="block text-sm font-medium text-amber-800 mb-4">
                          Custom Schedule Per Day
                        </label>
                        <div className="space-y-4">
                          {newService.availableDays.map((day) => (
                            <div
                              key={day}
                              className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-amber-800 text-base">
                                  {day}
                                </h4>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-amber-600 font-medium">
                                    Slots:
                                  </span>
                                  <select
                                    value={
                                      newService.customSchedules?.[day]
                                        ?.numberOfSlots || 1
                                    }
                                    onChange={(e) => {
                                      const slots = parseInt(e.target.value);
                                      const updatedSchedules = {
                                        ...newService.customSchedules,
                                      };
                                      updatedSchedules[day] = {
                                        ...updatedSchedules[day],
                                        numberOfSlots: slots,
                                        timeSlots: Array(slots)
                                          .fill("")
                                          .map(() => ({ start: "", end: "" })),
                                      };
                                      setNewService((prev) => ({
                                        ...prev,
                                        customSchedules: updatedSchedules,
                                      }));
                                    }}
                                    className="text-xs border border-amber-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                                      <option key={num} value={num}>
                                        {num}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {Array.from({
                                  length:
                                    newService.customSchedules?.[day]
                                      ?.numberOfSlots || 1,
                                }).map((_, index) => (
                                  <div
                                    key={index}
                                    className="flex gap-3 items-center"
                                  >
                                    <span className="text-xs text-amber-600 w-20 font-medium">
                                      Slot {index + 1}:
                                    </span>
                                    <select
                                      value={
                                        newService.customSchedules?.[day]
                                          ?.timeSlots?.[index]?.start || ""
                                      }
                                      onChange={(e) => {
                                        const selectedTime = e.target.value;
                                        const selectedSlot = generateTimeSlots(
                                          newService.durationMin
                                        ).find(
                                          (slot) => slot.start === selectedTime
                                        );
                                        const updatedSchedules = {
                                          ...newService.customSchedules,
                                        };
                                        if (!updatedSchedules[day])
                                          updatedSchedules[day] = {
                                            numberOfSlots: 1,
                                            timeSlots: [],
                                          };
                                        if (!updatedSchedules[day].timeSlots)
                                          updatedSchedules[day].timeSlots = [];
                                        updatedSchedules[day].timeSlots[index] =
                                          {
                                            start: selectedTime,
                                            end: selectedSlot?.end || "",
                                          };
                                        setNewService((prev) => ({
                                          ...prev,
                                          customSchedules: updatedSchedules,
                                        }));
                                      }}
                                      className="flex-1 border border-amber-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                                    >
                                      <option value="">Select time</option>
                                      {generateTimeSlots(
                                        newService.durationMin
                                      ).map((slot, slotIndex) => (
                                        <option
                                          key={slotIndex}
                                          value={slot.start}
                                        >
                                          {slot.start} - {slot.end} (
                                          {newService.durationMin} min)
                                        </option>
                                      ))}
                                    </select>
                                    <div className="w-24 border border-amber-300 rounded-xl px-3 py-2 bg-amber-50 text-amber-700 text-xs text-center font-medium">
                                      {newService.customSchedules?.[day]
                                        ?.timeSlots?.[index]?.end || "--:-- --"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Fields */}
                  {newService.mode === "In-person" && (
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Location Address
                      </label>
                      <input
                        name="locationAddress"
                        value={newService.locationAddress}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="e.g., 123 Health Ave, Wellness City"
                      />
                    </div>
                  )}

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Image Upload
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                      {newService.imageUrl ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={newService.imageUrl}
                              alt="preview"
                              className="w-20 h-20 rounded-xl object-cover"
                            />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">
                                Preview
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG/JPG up to 2.5MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setNewService((prev) => ({
                                ...prev,
                                imageUrl: "",
                              }))
                            }
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-500 mb-2" />
                          <span className="text-sm text-gray-700 font-medium">
                            Click to upload
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG/JPG up to 2.5MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelected}
                          />
                        </label>
                      )}
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Or paste image URL
                      </label>
                      <input
                        name="imageUrl"
                        value={newService.imageUrl}
                        onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newService.description}
                      onChange={handleNewServiceChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      rows={3}
                      placeholder="Describe your service..."
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Benefits (one per line)
                    </label>
                    <textarea
                      name="benefitsInput"
                      value={newService.benefitsInput}
                      onChange={handleNewServiceChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      rows={3}
                      placeholder="List the benefits of your service..."
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-3">
                      <input
                        id="service-active"
                        type="checkbox"
                        name="active"
                        checked={newService.active}
                        onChange={handleNewServiceChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="service-active"
                        className="text-sm font-medium text-gray-700"
                      >
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowServiceForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      formMode === "create" ? handleAddService : handleSaveEdit
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    {formMode === "create" ? "Create Service" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Services
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {transformedServices.length} total
              </span>
              <button
                onClick={loadServices}
                className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {loadingServices ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-xl overflow-hidden bg-white shadow-sm"
                  >
                    {/* Image header skeleton */}
                    <div className="relative aspect-video bg-gray-200 animate-pulse">
                      <div className="absolute top-3 left-3 h-5 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="absolute top-3 right-3 h-5 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>

                    {/* Body skeleton */}
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="text-right">
                          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
                        </div>
                      </div>

                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>

                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div
                            key={j}
                            className="h-6 bg-gray-200 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : transformedServices.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-gray-500">
                  No services yet. Create your first service to get started!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {transformedServices.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Image header */}
                    <div className="relative aspect-video bg-gray-100">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Stethoscope className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 inline-flex px-2 py-1 text-xs rounded-full bg-blue-600 text-white">
                        {service.category}
                      </div>
                      <div
                        className={`absolute top-3 right-3 inline-flex px-2 py-1 text-xs rounded-full ${
                          service.active ? "bg-green-600" : "bg-gray-500"
                        } text-white`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <h4 className="text-base font-semibold text-gray-900">
                          {service.name}
                        </h4>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ${service.price}
                          </div>
                          <div className="text-xs text-gray-500">
                            {service.mode}
                          </div>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-gray-600">
                        {service.description}
                      </p>

                      {service.benefits.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            Benefits
                          </h5>
                          <ul className="mt-1 space-y-1 text-sm text-gray-700 list-disc list-inside">
                            {service.benefits.slice(0, 4).map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                          Duration:{" "}
                          <span className="font-medium">
                            {service.durationMin}m
                          </span>
                        </div>
                        <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                          Mode:{" "}
                          <span className="font-medium">{service.mode}</span>
                        </div>
                        <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                          Price:{" "}
                          <span className="font-medium">${service.price}</span>
                        </div>
                      </div>
                      {service.mode !== "Virtual" &&
                        service.locationAddress && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="line-clamp-2">
                              {service.locationAddress}
                            </span>
                          </div>
                        )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(service.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium ${
                              service.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {service.active ? "Set Inactive" : "Set Active"}
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStartEditService(service)}
                            className="px-2.5 py-1.5 rounded-lg border text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 text-sm"
                          >
                            <Edit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "appointments":
        return renderAppointments();
      case "refunds":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                {/* Duplicate tab header removed; using top dynamic header */}
              </div>
              <button
                onClick={loadRefunds}
                disabled={loadingRefunds}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loadingRefunds ? "animate-spin" : ""}`}
                />
                <span>{loadingRefunds ? "Loading..." : "Refresh"}</span>
              </button>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden">
              {loadingRefunds ? (
                <div className="px-6 py-8 text-center text-gray-600">
                  Loading refund requests…
                </div>
              ) : refunds.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  No refund requests yet.
                </div>
              ) : (
                <div className="divide-y">
                  {refunds.map((n) => (
                    <div
                      key={n.id}
                      className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                    >
                      <div className="md:col-span-7 flex items-center gap-3">
                        <img
                          src={n.patientAvatar || ""}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {n.serviceName}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {n.patientName || "Patient"} • {n.date || ""}
                            {n.time ? ` • ${n.time}` : ""}
                          </div>
                          {n.reason && (
                            <div className="text-xs text-gray-500 mt-1">
                              Reason: {n.reason}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-5 md:text-right flex md:justify-end gap-3 items-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            n.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : n.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {n.status[0].toUpperCase() + n.status.slice(1)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              approveRefund({
                                id: n.id,
                                appointmentId: n.appointmentId,
                              })
                            }
                            disabled={
                              refundActionLoadingId === n.id ||
                              n.status !== "pending"
                            }
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {refundActionLoadingId === n.id
                              ? "Processing…"
                              : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              rejectRefund({
                                id: n.id,
                                appointmentId: n.appointmentId,
                              })
                            }
                            disabled={
                              refundActionLoadingId === n.id ||
                              n.status !== "pending"
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm hover:bg-rose-700 disabled:opacity-60"
                          >
                            {refundActionLoadingId === n.id
                              ? "Processing…"
                              : "Reject"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "events":
        return renderEvents();
      case "reschedule":
        return renderReschedule();
      case "patients":
        return renderPatients();
      case "messages":
        return renderMessages();
      case "reports":
        return renderReports();
      case "settings":
        return renderSettings();
      case "services":
        return renderServices();
      case "billing":
        return renderBilling();
      case "feedback":
        return renderFeedback();
      default:
        return renderOverview();
    }
  };

  // Notification UI moved to global Header

  // Billing state
  type PayoutMethodType = "bank" | "paypal" | "stripe";
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>("bank");
  const [payoutSchedule, setPayoutSchedule] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [currency, setCurrency] = useState("USD");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    country: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [pendingBalance, setPendingBalance] = useState<number>(210);
  const initialPayouts = [
    {
      id: "PO-54823",
      date: "2024-12-20",
      amount: 180,
      method: "Bank Transfer",
      status: "completed",
    },
    {
      id: "PO-54810",
      date: "2024-12-13",
      amount: 240,
      method: "PayPal",
      status: "completed",
    },
    {
      id: "PO-54795",
      date: "2024-12-06",
      amount: 120,
      method: "Bank Transfer",
      status: "completed",
    },
  ];
  const [payouts, setPayouts] = useState(initialPayouts);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const areBankDetailsComplete = () =>
    bankDetails.accountName &&
    bankDetails.accountNumber &&
    bankDetails.routingNumber &&
    bankDetails.bankName &&
    bankDetails.country;
  const handleRequestWithdrawal = () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return;
    if (amt > pendingBalance) return;
    if (payoutMethod !== "bank" || !areBankDetailsComplete()) return;
    const today = new Date();
    const dateLabel = today.toISOString().slice(0, 10);
    const newId = `PO-${Math.floor(Math.random() * 90000) + 10000}`;
    setPayouts((prev) => [
      {
        id: newId,
        date: dateLabel,
        amount: amt,
        method: "Bank Transfer",
        status: "pending",
      },
      ...prev,
    ]);
    setPendingBalance((prev) => prev - amt);
    setWithdrawAmount("");
  };
  const [billingTab, setBillingTab] = useState<"earnings" | "withdraw">(
    "earnings"
  );
  // Build earnings graph data from paid appointments by date
  const earningsMap = new Map<string, number>();
  paidAppointments
    .filter((a) => a.paymentStatus === "paid")
    .forEach((a) => {
      const key = format(parseISO(a.date), "MMM dd");
      earningsMap.set(key, (earningsMap.get(key) || 0) + a.price);
    });
  const earningsData = Array.from(earningsMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex relative h-[calc(100vh-4rem)] overflow-hidden">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 h-full overflow-auto md:static md:translate-x-0 md:w-64 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between md:hidden mb-4">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {`${(profile?.first_name?.[0] || "").toUpperCase()}${(
                      profile?.last_name?.[0] || ""
                    ).toUpperCase()}` || "DR"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {profile
                    ? `Dr. ${profile.first_name || ""} ${
                        profile.last_name || ""
                      }`.trim()
                    : "Loading..."}
                </h3>
                {(() => {
                  const spec = profile?.specialization || profile?.profession;
                  const vs = String(
                    (profile as any)?.verification_status ||
                      (profile as any)?.verification ||
                      ""
                  ).toLowerCase();
                  const isVerified = vs === "verified" || vs === "approved";
                  if (!spec && !isVerified) return null;
                  return (
                    <div className="mt-0.5 space-y-1">
                      {spec && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          {spec}
                        </span>
                      )}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3.5 w-3.5"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* <h3 className="text-lg font-semibold text-gray-900">
                  {profile
                    ? `Dr. ${profile.first_name} ${profile.last_name}`
                    : "Loading..."}
                </h3>
                <p className="text-sm text-gray-500">
                  {profile?.specialization ||
                    profile?.profession ||
                    "Professional"}
                </p> */}
              </div>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "overview"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "events"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CalendarDays className="w-5 h-5" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab("reschedule")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "reschedule"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ClockIcon className="w-5 h-5" />
                <span className="flex items-center gap-2">
                  Reschedule{" "}
                  {pendingRescheduleCount > 0 && (
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  )}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("services")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "services"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Stethoscope className="w-5 h-5" />
                <span>Services</span>
              </button>

              <button
                onClick={() => setActiveTab("appointments")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "appointments"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </button>

              <button
                onClick={() => setActiveTab("refunds")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "refunds"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Refunds</span>
              </button>

              <button
                onClick={() => setActiveTab("patients")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "patients"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Patients</span>
              </button>

              {/* Messages and Reports tabs removed per request */}

              <button
                onClick={() => setActiveTab("feedback")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "feedback"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Star className="w-5 h-5" />
                <span>Feedback</span>
              </button>

              <button
                onClick={() => setActiveTab("billing")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "billing"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Billing</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "settings"
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-start md:items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeTab === "overview"
                    ? "Dashboard"
                    : activeTab === "appointments"
                    ? "Appointments"
                    : activeTab === "patients"
                    ? "Patients"
                    : activeTab === "messages"
                    ? "Messages"
                    : activeTab === "reports"
                    ? "Reports"
                    : activeTab === "services"
                    ? "Services"
                    : activeTab === "billing"
                    ? "Billing"
                    : activeTab === "refunds"
                    ? "Refunds"
                    : activeTab === "feedback"
                    ? "Feedback"
                    : activeTab === "settings"
                    ? "Settings"
                    : "Dashboard"}
                </h1>
                <p className="text-gray-600">
                  {activeTab === "overview"
                    ? `Welcome back, ${(() => {
                        const fn = profile?.first_name || "";
                        const ln = profile?.last_name || "";
                        const full = `${fn} ${ln}`.trim();
                        return full ? `Dr. ${full}` : "Doctor";
                      })()}. Here's what's happening today.`
                    : activeTab === "appointments"
                    ? "Manage appointment requests and scheduled appointments"
                    : activeTab === "patients"
                    ? "Manage your patient database and records"
                    : activeTab === "messages"
                    ? "Communicate with your patients"
                    : activeTab === "reports"
                    ? "Manage patient reports and documents"
                    : activeTab === "services"
                    ? "Create and manage the services you provide to patients"
                    : activeTab === "billing"
                    ? "Manage payout methods, preferences and track payouts"
                    : activeTab === "refunds"
                    ? "Review and action patient refund requests"
                    : activeTab === "feedback"
                    ? "See what patients say about their sessions and services"
                    : activeTab === "settings"
                    ? "Manage your account and preferences"
                    : "Welcome back"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
