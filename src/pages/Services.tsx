import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEffect, useMemo, useState, useCallback } from "react";
import { simpleSupabase } from "@/lib/simple-supabase";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import Skeleton from "@/components/ui/Skeleton";

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

const Services = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("All specialties");
  const [sort, setSort] = useState<string>("recommended");
  const [activeChip, setActiveChip] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // State for service details modal/popup
  const [detailsOpen, setDetailsOpen] = useState(false);
  type DetailsData = ServiceRow & {
    benefits?: string[];
    professional?: ServiceRow["professional"] & {
      profile?: (ServiceRow["professional"] & {
        profile: { first_name: string | null; last_name: string | null };
      })["profile"] & { avatar_url?: string | null };
    };
  };
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data, error } = await simpleSupabase
          .from("services")
          .select(
            `
            id, slug, name, duration_min, price_cents, mode, description, image_url,
            professional:professionals!inner(slug, profession, profile:profiles!inner(first_name, last_name)),
            category:categories(name, slug)
          `
          )
          .order("id", { ascending: true });

        if (error) throw error;
        setServices((data || []) as unknown as ServiceRow[]);
      } catch (err: unknown) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Use the same fallback image logic as other pages for consistency
  const localImages = [article1, article2, article3, avatar1, avatar2, avatar3];
  const pickFallbackImage = (service: ServiceRow) => {
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

  // Show service details
  const openDetails = useCallback(async (service: ServiceRow) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const { data, error } = await supabase
        .from("services")
        .select(
          `
          *,
          professional:professionals!inner(slug, profession, profile:profiles!inner(first_name, last_name, avatar_url)),
          category:categories(name, slug)
        `
        )
        .eq("id", service.id)
        .single();

      if (error) throw error;
      setDetailsData(data as unknown as DetailsData);
    } catch (err: unknown) {
      console.error("Error fetching service details:", err);
      setDetailsError("Failed to load service details");
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsData(null);
    setDetailsError(null);
  };

  // Build dynamic categories from loaded data
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      const n = s.category?.name?.trim();
      if (n) set.add(n);
    });
    return ["All specialties", ...Array.from(set).sort()];
  }, [services]);

  // Apply filters and sorting
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = services.filter((s) => {
      // Search filter
      const providerName = s.professional?.profile
        ? `${s.professional.profile.first_name ?? ""} ${
            s.professional.profile.last_name ?? ""
          }`.trim()
        : "";
      const matchesSearch =
        q.length === 0 ||
        [
          s.name,
          s.description ?? "",
          providerName,
          s.category?.name ?? "",
        ].some((v) => (v ?? "").toLowerCase().includes(q));

      // Category select filter
      const matchesCategory =
        category === "All specialties" ||
        s.category?.name?.toLowerCase() === category.toLowerCase();

      // Chip filter
      let matchesChip = true;
      if (activeChip) {
        if (activeChip === "Telehealth") {
          matchesChip = (s.mode || "").toLowerCase() === "virtual";
        } else {
          matchesChip =
            (s.category?.name || "").toLowerCase() === activeChip.toLowerCase();
        }
      }

      return matchesSearch && matchesCategory && matchesChip;
    });

    // Sorting
    switch (sort) {
      case "price-asc":
        list = list
          .slice()
          .sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0));
        break;
      case "price-desc":
        list = list
          .slice()
          .sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0));
        break;
      case "duration":
        list = list
          .slice()
          .sort((a, b) => (a.duration_min ?? 0) - (b.duration_min ?? 0));
        break;
      default:
        // recommended: keep original ordering by id asc already applied by query
        break;
    }

    return list;
  }, [services, search, category, activeChip, sort]);

  // Pagination
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paged = filtered.slice(startIndex, endIndex);

  // Filter chips
  const chips = ["Telehealth", "Cardiology", "Mental Health", "Nutrition"];

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, activeChip]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Filter bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumbs />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Services</h1>
              <p className="mt-1 text-slate-600">
                Find the right care for your needs
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setActiveChip(activeChip === c ? "" : c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  activeChip === c
                    ? "border-violet-300 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services grid */}
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? // Skeleton loading for services
                Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border bg-white"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="mt-2 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <Skeleton className="mt-3 h-3 w-2/3" />
                      <div className="mt-4 flex gap-2">
                        <Skeleton className="h-9 w-20 rounded-full" />
                        <Skeleton className="h-9 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              : paged.map((s) => {
                  const providerName = s.professional?.profile
                    ? `${s.professional.profile.first_name ?? ""} ${
                        s.professional.profile.last_name ?? ""
                      }`.trim()
                    : "Professional";
                  const title = s.professional?.profession ?? "";
                  const priceLabel = `$${((s.price_cents ?? 0) / 100).toFixed(
                    0
                  )}`;
                  const durationLabel = `${s.duration_min} min`;
                  const providerId = s.professional?.slug ?? "";
                  const cardImg = s.image_url || pickFallbackImage(s);

                  // Services already have slugs in the database, no need to generate
                  const detailsUrl = `/services/${providerId}/${s.slug}`;

                  console.log("Services page - service:", s);
                  console.log("Services page - s.slug:", s.slug);
                  console.log("Services page - detailsUrl:", detailsUrl);

                  return (
                    <div
                      key={s.id}
                      className="group overflow-hidden rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        <img
                          src={cardImg}
                          alt={s.name}
                          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                              {s.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <span>{durationLabel}</span>
                              <span>•</span>
                              <span>{s.mode || "In-person"}</span>
                            </div>
                          </div>
                          <div className="text-base font-semibold text-slate-900">
                            {priceLabel}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 line-clamp-3">
                          {s.description}
                        </p>
                        <div className="mt-3 text-xs text-slate-500">
                          By {providerName} • {title}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            as="link"
                            to={`/book/${providerId}/${s.slug}`}
                            className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300"
                          >
                            Book
                          </Button>
                          <Button
                            as="link"
                            variant="secondary"
                            to={detailsUrl}
                            className="rounded-full px-4 py-2 hover:text-blue-700 transition-colors duration-300"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>

          {!loading && total > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-sm text-slate-600">
                Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}
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
                  Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
                </span>
                <Button
                  size="sm"
                  disabled={endIndex >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-full px-4 py-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {!loading && total === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-400 mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No services found
              </h3>
              <p className="text-slate-600">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Service details modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Service Details
                </h2>
                <button
                  onClick={closeDetails}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {detailsLoading ? (
                <div className="mt-4 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Loading details...</p>
                </div>
              ) : detailsError ? (
                <div className="mt-4 text-center py-8">
                  <p className="text-red-600">{detailsError}</p>
                </div>
              ) : (
                detailsData && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-5">
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={
                            detailsData.image_url ||
                            pickFallbackImage(detailsData)
                          }
                          alt={detailsData.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-7">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {detailsData.name}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {detailsData.duration_min} min
                        </span>
                        {detailsData.mode && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {detailsData.mode}
                          </span>
                        )}
                        {detailsData.category?.name && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                            {detailsData.category.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-slate-700">
                        <img
                          src={
                            detailsData.professional?.profile?.avatar_url ||
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200"
                          }
                          alt="avatar"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="text-xs sm:text-sm">
                          By{" "}
                          <span className="font-medium text-slate-900">
                            {`${
                              detailsData.professional?.profile?.first_name ??
                              ""
                            } ${
                              detailsData.professional?.profile?.last_name ?? ""
                            }`.trim()}
                          </span>
                          {detailsData.professional?.profession && (
                            <span className="text-slate-500">
                              {" "}
                              ({detailsData.professional.profession})
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                        {detailsData.description}
                      </p>
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold text-slate-900">
                          Included
                        </h5>
                        {Array.isArray(detailsData.benefits) &&
                        detailsData.benefits.length > 0 ? (
                          <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                            {detailsData.benefits.map(
                              (b: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <svg
                                    className="mt-0.5 h-4 w-4 text-violet-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M20 6L9 17l-5-5" />
                                  </svg>
                                  <span>{b}</span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                            <li className="flex items-start gap-2">
                              <svg
                                className="mt-0.5 h-4 w-4 text-violet-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span>Professional consultation</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg
                                className="mt-0.5 h-4 w-4 text-violet-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span>Personalized care plan</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg
                                className="mt-0.5 h-4 w-4 text-violet-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span>Follow-up support</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <svg
                                className="mt-0.5 h-4 w-4 text-violet-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              <span>24/7 care team access</span>
                            </li>
                          </ul>
                        )}
                        <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={`https://source.unsplash.com/800x450/?wellness,healthcare,booking`}
                            alt="Wellness platform"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Services;
