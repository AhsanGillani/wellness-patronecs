import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useProfessionals, useProfessionalServices } from "@/hooks/useDatabase";
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

const imageFor = (query: string) => `https://source.unsplash.com/960x540/?${encodeURIComponent(query)}`;

// Use the same fallback image logic as Services page for consistency
const localImages = [article1, article2, article3, avatar1, avatar2, avatar3];
const pickFallbackImage = (service: any) => {
  const name = (service?.name || "").toLowerCase();
  if (name.includes("cardiac") || name.includes("heart")) return article1;
  if (name.includes("yoga")) return article3;
  if (name.includes("virtual") || (service?.mode || "").toLowerCase() === "virtual") return avatar2;
  if (name.includes("consult")) return article2;
  const id = Number(service?.id) || 0;
  return localImages[id % localImages.length];
};

const ServiceDetail = () => {
  const params = useParams();
  const providerSlug = params.providerSlug;
  const serviceSlug = params.serviceSlug;
  
  console.log('ServiceDetail - route params:', params);
  console.log('ServiceDetail - providerSlug:', providerSlug);
  console.log('ServiceDetail - serviceSlug:', serviceSlug);
  
  const { professionals, loading: profLoading, error: profError } = useProfessionals();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the professional by slug (since providerId is actually the slug)
  const prof = professionals?.find((p) => p.slug === providerSlug);
  
  console.log('ServiceDetail - professionals loaded:', professionals?.length);
  console.log('ServiceDetail - found prof:', prof);
  console.log('ServiceDetail - prof.slug:', prof?.slug);
  console.log('ServiceDetail - providerSlug to match:', providerSlug);
  console.log('ServiceDetail - slug match?', prof?.slug === providerSlug);
  console.log('ServiceDetail - prof.id for services lookup:', prof?.id);
  
  // Fetch services for this professional using the professional's ID
  const { services, loading: servicesLoading } = useProfessionalServices(prof?.id);
  
  console.log('ServiceDetail - useProfessionalServices called with prof.id:', prof?.id);
  console.log('ServiceDetail - servicesLoading:', servicesLoading);
  console.log('ServiceDetail - services from hook:', services);
  console.log('ServiceDetail - services count:', services?.length);
  
  // Debug: Direct database query to see what's available
  useEffect(() => {
    const debugServices = async () => {
      if (prof?.id) {
        console.log('ServiceDetail - Debug: Direct query for professional ID:', prof.id);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('professional_id', prof.id);
        
        if (error) {
          console.error('ServiceDetail - Debug: Error querying services:', error);
        } else {
          console.log('ServiceDetail - Debug: Direct query result:', data);
          console.log('ServiceDetail - Debug: Services count from direct query:', data?.length);
          console.log('ServiceDetail - Debug: Service slugs from direct query:', data?.map(s => s.slug));
        }
      }
    };
    
    debugServices();
  }, [prof?.id]);

  useEffect(() => {
    console.log('ServiceDetail useEffect triggered');
    console.log('ServiceDetail - services:', services);
    console.log('ServiceDetail - serviceSlug:', serviceSlug);
    console.log('ServiceDetail - providerSlug:', providerSlug);
    console.log('ServiceDetail - professionals:', professionals);
    console.log('ServiceDetail - prof:', prof);
    
    if (services && serviceSlug) {
      // Reset any previous error before attempting lookup
      setError(null);

      console.log('ServiceDetail - services loaded:', services);
      console.log('ServiceDetail - looking for serviceSlug:', serviceSlug);
      console.log('ServiceDetail - providerSlug:', providerSlug);
      
      // Try to find service by slug first
      let foundService = services.find((s) => s.slug === serviceSlug);
      console.log('ServiceDetail - foundService by slug:', foundService);
      
      if (!foundService) {
        // Try to find by generated slug from name
        const generatedSlug = services.find((s) => 
          s.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === serviceSlug
        );
        if (generatedSlug) {
          foundService = generatedSlug;
          console.log('ServiceDetail - found service by generated slug from name');
        }
      }
      
      if (!foundService) {
        // Try to find by ID as fallback
        foundService = services.find((s) => String(s.id) === String(serviceSlug));
        if (foundService) {
          console.log('ServiceDetail - found service by ID fallback');
        }
      }
      
      console.log('ServiceDetail - final foundService:', foundService);
      console.log('ServiceDetail - all service slugs:', services.map(s => s.slug));
      console.log('ServiceDetail - all service names:', services.map(s => s.name));
      console.log('ServiceDetail - all service IDs:', services.map(s => s.id));
      console.log('ServiceDetail - serviceSlug type:', typeof serviceSlug);
      
      if (foundService) {
        console.log('ServiceDetail - Setting service state with:', foundService);
        setError(null);
        setService(foundService);
        console.log('ServiceDetail - Service state set, should render service details');
      } else {
        console.log('ServiceDetail - No service found, setting error');
        setService(null as any);
        setError('Service not found');
      }
      setLoading(false);
    } else {
      console.log('ServiceDetail - missing data:', { services: !!services, serviceSlug: !!serviceSlug });
      if (services) {
        console.log('ServiceDetail - services available but no serviceSlug');
        console.log('ServiceDetail - available service slugs:', services.map(s => s.slug));
      }
    }
  }, [services, serviceSlug, providerSlug, professionals]);

  if (profLoading || servicesLoading || loading) {
    console.log('ServiceDetail - Loading states:', { profLoading, servicesLoading, loading });
    console.log('ServiceDetail - Service found but still loading:', { service, prof, error });
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
            <h1 className="text-2xl font-bold text-slate-900">Error Loading Service</h1>
            <p className="mt-2 text-slate-600">{profError}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    console.log('ServiceDetail - Error condition triggered:', { prof: !!prof, service: !!service, error: !!error });
    console.log('ServiceDetail - Current values:', { prof, service, error });
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Service not found</h1>
            <p className="mt-2 text-slate-600">The service you are looking for does not exist.</p>
            <Button as="link" to="/professionals" className="mt-4">Back to Professionals</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prof || !service) {
    console.log('ServiceDetail - Error condition triggered:', { prof: !!prof, service: !!service, error: !!error });
    console.log('ServiceDetail - Current values:', { prof, service, error });
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Service not found</h1>
            <p className="mt-2 text-slate-600">The service you are looking for does not exist.</p>
            <Button as="link" to="/professionals" className="mt-4">Back to Professionals</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      {/* Hero */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-12">
            <Breadcrumbs />
          </div>
          <div className="lg:col-span-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{service.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/></svg>
                {service.duration_min} min
              </span>
              {service.mode && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                  {service.mode}
                </span>
              )}
              {service.categories?.name && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                  {service.categories.name}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-slate-700">
              <img
                src={prof.avatar_url || prof.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200"}
                alt={prof.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div className="text-sm">
                By <span className="font-medium text-slate-900">{(prof.name || '').replace(/^Dr\.?\s+/i, '')}</span> <span className="text-slate-500">({prof.title})</span>
              </div>
            </div>
            <p className="mt-4 text-slate-700 leading-relaxed">{service.description}</p>
            <div className="mt-4 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-600">Price</div>
              <div className="text-2xl font-semibold text-slate-900">${(service.price_cents / 100).toFixed(2)}</div>
              <div className="mt-3 flex gap-2">
                <Button
                  as="link"
                  to={`/book/${prof.slug}/${service.slug}`}
                  className="flex-1 rounded-full bg-violet-600 px-4 py-2 text-white shadow-sm transition-colors duration-200 hover:bg-violet-700 hover:shadow"
                >
                  Book
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition-colors duration-200 hover:bg-slate-50"
                >
                  Ask a question
                </Button>
            </div>
            </div>
            <div className="mt-6 h-px w-full bg-slate-100"/>
          </div>
          <div className="lg:col-span-5">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-slate-100">
              <img src={service.image_url || pickFallbackImage(service)} alt={service.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-12">
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">What to expect</h2>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                {[
                  'Personalized assessment and clear next steps',
                  'Evidence-based guidance tailored to your needs',
                  'Time for Q&A and practical tips'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Included</h2>
              {Array.isArray(service.benefits) && service.benefits.length > 0 ? (
                <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  {service.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
              <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  {['Appointment summary','Follow-up recommendations','Resources and handouts','Optional telehealth'].map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="mt-0.5 h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                      <span>{b}</span>
                    </li>
                  ))}
              </ul>
              )}
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Why book with Wellness</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {[
                  'Verified professionals',
                  'Secure, fast booking',
                  'Flexible in-person or virtual',
                  'Transparent pricing',
                  'Real patient reviews',
                  'Friendly support'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                <img src={`https://source.unsplash.com/800x450/?wellness,healthcare,booking`} alt="Wellness platform" className="h-full w-full object-cover" />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile booking bar */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-white p-4 sm:hidden z-40">
        <div className="mx-auto max-w-7xl px-2 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-600">Price</div>
            <div className="text-lg font-semibold text-slate-900">${(service.price_cents / 100).toFixed(2)}</div>
          </div>
          <Button as="link" to={`/book/${prof.slug}/${service.slug}`} className="bg-violet-600 text-white">Book</Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetail;