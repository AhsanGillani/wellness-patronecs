import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import {
  useProfessionals,
  useProfessionalServices,
} from "@/hooks/useMarketplace";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { formatTime12h } from "@/lib/time";

type ServiceRow = {
  id: number;
  slug: string;
  name: string;
  duration_min: number;
  price_cents: number;
  mode: string;
  description: string | null;
  image_url: string | null;
  professional: {
    slug: string;
    profession: string | null;
    profile: { first_name: string | null; last_name: string | null } | null;
  } | null;
  category: { name: string | null; slug: string | null } | null;
};

const imageFor = (query: string) =>
  `https://source.unsplash.com/960x540/?${encodeURIComponent(query)}`;

// Use the same fallback image logic as Services page for consistency
const localImages = [article1, article2, article3, avatar1, avatar2, avatar3];
const pickFallbackImage = (service: {
  name?: string;
  id?: number;
  mode?: string;
}) => {
  const name = (service?.name || "").toLowerCase();
  if (name.includes("cardiac") || name.includes("heart")) return article1;
  if (name.includes("yoga")) return article3;
  if (
    name.includes("virtual") ||
    (service?.mode || "").toLowerCase() === "virtual"
  )
    return avatar2;
  if (name.includes("consult")) return article2;
  const id = Number(service?.id) || 0;
  return localImages[id % localImages.length];
};

