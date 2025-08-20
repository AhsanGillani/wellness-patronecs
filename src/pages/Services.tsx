import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { simpleSupabase } from "@/lib/simple-supabase";

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
  const imageFor = (query: string) => `https://source.unsplash.com/640x360/?${encodeURIComponent(query)}`;
  const categories = [
    "Consultation",
    "Follow-up",
    "Telehealth",
    "Lifestyle",
    "Nutrition",
    "Therapy",
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Services</h1>
          <p className="mt-1 text-slate-600">Browse available services across specialties and book instantly.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input className="rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200" placeholder="Search services" />
            <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
              <option>All specialties</option>
              <option>Cardiology</option>
              <option>Nutrition</option>
              <option>Psychology</option>
            </select>
            <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
              <option>Sort by: Recommended</option>
              <option>Price: low to high</option>
              <option>Price: high to low</option>
              <option>Duration</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100">{c}</button>
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
            {!loading && services.map((s) => {
              const providerName = s.professional?.profile ? `${s.professional.profile.first_name ?? ''} ${s.professional.profile.last_name ?? ''}`.trim() : 'Professional';
              const title = s.professional?.profession ?? '';
              const priceLabel = `$${((s.price_cents ?? 0)/100).toFixed(0)}`;
              const durationLabel = `${s.duration_min} min`;
              const providerId = s.professional?.slug ?? '';
              const cardImg = s.image_url || imageFor(`${s.name} ${title}`);
              return (
              <div key={s.id} className="overflow-hidden rounded-2xl border bg-white">
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <img
                    src={cardImg}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
                    loading="lazy"
                  />
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
                    <Button as="link" to={`/book/${providerId}`}>Book</Button>
                    <Button as="link" variant="secondary" to={`/services/${providerId}/${s.id}`}>Details</Button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;


