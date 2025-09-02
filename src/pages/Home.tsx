import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import heroImg from "@/assets/hero-wellness.jpg";
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProfessionals } from "@/hooks/useDatabase";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogs } from "@/hooks/useMarketplace";
import Breadcrumbs from "@/components/site/Breadcrumbs";

type CountUpProps = {
  end: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
};

const formatCompact = (value: number) => {
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}m`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return new Intl.NumberFormat().format(Math.round(value));
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const CountUp = ({ end, durationMs = 1500, prefix = "", suffix = "", compact = false }: CountUpProps) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0 as number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = easeOutCubic(progress);
      setValue(end * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, durationMs]);

  const displayed = compact ? formatCompact(value) : new Intl.NumberFormat().format(Math.round(value));
  return <span>{prefix}{displayed}{suffix}</span>;
};

const Home = () => {
  const { professionals: pros, loading: prosLoading } = useProfessionals();
  const { data: blogs = [], isLoading: blogsLoading } = useBlogs();
  const { profile } = useAuth();
  const topPros = (pros || []).slice(0, 3);
  const avatars = [avatar1, avatar2, avatar3];
  const shouldShowStripeBanner = Boolean(profile && profile.role === 'professional' && !(profile as any).stripe_account_id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {shouldShowStripeBanner && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs">!</span>
              <span>Professionals: Connect your Stripe account to receive payouts.</span>
            </div>
            <Link to="/doctor-dashboard?tab=billing" className="underline text-amber-900 hover:text-amber-800">Connect now</Link>
          </div>
        </div>
      )}
      <Header />

      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(124,58,237,0.12),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-50/30 via-transparent to-blue-50/20" />
          
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-violet-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-emerald-200/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                  <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                    Connect with trusted
                  </span>
                  <br />
                  <span className="text-slate-900">health professionals</span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg">
                  Book appointments, get answers, and discover curated wellness content — all in one place.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  as="link" 
                  to="#cta" 
                  className="group relative bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white border-0 rounded-full px-8 py-3"
                >
                  Get started
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="group text-center p-4 rounded-xl hover:bg-white/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="text-4xl font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                    <CountUp end={2000} suffix="+" compact />
                  </div>
                  <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Verified experts</div>
                  <div className="w-8 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="group text-center p-4 rounded-xl hover:bg-white/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="text-4xl font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                    <CountUp end={50000} suffix="+" compact />
                  </div>
                  <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Community members</div>
                  <div className="w-8 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="group text-center p-4 rounded-xl hover:bg-white/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="text-4xl font-extrabold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                    <CountUp end={98} suffix="%" />
                  </div>
                  <div className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300">Satisfaction</div>
                  <div className="w-8 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto mt-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-white shadow-elevated ring-1 ring-slate-100 overflow-hidden transform group-hover:scale-105 transition-all duration-500">
                <img 
                  src={heroImg} 
                  alt="Wellness care and consultations" 
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                ✨ Trusted Care
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need for wellness</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Discover our comprehensive platform designed to connect you with the right care and support.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Book appointments',
                  desc: 'Find the right professional and book in minutes across specialities.',
                  icon: '📅',
                  color: 'from-violet-500 to-violet-600',
                  bgColor: 'bg-violet-50',
                  link: '/services'
                },
                {
                  title: 'Ask the community',
                  desc: 'Get answers from experts and members who have been there.',
                  icon: '💬',
                  color: 'from-blue-500 to-blue-600',
                  bgColor: 'bg-blue-50',
                  link: '/community'
                },
                {
                  title: 'Curated content',
                  desc: 'Read articles and tips selected by our medical editors.',
                  icon: '📚',
                  color: 'from-emerald-500 to-emerald-600',
                  bgColor: 'bg-emerald-50',
                  link: '/blogs'
                },
              ].map((item) => (
                <div key={item.title} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" style={{background: `linear-gradient(135deg, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})`}} />
                  <Link to={item.link} className="block">
                    <div className="relative rounded-2xl border bg-white p-8 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <div className={`h-16 w-16 rounded-2xl ${item.bgColor} text-4xl grid place-items-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors duration-300">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed mb-6">{item.desc}</p>
                      <div className="flex items-center text-violet-600 font-medium group-hover:text-violet-700 transition-colors duration-300">
                        <span className="mr-2">Learn more</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights grid (inspired by reference) */}
        <section id="highlights" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* #1 brand */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-3xl font-extrabold text-violet-700">#1</div>
                <div className="mt-2 text-slate-900 font-medium">Most recognized virtual care brand.*</div>
                <a href="#" className="mt-1 inline-block text-sm text-violet-700 hover:underline">See reviews.</a>
                <div className="mt-4 aspect-[16/10] w-full overflow-hidden rounded-lg bg-slate-100">
                  <img src={article1} alt="Doctor phone reviews" className="h-full w-full object-cover" />
                </div>
              </div>

              {/* 88% availability benefits */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-4xl font-extrabold text-violet-700">
                  <CountUp end={88} suffix="%" />
                </div>
                <div className="mt-2 text-slate-900 font-medium">Patients report easy access to care when they need it.*</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>Large network of verified doctors across specialties</li>
                  <li>Same‑week appointments and virtual availability</li>
                  <li>Filter by specialty, language, location and price</li>
                </ul>
                <a href="#" className="mt-1 inline-block text-sm text-violet-700 hover:underline">Learn more.</a>
              </div>

              {/* 20+ years expertise and easy connection */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-4xl font-extrabold text-violet-700">
                  <CountUp end={20} suffix="+" />
                </div>
                <div className="mt-2 text-slate-900 font-medium">years of virtual care expertise.</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>Find the right professional in seconds with smart matching</li>
                  <li>Book in minutes — secure telehealth or in‑person sessions</li>
                  <li>All chats, notes and follow‑ups in one HIPAA‑grade place</li>
                </ul>
              </div>

              {/* Patient image tile (replacing video) */}
              <div className="relative rounded-2xl overflow-hidden bg-black md:row-span-2">
                <img src={avatar2} alt="Patient portrait" className="h-full w-full object-cover opacity-90" loading="lazy" />
              </div>

              {/* 100 Million members */}
              <div className="rounded-2xl border bg-white p-6 md:col-span-2">
                <div className="text-4xl sm:text-5xl font-extrabold text-violet-700">
                  <CountUp end={100} /> <span className="align-baseline">Million</span>
                </div>
                <div className="mt-1 text-slate-900">Members in the U.S.</div>
                <div className="mt-4 aspect-[16/7] w-full overflow-hidden rounded-lg bg-slate-100">
                  <img src={article3} alt="Members" className="h-full w-full object-cover" />
                </div>
              </div>

              {/* 76% feel better */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-4xl font-extrabold text-violet-700">
                  <CountUp end={76} suffix="%" />
                </div>
                <div className="mt-2 text-slate-900">of people with depression feel better after their third visit with their therapist.*</div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>Compassionate, expert‑led care</li>
                  <li>Follow‑ups to keep you on track</li>
                  <li>Community support when you need it</li>
                </ul>
                <a href="#" className="mt-1 inline-block text-sm text-violet-700 hover:underline">See reviews.</a>
              </div>

              {/* Patient/doctor image tile (replacing video) */}
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <img src={avatar1} alt="Doctor portrait" className="h-full w-full object-cover opacity-90" />
              </div>

              {/* Patient safety org */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-slate-900">Founder of the first virtual care</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  patient safety
                  <div>organization</div>
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>Clinical governance & quality checks</li>
                  <li>Continuous safety monitoring</li>
                  <li>Transparent outcomes reporting</li>
                </ul>
              </div>

              {/* 40k+ providers */}
              <div className="rounded-2xl border bg-white p-6">
                <div className="text-4xl font-extrabold text-violet-700">
                  <CountUp end={40000} suffix="+" compact />
                </div>
                <div className="mt-2 text-slate-900">Providers, therapists & coaches.</div>
                <div className="mt-4 flex -space-x-3">
                  <img src={avatar2} alt="Doctor" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                  <img src={avatar3} alt="Patient" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                  <img src={avatar1} alt="Doctor" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                  <img src={avatar2} alt="Patient" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                  <img src={avatar3} alt="Doctor" className="h-10 w-10 rounded-full ring-2 ring-white object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experts */}
        <section id="experts" className="py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Top experts</h2>
              <Link to="/professionals" className="text-sm text-violet-700 hover:underline">View all</Link>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(prosLoading ? [1,2,3] : []).map((i) => (
                <div key={`skeleton-${i}`} className="rounded-2xl border bg-white p-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div>
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="mt-2 h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="mt-3 h-3 w-48 bg-slate-100 rounded" />
                  <div className="mt-4 h-9 w-24 rounded bg-slate-200" />
                </div>
              ))}

              {!prosLoading && topPros.map((p, idx) => {
                const imgSrc = p.image && !String(p.image).includes("placeholder") ? p.image : avatars[idx % avatars.length];
                return (
                  <div key={p.slug || p.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 via-transparent to-blue-50/0 group-hover:from-violet-50/30 group-hover:to-blue-50/20 transition-all duration-300" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Header with avatar and info */}
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img 
                            src={imgSrc} 
                            alt={p.name} 
                            className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-md group-hover:ring-violet-100 transition-all duration-300" 
                          />
                          {/* Verification badge */}
                          {p.verification === 'verified' && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-sm">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-violet-700 transition-colors duration-300">
                            {p.name}
                          </h3>
                          <p className="text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full inline-block mt-1">
                            {p.title || "Professional"}
                          </p>
                        </div>
                      </div>

                      {/* Stats and details */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-medium">{p.rating || 4.8}</span>
                            <span className="text-slate-400">({p.reviews || 0} reviews)</span>
                          </span>
                          <span className="font-medium text-slate-700">{p.years || 0} years</span>
                        </div>
                        
                        {p.specialization && (
                          <div className="text-sm text-slate-600">
                            <span className="font-medium">Specializes in:</span> {p.specialization}
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="mt-6">
                        <Button 
                          as="link" 
                          to={`/professional/${p.slug}`}
                          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-0 rounded-xl py-3 px-6 font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Book Consultation
                        </Button>
                      </div>

                      {/* Hover effect indicator */}
                      <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stories */}
        <section id="stories" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Latest stories</h2>
              <Link to="/blogs" className="text-sm text-violet-700 hover:underline">View all stories</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(blogsLoading ? [1,2,3] : []).map((i) => (
                <div key={`blog-skel-${i}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="aspect-[16/10] w-full bg-slate-200 animate-pulse" />
                  <div className="p-6">
                    <div className="h-3 w-28 bg-slate-200 rounded mb-3" />
                    <div className="h-5 w-48 bg-slate-100 rounded mb-2" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}

              {!blogsLoading && blogs.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 text-violet-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon!</h3>
                  <p className="text-slate-600 mb-4">We're working on some amazing wellness content for you.</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}

              {!blogsLoading && blogs.slice(0, 3).map((post, idx) => {
                const cover = post.cover_url || [article1, article2, article3][idx % 3];
                const tag = Array.isArray(post.tags) && post.tags.length > 0 ? post.tags[0] : 'Wellness';
                return (
                  <Link key={post.slug} to={`/blogs/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 hover:-translate-y-1">
                    {/* Image container */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                      <img 
                        src={cover} 
                        alt={post.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy" 
                      />
                      {/* Overlay gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Tag badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm">
                          {tag}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Meta information */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          6 min read
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-slate-400">Wellness</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors duration-300 line-clamp-2 mb-3">
                        {post.title}
                      </h3>
                      
                      {/* Read more indicator */}
                      <div className="flex items-center text-sm text-violet-600 font-medium group-hover:text-violet-700 transition-colors duration-300">
                        Read more
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-violet-600 px-6 py-10 sm:px-10 sm:py-14 text-white shadow-elevated">
              <div className="grid lg:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-semibold">Start your wellness journey today</h3>
                  <p className="mt-2 text-white/80">Join thousands who trust our platform to find the care they need.</p>
                </div>
                <div className="flex gap-3 lg:justify-end">
                  <a href="#" className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-violet-700 font-medium hover:bg-white/90">Create account</a>
                  <a href="#" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-2.5 text-white font-medium hover:bg-white/10">Contact us</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;



