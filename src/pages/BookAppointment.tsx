import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useWishlistStatus, useWishlistSubscribe, useWishlistUnsubscribe } from "@/hooks/useMarketplace";
import { useProfessionals, useProfessionalServices } from "@/hooks/useDatabase";
import { simpleSupabase } from "@/lib/simple-supabase";
import { useEffect, useMemo, useState } from "react";

// Helper date/time utils (no external deps)
const toTwo = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatYmd = (d: Date) => `${d.getFullYear()}-${toTwo(d.getMonth() + 1)}-${toTwo(d.getDate())}`;
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
  const pa = parseTime(a); const pb = parseTime(b);
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

const appointmentTypes = [
  { key: "consult", label: "Initial consultation (30 min)" },
  { key: "follow", label: "Follow-up (45 min)" },
  { key: "tele", label: "Telehealth session (30 min)" },
];

const BookAppointment = () => {
  const params = useParams();
  const professionalId = params.id; // legacy route: /book/:id
  const providerSlug = (params as any).providerSlug as string | undefined; // new route: /book/:providerSlug/:serviceSlug
  const serviceSlug = (params as any).serviceSlug as string | undefined;
  const isServiceFlow = Boolean(providerSlug && serviceSlug);
  const { professionals, loading, error } = useProfessionals();
  
  // Debug logging
  console.log('BookAppointment - route params:', params);
  console.log('BookAppointment - professionalId (legacy):', professionalId);
  console.log('BookAppointment - providerSlug (service flow):', providerSlug);
  console.log('BookAppointment - serviceSlug (service flow):', serviceSlug);
  console.log('BookAppointment - professionals loaded:', professionals?.length);
  console.log('BookAppointment - all professional IDs:', professionals?.map(p => ({ id: p.id, name: p.name })));
  
  // Find the professional by ID (legacy) or by slug (service flow)
  const prof = isServiceFlow
    ? professionals?.find((p) => p.slug === providerSlug)
    : professionals?.find((p) => p.id === professionalId);
  
  console.log('BookAppointment - found professional:', prof);
  console.log('BookAppointment - isServiceFlow:', isServiceFlow);

  // Load services for the professional when in service flow
  const { services: profServices, loading: servicesLoading } = useProfessionalServices(prof?.id);
  const selectedService = isServiceFlow
    ? (profServices || []).find((s: any) => s.slug === serviceSlug)
    : null;
  console.log('BookAppointment - services count for prof:', profServices?.length);
  console.log('BookAppointment - selectedService:', selectedService);

  const [date, setDate] = useState<string>("");
  const [slot, setSlot] = useState<string>("");
  const [type, setType] = useState<string>(appointmentTypes[0].key);
  const [notes, setNotes] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [showPayment, setShowPayment] = useState<boolean>(false);
  const [cardName, setCardName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiry, setExpiry] = useState<string>("");
  const [cvc, setCvc] = useState<string>("");
  const formattedCardNumber = (cardNumber || "").replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const typeLabel = useMemo(() => appointmentTypes.find((t) => t.key === type)?.label ?? "", [type]);

  // Calendar + availability state
  const now = new Date();
  // Rolling availability window (days ahead to show)
  const windowDays = 30;
  const [availableByDate, setAvailableByDate] = useState<Record<string, string[]>>({});
  const [loadingAvail, setLoadingAvail] = useState<boolean>(false);

  // Build available slots for a specific date using service availability json
  const buildServiceDaySlots = (service: any, ymd: string): string[] => {
    const availability = service?.availability as any;
    if (!availability) return [];
    const duration = Number(service?.duration_min) || 30;
    const weekday = new Date(ymd).getDay(); // 0=Sun
    const weekdayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const weekdayName = weekdayNames[weekday];

    const makeSlots = (windows: Array<{ start: string; end: string }>) => {
      const slots: string[] = [];
      for (const w of windows || []) {
        let cursor = w.start;
        while (compareTime(addMinutes(cursor, duration), w.end) <= 0) {
          slots.push(cursor);
          cursor = addMinutes(cursor, duration);
        }
      }
      return slots;
    };

    if (availability.scheduleType === "custom" && availability.customSchedules && availability.customSchedules[ymd]) {
      return makeSlots(availability.customSchedules[ymd].timeSlots || []);
    }
    if (availability.days && availability.days.includes(weekdayName)) {
      return makeSlots(availability.timeSlots || []);
    }
    return [];
  };

  // Load rolling availability for the next N days. Prefer service availability json; fallback to availability_slots.
  const loadMonthAvailability = async () => {
    if (!prof) return;
    setLoadingAvail(true);
    try {
      const start = new Date(now);
      const end = new Date(now);
      end.setDate(end.getDate() + windowDays - 1);
      const ymdStart = formatYmd(start);
      const ymdEnd = formatYmd(end);

      // 1) Start from service availability json if we are in a service flow and it exists
      const base: Record<string, string[]> = {};
      if (isServiceFlow && selectedService) {
        const rollingDays: Date[] = [];
        const cursor = new Date(start);
        while (cursor <= end) { rollingDays.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }
        for (const d of rollingDays) { const ymd = formatYmd(d); base[ymd] = buildServiceDaySlots(selectedService, ymd); }
      } else {
        // 2) Fallback to raw availability_slots if available (per professional), not booked
        const { data: slots, error: slotsErr } = await simpleSupabase
          .from("availability_slots")
          .select("id,start_time,end_time,is_booked")
          .eq("professional_id", prof.id)
          .eq("is_booked", false)
          .gte("start_time", `${ymdStart}T00:00:00+00:00`)
          .lte("start_time", `${ymdEnd}T23:59:59+00:00`);
        if (!slotsErr && Array.isArray(slots)) {
          const rollingDays: Date[] = [];
          const cursor = new Date(start);
          while (cursor <= end) { rollingDays.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }
          for (const d of rollingDays) { const ymd = formatYmd(d); base[ymd] = []; }
          for (const s of slots as any[]) {
            const dt = new Date(s.start_time);
            const ymd = formatYmd(dt);
            const hh = toTwo(dt.getHours());
            const mm = toTwo(dt.getMinutes());
            base[ymd] = base[ymd] || [];
            base[ymd].push(`${hh}:${mm}`);
          }
          for (const k of Object.keys(base)) base[k] = (base[k] || []).sort(compareTime);
        }
      }

      // Remove times that are already booked via appointments table (service-specific only)
      if (isServiceFlow && selectedService) {
        const { data: appts, error: apptErr } = await simpleSupabase
          .from("appointments")
          .select("date,start_time,end_time")
          .eq("service_id", selectedService.id)
          .gte("date", ymdStart)
          .lte("date", ymdEnd);
        if (!apptErr && Array.isArray(appts)) {
          const bookedByDate: Record<string, Set<string>> = {};
          for (const a of appts as any[]) {
            bookedByDate[a.date] = bookedByDate[a.date] || new Set<string>();
            bookedByDate[a.date].add(a.start_time.slice(0,5));
          }
          for (const [ymd, list] of Object.entries(base)) {
            const booked = bookedByDate[ymd];
            if (booked) base[ymd] = (list || []).filter((t) => !booked.has(t));
          }
        }
      }

      setAvailableByDate(base);
    } finally {
      setLoadingAvail(false);
    }
  };

  // Load availability when selection changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadMonthAvailability(); }, [prof?.id, selectedService?.id, isServiceFlow]);

  // Auto-select first available date if none selected
  useEffect(() => {
    if (!date) {
      const sorted = Object.keys(availableByDate).sort();
      const first = sorted.find((ymd) => (availableByDate[ymd] || []).length > 0);
      if (first) setDate(first);
    }
  }, [availableByDate, date]);

  // Wishlist hooks must be declared before any early returns to keep hook order stable
  const { data: wishlist } = useWishlistStatus(selectedService?.id as unknown as number);
  const subscribeMutation = useWishlistSubscribe();
  const unsubscribeMutation = useWishlistUnsubscribe();
  const toggleAlert = async () => {
    if (!selectedService?.id) return;
    if (!wishlist?.active) {
      await subscribeMutation.mutateAsync({ serviceId: Number(selectedService.id) });
    } else {
      await unsubscribeMutation.mutateAsync({ serviceId: Number(selectedService.id) });
    }
  };

  if (loading || (isServiceFlow && servicesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading {isServiceFlow ? 'service' : 'professional'} information...</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Error Loading Professional</h1>
            <p className="mt-2 text-slate-600">{error}</p>
            <Button as="link" to="/professionals" className="mt-4">Back to Professionals</Button>
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
            <h1 className="text-2xl font-bold text-slate-900">{!prof ? 'Professional not found' : 'Service not found'}</h1>
            <p className="mt-2 text-slate-600">{!prof ? 'The professional you are trying to book with does not exist.' : 'The service you are trying to book does not exist.'}</p>
            <Button as="link" to="/professionals" className="mt-4">Back to Professionals</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const priceCents = selectedService?.price_cents;
  const priceLabel = typeof priceCents === 'number' ? `$${(priceCents / 100).toFixed(2)}` : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Left: Booking form */}
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{isServiceFlow ? 'Book service' : 'Book an appointment'}</h1>
              <p className="mt-1 text-slate-600">with {prof.name} • {prof.title}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Days list (next 30 days) - only days with available slots */}
                <div className="sm:col-span-2">
                  <div className="text-sm font-medium text-slate-700">Select day</div>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(() => {
                      const items: JSX.Element[] = [];
                      const start = new Date(now);
                      for (let i = 0; i < windowDays; i++) {
                        const d = new Date(start);
                        d.setDate(start.getDate() + i);
                        const ymd = formatYmd(d);
                        const isSelected = date === ymd;
                        const slots = (availableByDate[ymd] || []);
                        const hasSlots = slots.length > 0;
                        if (!hasSlots) continue;
                        items.push(
                          <button
                            key={ymd}
                            type="button"
                            onClick={() => { setDate(ymd); setSlot(""); }}
                            className={`text-left rounded-md border px-3 py-2 ${isSelected ? 'bg-violet-600 text-white border-transparent' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'} ${!hasSlots ? 'opacity-50' : ''}`}
                            disabled={!hasSlots}
                          >
                            <div className="text-xs">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                            <div className="text-sm font-medium">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                            {hasSlots && <div className="mt-1 text-[10px] text-slate-600">{slots.length} slots</div>}
                          </button>
                        );
                      }
                      return items;
                    })()}
                  </div>
                </div>
                {!isServiceFlow ? (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Appointment type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  >
                    {appointmentTypes.map((t) => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </select>
                </div>
                ) : (
                  <div className="sm:col-span-2">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <div className="text-sm font-medium text-slate-900">{selectedService?.name}</div>
                      <div className="mt-0.5 text-xs text-slate-600">{selectedService?.duration_min} min • {selectedService?.mode}{selectedService?.categories?.name ? ` • ${selectedService.categories.name}` : ''}</div>
                    </div>
                </div>
                )}

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Time</label>
                  <div className="mt-1 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(date ? (availableByDate[date] || []) : []).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSlot(t)}
                        className={`rounded-md px-3 py-2 text-sm border ${slot === t ? 'bg-violet-600 text-white border-transparent' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                    {!date && (
                      (Object.values(availableByDate).reduce((acc, arr) => acc + (arr?.length || 0), 0) === 0 ? (
                        <div className="col-span-full">
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70">
                              <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                            </div>
                            <div className="text-sm font-medium text-slate-900">Coming soon</div>
                            <div className="mt-1 text-xs text-slate-600">Sorry, time slots will be shared soon</div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-full text-xs text-slate-500">Select a date to see available times</div>
                      ))
                    )}
                    {date && (availableByDate[date] || []).length === 0 && (
                      <div className="col-span-full">
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200/70">
                            <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01"/></svg>
                          </div>
                          <div className="text-sm font-medium text-slate-900">All slots are occupied</div>
                          <div className="mt-1 text-xs text-slate-600">Try another date or check back later</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything you'd like the professional to know in advance"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Preferred contact</label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email or phone"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button disabled={!date || !slot} onClick={() => setShowPayment(true)}>Confirm booking</Button>
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
                  <span className="font-medium text-slate-900">{prof.name}</span>
                </div>
                {isServiceFlow ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Service</span>
                      <span className="font-medium text-slate-900">{selectedService?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-medium text-slate-900">{selectedService?.duration_min} min</span>
                    </div>
                  </>
                ) : (
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span className="font-medium text-slate-900">{typeLabel}</span>
                </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Date</span>
                  <span className="font-medium text-slate-900">{date || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Time</span>
                  <span className="font-medium text-slate-900">{slot || "—"}</span>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="text-sm text-slate-600">Price</div>
                <div className="text-base font-semibold text-slate-900">{priceLabel || '—'}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 text-violet-900">
              <h3 className="text-lg font-semibold">Get notified</h3>
              <p className="mt-1 text-sm text-violet-800">No times that work? Save this service to get a notification when new slots open.</p>
              <div className="mt-3 flex gap-2">
                <Button
                  disabled={subscribeMutation.isPending || unsubscribeMutation.isPending || !selectedService?.id}
                  onClick={toggleAlert}
                  className={`rounded-full px-4 py-2 ${wishlist?.active ? 'bg-violet-600 text-white opacity-70 cursor-default' : 'bg-violet-600 text-white hover:bg-violet-700'} `}
                >
                  {subscribeMutation.isPending || unsubscribeMutation.isPending ? 'Saving…' : (wishlist?.active ? 'Added' : 'Add to alerts')}
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPayment(false)} />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-elevated">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <h2 className="text-base font-semibold">Secure checkout</h2>
                </div>
                <button aria-label="Close" className="h-8 w-8 rounded-md border border-white/20 text-white/90 hover:bg-white/10" onClick={() => setShowPayment(false)}>✕</button>
              </div>
              <div className="mt-3 text-sm text-white/90">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{prof.name}</span>
                  <span className="opacity-85">• {typeLabel}</span>
                  <span className="opacity-85">• {date || "Select date"}</span>
                  <span className="opacity-85">• {slot || "Select time"}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Card preview */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Cardholder</div>
                    <div className="font-medium text-slate-900">{cardName || "Full name"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Expiry</div>
                    <div className="font-medium text-slate-900">{expiry || "MM/YY"}</div>
                  </div>
                </div>
                <div className="mt-3 font-mono text-sm tracking-widest text-slate-900">
                  {formattedCardNumber || "•••• •••• •••• ••••"}
                </div>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name on card</label>
                  <div className="relative mt-1">
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Card number</label>
                  <div className="relative mt-1">
                    <input inputMode="numeric" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                      <svg width="24" height="16" viewBox="0 0 48 32" className="fill-current"><rect width="48" height="32" rx="4"/></svg>
                      <svg width="24" height="16" viewBox="0 0 48 32" className="fill-current opacity-60"><rect width="48" height="32" rx="4"/></svg>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Expiry</label>
                    <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">CVC</label>
                    <input inputMode="numeric" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" />
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
                    <span className="font-semibold text-slate-900">{prof.price}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">You will not be charged until the appointment is confirmed.</div>
                </div>

                <div className="mt-1 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowPayment(false)}>Back</Button>
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" disabled={!cardName || !cardNumber || !expiry || !cvc} onClick={() => setShowPayment(false)}>Pay now</Button>
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