const ServiceDetail = () => {
  const params = useParams();
  const providerSlug = params.providerSlug;
  const serviceSlug = params.serviceSlug;

  console.log("ServiceDetail - route params:", params);
  console.log("ServiceDetail - providerSlug:", providerSlug);
  console.log("ServiceDetail - serviceSlug:", serviceSlug);

  const {
    data: professionals = [],
    isLoading: profLoading,
    error: profError,
  } = useProfessionals();
  const [service, setService] = useState<ServiceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [displayProfessional, setDisplayProfessional] = useState<{
    name: string;
    title?: string | null;
    avatar_url?: string | null;
  } | null>(null);

  // Availability helpers
  const renderAvailabilitySummary = (svc: any) => {
    const availability = svc?.availability as any;
    if (!availability) return null;

    const scheduleType = availability?.scheduleType || "same";
    const days: string[] = Array.isArray(availability?.days)
      ? availability.days
      : [];

    const timeSlots: Array<{ start: string; end: string }> =
      availability?.timeSlots || [];

    const customSchedules = availability?.customSchedules || {};

    return (
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Availability</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-sm text-slate-600">Schedule Type</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {scheduleType === "custom"
                ? "Customized per day"
                : "Same times for all selected days"}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Available Days</div>
            <div className="mt-1 text-sm font-medium text-slate-900">
              {days.length > 0 ? days.join(", ") : "Not specified"}
            </div>
          </div>
        </div>

        {scheduleType !== "custom" ? (
          <div className="mt-4">
            <div className="text-sm text-slate-600 mb-1">Time Slots</div>
            {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {formatTime12h(s.start)} - {formatTime12h(s.end)}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-700">
                No time slots configured
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {Object.keys(customSchedules).length === 0 ? (
              <div className="text-sm text-slate-700">
                No custom schedules configured
              </div>
            ) : (
              Object.entries(customSchedules).map(([k, v]: any, i) => (
                <div
                  key={`${k}-${i}`}
                  className="rounded-xl border bg-slate-50 p-3"
                >
                  <div className="text-xs font-medium text-slate-900">{k}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Array.isArray(v?.timeSlots) && v.timeSlots.length > 0 ? (
                      v.timeSlots.map((ts: any, j: number) => (
                        <span
                          key={`${k}-${j}`}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 border"
                        >
                          {typeof ts === "string"
                            ? formatTime12h(ts)
                            : `${formatTime12h(ts?.start)} - ${formatTime12h(
                              ts?.end
                            )}`}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-600">
                        No time slots
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Find the professional by slug (since providerId is actually the slug)
  const prof = professionals?.find((p) => p.slug === providerSlug) as any;

  console.log("ServiceDetail - Found professional:", prof);
  console.log("ServiceDetail - Professional ID:", prof?.id);

  const {
    data: profServices = [],
    isLoading: servicesLoading,
    error: servicesError,
  } = useProfessionalServices(prof?.profile_id as any);

  console.log("ServiceDetail - Professional services:", profServices);
  console.log("ServiceDetail - Services loading:", servicesLoading);
  console.log("ServiceDetail - Services error:", servicesError);

  useEffect(() => {
    if (prof && profServices && serviceSlug) {
      console.log(
        "ServiceDetail - Looking for service with slug:",
        serviceSlug
      );
      console.log(
        "ServiceDetail - Available services:",
        profServices.map((s) => ({ id: s.id, slug: s.slug, name: s.name }))
      );

      const foundService = profServices.find((s) => s.slug === serviceSlug);
      console.log("ServiceDetail - Found service:", foundService);

      if (foundService) {
        setService(foundService);
        setError(null);

        // Set display professional info
        setDisplayProfessional({
          name: `${prof.profile?.first_name || ""} ${prof.profile?.last_name || ""
            }`.trim(),
          title: prof.profession,
          avatar_url: prof.profile?.avatar_url,
        });

        // Set hero image
        if (foundService.image_url) {
          setHeroImageUrl(foundService.image_url);
        } else {
          setHeroImageUrl(pickFallbackImage(foundService));
        }
      } else {
        console.log("ServiceDetail - Service not found, setting error");
        setError("Service not found");
      }
      setLoading(false);
    } else if (prof && profServices && !serviceSlug) {
      console.log("ServiceDetail - No service slug provided");
      setError("No service specified");
      setLoading(false);
    } else if (prof && !servicesLoading && profServices?.length === 0) {
      console.log("ServiceDetail - No services found for professional");
      setError("No services available");
      setLoading(false);
    }
  }, [prof?.profile_id, serviceSlug, profServices, servicesLoading]);

  if (profLoading || servicesLoading || loading) {
    console.log("ServiceDetail - Loading states:", {
      profLoading,
      servicesLoading,
      loading,
    });
    console.log("ServiceDetail - Service found but still loading:", {
      service,
      prof,
      error,
    });
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading service details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (profError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Error Loading Service
            </h1>
            <p className="mt-2 text-slate-600">{profError}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.log("ServiceDetail - Error condition triggered:", {
      prof: !!prof,
      service: !!service,
      error: !!error,
    });
    console.log("ServiceDetail - Current values:", { prof, service, error });
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Service not found
            </h1>
            <p className="mt-2 text-slate-600">
              The service you are looking for does not exist.
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

  if (!service) {
    console.log("ServiceDetail - No service found, showing not found message");
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Service not found
            </h1>
            <p className="mt-2 text-slate-600">
              The service you are looking for does not exist.
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

  console.log("ServiceDetail - Rendering service:", service);
  console.log("ServiceDetail - Service category:", service.category);
  console.log(
    "ServiceDetail - Service.category?.name:",
    service.category?.name
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* New Hero / Summary */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 grid gap-8 lg:grid-cols-12 items-start">
          {/* Left: Summary card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border bg-white shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">
                    {service.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {service.duration_min} min
                    </span>
                    {service.mode && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {service.mode}
                      </span>
                    )}
                    {service.category?.name && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="mt-4 text-slate-700 leading-relaxed whitespace-pre-line">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="hidden sm:block w-40 h-28 overflow-hidden rounded-xl border bg-slate-100">
                  <img
                    src={
                      heroImageUrl ||
                      service.image_url ||
                      pickFallbackImage(service)
                    }
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  as="link"
                  to={`/book/${prof.slug}/${service.slug}`}
                  className="bg-violet-600 text-white rounded-full px-5 py-2.5"
                >
                  Book Now
                </Button>
                {/* <Button
                  variant="secondary"
                  className="sm:flex-1 rounded-full px-5 py-2.5"
                >
                  Ask a question
                </Button> */}
              </div>
            </div>

            {/* What to Expect + Availability */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  What to expect
                </h2>
                <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                  {[
                    "Professional consultation",
                    "Personalized treatment plan",
                    "Follow-up care instructions",
                    "24/7 support available",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-violet-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {renderAvailabilitySummary(service)}
            </div>
          </div>

          {/* Right: Price and Provider */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border bg-white p-6 sticky top-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  ${(service.price_cents / 100).toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">per session</div>
              </div>
              {/* Book button removed per request */}
              <div className="mt-4 text-center text-sm text-slate-600 space-y-1">
                <p>✓ Secure booking</p>
                <p>✓ Instant confirmation</p>
                <p>✓ 24/7 support</p>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="font-semibold text-slate-900">
                About the provider
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={
                    prof?.avatar_url ||
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200"
                  }
                  alt="avatar"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {prof?.name || "Provider"}
                  </div>
                  <div className="text-sm text-slate-600 truncate">
                    {[prof?.title, prof?.specialization]
                      .filter(Boolean)
                      .join(" • ") || null}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-700">
                {typeof (prof as any)?.years === "number" &&
                  (prof as any).years > 0 && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-slate-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      <span className="text-slate-600">Experience:</span>
                      <span className="font-medium text-slate-900">
                        {(prof as any).years} years
                      </span>
                    </div>
                  )}
                {(prof as any)?.location && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10z" />
                    </svg>
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium text-slate-900 truncate">
                      {(prof as any).location}
                    </span>
                  </div>
                )}
                {displayProfessional?.title && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-slate-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 7h18M3 12h18M3 17h18" />
                    </svg>
                    <span className="text-slate-600">Profession:</span>
                    <span className="font-medium text-slate-900">
                      {displayProfessional.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Details removed to avoid duplication; consolidated into hero section */}

      {/* Mobile booking bar */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-white p-4 sm:hidden z-40">
        <div className="mx-auto max-w-7xl px-2 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-600">Price</div>
            <div className="text-lg font-semibold text-slate-900">
              ${(service.price_cents / 100).toFixed(2)}
            </div>
          </div>
          <Button
            as="link"
            to={`/book/${prof.slug}/${service.slug}`}
            className="bg-violet-600 text-white"
          >
            Book
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
