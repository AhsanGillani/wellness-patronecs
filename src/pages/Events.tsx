import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatTime12h } from "@/lib/time";
import { useEvents } from "@/hooks/useMarketplace";
import { supabase } from "@/integrations/supabase/client";

import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Skeleton from "@/components/ui/Skeleton";

const categories = [
  "All",
  "Mental Health",
  "Cardiology",
  "Nutrition",
  "Fitness",
];

const Events = () => {
  const { data: events, isLoading: loading, error } = useEvents();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const [addingSampleEvents, setAddingSampleEvents] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredEvents = useMemo(() => {
    if (!events) return [] as any[];
    if (activeCategory === "All") return events;
    // match on type or summary/details containing the category keyword
    const keyword = activeCategory.toLowerCase();
    return events.filter((ev: any) => {
      const inType = (ev.type || "").toLowerCase().includes(keyword);
      const inSummary = (ev.summary || "").toLowerCase().includes(keyword);
      const inDetails = (ev.details || "").toLowerCase().includes(keyword);
      return inType || inSummary || inDetails;
    });
  }, [events, activeCategory]);

  const addSampleEvents = async () => {
    setAddingSampleEvents(true);
    try {
      const sampleEvents = [
        {
          slug: "mental-health-workshop",
          title: "Mental Health Awareness Workshop",
          type: "Workshop",
          date: "2024-02-15",
          start_time: "10:00:00",
          end_time: "12:00:00",
          location: "Community Center, Downtown",
          summary:
            "Join us for an informative workshop on mental health awareness and coping strategies.",
          details:
            "This workshop will cover various aspects of mental health, including stress management, anxiety coping techniques, and building resilience. Led by certified mental health professionals.",
          registration_url: "https://example.com/register",
          image_url: null,
          ticket_price_cents: 0,
          status: "approved",
        },
        {
          slug: "cardiology-seminar",
          title: "Heart Health Seminar",
          type: "Seminar",
          date: "2024-02-20",
          start_time: "14:00:00",
          end_time: "16:00:00",
          location: "Medical Center, Conference Room A",
          summary:
            "Learn about heart health, prevention strategies, and latest treatments.",
          details:
            "Our cardiology experts will discuss heart disease prevention, healthy lifestyle choices, and the latest advances in cardiac care.",
          registration_url: "https://example.com/register",
          image_url: null,
          ticket_price_cents: 2500,
          status: "approved",
        },
        {
          slug: "nutrition-bootcamp",
          title: "Nutrition Bootcamp",
          type: "Bootcamp",
          date: "2024-02-25",
          start_time: "09:00:00",
          end_time: "17:00:00",
          location: "Wellness Center, Main Hall",
          summary:
            "A comprehensive day-long program on healthy eating and nutrition.",
          details:
            "Learn about macronutrients, meal planning, healthy cooking techniques, and how to maintain a balanced diet for optimal health.",
          registration_url: "https://example.com/register",
          image_url: null,
          ticket_price_cents: 5000,
          status: "approved",
        },
        {
          slug: "fitness-challenge",
          title: "30-Day Fitness Challenge",
          type: "Challenge",
          date: "2024-03-01",
          start_time: "06:00:00",
          end_time: "07:00:00",
          location: "Online - Virtual Event",
          summary:
            "Join our 30-day fitness challenge to kickstart your health journey.",
          details:
            "A month-long program with daily workouts, nutrition guidance, and community support to help you achieve your fitness goals.",
          registration_url: "https://example.com/register",
          image_url: null,
          ticket_price_cents: 0,
          status: "approved",
        },
      ];

      const { data, error } = await supabase
        .from("events")
        .insert(sampleEvents.map(event => ({
          ...event,
          host_professional_id: "00000000-0000-0000-0000-000000000000" // Placeholder
        })));

      if (error) {
        console.error("Error adding sample events:", error);
        alert("Error adding sample events: " + error.message);
      } else {
        console.log("Successfully added sample events");
        alert("Sample events added successfully! Please refresh the page.");
        // Refresh the page to show the new events
        window.location.reload();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error occurred");
    } finally {
      setAddingSampleEvents(false);
    }
  };

  // Fallback images for events
  const eventImages = [article1, article2, article3, avatar1, avatar2, avatar3];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <Breadcrumbs />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {loading ? (
              // Skeleton loading for header
              <>
                <div>
                  <Skeleton className="h-10 w-32 mb-4" />
                  <Skeleton className="h-6 w-80" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-48" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    Wellness Events
                  </h1>
                  <p className="text-slate-600">
                    Discover upcoming health and wellness events in your area
                  </p>
                </div>
                <div className="flex flex-wrap gap-3"></div>
              </>
            )}
          </div>

          {/* Category filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <Button
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setPage(1);
                    setActiveCategory(category);
                  }}
                  className={`rounded-full px-4 py-2 transition-colors duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white hover:bg-violet-700"
                      : "hover:bg-violet-100 hover:text-violet-700"
                  }`}
                >
                  {category}
                </Button>
              );
            })}
          </div>

          {/* Events grid */}
          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border bg-white p-6">
                    <Skeleton className="h-48 w-full rounded-xl mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">Error loading events: {error?.message || 'Unknown error'}</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 text-violet-600 mb-6">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  No events found
                </h3>
                <p className="text-slate-600 mb-6">
                  Check back soon for upcoming wellness events!
                </p>
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={addSampleEvents}
                    disabled={addingSampleEvents}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {addingSampleEvents
                      ? "Adding Sample Events..."
                      : "Add Sample Events"}
                  </Button>
                  <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                    <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents
                  .slice(
                    (page - 1) * pageSize,
                    (page - 1) * pageSize + pageSize
                  )
                  .map((ev, idx) => {
                    const index = (page - 1) * pageSize + idx;
                    const imageSrc =
                      ev.image_url || eventImages[index % eventImages.length];
                    return (
                      <div
                        key={ev.id}
                        className="group overflow-hidden rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
                        onClick={() => navigate(`/events/${ev.slug || ev.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            navigate(`/events/${ev.slug || ev.id}`);
                          }
                        }}
                      >
                        <div className="h-48 bg-gradient-to-br from-violet-50 to-blue-50 relative overflow-hidden">
                          <img
                            src={imageSrc}
                            alt={ev.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Event type badge */}
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            {ev.type || "Event"}
                          </div>

                          {/* Floating elements */}
                          <div className="absolute top-3 right-3 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                          <div
                            className="absolute bottom-3 right-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                            style={{ animationDelay: "1s" }}
                          ></div>
                        </div>

                        <div className="p-6">
                          <div className="text-xs font-medium text-violet-700 mb-2">
                            {ev.type || "Event"}
                          </div>
                          <div className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                            {ev.title}
                          </div>
                          <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                            <span>📅</span>
                            {new Date(ev.date).toLocaleDateString()} •{" "}
                            {ev.start_time
                              ? ev.end_time
                                ? `${formatTime12h(
                                    ev.start_time
                                  )} – ${formatTime12h(ev.end_time)}`
                                : formatTime12h(ev.start_time)
                              : "TBD"}
                          </div>
                          <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                            <span>📍</span>
                            {ev.location || "Location TBD"}
                          </div>
                          <p className="mt-3 text-sm text-slate-700 line-clamp-2 leading-relaxed">
                            {ev.summary || ev.details}
                          </p>
                          <div className="mt-4">
                            <Button
                              as="link"
                              to={
                                ev.registration_url ||
                                `/events/${ev.slug || ev.id}`
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white transition-all duration-300 transform hover:scale-105"
                            >
                              {typeof ev.ticket_price_cents === "number" &&
                              ev.ticket_price_cents > 0
                                ? `Buy ticket $${(
                                    ev.ticket_price_cents / 100
                                  ).toFixed(2)}`
                                : "Register"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredEvents.length > 0 && (
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-sm text-slate-600">
                Showing{" "}
                {Math.min((page - 1) * pageSize + 1, filteredEvents.length)}–
                {Math.min(page * pageSize, filteredEvents.length)} of{" "}
                {filteredEvents.length}
              </div>
              <div className="inline-flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-full px-4 py-2"
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-500">
                  Page {page} of{" "}
                  {Math.max(1, Math.ceil(filteredEvents.length / pageSize))}
                </span>
                <Button
                  size="sm"
                  disabled={page * pageSize >= filteredEvents.length}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full px-4 py-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
