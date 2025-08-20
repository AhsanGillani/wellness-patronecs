import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { professionals } from "@/lib/mockData";
import { useMemo, useState } from "react";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00",
  "13:00", "13:30", "14:00", "14:30", "15:00",
];

const appointmentTypes = [
  { key: "consult", label: "Initial consultation (30 min)" },
  { key: "follow", label: "Follow-up (45 min)" },
  { key: "tele", label: "Telehealth session (30 min)" },
];

const BookAppointment = () => {
  const params = useParams();
  const professionalId = Number(params.id);
  const prof = professionals.find((p) => p.id === professionalId);

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

  if (!prof) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Professional not found</h1>
            <p className="mt-2 text-slate-600">The professional you are trying to book with does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Left: Booking form */}
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Book an appointment</h1>
              <p className="mt-1 text-slate-600">with {prof.name} • {prof.title}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

                <div>
                  <label className="text-sm font-medium text-slate-700">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Time</label>
                  <div className="mt-1 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSlot(t)}
                        className={
                          `rounded-md px-3 py-2 text-sm border ` +
                          (slot === t ? "bg-violet-600 text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                        }
                      >
                        {t}
                      </button>
                    ))}
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
                <div className="flex items-center justify-between">
                  <span>Type</span>
                  <span className="font-medium text-slate-900">{typeLabel}</span>
                </div>
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
                <div className="text-base font-semibold text-slate-900">{prof.price}</div>
              </div>
            </div>

            <div className="rounded-2xl bg-violet-600 text-white p-6">
              <h3 className="text-lg font-semibold">Need help?</h3>
              <p className="mt-1 text-white/80 text-sm">Contact our support team if you need assistance with booking.</p>
              <Button variant="secondary" className="mt-3">Contact support</Button>
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


