import Header from "@/components/site/Header";
import { getFeedback } from "@/lib/feedback";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Menu
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
  Legend
} from "recharts";
import { parseISO, isToday, isThisWeek, isThisMonth, isWithinInterval, parse, compareAsc, format } from "date-fns";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointmentView, setAppointmentView] = useState("requests");
  const [chartMetric, setChartMetric] = useState<"patients" | "appointments" | "services" | "revenue" | "statistics">("patients");
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "12M">("12M");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const handler = () => setIsSidebarOpen(true);
    window.addEventListener("open-dashboard-sidebar", handler as EventListener);
    return () => window.removeEventListener("open-dashboard-sidebar", handler as EventListener);
  }, []);

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
  }

  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentServiceFilter, setAppointmentServiceFilter] = useState<number | "all">("all");
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<PaymentStatus | "all">("all");
  const [appointmentModeFilter, setAppointmentModeFilter] = useState<AppointmentMode | "all">("all");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [appointmentStartDate, setAppointmentStartDate] = useState<string>("");
  const [appointmentEndDate, setAppointmentEndDate] = useState<string>("");
  
  // Rejection notification state
  const [showRejectionBanner, setShowRejectionBanner] = useState(true);
  const [rejectionNotification] = useState({
    message: "Your application has been rejected. Please review the feedback and resubmit.",
    reason: "Incomplete documentation and insufficient experience verification.",
    date: "2025-03-30"
  });

  // Mock: appointment happening now
  const nowDateISO = format(new Date(), 'yyyy-MM-dd');
  const nowTimeLabel = format(new Date(), 'hh:mm a');

  const paidAppointments: PaidAppointment[] = [
    {
      id: 1000,
      patientName: "Live Patient",
      patientEmail: "live.patient@example.com",
      patientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
      serviceId: 2,
      serviceName: "Virtual Follow-up",
      mode: "Virtual",
      date: nowDateISO,
      time: nowTimeLabel,
      price: 30,
      paymentStatus: "paid",
      transactionId: "TXN-NOWLIVE"
    },
    {
      id: 1001,
      patientName: "Sarah Johnson",
      patientEmail: "sarah.j@example.com",
      patientAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=256&auto=format&fit=crop",
      serviceId: 1,
      serviceName: "General Consultation",
      mode: "In-person",
      date: "2024-12-23",
      time: "09:30 AM",
      price: 50,
      paymentStatus: "paid",
      transactionId: "TXN-9A2S5D",
      locationAddress: "123 Health Ave, Wellness City"
    },
    {
      id: 1002,
      patientName: "Michael Chen",
      patientEmail: "mchen@example.com",
      patientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      serviceId: 2,
      serviceName: "Virtual Follow-up",
      mode: "Virtual",
      date: "2024-12-23",
      time: "11:00 AM",
      price: 30,
      paymentStatus: "paid",
      transactionId: "TXN-7K3Q1Z"
    },
    {
      id: 1003,
      patientName: "Emily Davis",
      patientEmail: "emily.d@example.com",
      patientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop",
      serviceId: 3,
      serviceName: "Cardiac Assessment",
      mode: "In-person",
      date: "2024-12-24",
      time: "02:15 PM",
      price: 120,
      paymentStatus: "paid",
      transactionId: "TXN-3J9X2B",
      locationAddress: "456 Care Blvd, Heart Town"
    },
    {
      id: 1004,
      patientName: "David Wilson",
      patientEmail: "dwilson@example.com",
      patientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop",
      serviceId: 2,
      serviceName: "Virtual Follow-up",
      mode: "Virtual",
      date: "2024-12-24",
      time: "03:45 PM",
      price: 30,
      paymentStatus: "refunded",
      transactionId: "TXN-5L8V0M"
    }
  ];

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

  // Generate time slots based on duration
  const generateTimeSlots = (durationMinutes: number) => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const interval = durationMinutes;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour + Math.floor((minute + interval) / 60) <= endHour) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHourTotal = hour + Math.floor((minute + interval) / 60);
          const endMinute = (minute + interval) % 60;
          const endTime = `${endHourTotal.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          slots.push({ start: startTime, end: endTime });
        }
      }
    }
    
    return slots;
  };

  // Chart mock datasets (weekly and monthly)
  const monthlyLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; 
  const weeklyLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; 

  const chartDataSource: Record<string, { monthly: Array<{ name: string; value: number }>; weekly: Array<{ name: string; value: number }> }> = {
    patients: {
      monthly: monthlyLabels.map((m, i) => ({ name: m, value: [120, 180, 160, 200, 220, 260, 240, 300, 280, 330, 310, 350][i] })),
      weekly: weeklyLabels.map((d, i) => ({ name: d, value: [24, 28, 35, 30, 38, 42, 36][i] }))
    },
    appointments: {
      monthly: monthlyLabels.map((m, i) => ({ name: m, value: [60, 72, 80, 90, 96, 104, 98, 120, 110, 130, 125, 140][i] })),
      weekly: weeklyLabels.map((d, i) => ({ name: d, value: [8, 10, 12, 11, 13, 14, 12][i] }))
    },
    services: {
      monthly: monthlyLabels.map((m, i) => ({ name: m, value: [8, 10, 11, 12, 13, 14, 15, 16, 16, 17, 18, 20][i] })),
      weekly: weeklyLabels.map((d, i) => ({ name: d, value: [1, 1, 2, 1, 2, 2, 2][i] }))
    },
    revenue: {
      monthly: monthlyLabels.map((m, i) => ({ name: m, value: [1200, 1500, 1400, 1750, 2100, 2400, 2250, 2800, 2600, 3200, 3100, 3600][i] })),
      weekly: weeklyLabels.map((d, i) => ({ name: d, value: [180, 200, 220, 210, 260, 300, 260][i] }))
    },
    statistics: {
      monthly: monthlyLabels.map((m, i) => ({ name: m, value: [2.8, 2.6, 2.9, 2.7, 2.5, 2.4, 2.6, 2.3, 2.2, 2.1, 2.4, 2.3][i] })), // avg response time (h)
      weekly: weeklyLabels.map((d, i) => ({ name: d, value: [2.5, 2.4, 2.6, 2.3, 2.2, 2.1, 2.3][i] }))
    }
  };

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

  // Overview stats cards data
  const stats = [
    { title: "Total Patients", value: "1,247", change: "+12%", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Appointments Today", value: "8", change: "+2", icon: Calendar, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Pending Requests", value: "4", change: "+3", icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Response Time", value: "2.3h", change: "-0.5h", icon: Clock, color: "text-purple-600", bgColor: "bg-purple-50" }
  ];

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
      scheduleType: 'same' | 'custom';
      numberOfSlots: number; 
      timeSlots: Array<{ start: string; end: string }>;
      customSchedules?: Record<string, { numberOfSlots: number; timeSlots: Array<{ start: string; end: string }> }>;
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
    scheduleType: 'same' | 'custom';
    numberOfSlots: number;
    timeSlots: Array<{ start: string; end: string }>;
    customSchedules: Record<string, { numberOfSlots: number; timeSlots: Array<{ start: string; end: string }> }>;
  }

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      name: "General Consultation",
      category: "Consultation",
      durationMin: 30,
      price: 50,
      mode: "In-person",
      description: "A comprehensive discussion about your health concerns and wellness goals.",
      benefits: ["Personalized plan", "Medical history review", "Next steps"],
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2070&auto=format&fit=crop",
      active: true,
      locationAddress: "123 Health Ave, Wellness City"
    },
    {
      id: 2,
      name: "Virtual Follow-up",
      category: "Follow-up",
      durationMin: 20,
      price: 30,
      mode: "Virtual",
      description: "Short virtual session to review progress and adjust plans.",
      benefits: ["Progress review", "Plan adjustments", "Q&A"],
      imageUrl: "https://images.unsplash.com/photo-1586985289906-4061ec3c0223?q=80&w=2069&auto=format&fit=crop",
      active: true,
      locationAddress: ""
    },
    {
      id: 3,
      name: "Cardiac Assessment",
      category: "Assessment",
      durationMin: 60,
      price: 120,
      mode: "In-person",
      description: "Detailed assessment for cardiac-related concerns including plan creation.",
      benefits: ["Risk evaluation", "Lifestyle guidance", "Actionable plan"],
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
      active: false,
      locationAddress: "456 Care Blvd, Heart Town"
    }
  ]);
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
    scheduleType: 'same',
    numberOfSlots: 1,
    timeSlots: [{ start: '', end: '' }],
    customSchedules: {}
  });

  // Reset time slots when duration changes
  useEffect(() => {
    setNewService(prev => ({ 
      ...prev, 
      timeSlots: Array(prev.numberOfSlots).fill('').map(() => ({ start: '', end: '' }))
    }));
  }, [newService.durationMin]);

  const recentAppointments = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      time: "09:00 AM",
      type: "Consultation",
      status: "confirmed",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 2,
      patientName: "Michael Chen",
      time: "10:30 AM",
      type: "Follow-up",
      status: "confirmed",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 3,
      patientName: "Emily Davis",
      time: "02:00 PM",
      type: "Check-up",
      status: "pending",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 4,
      patientName: "David Wilson",
      time: "03:30 PM",
      type: "Consultation",
      status: "confirmed",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patientName: "Lisa Anderson",
      date: "Tomorrow",
      time: "09:00 AM",
      type: "Initial Consultation",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 2,
      patientName: "Robert Taylor",
      date: "Dec 24",
      time: "11:00 AM",
      type: "Follow-up",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const notifications = [
    { id: 1, message: "New patient registration: Maria Garcia", time: "2 min ago", type: "info" },
    { id: 2, message: "Appointment reminder: Sarah Johnson at 9:00 AM", time: "15 min ago", type: "reminder" },
    { id: 3, message: "Lab results available for Michael Chen", time: "1 hour ago", type: "results" },
    { id: 4, message: "Patient feedback received", time: "2 hours ago", type: "feedback" }
  ];

  // Additional mock data for other tabs
  const allAppointments = [
    ...recentAppointments,
    {
      id: 5,
      patientName: "Jennifer Lee",
      time: "11:00 AM",
      type: "Follow-up",
      status: "cancelled",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      lastVisit: "2024-12-20",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      lastVisit: "2024-12-19",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const messages = [
    {
      id: 1,
      from: "Sarah Johnson",
      subject: "Appointment reschedule request",
      message: "Hi Dr. Wilson, I need to reschedule my appointment for next week. Is Friday afternoon available?",
      time: "2 hours ago",
      unread: true,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 2,
      from: "Michael Chen",
      subject: "Follow-up question",
      message: "Thank you for the consultation. I have a question about the medication dosage.",
      time: "1 day ago",
      unread: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
    }
  ];

  const reports = [
    {
      id: 1,
      patientName: "Sarah Johnson",
      type: "Blood Test Results",
      date: "2024-12-20",
      status: "completed",
      fileSize: "2.3 MB"
    },
    {
      id: 2,
      patientName: "Michael Chen",
      type: "X-Ray Report",
      date: "2024-12-19",
      status: "pending",
      fileSize: "5.1 MB"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info": return "text-blue-500";
      case "reminder": return "text-orange-500";
      case "results": return "text-green-500";
      case "feedback": return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  const renderOverview = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
                <h3 className="text-sm font-medium text-red-800">Application Rejected</h3>
                <p className="text-sm text-red-700 mt-1">{rejectionNotification.message}</p>
                <div className="mt-2 p-3 bg-red-100 rounded-lg">
                  <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-xs text-red-700">{rejectionNotification.reason}</p>
                  <p className="text-xs text-red-600 mt-1">Date: {rejectionNotification.date}</p>
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

      {/* Dynamic Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
            <p className="text-sm text-gray-600">Visualize patients, appointments, services, revenue, and statistics</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {(["patients","appointments","services","revenue","statistics"] as const).map(key => (
                <button
                  key={key}
                  onClick={() => setChartMetric(key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${chartMetric === key ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
            <div className="bg-gray-100 rounded-lg p-1 flex">
              {(["7D","30D","12M"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-medium ${chartRange === r ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
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
              {chartMetric === 'revenue' ? (
                <AreaChart data={getActiveChartData()} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} />
                  <Tooltip formatter={(v: number | string) => chartMetric === 'revenue' ? `$${v}` : v} />
                  <Area type="monotone" dataKey="value" stroke="#7c3aed" fillOpacity={1} fill="url(#rev)" />
                </AreaChart>
              ) : chartMetric === 'statistics' ? (
                <LineChart data={getActiveChartData()} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={formatYAxis} />
                  <Tooltip formatter={(v: number | string) => `${v}${chartMetric === 'statistics' ? 'h' : ''}`} />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={getActiveChartData()} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[6,6,0,0]} />
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
                <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
                <button onClick={() => setActiveTab("appointments")} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
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
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={appointment.avatar}
                      alt={appointment.patientName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{appointment.time}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3">
                    <img
                      src={appointment.avatar}
                      alt={appointment.patientName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                      <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationIcon(notification.type)}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <Calendar className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">New Appointment</span>
                </button>
                <button className="p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <FileText className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Write Report</span>
                </button>
                <button className="p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  <MessageSquare className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Send Message</span>
                </button>
                <button className="p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                  <Users className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm font-medium">Add Patient</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAppointments = () => {
    try {
      const list = Array.isArray(paidAppointments) ? paidAppointments : [];
      const toDateTime = (appt: PaidAppointment) => {
        const date = parseISO(appt.date);
        // Parse time like "09:30 AM" on the same date
        const dateTime = parse(appt.time, 'hh:mm a', date);
        return dateTime;
      };
      const todaysAppointments = list
        .filter(appt => isToday(parseISO(appt.date)))
        .sort((a, b) => compareAsc(toDateTime(a), toDateTime(b)));

      const filtered = list.filter(appt => {
        const matchService = appointmentServiceFilter === "all" || appt.serviceId === appointmentServiceFilter;
        const matchStatus = appointmentStatusFilter === "all" || appt.paymentStatus === appointmentStatusFilter;
        const matchMode = appointmentModeFilter === "all" || appt.mode === appointmentModeFilter;
        const q = appointmentSearch.trim().toLowerCase();
        const matchQuery = !q || [
          appt.patientName,
          appt.patientEmail,
          appt.serviceName,
          appt.transactionId
        ].some(s => s.toLowerCase().includes(q));
        // Date matching
        let matchDate = true;
        if (appointmentDateFilter !== "all") {
          const d = parseISO(appt.date);
          if (appointmentDateFilter === "today") matchDate = isToday(d);
          else if (appointmentDateFilter === "week") matchDate = isThisWeek(d, { weekStartsOn: 1 });
          else if (appointmentDateFilter === "month") matchDate = isThisMonth(d);
          else if (appointmentDateFilter === "custom") {
            if (appointmentStartDate && appointmentEndDate) {
              matchDate = isWithinInterval(d, { start: parseISO(appointmentStartDate), end: parseISO(appointmentEndDate) });
            } else {
              matchDate = true;
            }
          }
        }
        return matchService && matchStatus && matchMode && matchQuery && matchDate;
      });

      const totalRevenue = filtered.reduce((sum, a) => a.paymentStatus === "paid" ? sum + a.price : sum, 0);
      const completedCount = filtered.length;
      const refundedCount = filtered.filter(a => a.paymentStatus === "refunded").length;

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
              <p className="text-gray-600">Paid bookings for your services</p>
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
                <h3 className="text-sm font-semibold text-amber-900">Today's Priority</h3>
                <span className="text-xs text-amber-800">{todaysAppointments.length} meeting(s)</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {todaysAppointments.slice(0, 3).map(appt => (
                  <div key={appt.id} className="bg-white rounded-md border p-3 flex items-center gap-3">
                    <img src={appt.patientAvatar} alt={appt.patientName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{appt.patientName}</p>
                        <span className="text-xs font-medium text-gray-700">{appt.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{appt.serviceName} • {appt.mode}</p>
                    </div>
                    <button onClick={() => { try { sessionStorage.setItem(`live_session_prof_${appt.id}`, String(appt.serviceId)); } catch {} ; navigate(`/live-session/${appt.id}`); }} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700">Start Session</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Refunds</p>
              <p className="text-2xl font-bold text-gray-900">{refundedCount}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={appointmentSearch} onChange={e => setAppointmentSearch(e.target.value)}
                       placeholder="Search by patient, service, transaction..."
                       className="w-full pl-9 pr-3 py-2 rounded-lg border" />
              </div>
              <select value={appointmentServiceFilter === 'all' ? 'all' : String(appointmentServiceFilter)} onChange={(e) => setAppointmentServiceFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="rounded-lg border px-3 py-2">
                <option value="all">All Services</option>
                {(services || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select value={appointmentModeFilter} onChange={(e) => setAppointmentModeFilter(e.target.value as AppointmentMode | 'all')} className="rounded-lg border px-3 py-2">
                <option value="all">All Modes</option>
                <option value="In-person">In-person</option>
                <option value="Virtual">Virtual</option>
              </select>
              <select value={appointmentStatusFilter} onChange={(e) => setAppointmentStatusFilter(e.target.value as PaymentStatus | 'all')} className="rounded-lg border px-3 py-2">
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
              <select value={appointmentDateFilter} onChange={(e) => setAppointmentDateFilter(e.target.value as "all" | "today" | "week" | "month" | "custom")} className="rounded-lg border px-3 py-2">
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom</option>
              </select>
              {appointmentDateFilter === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" value={appointmentStartDate} onChange={(e) => setAppointmentStartDate(e.target.value)} className="rounded-lg border px-3 py-2" />
                  <span className="text-gray-400">–</span>
                  <input type="date" value={appointmentEndDate} onChange={(e) => setAppointmentEndDate(e.target.value)} className="rounded-lg border px-3 py-2" />
                </div>
              )}
            </div>
          </div>

          {/* Appointments Table/List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
              <div className="col-span-3">Patient</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Date & Time</div>
              <div className="col-span-1">Mode</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-2 text-right">Payment</div>
            </div>
            <div>
              {filtered.map(appt => (
                <div key={appt.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <img src={appt.patientAvatar} alt={appt.patientName} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <div className="font-medium text-gray-900">{appt.patientName}</div>
                      <div className="text-xs text-gray-500">{appt.patientEmail}</div>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">{appt.serviceName}</div>
                    {appt.mode !== 'Virtual' && appt.locationAddress && (
                      <div className="text-xs text-gray-500 line-clamp-1">{appt.locationAddress}</div>
                    )}
                    <div className="text-xs text-gray-500">Txn: {appt.transactionId}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="font-medium text-gray-900">{appt.date}</div>
                    <div className="text-xs text-gray-500">{appt.time}</div>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm text-gray-700">{appt.mode}</span>
                  </div>
                  <div className="col-span-1">
                    <span className="font-semibold text-gray-900">${appt.price}</span>
                  </div>
                  <div className="col-span-2 flex md:justify-end justify-start items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getPaymentBadge(appt.paymentStatus)}`}>
                      {appt.paymentStatus.charAt(0).toUpperCase() + appt.paymentStatus.slice(1)}
                    </span>
                    <button onClick={() => { try { sessionStorage.setItem(`live_session_prof_${appt.id}`, String(appt.serviceId)); } catch {} ; navigate(`/live-session/${appt.id}`); }} className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs flex items-center gap-1.5">
                      Start Session
                    </button>
                    <button className="px-2.5 py-1.5 rounded-lg border text-blue-700 hover:bg-blue-50 text-xs flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-gray-500">No appointments match your filters.</div>
              )}
            </div>
          </div>
        </div>
      );
    } catch (err) {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
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
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <p className="text-gray-600">Manage your patient database and records</p>
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
          <div className="space-y-4">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{patient.name}</h4>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                  <p className="text-sm text-gray-500">{patient.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Visit: {patient.lastVisit}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => {
    // In a real app, doctorId should come from auth/user context; using 1 for demo
    const doctorId = 1;
    const feedbackList = getFeedback(doctorId);
    const average = feedbackList.length
      ? Math.round((feedbackList.reduce((s, f) => s + (f.rating || 0), 0) / feedbackList.length) * 10) / 10
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Feedback</h2>
            <p className="text-gray-600">See ratings and comments from your patients</p>
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
            <p className="text-2xl font-bold text-gray-900">{feedbackList.length}</p>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600">Recommend Rate</p>
            <p className="text-2xl font-bold text-gray-900">{feedbackList.length ? Math.round((feedbackList.filter(f => f.wouldRecommend).length / feedbackList.length) * 100) : 0}%</p>
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
            {feedbackList.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-gray-500">No feedback yet.</div>
            )}
            {feedbackList.map((fb) => (
              <div key={fb.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-3">
                  <div className="font-medium text-gray-900">{fb.patientName || "Patient"}</div>
                  <div className="text-xs text-gray-500">Appt #{fb.appointmentId ?? "—"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="font-semibold text-gray-900">⭐ {fb.rating}</div>
                  {fb.wouldRecommend !== undefined && (
                    <div className={`text-xs mt-1 ${fb.wouldRecommend ? 'text-emerald-700' : 'text-rose-700'}`}>{fb.wouldRecommend ? 'Would recommend' : 'Would not recommend'}</div>
                  )}
                </div>
                <div className="md:col-span-5 space-y-1">
                  {fb.feedbackText && <div className="text-sm text-gray-800">{fb.feedbackText}</div>}
                  {fb.additionalComments && <div className="text-xs text-gray-600">{fb.additionalComments}</div>}
                  {fb.sessionQuality && (
                    <div className="text-xs text-gray-500">
                      Video {fb.sessionQuality.videoQuality}/5 • Audio {fb.sessionQuality.audioQuality}/5 • Conn {fb.sessionQuality.connectionStability}/5
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-700">{new Date(fb.createdAt).toLocaleDateString()}</div>
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
              <div key={message.id} className={`flex items-center space-x-4 p-4 rounded-lg ${message.unread ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                <img
                  src={message.avatar}
                  alt={message.from}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{message.from}</h4>
                    {message.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{message.subject}</p>
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
              <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{report.patientName}</h4>
                  <p className="text-sm text-gray-600">{report.type}</p>
                  <p className="text-xs text-gray-500">{report.date} • {report.fileSize}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
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
    status: 'registered' | 'paid' | 'waitlist';
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
    registrationUrl?: string;
    ticketPrice?: number;
    participants?: EventParticipant[];
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
    registrationUrl: string;
    ticketPrice: string;
  }
  const [events, setEvents] = useState<DoctorEvent[]>([
    {
      id: 1,
      title: "Fueling Performance: Nutrition Basics",
      type: "Workshop",
      category: "Nutrition",
      summary: "Foundational strategies for meal timing, macros, and hydration for everyday athletes.",
      details: "We will walk through pre- and post-workout fueling strategies, hydration, and simple plate-building templates.",
      agenda: ["Macro basics", "Timing & portions", "Hydration", "Q&A"],
      date: "2025-04-11",
      startTime: "04:30 PM",
      endTime: "05:30 PM",
      location: "Online webinar",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
      registrationUrl: "https://example.com/register-nutrition-basics",
      ticketPrice: 15,
      participants: [
        { id: 9001, name: "Sarah Johnson", email: "sarah@example.com", status: 'paid', registeredAt: "2025-03-30", amount: 15 },
        { id: 9002, name: "Michael Chen", email: "mchen@example.com", status: 'registered', registeredAt: "2025-04-01" },
        { id: 9003, name: "Emily Davis", email: "emily@example.com", status: 'waitlist', registeredAt: "2025-04-02" }
      ]
    },
    {
      id: 2,
      title: "Heart Health 101",
      type: "Event",
      category: "Wellness",
      summary: "Intro to heart-healthy lifestyle and risk awareness.",
      details: "Overview of key lifestyle domains that contribute to cardiovascular health, with practical tips.",
      agenda: ["Risk factors", "Diet & activity", "Stress", "Q&A"],
      date: "2025-05-02",
      startTime: "05:00 PM",
      endTime: "06:00 PM",
      location: "Wellness City Hall",
      imageUrl: "https://images.unsplash.com/photo-1510627498534-cf7e9002facc?q=80&w=1200&auto=format&fit=crop",
      registrationUrl: "https://example.com/register-heart-health",
      ticketPrice: 0,
      participants: [
        { id: 9101, name: "David Wilson", email: "dwilson@example.com", status: 'registered', registeredAt: "2025-04-05" }
      ]
    }
  ]);
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
    registrationUrl: "",
    ticketPrice: ""
  });
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [openParticipants, setOpenParticipants] = useState<Record<number, boolean>>({});
  const readEventFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };
  const handleEventImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert("Please select an image smaller than 2.5MB");
      return;
    }
    try {
      const dataUrl = await readEventFileAsDataUrl(file);
      setNewEventForm(prev => ({ ...prev, imageUrl: dataUrl }));
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateEvent = () => {
    if (!newEventForm.title || !newEventForm.date || !newEventForm.startTime) return;
    const agenda = newEventForm.agendaInput
      .split(/\n|•|-/)
      .map(s => s.trim())
      .filter(Boolean);
    const toAdd: DoctorEvent = {
      id: Date.now(),
      title: newEventForm.title,
      type: newEventForm.type,
      category: newEventForm.category || "General",
      summary: newEventForm.summary,
      details: newEventForm.details,
      agenda,
      date: newEventForm.date,
      startTime: newEventForm.startTime,
      endTime: newEventForm.endTime,
      location: newEventForm.location,
      imageUrl: newEventForm.imageUrl,
      registrationUrl: newEventForm.registrationUrl,
      ticketPrice: newEventForm.ticketPrice ? Number(newEventForm.ticketPrice) : undefined
    };
    setEvents(prev => [toAdd, ...prev]);
    setNewEventForm({ title: "", type: "Event", category: "", summary: "", details: "", agendaInput: "", date: "", startTime: "", endTime: "", location: "", imageUrl: "", registrationUrl: "", ticketPrice: "" });
  };
  const renderEvents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Events & Workshops</h2>
          <p className="text-gray-600">Create and manage your events and workshops</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New</h3>
          <button
            onClick={() => setShowCreateEvent(v => !v)}
            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
          >
            {showCreateEvent ? 'Hide' : 'New Event'}
          </button>
        </div>
        {showCreateEvent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={newEventForm.title} onChange={e => setNewEventForm(prev => ({ ...prev, title: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Fueling Performance: Nutrition Basics" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={newEventForm.type} onChange={e => setNewEventForm(prev => ({ ...prev, type: e.target.value as EventType }))} className="w-full border rounded-lg px-3 py-2">
              <option>Event</option>
              <option>Workshop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input value={newEventForm.category} onChange={e => setNewEventForm(prev => ({ ...prev, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Nutrition" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={newEventForm.date} onChange={e => setNewEventForm(prev => ({ ...prev, date: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="time" value={newEventForm.startTime} onChange={e => setNewEventForm(prev => ({ ...prev, startTime: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" value={newEventForm.endTime} onChange={e => setNewEventForm(prev => ({ ...prev, endTime: e.target.value }))} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration URL</label>
              <input value={newEventForm.registrationUrl} onChange={e => setNewEventForm(prev => ({ ...prev, registrationUrl: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={newEventForm.location} onChange={e => setNewEventForm(prev => ({ ...prev, location: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Online webinar" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <input value={newEventForm.summary} onChange={e => setNewEventForm(prev => ({ ...prev, summary: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="Foundational strategies for meal timing, macros, and hydration..." />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea value={newEventForm.details} onChange={e => setNewEventForm(prev => ({ ...prev, details: e.target.value }))} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="We will walk through pre- and post-workout fueling strategies..." />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Agenda (one per line)</label>
            <textarea value={newEventForm.agendaInput} onChange={e => setNewEventForm(prev => ({ ...prev, agendaInput: e.target.value }))} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder={"Macro basics\nTiming & portions\nHydration\nQ&A"} />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50">
              {newEventForm.imageUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={newEventForm.imageUrl} alt="preview" className="w-16 h-16 rounded object-cover" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Preview</p>
                      <p className="text-xs text-gray-500">PNG/JPG up to 2.5MB</p>
                    </div>
                  </div>
                  <button onClick={() => setNewEventForm(prev => ({ ...prev, imageUrl: "" }))} className="text-sm text-red-600 hover:underline">Remove</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-500" />
                  <span className="text-sm text-gray-700">Click to upload</span>
                  <span className="text-xs text-gray-500">PNG/JPG up to 2.5MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleEventImageSelected} />
                </label>
              )}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Or paste image URL</label>
              <input value={newEventForm.imageUrl} onChange={e => setNewEventForm(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="https://..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:col-span-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price ($)</label>
              <input value={newEventForm.ticketPrice} onChange={e => setNewEventForm(prev => ({ ...prev, ticketPrice: e.target.value }))} className="w-full border rounded-lg px-3 py-2" placeholder="0 for free" />
            </div>
            <div className="flex items-end">
              <button onClick={handleCreateEvent} className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
        )}
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900">Your Events</div>
        {events.map(ev => (
          <div key={ev.id} className="px-6 py-5 border-b last:border-0">
            <details>
              <summary className="grid grid-cols-1 sm:grid-cols-12 gap-4 cursor-pointer">
                <div className="sm:col-span-2">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} className="w-full h-24 object-cover rounded" />
                  ) : (
                    <div className="w-full h-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="sm:col-span-7">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">{ev.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">{ev.category || 'General'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{ev.type}</span>
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
                  <div className="font-medium text-gray-900 mb-1">When & where</div>
                  <div>{ev.date}</div>
                  <div>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</div>
                  <div>{ev.location}</div>
                  {typeof ev.ticketPrice === 'number' && (
                    <div className="mt-1">Price: <span className="font-semibold">${ev.ticketPrice}</span></div>
                  )}
                  {ev.registrationUrl && (
                    <div className="mt-2">
                      <a className="text-blue-600 hover:text-blue-700 font-medium" href={ev.registrationUrl} target="_blank" rel="noreferrer">Register</a>
                    </div>
                  )}
                </div>
              </summary>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-12">
                  <div className="text-sm text-gray-900 font-medium mb-1">Details</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{ev.details}</div>
                </div>
                <div className="sm:col-span-12">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-900 font-medium">Participants</div>
                    <button
                      onClick={() => setOpenParticipants(prev => ({ ...prev, [ev.id]: !prev[ev.id] }))}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {openParticipants[ev.id] ? 'Hide all' : 'Show all'}
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
                      {(ev.participants || []).map(p => (
                        <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-2 border-b last:border-0 text-sm">
                          <div className="md:col-span-4 font-medium text-gray-900">{p.name}</div>
                          <div className="md:col-span-4 text-gray-700 break-all">{p.email}</div>
                          <div className="md:col-span-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : p.status === 'registered' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{p.status}</span>
                            {typeof p.amount === 'number' && <span className="ml-2 text-xs text-gray-600">${p.amount}</span>}
                          </div>
                          <div className="md:col-span-2 md:text-right text-gray-700 text-xs">{p.registeredAt}</div>
                        </div>
                      ))}
                      {(ev.participants || []).length === 0 && (
                        <div className="py-4 text-xs text-gray-500">No participants yet.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </div>
        ))}
        {events.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No events yet.</div>
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
  const [rescheduleRequests, setRescheduleRequests] = useState<RescheduleRequest[]>([
    { id: 501, patientName: "Emily Davis", serviceName: "Cardiac Assessment", currentDate: "2024-12-24", currentTime: "02:15 PM", requestedDate: "2024-12-26", requestedTime: "11:30 AM", reason: "Travel conflict", status: "pending" }
  ]);
  const pendingRescheduleCount = rescheduleRequests.filter(r => r.status === "pending").length;
  const updateRequestStatus = (id: number, status: RescheduleRequest["status"]) => {
    setRescheduleRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };
  const renderReschedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reschedule Requests</h2>
          <p className="text-gray-600">Manage patient requests to reschedule appointments</p>
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
        {rescheduleRequests.map(r => (
          <div key={r.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="col-span-3 font-medium text-gray-900">{r.patientName}</div>
            <div className="col-span-3 text-gray-700">{r.serviceName}</div>
            <div className="col-span-2 text-gray-700">{r.currentDate}<div className="text-xs text-gray-500">{r.currentTime}</div></div>
            <div className="col-span-2 text-gray-700">{r.requestedDate}<div className="text-xs text-gray-500">{r.requestedTime}</div></div>
            <div className="col-span-2 md:text-right flex md:justify-end gap-2">
              {r.status === 'pending' ? (
                <>
                  <button onClick={() => updateRequestStatus(r.id, 'approved')} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700">Approve</button>
                  <button onClick={() => updateRequestStatus(r.id, 'declined')} className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700">Decline</button>
                </>
              ) : (
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{r.status}</span>
              )}
            </div>
            <div className="md:col-span-12 text-xs text-gray-500">Reason: {r.reason}</div>
          </div>
        ))}
        {rescheduleRequests.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No reschedule requests.</div>
        )}
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="text-gray-600">Manage how you get paid for sessions and services</p>
        </div>
      </div>

      {/* Payments Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Paid Patients</p>
          <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(paidAppointments.filter(a => a.paymentStatus === 'paid').map(a => a.patientEmail))).length}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Paid Sessions</p>
          <p className="text-2xl font-bold text-gray-900">{paidAppointments.filter(a => a.paymentStatus === 'paid').length}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Pending Balance</p>
          <div className="mt-1 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-500" />
            <p className="text-2xl font-bold text-gray-900">${pendingBalance}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-600">Payout Method</p>
          <p className="text-2xl font-bold text-gray-900 capitalize">{payoutMethod}</p>
        </div>
      </div>

      {/* Billing Tabs */}
      <div className="bg-white rounded-xl border p-2 w-full">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-max">
          <button onClick={() => setBillingTab('earnings')} className={`px-3 py-1.5 rounded-md text-sm ${billingTab === 'earnings' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Earnings</button>
          <button onClick={() => setBillingTab('method')} className={`px-3 py-1.5 rounded-md text-sm ${billingTab === 'method' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Payment Method</button>
          <button onClick={() => setBillingTab('withdraw')} className={`px-3 py-1.5 rounded-md text-sm ${billingTab === 'withdraw' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Withdraw</button>
        </div>
      </div>

      {/* Earnings Tab */}
      {billingTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
              <p className="text-sm text-gray-600">Daily totals of paid sessions</p>
            </div>
            <div className="p-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData} margin={{ left: 8, right: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Paid list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b text-lg font-semibold text-gray-900">Paid Sessions</div>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
              <div className="col-span-4">Patient</div>
              <div className="col-span-4">Service</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {paidAppointments.filter(a => a.paymentStatus === 'paid').map(appt => (
              <div key={appt.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center gap-3">
                  <img src={appt.patientAvatar} alt={appt.patientName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div className="font-medium text-gray-900">{appt.patientName}</div>
                    <div className="text-xs text-gray-500">{appt.patientEmail}</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="font-medium text-gray-900">{appt.serviceName}</div>
                  <div className="text-xs text-gray-500">{appt.mode}</div>
                </div>
                <div className="col-span-2 text-gray-700">{appt.date}</div>
                <div className="col-span-2 md:text-right font-semibold text-gray-900">${appt.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Method Tab */}
      {billingTab === 'method' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Method</h3>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-max mb-4">
              <button onClick={() => setPayoutMethod('bank')} className={`px-3 py-1.5 rounded-md text-sm ${payoutMethod === 'bank' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Bank Transfer</button>
              <button onClick={() => setPayoutMethod('paypal')} className={`px-3 py-1.5 rounded-md text-sm ${payoutMethod === 'paypal' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>PayPal</button>
              <button onClick={() => setPayoutMethod('stripe')} className={`px-3 py-1.5 rounded-md text-sm ${payoutMethod === 'stripe' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Stripe Connect</button>
            </div>
            {payoutMethod === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input value={bankDetails.accountName} onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input value={bankDetails.bankName} onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Bank of Wellness" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input value={bankDetails.accountNumber} onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="•••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                    <input value={bankDetails.routingNumber} onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="•••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input value={bankDetails.country} onChange={(e) => setBankDetails({ ...bankDetails, country: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="US" />
                  </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save Bank Details</button>
              </div>
            )}
            {payoutMethod === 'paypal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                  <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="you@example.com" />
                </div>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save PayPal</button>
              </div>
            )}
            {payoutMethod === 'stripe' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Connect your Stripe account to receive payouts directly.</p>
                <button onClick={() => setStripeConnected(true)} className={`px-4 py-2 rounded-lg ${stripeConnected ? 'bg-green-600' : 'bg-blue-600'} text-white hover:opacity-90`}>{stripeConnected ? 'Connected' : 'Connect Stripe'}</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How payouts work</h3>
            <p className="text-sm text-gray-700">When a patient pays for a session or service, the payment is processed and held in your platform balance. Based on your payout method and schedule, funds are transferred to your selected destination. Bank withdrawals require complete bank details.</p>
          </div>
        </div>
      )}

      {/* Withdraw Tab */}
      {billingTab === 'withdraw' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Withdrawal</h3>
            <p className="text-sm text-gray-600 mb-4">Withdraw from your pending balance to your bank account.</p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input type="number" min={1} max={pendingBalance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full sm:w-48 border rounded-lg px-3 py-2" placeholder={`Up to $${pendingBalance}`} />
              <button onClick={handleRequestWithdrawal} disabled={!(payoutMethod === 'bank' && areBankDetailsComplete() && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= pendingBalance)} className={`px-4 py-2 rounded-lg text-white ${payoutMethod === 'bank' && areBankDetailsComplete() && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= pendingBalance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                Request Withdrawal
              </button>
              {payoutMethod !== 'bank' && (
                <span className="text-xs text-amber-600">Switch to Bank Transfer to withdraw to your bank.</span>
              )}
              {payoutMethod === 'bank' && !areBankDetailsComplete() && (
                <span className="text-xs text-amber-600">Complete your bank details to receive withdrawals.</span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
            </div>
            <div>
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b text-xs font-medium text-gray-500">
                <div className="col-span-3">Payout ID</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Method</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {payouts.map(p => (
                <div key={p.id} className="px-6 py-4 border-b last:border-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 font-medium text-gray-900">{p.id}</div>
                  <div className="col-span-3 text-gray-700">{p.date}</div>
                  <div className="col-span-2 font-semibold text-gray-900">${p.amount}</div>
                  <div className="col-span-2 text-gray-700">{p.method}</div>
                  <div className="col-span-2 md:text-right">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
            {/* Name and Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" defaultValue="Sarah" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" defaultValue="Wilson" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue="dr.wilson@wellness.com" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input type="text" defaultValue="Physician" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input type="text" defaultValue="Cardiology" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input type="text" defaultValue="LIC-123456" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            {/* Practice Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name</label>
              <input type="text" defaultValue="Wellness Heart Clinic" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Practice Address</label>
              <input type="text" defaultValue="123 Health Ave" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" defaultValue="Wellness City" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" defaultValue="CA" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip</label>
                <input type="text" defaultValue="90210" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>

            {/* Education & Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <textarea defaultValue="MD from University of Health" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input type="number" defaultValue={8} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Update Profile</button>
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
              <span className="text-sm text-gray-700">Appointment Reminders</span>
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
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const name = (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).name;

      let nextValue: string | number | boolean = (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

      if ('checked' in target && (target as HTMLInputElement).type === 'checkbox') {
        nextValue = (target as HTMLInputElement).checked;
      } else if (name === 'durationMin' || name === 'price') {
        nextValue = Number((target as HTMLInputElement | HTMLSelectElement).value);
      }

      setNewService(prev => ({
        ...prev,
        [name]: nextValue
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
        setNewService(prev => ({ ...prev, imageUrl: dataUrl }));
      } catch (err) {
        console.error(err);
      }
    };

    const resetForm = () => {
      setNewService({ name: "", category: "Consultation", durationMin: 30, price: 0, mode: "In-person", description: "", benefitsInput: "", imageUrl: "", active: true, customCategory: "", locationAddress: "", availableDays: [], scheduleType: 'same', numberOfSlots: 1, timeSlots: [{ start: '', end: '' }], customSchedules: {} });
      setEditingServiceId(null);
      setFormMode("create");
    };

    const handleAddService = () => {
      if (!newService.name || !newService.category || !newService.durationMin || !newService.price) return;
      if (newService.category === "Other" && !newService.customCategory.trim()) return;
      if (newService.mode === "In-person" && !newService.locationAddress.trim()) return;
      const benefits = newService.benefitsInput
        .split(/\n|,/)
        .map(b => b.trim())
        .filter(Boolean);
      const resolvedCategory = newService.category === "Other" ? newService.customCategory.trim() : newService.category;
      const toAdd: Service = {
        id: Date.now(),
        name: newService.name,
        category: resolvedCategory,
        durationMin: Number(newService.durationMin),
        price: Number(newService.price),
        mode: newService.mode,
        description: newService.description,
        benefits,
        imageUrl: newService.imageUrl,
        active: newService.active,
        locationAddress: newService.mode !== "Virtual" ? newService.locationAddress.trim() : "",
        availability: { 
          days: newService.availableDays, 
          scheduleType: newService.scheduleType,
          numberOfSlots: newService.numberOfSlots, 
          timeSlots: newService.timeSlots,
          customSchedules: newService.scheduleType === 'custom' ? newService.customSchedules : undefined
        }
      };
      setServices(prev => [toAdd, ...prev]);
      setNewService({ name: "", category: "Consultation", durationMin: 30, price: 0, mode: "In-person", description: "", benefitsInput: "", imageUrl: "", active: true, customCategory: "", locationAddress: "", availableDays: [], scheduleType: 'same', numberOfSlots: 1, timeSlots: [{ start: '', end: '' }], customSchedules: {} });
      setShowServiceForm(false);
    };

    const handleStartEditService = (svc: Service) => {
      setFormMode("edit");
      setEditingServiceId(svc.id);
      setShowServiceForm(true);
      const categories = ["Consultation","Follow-up","Assessment","Therapy","Nutrition","Mental Health","Wellness","Other"];
      const isKnownCategory = categories.includes(svc.category);
      setNewService({
        name: svc.name,
        category: isKnownCategory ? svc.category : "Other",
        customCategory: isKnownCategory ? "" : svc.category,
        durationMin: svc.durationMin,
        price: svc.price,
        mode: svc.mode,
        description: svc.description,
        benefitsInput: svc.benefits.join("\n"),
        imageUrl: svc.imageUrl,
        active: svc.active,
        locationAddress: svc.locationAddress || "",
        availableDays: svc.availability?.days || [],
        scheduleType: svc.availability?.customSchedules ? 'custom' : 'same',
        numberOfSlots: svc.availability?.numberOfSlots || 1,
        timeSlots: svc.availability?.timeSlots || [{ start: '', end: '' }],
        customSchedules: svc.availability?.customSchedules || {}
      });
    };

    const handleSaveEdit = () => {
      if (editingServiceId == null) return;
      if (newService.category === "Other" && !newService.customCategory.trim()) return;
      if (newService.mode === "In-person" && !newService.locationAddress.trim()) return;
      const benefits = newService.benefitsInput
        .split(/\n|,/)
        .map(b => b.trim())
        .filter(Boolean);
      const resolvedCategory = newService.category === "Other" ? newService.customCategory.trim() : newService.category;
      setServices(prev => prev.map(s => s.id === editingServiceId ? {
        ...s,
        name: newService.name,
        category: resolvedCategory,
        durationMin: newService.durationMin,
        price: newService.price,
        mode: newService.mode,
        description: newService.description,
        benefits,
        imageUrl: newService.imageUrl,
        active: newService.active,
        locationAddress: newService.mode !== "Virtual" ? newService.locationAddress.trim() : "",
        availability: { 
          days: newService.availableDays, 
          scheduleType: newService.scheduleType,
          numberOfSlots: newService.numberOfSlots, 
          timeSlots: newService.timeSlots,
          customSchedules: newService.scheduleType === 'custom' ? newService.customSchedules : undefined
        }
      } : s));
      setNewService({ name: "", category: "Consultation", durationMin: 30, price: 0, mode: "In-person", description: "", benefitsInput: "", imageUrl: "", active: true, customCategory: "", locationAddress: "", availableDays: [], scheduleType: 'same', numberOfSlots: 1, timeSlots: [{ start: '', end: '' }], customSchedules: {} });
      setEditingServiceId(null);
      setFormMode("create");
      setShowServiceForm(false);
    };

    const handleDeleteService = (id: number) => {
      setServices(prev => prev.filter(s => s.id !== id));
    };

    const handleToggleActive = (id: number) => {
      setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    };

    return (
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            <p className="text-gray-600">Create and manage the services you provide to patients</p>
          </div>
          <div className="flex items-center gap-2">
            {showServiceForm && (
              <button
                onClick={() => { setShowServiceForm(false); resetForm(); }}
                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            )}
            <button
              onClick={() => { setShowServiceForm(v => !v); setFormMode("create"); setEditingServiceId(null); if (!showServiceForm) resetForm(); }}
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
                    <h3 className="text-xl font-semibold text-gray-900">{formMode === 'create' ? 'Create New Service' : 'Edit Service'}</h3>
                    <p className="text-xs text-gray-600 mt-1">Configure your service details and availability</p>
                  </div>
                  <div className="flex items-center gap-3">
              {formMode === 'edit' && (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">Editing</span>
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
                      <label className="block text-xs font-medium text-gray-700 mb-2">Service Name</label>
                <input
                  name="name"
                  value={newService.name}
                  onChange={handleNewServiceChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., General Consultation"
                />
              </div>
              <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
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
              {newService.category === 'Other' && (
                <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">Custom Category</label>
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
                      <label className="block text-xs font-medium text-gray-700 mb-2">Duration (minutes)</label>
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
                      <label className="block text-xs font-medium text-gray-700 mb-2">Price ($)</label>
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
                      <label className="block text-xs font-medium text-gray-700 mb-2">Mode</label>
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
                      <label className="block text-xs font-medium text-blue-800 mb-3">Schedule Type</label>
                      <div className="flex gap-3">
                        <label className={`flex-1 cursor-pointer transition-all duration-300 ${newService.scheduleType === 'same' ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-white text-gray-700 hover:bg-blue-50 hover:scale-102'}`}>
                          <input
                            type="radio"
                            name="scheduleType"
                            value="same"
                            checked={newService.scheduleType === 'same'}
                            onChange={(e) => setNewService(prev => ({ ...prev, scheduleType: e.target.value as 'same' | 'custom' }))}
                            className="hidden"
                          />
                          <div className="p-3 rounded-lg border-2 border-transparent text-center">
                            <div className="font-medium text-sm">Same for All Days</div>
                            <div className="text-xs opacity-80 mt-1">Use identical time slots every day</div>
                          </div>
                        </label>
                        <label className={`flex-1 cursor-pointer transition-all duration-300 ${newService.scheduleType === 'custom' ? 'bg-purple-600 text-white shadow-md scale-105' : 'bg-white text-gray-700 hover:bg-purple-50 hover:scale-102'}`}>
                          <input
                            type="radio"
                            name="scheduleType"
                            value="custom"
                            checked={newService.scheduleType === 'custom'}
                            onChange={(e) => setNewService(prev => ({ ...prev, scheduleType: e.target.value as 'same' | 'custom' }))}
                            className="hidden"
                          />
                          <div className="p-3 rounded-lg border-2 border-transparent text-center">
                            <div className="font-medium text-sm">Customize Per Day</div>
                            <div className="text-xs opacity-80 mt-1">Different schedules for different days</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Available Days Selection */}
                    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                      <label className="block text-sm font-medium text-emerald-800 mb-4">Available Days</label>
                      <div className="grid grid-cols-4 gap-3">
                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                          <label key={d} className={`cursor-pointer transition-all duration-300 ${newService.availableDays.includes(d) ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-white text-gray-600 hover:bg-emerald-100 hover:scale-102'}`}>
                            <input
                              type="checkbox"
                              checked={newService.availableDays.includes(d)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setNewService(prev => ({
                                  ...prev,
                                  availableDays: checked ? [...prev.availableDays, d] : prev.availableDays.filter(x => x !== d)
                                }));
                              }}
                              className="hidden"
                            />
                            <div className="p-3 rounded-xl border-2 border-transparent text-center font-semibold text-sm">
                              {d}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Time Slots Configuration */}
                    {newService.scheduleType === 'same' ? (
                      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-purple-800">Time Slots (Same for All Days)</label>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-purple-600 font-medium">Number of slots:</span>
                            <select
                              value={newService.numberOfSlots || 1}
                              onChange={(e) => {
                                const slots = parseInt(e.target.value);
                                setNewService(prev => ({ 
                                  ...prev, 
                                  numberOfSlots: slots,
                                  timeSlots: Array(slots).fill('').map((_, index) => ({ start: '', end: '' }))
                                }));
                              }}
                              className="text-xs border border-purple-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                            >
                              {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {Array.from({ length: newService.numberOfSlots || 1 }).map((_, index) => (
                            <div key={index} className="flex gap-3 items-center p-3 bg-white rounded-xl border border-purple-200 shadow-sm">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                                {index + 1}
                              </div>
                              <select
                                value={newService.timeSlots?.[index]?.start || ''}
                                onChange={(e) => {
                                  const selectedTime = e.target.value;
                                  const selectedSlot = generateTimeSlots(newService.durationMin).find(slot => slot.start === selectedTime);
                                  const updatedSlots = [...(newService.timeSlots || [])];
                                  updatedSlots[index] = { 
                                    start: selectedTime, 
                                    end: selectedSlot?.end || '' 
                                  };
                                  setNewService(prev => ({ 
                                    ...prev, 
                                    timeSlots: updatedSlots
                                  }));
                                }}
                                className="flex-1 border border-purple-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                              >
                                <option value="">Select start time</option>
                                {generateTimeSlots(newService.durationMin).map((slot, slotIndex) => (
                                  <option key={slotIndex} value={slot.start}>
                                    {slot.start} - {slot.end} ({newService.durationMin} min)
                                  </option>
                                ))}
                              </select>
                              <div className="w-24 border border-purple-300 rounded-xl px-3 py-2 bg-purple-50 text-purple-700 text-xs text-center font-medium">
                                {newService.timeSlots?.[index]?.end || '--:-- --'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                        <label className="block text-sm font-medium text-amber-800 mb-4">Custom Schedule Per Day</label>
                        <div className="space-y-4">
                          {newService.availableDays.map(day => (
                            <div key={day} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-amber-800 text-base">{day}</h4>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-amber-600 font-medium">Slots:</span>
                                  <select
                                    value={newService.customSchedules?.[day]?.numberOfSlots || 1}
                                    onChange={(e) => {
                                      const slots = parseInt(e.target.value);
                                      const updatedSchedules = { ...newService.customSchedules };
                                      updatedSchedules[day] = {
                                        ...updatedSchedules[day],
                                        numberOfSlots: slots,
                                        timeSlots: Array(slots).fill('').map(() => ({ start: '', end: '' }))
                                      };
                                      setNewService(prev => ({ 
                                        ...prev, 
                                        customSchedules: updatedSchedules
                                      }));
                                    }}
                                    className="text-xs border border-amber-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                                      <option key={num} value={num}>{num}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {Array.from({ length: newService.customSchedules?.[day]?.numberOfSlots || 1 }).map((_, index) => (
                                  <div key={index} className="flex gap-3 items-center">
                                    <span className="text-xs text-amber-600 w-20 font-medium">Slot {index + 1}:</span>
                                    <select
                                      value={newService.customSchedules?.[day]?.timeSlots?.[index]?.start || ''}
                                      onChange={(e) => {
                                        const selectedTime = e.target.value;
                                        const selectedSlot = generateTimeSlots(newService.durationMin).find(slot => slot.start === selectedTime);
                                        const updatedSchedules = { ...newService.customSchedules };
                                        if (!updatedSchedules[day]) updatedSchedules[day] = { numberOfSlots: 1, timeSlots: [] };
                                        if (!updatedSchedules[day].timeSlots) updatedSchedules[day].timeSlots = [];
                                        updatedSchedules[day].timeSlots[index] = { 
                                          start: selectedTime, 
                                          end: selectedSlot?.end || '' 
                                        };
                                        setNewService(prev => ({ 
                                          ...prev, 
                                          customSchedules: updatedSchedules
                                        }));
                                      }}
                                      className="flex-1 border border-amber-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                                    >
                                      <option value="">Select time</option>
                                      {generateTimeSlots(newService.durationMin).map((slot, slotIndex) => (
                                        <option key={slotIndex} value={slot.start}>
                                          {slot.start} - {slot.end} ({newService.durationMin} min)
                                        </option>
                                      ))}
                                    </select>
                                    <div className="w-24 border border-amber-300 rounded-xl px-3 py-2 bg-amber-50 text-amber-700 text-xs text-center font-medium">
                                      {newService.customSchedules?.[day]?.timeSlots?.[index]?.end || '--:-- --'}
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
                  {newService.mode === 'In-person' && (
                    <div className="lg:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Location Address</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-2">Image Upload</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                  {newService.imageUrl ? (
                    <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img src={newService.imageUrl} alt="preview" className="w-20 h-20 rounded-xl object-cover" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Preview</p>
                          <p className="text-xs text-gray-500">PNG/JPG up to 2.5MB</p>
                        </div>
                      </div>
                          <button onClick={() => setNewService(prev => ({ ...prev, imageUrl: "" }))} className="text-xs text-red-600 hover:underline font-medium">Remove</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-500 mb-2" />
                          <span className="text-sm text-gray-700 font-medium">Click to upload</span>
                      <span className="text-xs text-gray-500">PNG/JPG up to 2.5MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageSelected} />
                    </label>
                  )}
                </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Or paste image URL</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-2">Description</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-2">Benefits (one per line)</label>
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
                      <label htmlFor="service-active" className="text-sm font-medium text-gray-700">Active</label>
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
                    onClick={formMode === 'create' ? handleAddService : handleSaveEdit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    {formMode === 'create' ? 'Create Service' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Services</h3>
            <span className="text-sm text-gray-500">{services.length} total</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  {/* Image header */}
                  <div className="relative aspect-video bg-gray-100">
                    {service.imageUrl ? (
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Stethoscope className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 inline-flex px-2 py-1 text-xs rounded-full bg-blue-600 text-white">
                      {service.category}
                    </div>
                    <div className={`absolute top-3 right-3 inline-flex px-2 py-1 text-xs rounded-full ${service.active ? 'bg-green-600' : 'bg-gray-500'} text-white`}>
                      {service.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-semibold text-gray-900">{service.name}</h4>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">${service.price}</div>
                        <div className="text-xs text-gray-500">{service.mode}</div>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-600">{service.description}</p>

                    {service.benefits.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-900">Benefits</h5>
                        <ul className="mt-1 space-y-1 text-sm text-gray-700 list-disc list-inside">
                          {service.benefits.slice(0, 4).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                        Duration: <span className="font-medium">{service.durationMin}m</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                        Mode: <span className="font-medium">{service.mode}</span>
                      </div>
                      <div className="rounded border bg-gray-50 px-2 py-1 text-gray-700">
                        Price: <span className="font-medium">${service.price}</span>
                      </div>
                    </div>
                    {service.mode !== 'Virtual' && service.locationAddress && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <span className="line-clamp-2">{service.locationAddress}</span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleToggleActive(service.id)} className={`px-2.5 py-1 rounded text-xs font-medium ${service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {service.active ? 'Set Inactive' : 'Set Active'}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleStartEditService(service)} className="px-2.5 py-1.5 rounded-lg border text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 text-sm">
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
  const [payoutSchedule, setPayoutSchedule] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [currency, setCurrency] = useState("USD");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
    country: ""
  });
  const [paypalEmail, setPaypalEmail] = useState("");
  const [stripeConnected, setStripeConnected] = useState(false);
  const [pendingBalance, setPendingBalance] = useState<number>(210);
  const initialPayouts = [
    { id: "PO-54823", date: "2024-12-20", amount: 180, method: "Bank Transfer", status: "completed" },
    { id: "PO-54810", date: "2024-12-13", amount: 240, method: "PayPal", status: "completed" },
    { id: "PO-54795", date: "2024-12-06", amount: 120, method: "Bank Transfer", status: "completed" }
  ];
  const [payouts, setPayouts] = useState(initialPayouts);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const areBankDetailsComplete = () =>
    bankDetails.accountName && bankDetails.accountNumber && bankDetails.routingNumber && bankDetails.bankName && bankDetails.country;
  const handleRequestWithdrawal = () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) return;
    if (amt > pendingBalance) return;
    if (payoutMethod !== "bank" || !areBankDetailsComplete()) return;
    const today = new Date();
    const dateLabel = today.toISOString().slice(0, 10);
    const newId = `PO-${Math.floor(Math.random() * 90000) + 10000}`;
    setPayouts(prev => [{ id: newId, date: dateLabel, amount: amt, method: "Bank Transfer", status: "pending" }, ...prev]);
    setPendingBalance(prev => prev - amt);
    setWithdrawAmount("");
  };
  const [billingTab, setBillingTab] = useState<"earnings" | "method" | "withdraw">("earnings");
  // Build earnings graph data from paid appointments by date
  const earningsMap = new Map<string, number>();
  paidAppointments.filter(a => a.paymentStatus === "paid").forEach(a => {
    const key = format(parseISO(a.date), "MMM dd");
    earningsMap.set(key, (earningsMap.get(key) || 0) + a.price);
  });
  const earningsData = Array.from(earningsMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name));

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
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 h-full overflow-auto md:static md:translate-x-0 md:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between md:hidden mb-4">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl font-semibold">Dr.</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dr. Sarah Wilson</h3>
                <p className="text-sm text-gray-500">Cardiologist</p>
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
                <span className="flex items-center gap-2">Reschedule {pendingRescheduleCount > 0 && <span className="inline-block h-2 w-2 rounded-full bg-red-500" />}</span>
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
              
              <button
                onClick={() => setActiveTab("messages")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "messages" 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </button>
              
              <button
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === "reports" 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </button>

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
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-lg border text-gray-700 hover:bg-gray-50">
                <Menu className="w-5 h-5" />
              </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === "overview" ? "Dashboard" : 
                 activeTab === "appointments" ? "Appointments" :
                 activeTab === "patients" ? "Patients" :
                 activeTab === "messages" ? "Messages" :
                 activeTab === "reports" ? "Reports" :
                 activeTab === "services" ? "Services" :
                 activeTab === "billing" ? "Billing" :
                 activeTab === "feedback" ? "Feedback" :
                 activeTab === "settings" ? "Settings" : "Dashboard"}
              </h1>
              <p className="text-gray-600">
                {activeTab === "overview" ? "Welcome back, Dr. Wilson. Here's what's happening today." :
                 activeTab === "appointments" ? "Manage appointment requests and scheduled appointments" :
                 activeTab === "patients" ? "Manage your patient database and records" :
                 activeTab === "messages" ? "Communicate with your patients" :
                 activeTab === "reports" ? "Manage patient reports and documents" :
                 activeTab === "services" ? "Create and manage the services you provide to patients" :
                 activeTab === "billing" ? "Manage payout methods, preferences and track payouts" :
                 activeTab === "feedback" ? "See what patients say about their sessions and services" :
                 activeTab === "settings" ? "Manage your account and preferences" : "Welcome back"}
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
