import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import {
  useWishlistStatus,
  useWishlistSubscribe,
  useWishlistUnsubscribe,
} from "@/hooks/useMarketplace";
import {
  useProfessionals,
  useProfessionalServices,
} from "@/hooks/useMarketplace";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { simpleSupabase } from "@/lib/simple-supabase";
import { useEffect, useMemo, useState } from "react";
import { formatTime12h } from "@/lib/time";

// Helper date/time utils (no external deps)
const toTwo = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatYmd = (d: Date) =>
  `${d.getFullYear()}-${toTwo(d.getMonth() + 1)}-${toTwo(d.getDate())}`;
const parseTime = (t: string) => {
  const [hh, mm] = t.split(":").map((x) => parseInt(x, 10));
  return { hh, mm };
};
const addMinutes = (t: string, mins: number) => {
  const { hh, mm } = parseTime(t);
  const total = hh * 60 + mm + mins;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${toTwo(nh)}:${toTwo(nm)}`;
};
const compareTime = (a: string, b: string) => {
  const pa = parseTime(a);
  const pb = parseTime(b);
  return pa.hh * 60 + pa.mm - (pb.hh * 60 + pb.mm);
};
const daysInMonth = (year: number, monthIndex0: number) => {
  const first = new Date(year, monthIndex0, 1);
  const days: Date[] = [];
  const cursor = new Date(first);
  while (cursor.getMonth() === monthIndex0) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};
// Weekday normalization helpers
const weekdayShorts = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
const normalizeDayName = (name: string): string | null => {
  if (!name) return null;
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  // Match full names, shorts, and common variants
  const map: Record<string, string> = {
    sunday: "Sun",
    sun: "Sun",
    monday: "Mon",
    mon: "Mon",
    tuesday: "Tue",
    tue: "Tue",
    tues: "Tue",
    wednesday: "Wed",
    wed: "Wed",
    thursday: "Thu",
    thu: "Thu",
    thurs: "Thu",
    friday: "Fri",
    fri: "Fri",
    saturday: "Sat",
    sat: "Sat",
  };
  return map[lower] || null;
};
const toDaySet = (days: any): Set<string> => {
  const set = new Set<string>();
  if (Array.isArray(days)) {
    for (const d of days) {
      const n = normalizeDayName(String(d));
      if (n) set.add(n);
    }
  }
  return set;
};

const appointmentTypes = [
  { key: "consult", label: "Initial consultation (30 min)" },
  { key: "follow", label: "Follow-up (45 min)" },
  { key: "tele", label: "Telehealth session (30 min)" },
];

const BookAppointment = () => {
  const params = useParams();
  const navigate = useNavigate();

  const professionalId = params.id; // legacy route: /book/:id
  const providerSlug = (params as any).providerSlug as string | undefined; // new route: /book/:providerSlug/:serviceSlug
  const serviceSlug = (params as any).serviceSlug as string | undefined;
  const isServiceFlow = Boolean(providerSlug && serviceSlug);
  const { data: professionals, isLoading: loading, error } = useProfessionals();

  // Debug logging
  console.log("BookAppointment - route params:", params);
  console.log("BookAppointment - professionalId (legacy):", professionalId);
  console.log("BookAppointment - providerSlug (service flow):", providerSlug);
  console.log("BookAppointment - serviceSlug (service flow):", serviceSlug);
  console.log("BookAppointment - professionals loaded:", professionals?.length);
  console.log(
    "BookAppointment - all professional IDs:",
    professionals?.map((p) => ({ id: p.id, name: p.name }))
  );

  // Find the professional by ID (legacy) or by slug (service flow)
  const prof = isServiceFlow
    ? professionals?.find((p) => p.slug === providerSlug)
    : professionals?.find((p) => p.id === professionalId);

  console.log("BookAppointment - found professional:", prof);
  console.log("BookAppointment - isServiceFlow:", isServiceFlow);

  // Load services for the professional when in service flow
  // When booking by service slug, we need to load services using the professional's profile_id
  const { data: profServices, isLoading: servicesLoading } =
    useProfessionalServices((prof as any)?.profile_id);
  const selectedService = isServiceFlow
    ? (profServices || []).find((s: any) => s.slug === serviceSlug)
    : null;
  console.log(
    "BookAppointment - services count for prof:",
    profServices?.length
  );
  console.log("BookAppointment - selectedService:", selectedService);

  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [type, setType] = useState<string>(appointmentTypes[0].key);
  const [notes, setNotes] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const formattedCardNumber = (cardNumber || "")
    .replace(/\s+/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

  const typeLabel = useMemo(
    () => appointmentTypes.find((t) => t.key === type)?.label ?? "",
    [type]
  );

  // Calendar + availability state
  const now = new Date();
  // Weekly availability window
  const windowDays = 7;
  const [availableByDate, setAvailableByDate] = useState<
    Record<string, string[]>
  >({});
  const [loadingAvail, setLoadingAvail] = useState<boolean>(false);
  const [autoAdvanceCount, setAutoAdvanceCount] = useState<number>(0);
  const [computedWeekStart, setComputedWeekStart] = useState<string>("");

  // Current week start (Sunday) for pagination
  const startOfWeek = (d: Date) => {
    const day = d.getDay(); // 0=Sun
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(
    formatYmd(startOfWeek(now))
  );
  const todayWeekStart = formatYmd(startOfWeek(now));
  const todayYmd = formatYmd(new Date());

  // Rolling availability window (days ahead to show)

  // Build available slots for a specific date using service availability json
  const buildServiceDaySlots = (service: any, ymd: string): string[] => {
    const availability = service?.availability as any;
    if (!availability) return [];
    const duration = Number(service?.duration_min) || 30;
    const weekday = new Date(ymd).getDay(); // 0=Sun
    const weekdayName = weekdayShorts[weekday];
    const daySet = toDaySet(availability.days);

    const makeSlots = (
      windows: Array<{ start: string; end: string }> | string[]
    ) => {
      const slots: string[] = [];
      if (!Array.isArray(windows)) return slots;
      if (windows.length > 0 && typeof windows[0] === "string") {
        return (windows as string[]).slice().sort(compareTime);
      }
      for (const w of (windows as Array<{ start: string; end: string }>) ||
        []) {
        if (!w?.start || !w?.end || !w.start.trim() || !w.end.trim()) continue;
        let cursor = w.start;
        while (compareTime(addMinutes(cursor, duration), w.end) <= 0) {
          slots.push(cursor);
          cursor = addMinutes(cursor, duration);
        }
      }
      return slots;
    };

    if (
      availability.scheduleType === "custom" &&
      availability.customSchedules
    ) {
      // Accept either exact date keys or weekday-name keys
      const custom =
        availability.customSchedules[ymd] ||
        availability.customSchedules[weekdayName] ||
        availability.customSchedules[normalizeDayName(weekdayName) as any];
      if (custom) {
        const slots = makeSlots(custom.timeSlots || custom.slots || []);
        return slots;
      }
    }
    // Weekly (same) schedule
    if (
      (availability.scheduleType === "same" ||
        availability.scheduleType === "weekly" ||
        !availability.scheduleType) &&
      daySet.has(weekdayName)
    ) {
      const weekly = availability.timeSlots || availability.slots || [];
      return makeSlots(weekly);
    }
    // If scheduleType is custom but no custom for this date/day, fall back to weekly if provided
    if (availability.scheduleType === "custom" && daySet.has(weekdayName)) {
      const weekly = availability.timeSlots || availability.slots || [];
      return makeSlots(weekly);
    }
    return [];
  };

  // Load rolling availability for the next N days. Prefer service availability json; fallback to availability_slots.
  const loadMonthAvailability = async () => {
    if (!prof) return;
    setLoadingAvail(true);
    try {
      // Build the rolling window from the currently selected week start, not always 'now'
      const start = (() => {
        try {
          const [y, m, d] = String(currentWeekStart || todayWeekStart)
            .split("-")
            .map(Number);
          return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
        } catch {
          return new Date(now);
        }
      })();
      const end = new Date(start);

      end.setDate(end.getDate() + windowDays - 1);
      const ymdStart = formatYmd(start);
      const ymdEnd = formatYmd(end);

      // Use service availability JSONB if available, otherwise fallback to availability_slots
      const base: Record<string, string[]> = {};
      console.log(
        "BookAppointment - Loading availability for professional:",
        prof.id,
        "from",
        ymdStart,
        "to",
        ymdEnd
      );

      if (isServiceFlow && selectedService?.availability) {
        // Use service availability JSONB
        console.log(
          "BookAppointment - Using service availability JSONB:",
          selectedService.availability
        );
        const availability = selectedService.availability;
        const rollingDays: Date[] = [];
        const cur = new Date(start);
        while (cur <= end) {
          rollingDays.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
        const daySet = toDaySet((availability as any)?.days || []);
        console.log(
          "BookAppointment - Normalized days set:",
          Array.from(daySet)
        );

        for (const d of rollingDays) {
          const ymd = formatYmd(d);
          const weekday = d.getDay(); // 0=Sun
          const weekdayName = weekdayShorts[weekday];

          if (
            (availability as any)?.scheduleType === "custom" &&
            (availability as any)?.customSchedules
          ) {
            // Custom schedule for specific date or weekday
            const custom =
              (availability as any)?.customSchedules?.[ymd] ||
              (availability as any)?.customSchedules?.[weekdayName] ||
              (availability as any)?.customSchedules?.[
              normalizeDayName(weekdayName) as any
              ];
            const timeSlots = custom
              ? (custom as any)?.timeSlots || (custom as any)?.slots || []
              : [];
            const duration = Number(selectedService?.duration_min) || 30;
            const slots: string[] = [];
            if (
              Array.isArray(timeSlots) &&
              timeSlots.length > 0 &&
              typeof timeSlots[0] === "string"
            ) {
              base[ymd] = (timeSlots as string[]).slice().sort(compareTime);
              continue;
            }
            for (const w of (timeSlots as Array<{
              start: string;
              end: string;
            }>) || []) {
              if (!w?.start || !w?.end || !w.start.trim() || !w.end.trim())
                continue;
              let cursor = w.start;
              while (compareTime(addMinutes(cursor, duration), w.end) <= 0) {
                slots.push(cursor);
                cursor = addMinutes(cursor, duration);
              }
            }
            base[ymd] = slots;
          } else if (
            ((availability as any)?.scheduleType === "same" ||
              (availability as any)?.scheduleType === "weekly" ||
              !(availability as any)?.scheduleType) &&
            daySet.has(weekdayName)
          ) {
            // Regular weekly schedule
            const timeSlots =
              (availability as any)?.timeSlots ||
              (availability as any)?.slots ||
              [];
            const duration = Number(selectedService?.duration_min) || 30;
            const slots: string[] = [];
            if (
              Array.isArray(timeSlots) &&
              timeSlots.length > 0 &&
              typeof timeSlots[0] === "string"
            ) {
              base[ymd] = (timeSlots as string[]).slice().sort(compareTime);
            } else {
              for (const w of (timeSlots as Array<{
                start: string;
                end: string;
              }>) || []) {
                if (!w?.start || !w?.end || !w.start.trim() || !w.end.trim())
                  continue;
                let cursor = w.start;
                while (compareTime(addMinutes(cursor, duration), w.end) <= 0) {
                  slots.push(cursor);
                  cursor = addMinutes(cursor, duration);
                }
              }
              base[ymd] = slots;
            }
          } else {
            base[ymd] = [];
          }
        }
      } else {
        // Fallback to availability_slots table
        console.log(
          "BookAppointment - Falling back to availability_slots table"
        );
        const rollingDays: Date[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
          rollingDays.push(new Date(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }
        for (const d of rollingDays) {
          const ymd = formatYmd(d);
          base[ymd] = buildServiceDaySlots(selectedService, ymd);
        }
      }

      // 2) Fallback to raw availability_slots if available (per professional), not booked
      if (!isServiceFlow || !selectedService) {
        const { data: slots, error: slotsErr } = await simpleSupabase
          .from("availability_slots")
          .select("id,start_time,end_time,is_booked")
          .eq("professional_id", prof.id)
          .eq("is_booked", false)
          .gte("start_time", `${ymdStart}T00:00:00+00:00`)
          .lte("start_time", `${ymdEnd}T23:59:59+00:00`);
        console.log("BookAppointment - Availability slots query result:", {
          slots,
          error: slotsErr,
          count: slots?.length,
        });
        if (!slotsErr && Array.isArray(slots)) {
          const rollingDays: Date[] = [];
          const cursor = new Date(start);
          while (cursor <= end) {
            rollingDays.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }

          for (const d of rollingDays) {
            const ymd = formatYmd(d);
            base[ymd] = [];
          }
          for (const s of slots as any[]) {
            const dt = new Date(s.start_time);
            const ymd = formatYmd(dt);
            const hh = toTwo(dt.getHours());
            const mm = toTwo(dt.getMinutes());
            base[ymd] = base[ymd] || [];
            base[ymd].push(`${hh}:${mm}`);
          }
          for (const k of Object.keys(base))
            base[k] = (base[k] || []).sort(compareTime);
        }
      }
      console.log("BookAppointment - Built availability base:", base);

      // Filter out past times for today's date so only future times remain
      try {
        const nowLocal = new Date();
        const nowYmd = formatYmd(nowLocal);
        const nowHm = `${toTwo(nowLocal.getHours())}:${toTwo(
          nowLocal.getMinutes()
        )}`;
        if (base[nowYmd]) {
          base[nowYmd] = (base[nowYmd] || []).filter(
            (t) => compareTime(t, nowHm) > 0
          );
        }
      } catch (e) {
        console.warn("Failed to filter past times for today:", e);
      }

      // Remove times that are already booked via appointments table (service-specific only)
      if (isServiceFlow && selectedService) {
        console.log(
          "BookAppointment - Filtering out booked appointments for service:",
          selectedService.id
        );

        const { data: appts, error: apptErr } = await simpleSupabase
          .from("appointments")
          .select("date,start_time,end_time")
          .eq("service_id", selectedService.id)
          .gte("date", ymdStart)
          .lte("date", ymdEnd);
        console.log("BookAppointment - Booked appointments:", {
          appts,
          error: apptErr,
          count: appts?.length,
        });

        if (!apptErr && Array.isArray(appts)) {
          const bookedByDate: Record<string, Set<string>> = {};
          for (const a of appts as any[]) {
            bookedByDate[a.date] = bookedByDate[a.date] || new Set<string>();
            bookedByDate[a.date].add(a.start_time.slice(0, 5));
          }
          for (const [ymd, list] of Object.entries(base)) {
            const booked = bookedByDate[ymd];
            if (booked) base[ymd] = (list || []).filter((t) => !booked.has(t));
          }
        }
      }

      // Deduplicate and sort slots per day to avoid duplicate keys and UI warnings
      for (const k of Object.keys(base)) {
        const list = base[k] || [];
        base[k] = Array.from(new Set(list)).sort(compareTime);
      }
      console.log(
        "BookAppointment - Final availability after filtering:",
        base
      );
      setAvailableByDate(base);
      setComputedWeekStart(ymdStart);
    } catch (error) {
      console.error("Error loading availability:", error);
    } finally {
      setLoadingAvail(false);
    }
  };

  // Load availability when selection changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadMonthAvailability();
  }, [prof?.id, selectedService?.id, isServiceFlow, currentWeekStart]);

  // Auto-advance to next week if current week has zero slots (up to 8 weeks)
  useEffect(() => {
    if (loadingAvail) return;
    if (!computedWeekStart || computedWeekStart !== currentWeekStart) return;
    // compute total slots in current week
    const start = new Date(currentWeekStart);
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const ymd = formatYmd(d);
      total += (availableByDate[ymd] || []).length;
    }
    // Only hop once automatically to avoid chains
    if (total === 0 && autoAdvanceCount < 1) {
      const next = new Date(currentWeekStart);
      next.setDate(next.getDate() + 7);
      setCurrentWeekStart(formatYmd(next));
      setAutoAdvanceCount(autoAdvanceCount + 1);
    } else if (total > 0 && autoAdvanceCount !== 0) {
      // reset counter when we find a week with slots
      setAutoAdvanceCount(0);
    }
  }, [
    availableByDate,
    loadingAvail,
    currentWeekStart,
    autoAdvanceCount,
    computedWeekStart,
  ]);

  useEffect(() => {
    loadMonthAvailability();
  }, [prof?.id, selectedService?.id, isServiceFlow]);

  // Auto-select first available date if none selected
  useEffect(() => {
    if (!date) {
      const sorted = Object.keys(availableByDate).sort();
      const first = sorted.find(
        (ymd) => (availableByDate[ymd] || []).length > 0
      );
      if (first) setDate(first);
    }
  }, [availableByDate, date]);

  // Wishlist hooks must be declared before any early returns to keep hook order stable
  const { data: wishlist } = useWishlistStatus(
    selectedService?.id as unknown as number
  );
  const subscribeMutation = useWishlistSubscribe();
  const unsubscribeMutation = useWishlistUnsubscribe();
  const toggleAlert = async () => {
    if (!selectedService?.id) return;
    if (!wishlist?.active) {
      await subscribeMutation.mutateAsync({
        serviceId: Number(selectedService.id),
      });
    } else {
      await unsubscribeMutation.mutateAsync({
        serviceId: Number(selectedService.id),
      });
    }
  };

  const { profile: authProfile } = useAuth();
  const { toast } = useToast();

  if (loading || (isServiceFlow && servicesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">
              Loading {isServiceFlow ? "service" : "professional"}{" "}
              information...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Error Loading Professional
            </h1>
            <p className="mt-2 text-slate-600">
              {error instanceof Error
                ? error.message
                : "Failed to load booking form"}
            </p>
            <Button as="link" to="/professionals" className="mt-4">
              Back to Professionals
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prof || (isServiceFlow && !selectedService)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {!prof ? "Professional not found" : "Service not found"}
            </h1>
            <p className="mt-2 text-slate-600">
              {!prof
                ? "The professional you are trying to book with does not exist."
                : "The service you are trying to book does not exist."}
            </p>
            <Button as="link" to="/professionals" className="mt-4">
              Back to Professionals
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const priceCents = selectedService?.price_cents;
  const priceLabel =
    typeof priceCents === "number"
      ? `$${(priceCents / 100).toFixed(2)}`
      : undefined;

  const handleConfirmAndPay = async () => {
    if (
      !isServiceFlow ||
      !selectedService?.id ||
      !date ||
      !slot ||
      !authProfile?.id
    ) {
      setBookingError(
        "Missing required info. Please select date/time and ensure you are signed in."
      );
      toast({
        title: "Select date and time",
        description: "Please choose a day and time to continue.",
      });
      return;
    }
    if (date < todayYmd) {
      setBookingError("You cannot book a past date.");
      toast({
        title: "Not allowed",
        description: "You cannot book a past date.",
      });
      return;
    }
    try {
      setIsBooking(true);
      setBookingError("");
      const duration = Number(selectedService.duration_min) || 30;
      const end = addMinutes(slot, duration);
      const { error } = await simpleSupabase.from("appointments").insert({
        service_id: selectedService.id,
        patient_profile_id: authProfile.id,
        professional_id: prof.id,
        mode: selectedService.mode,
        date: date,
        start_time: `${slot}:00`,
        end_time: `${end}:00`,
        price_cents: selectedService.price_cents ?? 0,
      });
      if (error) {
        setBookingError(error.message || "Failed to create appointment");
        return;
      }

      // Best-effort: mark availability_slots as booked if a matching slot exists
      try {
        const startIso = new Date(`${date}T${slot}:00Z`).toISOString();
        const endIso = new Date(`${date}T${end}:00Z`).toISOString();
        const { data: slotRows, error: slotErr } = await simpleSupabase
          .from("availability_slots")
          .select("id")
          .eq("professional_id", prof.id)
          .eq("is_booked", false)
          .eq("start_time", startIso)
          .eq("end_time", endIso)
          .limit(1);
        if (!slotErr && slotRows && slotRows.length > 0) {
          await simpleSupabase
            .from("availability_slots")
            .update({ is_booked: true })
            .eq("id", slotRows[0].id);
        }
      } catch (slotUpdateErr) {
        // non-fatal
        console.warn(
          "Unable to mark availability slot as booked:",
          slotUpdateErr
        );
      }

      setBookingSuccess(true);
      toast({
        title: "Booked",
        description: "Your appointment has been scheduled.",
      });
      // Close modal and go to Profile → Bookings
      setTimeout(() => {
        setShowPayment(false);
        setBookingSuccess(false);
        navigate("/profile#bookings");
      }, 900);
    } catch (error) {
      console.error("Error booking appointment:", error);
      setBookingError("Failed to book appointment. Please try again.");
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment.",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Left: Booking form */}
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isServiceFlow ? "Book service" : "Book an appointment"}
              </h1>
              <p className="mt-1 text-slate-600">
                with {prof.name} • {prof.title}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Days list (current week) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-700">
                      Select day
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (currentWeekStart <= todayWeekStart) {
                            toast({
                              title: "Not allowed",
                              description:
                                "You can’t browse or book past weeks.",
                            });
                            return;
                          }
                          const d = new Date(currentWeekStart);
                          d.setDate(d.getDate() - 7);
                          const nextYmd = formatYmd(d);
                          setCurrentWeekStart(
                            nextYmd < todayWeekStart ? todayWeekStart : nextYmd
                          );
                          setDate("");
                          setSlot("");
                        }}
                        disabled={currentWeekStart <= todayWeekStart}
                      >
                        Previous week
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const d = new Date(currentWeekStart);
                          d.setDate(d.getDate() + 7);
                          setCurrentWeekStart(formatYmd(d));
                          setDate("");
                          setSlot("");
                        }}
                      >
                        Next week
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(() => {
                      const items: JSX.Element[] = [];
                      const start = new Date(currentWeekStart);
                      for (let i = 0; i < windowDays; i++) {
                        const d = new Date(start);
                        d.setDate(start.getDate() + i);
                        const ymd = formatYmd(d);
                        const isSelected = date === ymd;
                        const slots = availableByDate[ymd] || [];
                        const hasSlots = slots.length > 0;
                        const isPast = ymd < todayYmd;
                        if (!hasSlots || isPast) continue;
                        items.push(
                          <button
                            key={ymd}
                            type="button"
                            onClick={() => {
                              setDate(ymd);
                              setSlot("");
                            }}
                            className={`text-left rounded-md border px-3 py-2 ${isSelected
                              ? "bg-violet-600 text-white border-transparent"
                              : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                              } ${!hasSlots ? "opacity-50" : ""}`}
                            disabled={!hasSlots}
                          >
                            <div className="text-xs">
                              {d.toLocaleDateString(undefined, {
                                weekday: "short",
                              })}
                            </div>
                            <div className="text-sm font-medium">
                              {d.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            {hasSlots && (
                              <div className="mt-1 text-[10px] text-slate-600">
                                {slots.length} slots
                              </div>
                            )}
                          </button>
                        );
                      }
                      return items;
                    })()}
                  </div>
                  {(() => {
                    // If entire week has no slots, show CTA to see next week
                    const start = new Date(currentWeekStart);
                    let total = 0;
                    for (let i = 0; i < windowDays; i++) {
                      const d = new Date(start);
                      d.setDate(start.getDate() + i);
                      const ymd = formatYmd(d);
                      total += (availableByDate[ymd] || []).length;
                    }
                    if (total === 0 && !loadingAvail) {
                      return (
                        <div className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center">
                          <div className="text-sm font-medium text-slate-900">
                            No slots this week
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            Try the next week to see more times.
                          </div>
                          <div className="mt-2">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                const d = new Date(currentWeekStart);
                                d.setDate(d.getDate() + 7);
                                setCurrentWeekStart(formatYmd(d));
                                setDate("");
                                setSlot("");
                              }}
                            >
                              See next week
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                {!isServiceFlow ? (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Appointment type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    >
                      {appointmentTypes.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-medium text-slate-900">
                        {selectedService?.name}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {selectedService?.duration_min} min •{" "}
                        {selectedService?.mode}
                        {selectedService?.categories?.name
                          ? ` • ${selectedService.categories.name}`
                          : ""}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Time
                  </label>
                  <div className="mt-1 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(date ? availableByDate[date] || [] : []).map((t) => (
                      <button
                        key={`${date || "no-date"}-${t}`}
                        type="button"
                        onClick={() => setSlot(t)}
                        className={`rounded-md px-3 py-2 text-sm border ${slot === t
                          ? "bg-violet-600 text-white border-transparent"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        {formatTime12h(t)}
                      </button>
                    ))}
                    {!date &&
                      (Object.values(availableByDate).reduce(
                        (acc, arr) => acc + (arr?.length || 0),
                        0
                      ) === 0 ? (
                        <div className="col-span-full">
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70">
                              <svg
                                className="h-5 w-5 text-slate-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M3 12h18M3 6h18M3 18h18" />
                              </svg>
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              Coming soon
                            </div>
                            <div className="mt-1 text-xs text-slate-600">
                              Sorry, time slots will be shared soon
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-full text-xs text-slate-500">
                          Select a date to see available times
                        </div>
                      ))}
                    {date && (availableByDate[date] || []).length === 0 && (
                      <div className="col-span-full">
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70">
                            <svg
                              className="h-5 w-5 text-slate-600"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 8v4m0 4h.01" />
                            </svg>
                          </div>
                          <div className="text-sm font-medium text-slate-900">
                            All slots are occupied
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            Try another date or check back later
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything you'd like the professional to know in advance"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Preferred contact
                  </label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email or phone"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/services")}
                >
                  Cancel
                </Button>
                <Button
                  disabled={!date || !slot}
                  onClick={() => setShowPayment(true)}
                >
                  Confirm booking
                </Button>
              </div>
            </div>
          </section>

          {/* Right: Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Professional</span>
                  <span className="font-medium text-slate-900">
                    {prof.name}
                  </span>
                </div>
                {isServiceFlow ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Service</span>
                      <span className="font-medium text-slate-900">
                        {selectedService?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-medium text-slate-900">
                        {selectedService?.duration_min} min
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>Type</span>
                    <span className="font-medium text-slate-900">
                      {typeLabel}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Date</span>
                  <span className="font-medium text-slate-900">
                    {date || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time</span>
                  <span className="font-medium text-slate-900">
                    {slot ? formatTime12h(slot) : "—"}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="text-sm text-slate-600">Price</div>
                <div className="text-base font-semibold text-slate-900">
                  {priceLabel || "—"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 text-violet-900">
              <h3 className="text-lg font-semibold">Get notified</h3>
              <p className="mt-1 text-sm text-violet-800">
                No times that work? Save this service to get a notification when
                new slots open.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  disabled={
                    subscribeMutation.isPending ||
                    unsubscribeMutation.isPending ||
                    !selectedService?.id
                  }
                  onClick={toggleAlert}
                  className={`rounded-full px-4 py-2 ${wishlist?.active
                    ? "bg-violet-600 text-white opacity-70 cursor-default"
                    : "bg-violet-600 text-white hover:bg-violet-700"
                    } `}
                >
                  {subscribeMutation.isPending || unsubscribeMutation.isPending
                    ? "Saving…"
                    : wishlist?.active
                      ? "Added"
                      : "Add to alerts"}
                </Button>
                <Button
                  as="link"
                  to="/contact"
                  className="rounded-full border border-violet-300 px-4 py-2 text-violet-700 hover:bg-violet-100"
                >
                  Contact support
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPayment(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-elevated"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Secure checkout</h2>
                  <div className="text-sm text-white/90">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium">{prof.name}</span>
                      {isServiceFlow ? (
                        <>
                          <span className="opacity-85">
                            • {selectedService?.name}
                          </span>
                          <span className="opacity-85">
                            • {selectedService?.duration_min} min
                          </span>
                          <span className="opacity-85">
                            • {selectedService?.mode}
                          </span>
                        </>
                      ) : (
                        <span className="opacity-85">• {typeLabel}</span>
                      )}
                      <span className="opacity-85">
                        • {date || "Select date"}
                      </span>
                      <span className="opacity-85">
                        • {slot ? formatTime12h(slot) : "Select time"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  aria-label="Close"
                  className="h-8 w-8 rounded-md border border-white/20 text-white/90 hover:bg-white/10"
                  onClick={() => setShowPayment(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Booking summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-slate-500">Professional</div>
                    <div className="font-medium text-slate-900">
                      {prof.name}
                    </div>
                    {isServiceFlow ? (
                      <div className="mt-1 text-sm text-slate-700">
                        {selectedService?.name}
                      </div>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      {isServiceFlow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                          </svg>
                          {selectedService?.mode}
                        </span>
                      ) : null}
                      {isServiceFlow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {selectedService?.duration_min} min
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 0 0 2-2v-6H3v6a2 2 0 0 0 2 2z" />
                        </svg>
                        {date || "Select date"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        {slot || "Select time"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Price</div>
                    <div className="text-base font-semibold text-slate-900">
                      {priceLabel || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Name on card
                  </label>
                  <div className="relative mt-1">
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Card number
                  </label>
                  <div className="relative mt-1">
                    <input
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 48 32"
                        className="fill-current"
                      >
                        <rect width="48" height="32" rx="4" />
                      </svg>
                      <svg
                        width="24"
                        height="16"
                        viewBox="0 0 48 32"
                        className="fill-current opacity-60"
                      >
                        <rect width="48" height="32" rx="4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Expiry
                    </label>
                    <input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      CVC
                    </label>
                    <input
                      inputMode="numeric"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>Accepted:</span>
                    <span className="inline-flex h-4 w-6 items-center justify-center rounded-[2px] bg-slate-300" />
                    <span className="inline-flex h-4 w-6 items-center justify-center rounded-[2px] bg-slate-300/70" />
                    <span className="inline-flex h-4 w-6 items-center justify-center rounded-[2px] bg-slate-300/50" />
                  </div>
                  <div>256-bit SSL encrypted</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span className="font-semibold text-slate-900">
                      {priceLabel ||
                        (isServiceFlow
                          ? selectedService?.price_cents
                            ? `$${(selectedService.price_cents / 100).toFixed(
                              2
                            )}`
                            : "—"
                          : "—")}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    You will not be charged until the appointment is confirmed.
                  </div>
                </div>

                {bookingError && (
                  <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 border border-emerald-200">
                    Appointment booked!
                  </div>
                )}
                <div className="mt-2 flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowPayment(false)}
                    disabled={isBooking}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    disabled={
                      !cardName ||
                      !cardNumber ||
                      !expiry ||
                      !cvc ||
                      isBooking ||
                      !date ||
                      !slot
                    }
                    onClick={handleConfirmAndPay}
                  >
                    {isBooking ? "Processing…" : "Pay now"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookAppointment;
