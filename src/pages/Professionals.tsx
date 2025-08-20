import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useProfessionals } from "@/hooks/useDatabase";
import { getAggregated } from "@/lib/ratings";

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
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={isFull ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
            {isHalf ? (
              <defs>
                <linearGradient id={`half-${i}`} x1="0" x2="24" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            ) : null}
            <path fill={isHalf ? `url(#half-${i})` : isFull ? "currentColor" : "none"} d="M12 .587l3.668 7.431L24 9.748l-6 5.847 1.416 8.263L12 19.771 4.584 23.858 6 15.595 0 9.748l8.332-1.73z" />
          </svg>
        );
      })}
    </div>
  );
};

const Professionals = () => {
  const { professionals, loading, error } = useProfessionals();
  const specialties = ["Cardiology", "Nutrition", "Psychology", "Physiotherapy", "Dermatology", "Pediatrics"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Search</div>
              <input className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Name, condition..." />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Location</div>
              <input className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="City or Zip" />
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Specialty</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {specialties.map((s) => (
                  <button key={s} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">{s}</button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Rating</div>
              <select className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                <option>4+ stars</option>
                <option>4.5+ stars</option>
                <option>5 stars</option>
              </select>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <div className="text-sm font-semibold text-slate-900">Price</div>
              <select className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                <option>Any</option>
                <option>Under $50</option>
                <option>$50 - $100</option>
                <option>$100 - $150</option>
                <option>$150+</option>
              </select>
            </div>

            <Button className="w-full">Apply filters</Button>
          </aside>

          {/* Results */}
          <section className="lg:col-span-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Find professionals</h1>
                <p className="mt-1 text-slate-600">Browse verified experts and book an appointment.</p>
              </div>
              <select className="w-full sm:w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                <option>Recommended</option>
                <option>Highest rated</option>
                <option>Most experienced</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </div>

            <div className="mt-6 grid gap-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Loading professionals...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading professionals: {error}</p>
                </div>
              ) : professionals?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No professionals found.</p>
                </div>
              ) : (
                professionals?.map((p) => {
                  const agg = getAggregated(Number(p.id), 4.5, 25); // Fallback ratings
                  const displayRating = agg.rating;
                  const displayReviews = agg.reviews;
                  const profileData = p.profiles || {};
                  
                  return (
                    <div key={p.id} className="rounded-2xl border bg-white p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <img 
                          src={profileData.avatar_url || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"} 
                          alt={`${profileData.first_name || 'Professional'} ${profileData.last_name || ''}`} 
                          className="h-16 w-16 rounded-full object-cover" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <div className="text-base font-semibold text-slate-900">
                              {profileData.first_name} {profileData.last_name}
                            </div>
                            <div className="hidden sm:block text-slate-300">•</div>
                            <div className="text-sm text-slate-600">
                              {p.profession || 'Professional'} • {p.years_experience || 0} yrs
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Stars value={displayRating} />
                            <div className="text-sm text-slate-600">{displayRating} ({displayReviews})</div>
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
                          <div className="text-sm text-slate-600">Starting at</div>
                          <div className="text-base font-semibold text-slate-900">
                            ${p.price_per_session ? (p.price_per_session / 100).toFixed(0) : '50'}
                          </div>
                          <div className="mt-3 flex gap-2 sm:justify-end">
                            <Button as="link" to={`/professional/${p.slug}`} variant="secondary">View profile</Button>
                            <Button as="link" to={`/book/${p.id}`}>Book</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-600">Showing 1–3 of 250</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">Previous</Button>
                <Button size="sm">Next</Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Professionals;


