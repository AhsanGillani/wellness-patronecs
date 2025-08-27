import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { simpleSupabase } from "@/lib/simple-supabase";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";


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
  const [category, setCategory] = useState<string>("All specialties");
  const [sort, setSort] = useState<string>("recommended");
  const [activeChip, setActiveChip] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Chips row (acts as quick filters). "Telehealth" maps to Virtual mode.
  const chips = ["Consultation", "Follow-up", "Telehealth", "Lifestyle", "Nutrition", "Therapy"];

  // Local fallback images
  const localImages = [article1, article2, article3, avatar1, avatar2, avatar3];
  const pickFallbackImage = (service: ServiceRow) => {
    const name = (service.name || "").toLowerCase();
    if (name.includes("cardiac") || name.includes("heart")) return article1;
    if (name.includes("yoga")) return article3;
    if (name.includes("virtual") || service.mode?.toLowerCase() === "virtual") return avatar2;
    if (name.includes("consult")) return article2;
    return localImages[service.id % localImages.length];
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await simpleSupabase
        .from('services')
        .select(`
          id, slug, name, duration_min, price_cents, mode, description, image_url,
          professional:professional_id (
            slug, profession,
            profile:profile_id ( first_name, last_name )
          ),
          category:category_id ( name, slug )
        `)
        .order('id', { ascending: true });
      if (!error && data) setServices(data as unknown as ServiceRow[]);
      setLoading(false);
    };
    load();
  }, []);

  // Build dynamic categories from loaded data
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => { const n = s.category?.name?.trim(); if (n) set.add(n); });
    return ["All specialties", ...Array.from(set).sort()];
  }, [services]);

  // Apply filters and sorting
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = services.filter((s) => {
      // Search filter
      const providerName = s.professional?.profile ? `${s.professional.profile.first_name ?? ''} ${s.professional.profile.last_name ?? ''}`.trim() : '';
      const matchesSearch = q.length === 0 || [s.name, s.description ?? '', providerName, s.category?.name ?? ''].some(v => (v ?? '').toLowerCase().includes(q));

      // Category select filter
      const matchesCategory = category === "All specialties" || (s.category?.name?.toLowerCase() === category.toLowerCase());

      // Chip filter
      let matchesChip = true;
      if (activeChip) {
        if (activeChip === "Telehealth") {
          matchesChip = (s.mode || '').toLowerCase() === 'virtual';
        } else {
          matchesChip = (s.category?.name || '').toLowerCase() === activeChip.toLowerCase();
        }
      }

      return matchesSearch && matchesCategory && matchesChip;
    });

    // Sorting
    switch (sort) {
      case 'price-asc':
        list = list.slice().sort((a, b) => (a.price_cents ?? 0) - (b.price_cents ?? 0));
        break;
      case 'price-desc':
        list = list.slice().sort((a, b) => (b.price_cents ?? 0) - (a.price_cents ?? 0));
        break;
      case 'duration':
        list = list.slice().sort((a, b) => (a.duration_min ?? 0) - (b.duration_min ?? 0));
        break;
      default:
        // recommended: keep original ordering by id asc already applied by query
        break;
    }

    return list;
  }, [services, search, category, activeChip, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);
  const paged = filtered.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, activeChip]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Breadcrumbs />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Services</h1>
          <p className="mt-1 text-slate-600">Browse available services across specialties and book instantly.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              placeholder="Search services"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            >
              <option value="recommended">Sort by: Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setActiveChip(activeChip === c ? "" : c)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${activeChip === c ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && (
              <div className="col-span-full text-sm text-slate-600">Loading services...</div>
            )}
            {!loading && paged.map((s) => {
              const providerName = s.professional?.profile ? `${s.professional.profile.first_name ?? ''} ${s.professional.profile.last_name ?? ''}`.trim() : 'Professional';
              const title = s.professional?.profession ?? '';
              const priceLabel = `$${((s.price_cents ?? 0)/100).toFixed(0)}`;
              const durationLabel = `${s.duration_min} min`;
              const providerId = s.professional?.slug ?? '';
              const cardImg = s.image_url || pickFallbackImage(s);
              
              // Services already have slugs in the database, no need to generate
              const detailsUrl = `/services/${providerId}/${s.slug}`;
              
              console.log('Services page - service:', s);
              console.log('Services page - s.slug:', s.slug);
              console.log('Services page - s.name:', s.name);
              console.log('Services page - detailsUrl:', detailsUrl);
              
              return (
              <div key={s.id} className="overflow-hidden rounded-2xl border bg-white">
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={cardImg}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-600">{durationLabel}</div>
                    </div>
                    <div className="text-base font-semibold text-slate-900">{priceLabel}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 line-clamp-3">{s.description}</p>
                  <div className="mt-3 text-xs text-slate-500">By {providerName} • {title}</div>
                  <div className="mt-4 flex gap-2">
                    <Button as="link" to={`/book/${providerId}/${s.slug}`} className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300">Book</Button>
                    <Button as="link" variant="secondary" to={detailsUrl} className="rounded-full px-4 py-2 hover:text-blue-700 transition-colors duration-300">Details</Button>
                  </div>
                </div>
              </div>
            );})}
          </div>
          {!loading && total > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-sm text-slate-600">Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}</div>
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
                <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;


