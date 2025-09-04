import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useProfessionals } from "@/hooks/useMarketplace";
import { useState, useMemo } from "react";
import Breadcrumbs from "@/components/site/Breadcrumbs";

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

const Professionals = () => {
  const {
    data: professionals = [],
    isLoading: loading,
    error,
  } = useProfessionals();

  // Dynamic specialties based on actual professionals data
  const dynamicSpecialties = useMemo(() => {
    if (!professionals) return [];

    // Extract unique specialties from professionals
    const allSpecialties = new Set<string>();

    professionals.forEach((prof) => {
      if (prof.title) allSpecialties.add(prof.title);
      if (prof.specialization) {
        // Split specialization if it contains multiple values
        const specs = prof.specialization.split(",").map((s) => s.trim());
        specs.forEach((spec) => {
          if (spec) allSpecialties.add(spec);
        });
      }
    });

    // Convert to array and limit to first 8
    const result = Array.from(allSpecialties).slice(0, 8);
    return result;
  }, [professionals]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");

  // Filtered and sorted professionals
  const filteredProfessionals = useMemo(() => {
    if (!professionals) return [];

    let filtered = [...professionals];

    // Search filter (name, profession, specialization)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.title?.toLowerCase().includes(term) ||
          p.specialization?.toLowerCase().includes(term)
      );
    }

    // Location filter
    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(loc)
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter(
        (p) =>
          p.title === selectedSpecialty ||
          p.specialization === selectedSpecialty
      );
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    // Price filter
    if (maxPrice > 0) {
      filtered = filtered.filter((p) => {
        const price =
          p.price_per_session !== null && p.price_per_session !== undefined
            ? p.price_per_session / 100
            : 50;

        // Handle different price ranges
        let shouldInclude = false;
        if (maxPrice === 50) {
          shouldInclude = price < 50; // Under $50
        } else if (maxPrice === 100) {
          shouldInclude = price >= 50 && price <= 100; // $50 - $100
        } else if (maxPrice === 150) {
          shouldInclude = price >= 100 && price <= 150; // $100 - $150
        } else if (maxPrice === 999) {
          shouldInclude = price >= 150; // $150+
        }

        return shouldInclude;
      });
    }

    // Sorting
    switch (sortBy) {
      case "highest-rated":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "most-experienced":
        filtered.sort((a, b) => b.years - a.years);
        break;
      case "price-low-high":
        filtered.sort((a, b) => {
          const priceA =
            a.price_per_session !== null && a.price_per_session !== undefined
              ? a.price_per_session / 100
              : 50;
          const priceB =
            b.price_per_session !== null && b.price_per_session !== undefined
              ? b.price_per_session / 100
              : 50;
          return priceA - priceB;
        });
        break;
      case "price-high-low":
        filtered.sort((a, b) => {
          const priceA =
            a.price_per_session !== null && a.price_per_session !== undefined
              ? a.price_per_session / 100
              : 50;
          const priceB =
            b.price_per_session !== null && b.price_per_session !== undefined
              ? b.price_per_session / 100
              : 50;
          return priceB - priceA;
        });
        break;
      default: // recommended - keep original order
        break;
    }

    return filtered;
  }, [
    professionals,
    searchTerm,
    location,
    selectedSpecialty,
    minRating,
    maxPrice,
    sortBy,
  ]);

  // Pagination 10 per page
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const total = filteredProfessionals.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);
  const pagedProfessionals = filteredProfessionals.slice(startIndex, endIndex);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setSelectedSpecialty("");
    setMinRating(0);
    setMaxPrice(0);
    setSortBy("recommended");
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm ||
    location ||
    selectedSpecialty ||
    minRating > 0 ||
    maxPrice > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <Breadcrumbs />
          </div>
          {/* Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Search</div>
              <input
                className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                placeholder="Name, condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">
                Location
              </div>
              <input
                className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                placeholder="City or Zip"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">
                Specialty
              </div>
              {dynamicSpecialties.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dynamicSpecialties.map((s) => (
                    <button
                      key={s}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedSpecialty === s
                          ? "border-violet-500 bg-violet-100 text-violet-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                      onClick={() =>
                        setSelectedSpecialty(selectedSpecialty === s ? "" : s)
                      }
                    >
                      {s}
                      {selectedSpecialty === s && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-500">
                  No specialties available
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Rating</div>
              <select
                className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
              >
                <option value={0}>Any rating</option>
                <option value={4}>4+ stars</option>
                <option value={4.5}>4.5+ stars</option>
                <option value={5}>5 stars</option>
              </select>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Price</div>
              <select
                className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              >
                <option value={0}>Any price</option>
                <option value={50}>Under $50</option>
                <option value={100}>$50 - $100</option>
                <option value={150}>$100 - $150</option>
                <option value={999}>$150+</option>
              </select>
              {maxPrice > 0 && (
                <div className="mt-2 text-xs text-slate-500">
                  {maxPrice === 50 && "Showing professionals under $50"}
                  {maxPrice === 100 && "Showing professionals $50 - $100"}
                  {maxPrice === 150 && "Showing professionals $100 - $150"}
                  {maxPrice === 999 && "Showing professionals $150 and above"}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={clearFilters}
                variant={hasActiveFilters ? "primary" : "secondary"}
              >
                {hasActiveFilters ? "Clear filters" : "No filters applied"}
              </Button>
              {hasActiveFilters && (
                <div className="text-xs text-slate-500 text-center">
                  {filteredProfessionals.length} of {professionals?.length || 0}{" "}
                  professionals
                </div>
              )}
              {!hasActiveFilters &&
                professionals &&
                professionals.length > 0 && (
                  <div className="text-xs text-slate-500 text-center">
                    Showing all {professionals.length} professionals
                  </div>
                )}
            </div>
          </aside>

          {/* Results */}
          <section className="lg:col-span-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Find Professionals
                </h1>
                <p className="mt-1 text-slate-600">
                  {hasActiveFilters
                    ? `Found ${filteredProfessionals.length} professional${
                        filteredProfessionals.length !== 1 ? "s" : ""
                      } matching your criteria`
                    : "Browse wellness experts and book appointments with verified professionals."}
                </p>
              </div>
              <select
                className="w-full sm:w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="highest-rated">Highest rated</option>
                <option value="most-experienced">Most experienced</option>
                <option value="price-low-high">Price: low to high</option>
                <option value="price-high-low">Price: high to low</option>
              </select>
            </div>

            <div className="mt-6 grid gap-6">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl border bg-white p-5 sm:p-6 animate-pulse"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="h-16 w-16 rounded-full bg-slate-200"></div>
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="w-full sm:w-auto space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
                          <div className="h-6 bg-slate-200 rounded w-16"></div>
                          <div className="flex gap-2">
                            <div className="h-9 bg-slate-200 rounded w-24"></div>
                            <div className="h-9 bg-slate-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
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
                    Unable to Load Professionals
                  </h3>
                  <p className="text-red-600 mb-4">{String(error)}</p>
                  <div className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                    <p className="mb-2">This could be due to:</p>
                    <ul className="text-left space-y-1">
                      <li>• Network connectivity issues</li>
                      <li>• Database service temporarily unavailable</li>
                      <li>• Browser cache or cookies issues</li>
                    </ul>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => window.location.reload()}
                      variant="secondary"
                    >
                      Try Again
                    </Button>
                    <Button as="link" to="/">
                      Back to Home
                    </Button>
                  </div>
                </div>
              ) : filteredProfessionals?.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                      className="w-12 h-12 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {hasActiveFilters
                      ? "No professionals match your filters"
                      : "No Professionals Available Yet"}
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto mb-4">
                    {hasActiveFilters
                      ? "Try adjusting your search criteria or clearing some filters to see more results."
                      : "We're currently building our network of wellness professionals. Check back soon to connect with verified experts in health and wellness."}
                  </p>
                  {hasActiveFilters && (
                    <div className="mb-6">
                      <Button onClick={clearFilters} variant="secondary">
                        Clear all filters
                      </Button>
                    </div>
                  )}
                  <div className="text-sm text-slate-500 mb-6">
                    In the meantime, explore our{" "}
                    <a
                      href="/services"
                      className="text-violet-600 hover:text-violet-700 underline"
                    >
                      services
                    </a>{" "}
                    and{" "}
                    <a
                      href="/events"
                      className="text-violet-600 hover:text-violet-700 underline"
                    >
                      events
                    </a>
                    .
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button as="link" to="/" variant="secondary">
                      Back to Home
                    </Button>
                    <Button as="link" to="/contact">
                      Contact Us
                    </Button>
                  </div>
                </div>
              ) : (
                pagedProfessionals?.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border bg-white p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <img
                          src={
                            p.avatar_url ||
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
                          }
                          alt={p.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          {/* Doctor Name - Prominently displayed on top */}
                          <div className="text-lg font-bold text-slate-900 mb-2">
                            {p.name}
                          </div>

                          {/* Verification and Profession Info - Below the name */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                            {p.verification === "verified" && (
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
                            <div className="text-sm text-slate-600">
                              {p.title} • {p.years} yrs
                            </div>
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <Stars value={p.rating} />
                            <div className="text-sm text-slate-600">
                              {p.rating} ({p.reviews})
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {p.specialization && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                                {p.specialization}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-auto sm:text-right">
                          <div className="text-sm text-slate-600">
                            Starting at
                          </div>
                          <div className="text-base font-semibold text-slate-900">
                            $
                            {p.price_per_session !== null &&
                            p.price_per_session !== undefined
                              ? (p.price_per_session / 100).toFixed(0)
                              : "50"}
                          </div>
                          <div className="mt-3 flex gap-2 sm:justify-end">
                            <Button
                              as="link"
                              to={`/professional/${p.slug}`}
                              variant="secondary"
                            >
                              View profile
                            </Button>
                            <Button as="link" to={`/book/${p.id}`}>
                              Book
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination - Centered */}
            {filteredProfessionals && filteredProfessionals.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="text-sm text-slate-600">
                  Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of{" "}
                  {total}
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
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-full px-4 py-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Professionals;
