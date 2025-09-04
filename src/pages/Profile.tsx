/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import avatar from "@/assets/avatar-1.jpg";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Upload, Eye, X } from "lucide-react";
import {
  parse,
  isToday,
  differenceInMinutes,
  addMinutes,
  format,
} from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const OverviewTab = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    missed: 0,
  });
  const [nextAppt, setNextAppt] = useState<{
    title: string;
    date: string;
    time: string;
    isToday?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNextApptModal, setShowNextApptModal] = useState(false);
  const [todaysAppts, setTodaysAppts] = useState<
    { id: number; title: string; date: string; time: string; status: string }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!profile?.id) return;
        setLoading(true);
        const { data, error } = await supabase
          .from("appointments")
          .select(
            "id,date,start_time,appointment_status,service_id,services(name)"
          )
          .eq("patient_profile_id", profile.id)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });
        if (error) throw error;
        const nowLocal = new Date();
        let total = 0,
          upcoming = 0,
          completed = 0,
          missed = 0;
        let todaySoonest: any = null;
        let globalSoonest: any = null;
        const todays: {
          id: number;
          title: string;
          date: string;
          time: string;
          status: string;
        }[] = [];
        (data || []).forEach((a: any) => {
          total += 1;
          const dt = (() => {
            try {
              const [y, m, d] = String(a.date).split("-").map(Number);
              const [hh, mm] = String(a.start_time || "00:00")
                .split(":")
                .map(Number);
              return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
            } catch {
              return null;
            }
          })();
          const status = String(a.appointment_status || "").toLowerCase();
          if (status === "completed") completed += 1;
          else if (status === "no_show") missed += 1;
          else {
            const isUpcoming = dt ? dt.getTime() >= nowLocal.getTime() : true;
            if (isUpcoming) {
              upcoming += 1;
              if (!globalSoonest && dt) globalSoonest = a;
              if (dt) {
                const isToday = dt.toDateString() === nowLocal.toDateString();
                if (isToday && !todaySoonest) todaySoonest = a;
              }
            }
          }
          // collect today's appointments
          try {
            if (dt && dt.toDateString() === nowLocal.toDateString()) {
              todays.push({
                id: a.id,
                title: a.services?.name || "Service",
                date: a.date,
                time: a.start_time,
                status: status || "scheduled",
              });
            }
          } catch {
            /* noop */
          }
        });
        setStats({ total, upcoming, completed, missed });
        setTodaysAppts(todays);
        const pick = todaySoonest || globalSoonest;
        if (pick) {
          const isToday = (() => {
            try {
              const [y, m, d] = String(pick.date).split("-").map(Number);
              return (
                new Date(y, m - 1, d).toDateString() === nowLocal.toDateString()
              );
            } catch {
              return false;
            }
          })();
          setNextAppt({
            title: pick.services?.name || "Service",
            date: (() => {
              try {
                const [y, m, d] = String(pick.date).split("-").map(Number);
                return format(new Date(y, m - 1, d), "MMM dd, yyyy");
              } catch {
                return String(pick.date);
              }
            })(),
            time: String(pick.start_time || "").slice(0, 5),
            isToday,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top grid: Profile header + Next appointment (left), Stats + Quick actions (right) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero / Profile Card */}
          <div className="rounded-2xl border overflow-hidden bg-gradient-to-r from-violet-50 via-blue-50 to-sky-50">
            <div className="p-6 sm:p-7 flex items-center gap-5">
              <div className="relative">
                <img
                  src={profile?.avatar_url || avatar}
                  alt="avatar"
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-4 ring-white shadow"
                />
                <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-white">
                  ✓
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                  {`${profile?.first_name || "Your"} ${
                    profile?.last_name || "Name"
                  }`.trim()}
                </div>
                <div className="text-sm text-slate-700 truncate">
                  {profile?.email || "—"}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href="#account"
                    className="rounded-full border border-violet-200 bg-white text-violet-700 px-3 py-1.5 text-xs hover:bg-violet-50"
                  >
                    Edit profile
                  </a>
                  <a
                    href="#bookings"
                    className="rounded-full bg-violet-600 text-white px-3 py-1.5 text-xs hover:bg-violet-700"
                  >
                    Book again
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Today's appointments */}
          <div className="rounded-2xl border bg-white shadow-sm">
            <div className="p-5 sm:p-6 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
                <span>Today's appointments</span>
              </h3>
              <a
                href="#bookings"
                className="text-xs text-violet-700 hover:underline"
              >
                Manage
              </a>
            </div>
            <div className="p-5 sm:p-6">
              {loading ? (
                <div className="text-sm text-slate-600">Loading…</div>
              ) : todaysAppts.length > 0 ? (
                <div className="space-y-3">
                  {todaysAppts.map((a) => {
                    const canJoin = (() => {
                      try {
                        const now = new Date();
                        const [y, m, d] = String(a.date).split("-").map(Number);
                        const [hh, mm] = String(a.time || "00:00")
                          .split(":")
                          .map(Number);
                        const start = new Date(
                          y,
                          m - 1,
                          d,
                          hh || 0,
                          mm || 0,
                          0,
                          0
                        );
                        // Allow join if within +/- 60 minutes from start, or status is in_progress
                        const delta = Math.abs(now.getTime() - start.getTime());
                        return (
                          a.status === "in_progress" || delta <= 60 * 60 * 1000
                        );
                      } catch {
                        return a.status === "in_progress";
                      }
                    })();
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-xl border px-4 py-3"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {a.title}
                          </div>
                          <div className="mt-0.5 text-sm text-slate-700 truncate">
                            {(() => {
                              try {
                                const [y, m, d] = String(a.date)
                                  .split("-")
                                  .map(Number);
                                return `${format(
                                  new Date(y, m - 1, d),
                                  "MMM dd, yyyy"
                                )} • ${String(a.time).slice(0, 5)}`;
                              } catch {
                                return `${a.date} • ${a.time}`;
                              }
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canJoin ? (
                            <a
                              href={`/live-session/${a.id}`}
                              className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                            >
                              Join
                            </a>
                          ) : (
                            <span className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 border">
                              Join
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed bg-slate-50 px-5 py-6 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-slate-500"
                    >
                      <path d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    No appointments today
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    You don’t have any sessions scheduled for today.
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a
                      href="/services"
                      className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                    >
                      Book a service
                    </a>
                    <a
                      href="#bookings"
                      className="rounded-md border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
                    >
                      View all bookings
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          {showNextApptModal && nextAppt && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Next appointment
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNextApptModal(false)}
                    className="p-1 text-slate-500 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-base font-semibold text-slate-900">
                    {nextAppt.title}
                  </div>
                  <div className="text-sm text-slate-700">
                    {nextAppt.date} • {nextAppt.time}
                  </div>
                  <div className="text-xs text-slate-600">
                    This shows the service name, date and time of your upcoming
                    session. Click Open to go to bookings.
                  </div>
                </div>
                <div className="p-4 border-t flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNextApptModal(false)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <a
                    href="#bookings"
                    className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
                  >
                    Open
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Total
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.total}
                  </div>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3h18M3 9h18M3 15h18M3 21h18" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Upcoming
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.upcoming}
                  </div>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Completed
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.completed}
                  </div>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Missed
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {stats.missed}
                  </div>
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Quick actions
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href="#bookings"
                className="rounded-xl border bg-violet-50 text-violet-700 px-3 py-2 text-xs text-center hover:bg-violet-100"
              >
                View bookings
              </a>
              <a
                href="/services"
                className="rounded-xl border bg-slate-50 text-slate-800 px-3 py-2 text-xs text-center hover:bg-white"
              >
                Book service
              </a>
              <a
                href="#account"
                className="rounded-xl border bg-slate-50 text-slate-800 px-3 py-2 text-xs text-center hover:bg-white"
              >
                Edit account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountTab = () => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    phone: (profile as any)?.phone || "",
    dateOfBirth: (profile as any)?.date_of_birth || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    healthGoals: (profile as any)?.health_goals || "",
    bio: (profile as any)?.bio || "",
    avatarUrl: profile?.avatar_url || "",
  });

  // Best-effort parse of location into address/city/state/zip (non-destructive)
  useEffect(() => {
    try {
      if (!profile) return;
      const toYmd = (v: any) => {
        if (!v) return "";
        try {
          const d = new Date(v);
          if (!Number.isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const da = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${da}`;
          }
        } catch {
          /* noop */
        }
        const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
      };
      setForm((prev) => ({
        ...prev,
        firstName: profile.first_name || prev.firstName,
        lastName: profile.last_name || prev.lastName,
        phone: (profile as any)?.phone || prev.phone,
        dateOfBirth: toYmd((profile as any)?.date_of_birth) || prev.dateOfBirth,
        healthGoals: (profile as any)?.health_goals || prev.healthGoals,
        bio: (profile as any)?.bio || prev.bio,
        avatarUrl: profile.avatar_url || prev.avatarUrl,
      }));
      const loc = (profile as any)?.location as string | null;
      if (loc) {
        const parts = loc.split(",").map((s) => s.trim());
        if (parts.length >= 3) {
          const lastPart = parts[parts.length - 1] || "";
          const lastTokens = lastPart.split(" ").filter(Boolean);
          const maybeZip = lastTokens[lastTokens.length - 1] || "";
          const state = lastTokens.slice(0, -1).join(" ") || lastPart;
          setForm((prev) => ({
            ...prev,
            address: parts.slice(0, parts.length - 2).join(", "),
            city: parts[parts.length - 2] || prev.city,
            state: state || prev.state,
            zipCode: /\d/.test(maybeZip) ? maybeZip : prev.zipCode,
          }));
        }
      }
    } catch {
      /* noop */
    }
  }, [profile]);

  const onChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Could not read image file.",
        });
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Could not upload image.",
      });
    }
  };

  const onRemoveAvatar = async () => {
    try {
      setForm((prev) => ({ ...prev, avatarUrl: "" }));
    } catch {
      /* noop */
    }
  };

  const onSave = async () => {
    try {
      if (!profile?.id) {
        toast({ title: "Not signed in", description: "Please sign in again." });
        return;
      }
      const location =
        [
          form.address,
          form.city,
          [form.state, form.zipCode].filter(Boolean).join(" "),
        ]
          .filter(Boolean)
          .join(", ")
          .trim() || null;
      const updatePayload: Record<string, any> = {
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone || null,
        date_of_birth: form.dateOfBirth || null,
        location,
        health_goals: form.healthGoals || null,
        bio: form.bio || null,
        avatar_url: form.avatarUrl || null,
      };
      const { error } = await updateProfile(updatePayload);
      if (error) throw error;
      toast({ title: "Saved", description: "Your profile has been updated." });
    } catch (e: any) {
      toast({
        title: "Failed to save",
        description: e?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-4">
          <img
            src={form.avatarUrl || profile?.avatar_url || avatar}
            alt="avatar"
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="space-x-2">
            <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Upload photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarSelected}
              />
            </label>
            <Button variant="secondary" onClick={onRemoveAvatar}>
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Date of birth
          </label>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
          {form.dateOfBirth && (
            <div className="mt-1 text-xs text-slate-500">
              Saved:{" "}
              {(() => {
                try {
                  const d = new Date(form.dateOfBirth);
                  return d.toLocaleDateString("en-US");
                } catch {
                  return form.dateOfBirth;
                }
              })()}
            </div>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Address</label>
          <input
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">City</label>
          <input
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">State</label>
          <input
            value={form.state}
            onChange={(e) => onChange("state", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">ZIP Code</label>
          <input
            value={form.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">
            Health goals
          </label>
          <textarea
            rows={3}
            value={form.healthGoals}
            onChange={(e) => onChange("healthGoals", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => onChange("bio", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>
      <div className="mt-2">
        <Button onClick={onSave}>Save changes</Button>
      </div>
    </div>
  );
};

const BookingsTab = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<
    "upcoming" | "completed" | "no_show" | "all"
  >("upcoming");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<any | null>(null);
  const [serviceBooking, setServiceBooking] = useState<any | null>(null);

  const buildDateTime = (dateStr?: string | null, timeStr?: string | null) => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hour, minute] = String(timeStr).split(":").map(Number);
    if (!year || !month || !day || hour === undefined || minute === undefined)
      return null;
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  };

  const openServiceDetails = async (serviceId: number, booking?: any) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("id,name,description,duration_min,mode,price_cents,image_url")
        .eq("id", serviceId)
        .maybeSingle();
      if (error) throw error;
      setServiceDetails(data);
      setServiceBooking(booking || null);
      setShowServiceModal(true);
    } catch (e: any) {
      toast({
        title: "Failed to load",
        description: e?.message || "Unable to load service details",
      });
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!profile?.id) {
          setAllBookings([]);
          return;
        }

        const { data, error } = await supabase
          .from("appointments")
          .select(
            `
						id,
						date,
						start_time,
						end_time,
						mode,
						appointment_status,
						service_id,
						services!appointments_service_id_fkey(
							name,
							professional_id,
							professionals!services_professional_id_fkey(
								profile_id
							)
						)
					`
          )
          .eq("patient_profile_id", profile.id)
          .order("date", { ascending: false })
          .order("start_time", { ascending: false });

        if (error) throw error;

        const nowLocal = new Date();
        const mapped = (data || []).map((appt: any) => ({
          id: appt.id,
          title: appt.services?.name || "Service",
          subtitle: appt.mode
            ? `${String(appt.mode).charAt(0).toUpperCase()}${String(
                appt.mode
              ).slice(1)} call`
            : "Session",
          date: appt.date,
          time: appt.start_time,
          endTime: appt.end_time,
          professionalId: appt.services?.professional_id || null,
          professionalProfileId:
            appt.services?.professionals?.profile_id || null,
          serviceId: appt.service_id,
          status: appt.appointment_status || "scheduled",
          isLive: appt.appointment_status === "in_progress",
          isPast: (() => {
            const dt = buildDateTime(appt.date, appt.start_time);
            return dt ? dt.getTime() < nowLocal.getTime() : false;
          })(),
        }));

        setAllBookings(mapped);
      } catch (e: any) {
        console.error("Failed to load appointments", e);
        setError(e?.message || "Failed to load appointments");
        setAllBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [profile?.id]);

  const formatDisplayDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const [y, m, d] = String(dateStr).split("-").map(Number);
      return format(new Date(y, m - 1, d), "MMM dd, yyyy");
    } catch {
      return String(dateStr);
    }
  };

  const StatusBadge = ({
    status,
    pending,
  }: {
    status?: string;
    pending?: boolean;
  }) => {
    if (pending) {
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-amber-100 text-amber-700`}
        >
          Pending approval
        </span>
      );
    }
    const s = (status || "").toLowerCase();
    const cls =
      s === "completed"
        ? "bg-emerald-100 text-emerald-700"
        : s === "cancelled"
        ? "bg-rose-100 text-rose-700"
        : s === "in_progress"
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700";
    const label = s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}
      >
        {label || "Scheduled"}
      </span>
    );
  };

  return (
    <div>
      <div className="border-b px-4 pt-4">
        <h3 className="text-sm font-medium text-slate-900">Bookings</h3>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-600">Your booked services</div>
            <div className="flex items-center gap-1 bg-slate-50 border rounded-lg p-1">
              {(
                [
                  { key: "upcoming", label: "Upcoming" },
                  { key: "completed", label: "Completed" },
                  { key: "no_show", label: "Missed" },
                  { key: "all", label: "All" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilter(t.key)}
                  className={`px-2.5 py-1 text-xs rounded-md ${
                    filter === t.key
                      ? "bg-violet-600 text-white"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="rounded-xl border p-4 text-sm text-slate-600">
              Loading...
            </div>
          ) : error ? (
            <div className="rounded-xl border p-4 text-sm text-rose-600">
              {error}
            </div>
          ) : allBookings.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-1">
              {(() => {
                const filteredBookings = allBookings.filter((item) => {
                  if (filter === "all") return true;
                  if (filter === "upcoming")
                    return (
                      item.status === "scheduled" ||
                      item.status === "in_progress"
                    );
                  return item.status === filter;
                });

                return filteredBookings.length > 0 ? (
                  filteredBookings.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() =>
                              openServiceDetails(item.serviceId, item)
                            }
                            className="block truncate font-semibold text-slate-900 hover:underline text-left"
                          >
                            {item.title}
                          </button>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span>{item.subtitle}</span>
                            <span className="text-slate-400">•</span>
                            <span>
                              {formatDisplayDate(item.date)}{" "}
                              {(() => {
                                const dt = buildDateTime(item.date, item.time);
                                return dt
                                  ? `• ${format(dt, "hh:mm a")}`
                                  : `• ${item.time}`;
                              })()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} pending={false} />
                          {item.isLive && (
                            <a
                              href={`/live-session/${item.id}`}
                              onClick={() => {
                                try {
                                  sessionStorage.setItem(
                                    `live_session_prof_${item.id}`,
                                    String(1)
                                  );
                                } catch {
                                  /* noop */
                                }
                              }}
                              className="inline-flex items-center rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                            >
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-600 py-4">
                    No appointments match the selected filter
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="rounded-xl border p-4 text-center text-sm text-slate-600">
              No appointments found
            </div>
          )}
        </div>

        {showServiceModal && serviceDetails && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg overflow-hidden">
              <div className="p-5 border-b">
                <h3 className="text-lg font-semibold text-slate-900">
                  {serviceDetails.name}
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {serviceDetails.image_url && (
                  <img
                    src={serviceDetails.image_url}
                    alt={serviceDetails.name}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <div className="text-sm text-slate-700">
                  {serviceDetails.description || "No description provided."}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    {serviceDetails.duration_min} min
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                    {serviceDetails.mode}
                  </span>
                  {typeof serviceDetails.price_cents === "number" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
                      ${(serviceDetails.price_cents / 100).toFixed(2)}
                    </span>
                  )}
                </div>
                {serviceBooking && (
                  <div className="mt-2 rounded border p-3 bg-slate-50">
                    <div className="text-xs font-medium text-slate-900 mb-1">
                      Booked
                    </div>
                    <div className="text-xs text-slate-700">
                      {(() => {
                        try {
                          const [y, m, d] = String(serviceBooking.date)
                            .split("-")
                            .map(Number);
                          const dt = new Date(y, m - 1, d);
                          const pretty = dt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                          return `${pretty} • ${serviceBooking.time}`;
                        } catch {
                          return `${serviceBooking.date} • ${serviceBooking.time}`;
                        }
                      })()}
                      <span className="ml-2">• {serviceBooking.subtitle}</span>
                    </div>
                    <div className="mt-1">
                      <StatusBadge
                        status={serviceBooking.status}
                        pending={false}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t text-right">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowServiceModal(false);
                    setServiceDetails(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const [tab, setTab] = useState<"overview" | "bookings" | "account">(
    "overview"
  );
  // Support deep link via hash: #bookings, #account
  useEffect(() => {
    try {
      const hash = (window.location.hash || "").replace("#", "");
      if (hash === "bookings" || hash === "account" || hash === "overview")
        setTab(hash as any);
    } catch {
      /* noop */
    }
  }, []);

  // React to hash changes so in-page links like #bookings switch the tab
  useEffect(() => {
    const onHashChange = () => {
      try {
        const hash = (window.location.hash || "").replace("#", "");
        if (hash === "bookings" || hash === "account" || hash === "overview") {
          setTab(hash as any);
        }
      } catch {
        /* noop */
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Profile
            </h1>
          </div>
          <div className="mt-4 flex items-center gap-2 border-b">
            <button
              onClick={() => setTab("overview")}
              className={`px-3 py-2 text-sm border-b-2 ${
                tab === "overview"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("bookings")}
              className={`px-3 py-2 text-sm border-b-2 ${
                tab === "bookings"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setTab("account")}
              className={`px-3 py-2 text-sm border-b-2 ${
                tab === "account"
                  ? "border-violet-600 text-violet-700"
                  : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              Account
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {tab === "overview" && <OverviewTab />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "account" && <AccountTab />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
