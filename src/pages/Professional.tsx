import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import {
  useProfessionals,
  useProfessionalServices,
} from "@/hooks/useMarketplace";
import { useState } from "react";
import Breadcrumbs from "@/components/site/Breadcrumbs";

type Service = {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  description: string;
  mode: string;
  categories?: {
    name: string;
    slug: string;
  };
};

const Stars = ({ value }: { value: number }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const total = 5;
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const isFull = idx <= full;
        const isHalf = !isFull && half && idx === full + 1;
        return (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFull ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {isHalf ? (
              <defs>
                <linearGradient
                  id={`half-${i}`}
                  x1="0"
                  x2="24"
                  y1="0"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              fill={
                isHalf ? `url(#half-${i})` : isFull ? "currentColor" : "none"
              }
              d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.263L12 19.771 4.584 23.858 6 15.595 0 9.748l8.332-1.73z"
            />
          </svg>
        );
      })}
    </div>
  );
};

const ServicesTabs = ({
  services = [],
  profId,
  prof,
  feedback,
  servicesLoading,
  servicesError,
}: {
  services?: Service[];
  profId: string;
  prof: {
    profile?: { first_name?: string; last_name?: string; avatar_url?: string };
    profession?: string;
  };
  feedback: { rating: number; comment?: string; created_at: string }[];
  servicesLoading?: boolean;
  servicesError?: string | null;
}) => {
  const [active, setActive] = useState<"services" | "reviews">("services");

  return (
    <div>
      <div className="flex items-center gap-2 border-b px-4 pt-4">
        {(["services", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={
              `rounded-md px-3 py-2 text-sm font-medium ` +
              (active === tab
                ? "bg-violet-600 text-white"
                : "text-slate-700 hover:bg-slate-50")
            }
          >
            {tab === "services"
              ? `Services (${services.length})`
              : `Reviews (${feedback.length})`}
          </button>
        ))}
      </div>

      {active === "services" && (
        <div className="p-6">
          {servicesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : servicesError ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Error loading services
              </h3>
              <p className="text-slate-600">{servicesError}</p>
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid gap-4">
              {services.map((s) => {
                console.log("Service card - service:", s);
                console.log("Service card - s.id:", s.id, "type:", typeof s.id);
                console.log(
                  "Service card - s.slug:",
                  (s as Service & { slug?: string }).slug,
                  "type:",
                  typeof (s as Service & { slug?: string }).slug
                );
                console.log("Service card - s.name:", s.name);
                console.log(
                  "Service card - prof.slug:",
                  prof.slug,
                  "type:",
                  typeof prof.slug
                );

                // Generate a slug if missing
                const serviceSlug =
                  (s as Service & { slug?: string }).slug ||
                  s.name
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "") ||
                  s.id;

                console.log(
                  "Service card - generated serviceSlug:",
                  serviceSlug
                );
                console.log(
                  "Service card - final URL:",
                  `/services/${prof.slug}/${serviceSlug}`
                );

                return (
                  <div key={s.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {s.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="text-sm text-slate-600">
                            {s.duration_min} min
                          </div>
                          <div className="text-sm text-slate-500">•</div>
                          <div className="text-sm text-slate-600">{s.mode}</div>
                          {s.categories && (
                            <>
                              <div className="text-sm text-slate-500">•</div>
                              <span className="inline-flex items-center rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                                {s.categories.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-base font-semibold text-slate-900">
                        ${(s.price_cents / 100).toFixed(2)}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {s.description}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        as="link"
                        to={`/services/${prof.slug}/${serviceSlug}`}
                        size="sm"
                        onClick={() =>
                          console.log(
                            "View Details clicked - prof.slug:",
                            prof.slug,
                            "serviceSlug:",
                            serviceSlug,
                            "URL:",
                            `/services/${prof.slug}/${serviceSlug}`
                          )
                        }
                      >
                        View Details
                      </Button>
                      <Button
                        as="link"
                        to={`/book/${prof.slug}/${serviceSlug}`}
                        size="sm"
                        variant="secondary"
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No services listed
              </h3>
              <p className="text-slate-600">
                This professional hasn't added any services yet.
              </p>
            </div>
          )}
        </div>
      )}

      {active === "reviews" && (
        <div className="p-6">
          {feedback.length > 0 ? (
            <div className="space-y-6">
              {feedback.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-slate-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          review.profiles?.avatar_url ||
                          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
                        }
                        alt={`${review.profiles?.first_name || "Patient"} ${
                          review.profiles?.last_name || ""
                        }`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium text-slate-900">
                          {review.profiles?.first_name || "Anonymous"}{" "}
                          {review.profiles?.last_name || ""}
                        </div>
                        <div className="flex items-center gap-1">
                          <Stars value={review.rating} />
                          <span className="text-sm text-slate-600">
                            {review.rating}/5
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                      {review.feedback_text && (
                        <p className="text-slate-700 mb-2">
                          {review.feedback_text}
                        </p>
                      )}
                      {review.additional_comments && (
                        <p className="text-sm text-slate-600 italic">
                          "{review.additional_comments}"
                        </p>
                      )}
                      {review.would_recommend !== null && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                              review.would_recommend
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {review.would_recommend
                              ? "✓ Would recommend"
                              : "✗ Would not recommend"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-slate-600">
                Be the first to leave a review for this professional.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Professional = () => {
  const params = useParams();
  const slug = params.slug;
  const {
    data: professionals = [],
    isLoading: loading,
    error,
  } = useProfessionals();

  // Find the professional by slug
  const prof = professionals?.find((p: any) => p.slug === slug);

  // Fetch feedback for this professional (not provided via hook; fallback to empty for now)
  const feedback: any[] = [];
  const feedbackLoading = false;
  const feedbackError: string | null = null;

  // Fetch services for this professional
  const {
    data: services = [],
    isLoading: servicesLoading,
    error: servicesError,
  } = useProfessionalServices(prof?.profile_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">
              Loading professional profile...
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
              Error Loading Profile
            </h1>
            <p className="mt-2 text-slate-600">{error}</p>
            <Button as="link" to="/professionals" className="mt-4">
              Back to Professionals
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prof) {
    return (
      <div className="min-h-screen bg-gradient-to-b from white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Professional not found
            </h1>
            <p className="mt-2 text-slate-600">
              The profile you are looking for does not exist.
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <Breadcrumbs />
          </div>
          <section className="lg:col-span-8">
            <div className="rounded-2xl border bg-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <img
                  src={
                    prof.avatar_url ||
                    prof.image ||
                    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
                  }
                  alt={prof.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {prof.name}
                  </h1>
                  <div className="mt-1 text-slate-600">
                    {prof.title} • {prof.years} yrs experience
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prof.verification === "verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                    {prof.specialization && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                        {prof.specialization}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto sm:text-right">
                  <div className="text-sm text-slate-600">Starting at</div>
                  <div className="text-base font-semibold text-slate-900">
                    {prof.price ||
                      (prof.price_per_session !== null &&
                      prof.price_per_session !== undefined
                        ? `$${(prof.price_per_session / 100).toFixed(0)}`
                        : "$50")}
                  </div>
                  <div className="mt-3 flex gap-2 sm:justify-end">
                    <Button variant="secondary">Message</Button>
                    <Button as="link" to={`/book/${prof.id}`}>
                      Book
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">About</h2>
                <p className="mt-2 text-slate-700 leading-relaxed">
                  {prof.about ||
                    prof.bio ||
                    `${prof.name} is a ${prof.title} with ${
                      prof.years
                    } years of experience in ${
                      prof.specialization || "their field"
                    }.`}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-0 overflow-hidden">
                <ServicesTabs
                  services={services || []}
                  profId={prof.id}
                  prof={prof}
                  feedback={feedback || []}
                  servicesLoading={servicesLoading}
                  servicesError={servicesError}
                />
              </div>

              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Reviews
                </h2>
                <div className="mt-2 text-slate-700">
                  {feedback && feedback.length > 0 ? (
                    <>
                      Rated {prof.rating} by {feedback.length} patient
                      {feedback.length !== 1 ? "s" : ""}
                      {feedbackError && (
                        <div className="text-sm text-red-600 mt-1">
                          Error loading reviews: {feedbackError}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      Rated {prof.rating} by {prof.reviews}+ patients
                      {feedbackLoading && (
                        <div className="text-sm text-slate-500 mt-1">
                          Loading reviews...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-violet-600 text white p-6">
              <h3 className="text-lg font-semibold">Book an appointment</h3>
              <p className="mt-1 text-white/80 text-sm">
                Select a slot to get started. No payment required until
                confirmed.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["Mon 10:00", "Wed 14:00", "Fri 09:30", "Sat 11:15"].map(
                  (t) => (
                    <button
                      key={t}
                      className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
              <Button className="mt-4 w-full" variant="secondary">
                Continue
              </Button>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Clinic info
              </h3>

              {/* Location */}
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Location
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {prof.location ? (
                        <span className="inline-flex items-center gap-1">
                          {prof.location}
                          {prof.location.includes("Virtual") ||
                          prof.location.includes("Online") ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Virtual
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              In-Person
                            </span>
                          )}
                        </span>
                      ) : (
                        "Location not specified"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Modes */}
              {services && services.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-slate-400"
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
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Service Modes
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.from(new Set(services.map((s) => s.mode))).map(
                          (mode) => (
                            <span
                              key={mode}
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                mode === "Virtual"
                                  ? "bg-blue-100 text-blue-700"
                                  : mode === "In-person"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {mode}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Categories */}
              {services && services.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        Specialties
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.from(
                          new Set(
                            services
                              .map((s) => s.categories?.name)
                              .filter(Boolean)
                          )
                        ).map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
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
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Availability
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {services && services.length > 0 ? (
                        <div className="space-y-1">
                          <div>Flexible scheduling available</div>
                          <div className="text-xs text-slate-500">
                            {services.filter((s) => s.mode === "Virtual")
                              .length > 0 &&
                              `${
                                services.filter((s) => s.mode === "Virtual")
                                  .length
                              } virtual service${
                                services.filter((s) => s.mode === "Virtual")
                                  .length !== 1
                                  ? "s"
                                  : ""
                              } available`}
                          </div>
                          <div className="text-xs text-slate-500">
                            {services.filter((s) => s.mode === "In-person")
                              .length > 0 &&
                              `${
                                services.filter((s) => s.mode === "In-person")
                                  .length
                              } in-person service${
                                services.filter((s) => s.mode === "In-person")
                                  .length !== 1
                                  ? "s"
                                  : ""
                              } available`}
                          </div>
                        </div>
                      ) : (
                        "Standard business hours"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience & Verification */}
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
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
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Credentials
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {prof.years} years experience
                      </span>
                      {prof.verification === "verified" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      Contact
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Message {prof.name.split(" ")[0]}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Professional;
