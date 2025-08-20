import Header from "@/components/site/Header";
import { useState } from "react";
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

type AdminTab = "overview" | "users" | "professionals" | "services" | "events" | "earnings" | "withdrawals" | "reports" | "settings";

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

  // Mock data
  const [users, setUsers] = useState(
    [
      { 
        id: 1, 
        name: "John Doe", 
        email: "john@example.com", 
        role: "patient", 
        status: "active",
        phone: "(555) 123-4567",
        address: "123 Main St, City, State 12345",
        joinDate: "2024-01-15",
        lastActive: "2025-03-30"
      },
      { 
        id: 2, 
        name: "Sarah Johnson", 
        email: "sarah@example.com", 
        role: "patient", 
        status: "active",
        phone: "(555) 234-5678",
        address: "456 Oak Ave, City, State 12345",
        joinDate: "2024-02-20",
        lastActive: "2025-03-29"
      },
      { 
        id: 3, 
        name: "Michael Chen", 
        email: "mchen@example.com", 
        role: "patient", 
        status: "suspended",
        phone: "(555) 345-6789",
        address: "789 Pine Rd, City, State 12345",
        joinDate: "2024-03-10",
        lastActive: "2025-03-25"
      }
    ] as Array<{ 
      id: number; 
      name: string; 
      email: string; 
      role: string; 
      status: "active" | "suspended";
      phone: string;
      address: string;
      joinDate: string;
      lastActive: string;
    }>
  );
  const [pros, setPros] = useState(
    [
      { 
        id: 101, 
        name: "Dr. Emily Davis", 
        profession: "Cardiologist",
        yearsOfExperience: 8,
        specialization: "Interventional Cardiology, Heart Failure",
        email: "emily.d@wellness.com", 
        verification: "pending",
        phone: "(555) 111-2222",
        address: "123 Medical Center Dr, City, State 12345",
        joinDate: "2025-01-15",
        lastActive: "2025-03-30"
      },
      { 
        id: 102, 
        name: "Alex Morgan", 
        profession: "Nutritionist",
        yearsOfExperience: 5,
        specialization: "Sports Nutrition, Weight Management",
        email: "alex.m@wellness.com", 
        verification: "verified",
        phone: "(555) 222-3333",
        address: "456 Health Ave, City, State 12345",
        joinDate: "2024-11-20",
        lastActive: "2025-03-29"
      },
      { 
        id: 103, 
        name: "Jane Lee", 
        profession: "Therapist",
        yearsOfExperience: 12,
        specialization: "Cognitive Behavioral Therapy, Anxiety",
        email: "jane.l@wellness.com", 
        verification: "pending",
        phone: "(555) 333-4444",
        address: "789 Wellness Blvd, City, State 12345",
        joinDate: "2025-02-10",
        lastActive: "2025-03-25"
      },
      { 
        id: 104, 
        name: "Dr. Robert Wilson", 
        profession: "Dermatologist",
        yearsOfExperience: 15,
        specialization: "Cosmetic Dermatology, Skin Cancer",
        email: "robert.w@wellness.com", 
        verification: "pending",
        phone: "(555) 444-5555",
        address: "321 Skin Care Lane, City, State 12345",
        joinDate: "2025-03-01",
        lastActive: "2025-03-28"
      },
      { 
        id: 105, 
        name: "Maria Rodriguez", 
        profession: "Physical Therapist",
        yearsOfExperience: 7,
        specialization: "Sports Rehabilitation, Orthopedic PT",
        email: "maria.r@wellness.com", 
        verification: "pending",
        phone: "(555) 555-6666",
        address: "654 Rehab Street, City, State 12345",
        joinDate: "2025-03-05",
        lastActive: "2025-03-27"
      },
      { 
        id: 106, 
        name: "Dr. James Thompson", 
        profession: "Psychiatrist",
        yearsOfExperience: 20,
        specialization: "Adult Psychiatry, Addiction Medicine",
        email: "james.t@wellness.com", 
        verification: "pending",
        phone: "(555) 666-7777",
        address: "987 Mental Health Dr, City, State 12345",
        joinDate: "2025-03-08",
        lastActive: "2025-03-26"
      },
      { 
        id: 107, 
        name: "Lisa Chen", 
        profession: "Yoga Instructor",
        yearsOfExperience: 6,
        specialization: "Vinyasa Flow, Meditation, Stress Relief",
        email: "lisa.c@wellness.com", 
        verification: "pending",
        phone: "(555) 777-8888",
        address: "147 Zen Garden Way, City, State 12345",
        joinDate: "2025-03-12",
        lastActive: "2025-03-24"
      },
      { 
        id: 108, 
        name: "Dr. Amanda Foster", 
        profession: "Pediatrician",
        yearsOfExperience: 10,
        specialization: "General Pediatrics, Child Development",
        email: "amanda.f@wellness.com", 
        verification: "pending",
        phone: "(555) 888-9999",
        address: "258 Children's Health Ave, City, State 12345",
        joinDate: "2025-03-15",
        lastActive: "2025-03-23"
      },
      { 
        id: 109, 
        name: "Carlos Martinez", 
        profession: "Personal Trainer",
        yearsOfExperience: 8,
        specialization: "Strength Training, Weight Loss, HIIT",
        email: "carlos.m@wellness.com", 
        verification: "pending",
        phone: "(555) 999-0000",
        address: "369 Fitness Center Blvd, City, State 12345",
        joinDate: "2025-03-18",
        lastActive: "2025-03-22"
      },
      { 
        id: 110, 
        name: "Dr. Rachel Green", 
        profession: "Neurologist",
        yearsOfExperience: 18,
        specialization: "Movement Disorders, Multiple Sclerosis",
        email: "rachel.g@wellness.com", 
        verification: "pending",
        phone: "(555) 000-1111",
        address: "741 Brain Health Road, City, State 12345",
        joinDate: "2025-03-20",
        lastActive: "2025-03-21"
      },
      { 
        id: 111, 
        name: "Dr. Mark Johnson", 
        profession: "Orthopedic Surgeon",
        yearsOfExperience: 22,
        specialization: "Joint Replacement, Sports Medicine",
        email: "mark.j@wellness.com", 
        verification: "rejected",
        phone: "(555) 111-2222",
        address: "852 Surgery Center Dr, City, State 12345",
        joinDate: "2025-02-28",
        lastActive: "2025-03-15"
      },
      { 
        id: 112, 
        name: "Sophia Williams", 
        profession: "Acupuncturist",
        yearsOfExperience: 9,
        specialization: "Traditional Chinese Medicine, Pain Management",
        email: "sophia.w@wellness.com", 
        verification: "rejected",
        phone: "(555) 222-3333",
        address: "963 Healing Path Rd, City, State 12345",
        joinDate: "2025-03-02",
        lastActive: "2025-03-10"
      },
      { 
        id: 113, 
        name: "Dr. Kevin Brown", 
        profession: "Endocrinologist",
        yearsOfExperience: 16,
        specialization: "Diabetes Management, Thyroid Disorders",
        email: "kevin.b@wellness.com", 
        verification: "rejected",
        phone: "(555) 333-4444",
        address: "159 Hormone Health Way, City, State 12345",
        joinDate: "2025-03-05",
        lastActive: "2025-03-08"
      }
    ] as Array<{ 
      id: number; 
      name: string; 
      profession: string;
      yearsOfExperience: number;
      specialization: string;
      email: string; 
      verification: "pending" | "verified" | "rejected";
      phone: string;
      address: string;
      joinDate: string;
      lastActive: string;
    }>
  );
  const [servicesPending, setServicesPending] = useState(
    [
      { id: 201, provider: "Alex Morgan", name: "Nutrition Plan", submitted: "2025-03-20" },
      { id: 202, provider: "Jane Lee", name: "Therapy Session", submitted: "2025-03-22" }
    ] as Array<{ id: number; provider: string; name: string; submitted: string }>
  );

  // All services from all doctors
  const [allServices, setAllServices] = useState(
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
  const [events, setEvents] = useState(
    [
      { id: 301, title: "Heart Health 101", date: "2025-05-02", time: "05:00 PM", host: "Dr. Emily Davis", status: "scheduled" },
      { id: 302, title: "Fueling Performance", date: "2025-04-11", time: "04:30 PM", host: "Alex Morgan", status: "scheduled" }
    ] as Array<{ id: number; title: string; date: string; time: string; host: string; status: "scheduled" | "cancelled" }>
  );
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
  const [eventRequests, setEventRequests] = useState<AdminEvent[]>([
    { 
      id: 901, 
      title: "Cardio Basics Webinar", 
      type: "Event",
      category: "Cardiology", 
      date: "2025-05-02", 
      startTime: "05:00 PM",
      endTime: "06:00 PM",
      host: "Dr. Emily Davis", 
      status: "pending", 
      summary: "Learn fundamental practices for a healthy heart.",
      details: "This session covers lifestyle, diet, and movement strategies to support cardiovascular health.",
      agenda: ["Welcome & overview", "Risk factors & prevention", "Diet & activity basics", "Q&A"],
      registrationUrl: "https://example.com/register/cardio-basics",
      ticketPrice: 15,
      location: "Online webinar",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop"
    },
    { 
      id: 902, 
      title: "Holistic Nutrition 101", 
      type: "Event",
      category: "Nutrition", 
      date: "2025-05-03", 
      startTime: "11:00 AM",
      endTime: "12:00 PM",
      host: "Alex Morgan", 
      status: "pending", 
      summary: "Foundations of holistic nutrition for daily life.",
      details: "Understanding macronutrients, micronutrients, and building balanced meals.",
      agenda: ["Principles of holistic nutrition", "Meal planning demo", "Reading labels", "Q&A"],
      registrationUrl: "https://example.com/register/holistic-nutrition",
      ticketPrice: 10,
      location: "Online webinar",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop"
    }
  ]);
  const [approvedEvents, setApprovedEvents] = useState<AdminEvent[]>([
    { id: 301, title: "Heart Health 101", type: "Event", category: "Cardiology", date: "2025-05-02", startTime: "05:00 PM", endTime: "06:00 PM", host: "Dr. Emily Davis", status: "approved", summary: "Improving heart health.", registrationUrl: "https://example.com/heart101", ticketPrice: 20, location: "Online webinar", imageUrl: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=1200&auto=format&fit=crop" },
    { id: 302, title: "Fueling Performance: Nutrition Basics", type: "Event", category: "Nutrition", date: "2025-04-11", startTime: "04:30 PM", endTime: "05:15 PM", host: "Alex Morgan", status: "approved", summary: "Nutrition for athletes.", registrationUrl: "https://example.com/fuel-performance", ticketPrice: 25, location: "Online webinar", imageUrl: "https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=1200&auto=format&fit=crop" }
  ]);
  const [rejectedEvents, setRejectedEvents] = useState<AdminEvent[]>([]);
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

  // Chart data
  const chartData = [
    { month: "Jan", users: 120, professionals: 45, services: 67, events: 12, revenue: 8500 },
    { month: "Feb", users: 180, professionals: 52, services: 89, events: 18, revenue: 12400 },
    { month: "Mar", users: 240, professionals: 58, services: 112, events: 24, revenue: 16800 },
    { month: "Apr", users: 320, professionals: 65, services: 134, events: 31, revenue: 22100 },
    { month: "May", users: 380, professionals: 72, services: 156, events: 38, revenue: 26800 },
    { month: "Jun", users: 450, professionals: 78, services: 178, events: 45, revenue: 31500 }
  ];

  const userGrowthData = [
    { month: "Jan", newUsers: 120, activeUsers: 98 },
    { month: "Feb", newUsers: 60, activeUsers: 145 },
    { month: "Mar", newUsers: 60, activeUsers: 198 },
    { month: "Apr", newUsers: 80, activeUsers: 265 },
    { month: "May", newUsers: 60, activeUsers: 320 },
    { month: "Jun", newUsers: 70, activeUsers: 380 }
  ];

  const serviceCategoryData = [
    { name: "Nutrition", value: 35, color: "#3B82F6" },
    { name: "Cardiology", value: 25, color: "#8B5CF6" },
    { name: "Therapy", value: 20, color: "#10B981" },
    { name: "Fitness", value: 15, color: "#F59E0B" },
    { name: "Other", value: 5, color: "#EF4444" }
  ];

  // Professional services and appointments data
  const professionalServices = [
    {
      professionalId: 102,
      services: [
        {
          id: 1,
          serviceName: "Nutrition Consultation",
          category: "Nutrition",
          price: 150,
          duration: "60 min",
          status: "active",
          patientsServed: 45,
          rating: 4.8
        },
        {
          id: 2,
          serviceName: "Meal Planning",
          category: "Nutrition",
          price: 200,
          duration: "90 min",
          status: "active",
          patientsServed: 32,
          rating: 4.9
        }
      ],
      appointments: [
        {
          id: 1,
          patientName: "John Doe",
          serviceName: "Nutrition Consultation",
          date: "2025-03-30",
          time: "10:00 AM",
          status: "completed",
          amount: 150
        },
        {
          id: 2,
          patientName: "Sarah Johnson",
          serviceName: "Meal Planning",
          date: "2025-03-31",
          time: "2:00 PM",
          status: "scheduled",
          amount: 200
        }
      ]
    }
  ];

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

  const approveProfessional = (id: number) => setPros(prev => prev.map(p => p.id === id ? { ...p, verification: "verified" } : p));
  const openRejectionModal = (professional: typeof pros[0]) => {
    setProfessionalToReject(professional);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const rejectProfessional = (id: number) => {
    if (rejectionReason.trim()) {
      setPros(prev => prev.map(p => p.id === id ? { ...p, verification: "rejected" } : p));
      setShowRejectionModal(false);
      setRejectionReason("");
      setProfessionalToReject(null);
    }
  };
  const suspendUser = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  const approveService = (id: number) => setServicesPending(prev => prev.filter(s => s.id !== id));
  const cancelEvent = (id: number) => setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'cancelled' as const } : ev));
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
    setProfessionalModalTab("profile");
    setShowProfessionalModal(true);
  };

  const getProfessionalServices = (professionalId: number) => {
    const professionalData = professionalServices.find(ps => ps.professionalId === professionalId);
    return professionalData ? professionalData.services : [];
  };

  const getProfessionalAppointments = (professionalId: number) => {
    const professionalData = professionalServices.find(ps => ps.professionalId === professionalId);
    return professionalData ? professionalData.appointments : [];
  };

  const renderOverview = () => {
    const totalUsers = users.length;
    const totalProfessionals = pros.length;
    const pendingVerifications = pros.filter(p => p.verification === "pending").length;
    const openReports = reports.filter(r => r.status !== "closed").length;
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVerifications}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50"><AlertTriangle className="w-6 h-6 text-amber-600" /></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Reports</p>
                <p className="text-2xl font-bold text-gray-900">{openReports}</p>
              </div>
              <div className="p-3 rounded-full bg-rose-50"><FileText className="w-6 h-6 text-rose-600" /></div>
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

        {/* User Growth and Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
              {events.map(ev => (
                <div key={ev.id} className="px-6 py-4 border-b last:border-0 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{ev.title}</div>
                    <div className="text-sm text-gray-600">{ev.date} • {ev.time} • Host: {ev.host}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${ev.status === 'cancelled' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'}`}>{ev.status}</span>
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
    
    const professionalServices = getProfessionalServices(selectedProfessional.id);
    const professionalAppointments = getProfessionalAppointments(selectedProfessional.id);
    
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
                  {professionalServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No services found for this professional.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {professionalServices.map((service) => (
                        <div key={service.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                              <p className="text-sm text-gray-600">Category: {service.category}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              service.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {service.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <p className="text-gray-900 font-medium">${service.price}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="text-gray-900">{service.duration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Patients Served:</span>
                              <p className="text-gray-900">{service.patientsServed}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Rating:</span>
                              <p className="text-gray-900">{service.rating}/5.0</p>
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
                  {professionalAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No appointments found for this professional.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {professionalAppointments.map((appointment) => (
                        <div key={appointment.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.serviceName}</h4>
                              <p className="text-sm text-gray-600">Patient: {appointment.patientName}</p>
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
                              <p className="text-gray-900">{appointment.time}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <p className="text-gray-900 font-medium">${appointment.amount}</p>
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
    const filtered = users.filter(u => [u.name, u.email, u.role, u.status].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-3 py-2 rounded-lg border" />
          </div>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          {filtered.map(u => (
            <div key={u.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3 font-medium text-gray-900">{u.name}</div>
              <div className="md:col-span-3 text-gray-700 break-all">{u.email}</div>
              <div className="md:col-span-2 text-gray-700 capitalize">{u.role}</div>
              <div className="md:col-span-2">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{u.status}</span>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-center">
                <button 
                  onClick={() => openUserModal(u)} 
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View
                </button>
                <button 
                  onClick={() => suspendUser(u.id)} 
                  className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
                >
                  {u.status === 'active' ? 'Suspend' : 'Activate'}
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
    const verifiedPros = pros.filter(p => p.verification === "verified");
    const pendingPros = pros.filter(p => p.verification === "pending");
    const rejectedPros = pros.filter(p => p.verification === "rejected");
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
            <p className="text-2xl font-bold text-gray-900">{allServices.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Active Services</p>
            <p className="text-2xl font-bold text-emerald-600">{allServices.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600">{allServices.filter(s => s.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-blue-600">{getUniqueCategories().length - 1}</p>
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

    const approveEvent = (id: number) => {
      const ev = eventRequests.find(e => e.id === id);
      if (!ev) return;
      setEventRequests(prev => prev.filter(e => e.id !== id));
      setApprovedEvents(prev => [{ ...ev, status: "approved" }, ...prev]);
      setShowEventModal(false);
    };

    const openRejectEvent = (ev: AdminEvent) => {
      setSelectedEvent(ev);
      setEventRejectionReason("");
      setShowEventRejectModal(true);
    };

    const rejectEvent = () => {
      if (!selectedEvent) return;
      const ev = selectedEvent;
      // remove from requests/approved if present
      setEventRequests(prev => prev.filter(e => e.id !== ev.id));
      setApprovedEvents(prev => prev.filter(e => e.id !== ev.id));
      setRejectedEvents(prev => [{ ...ev, status: "rejected", rejectionReason: eventRejectionReason }, ...prev]);
      setShowEventRejectModal(false);
      setShowEventModal(false);
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
            <div className="md:col-span-2 text-gray-700">{ev.date} • {ev.time}</div>
            <div className="md:col-span-2 md:text-right flex md:justify-end gap-2 items-center">
              <button onClick={() => openEventDetails(ev)} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">View</button>
              <button onClick={() => approveEvent(ev.id)} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700">Approve</button>
              <button onClick={() => openRejectEvent(ev)} className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700">Reject</button>
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
                <div className="md:col-span-2 text-gray-700">{ev.date} • {ev.time}</div>
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
            <div className="md:col-span-2 text-gray-700">{ev.date} • {ev.time}</div>
            <div className="md:col-span-2 md:text-right text-sm text-gray-700">{ev.rejectionReason || "—"}</div>
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
    
    const userServices = getUserServices(selectedUser.id);
    
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      selectedUser.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                    <p className="text-gray-900">{selectedUser.joinDate}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <p className="text-gray-900">{selectedUser.address}</p>
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

  const openServiceModal = (service: typeof allServices[0]) => {
    setSelectedService(service);
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
    </div>
  );
};

export default AdminDashboard;


