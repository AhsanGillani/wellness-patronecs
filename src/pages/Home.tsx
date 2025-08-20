import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(124,58,237,0.12),rgba(255,255,255,0))]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Connect with trusted health professionals
              </h1>
              <p className="mt-4 text-slate-600 text-base sm:text-lg">
                Book appointments, get answers, and discover curated wellness content — all in one place.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button as-child><a href="#cta">Get started</a></Button>
                <Button variant="secondary" as-child className="sm:w-auto"><a href="#features">Explore features</a></Button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-semibold text-slate-900">2k+</div>
                  <div className="text-sm text-slate-600">Verified experts</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900">50k+</div>
                  <div className="text-sm text-slate-600">Community members</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-slate-900">98%</div>
                  <div className="text-sm text-slate-600">Satisfaction</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-2xl bg-white shadow-elevated ring-1 ring-slate-100 overflow-hidden">
                <img src="/placeholder.svg" alt="Wellness preview" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Book appointments',
                  desc: 'Find the right professional and book in minutes across specialities.',
                },
                {
                  title: 'Ask the community',
                  desc: 'Get answers from experts and members who have been there.',
                },
                {
                  title: 'Curated content',
                  desc: 'Read articles and tips selected by our medical editors.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border bg-white p-6 shadow-soft">
                  <div className="h-10 w-10 rounded-lg bg-violet-100 text-violet-700 grid place-items-center">★</div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experts */}
        <section id="experts" className="py-16 lg:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Top experts</h2>
              <a href="#experts" className="text-sm text-violet-700 hover:underline">View all</a>
            </div>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="rounded-2xl border bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div>
                      <div className="font-medium text-slate-900">Dr. Jane Doe</div>
                      <div className="text-sm text-slate-600">Cardiologist</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">12 years experience • 4.9 rating</p>
                  <Button className="mt-4 h-9 px-4 text-sm">Book</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stories */}
        <section id="stories" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900">Latest stories</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <a key={i} href="#" className="group block overflow-hidden rounded-2xl border bg-white">
                  <div className="aspect-[16/10] w-full bg-slate-200" />
                  <div className="p-5">
                    <div className="text-sm text-slate-500">Wellness • 6 min read</div>
                    <div className="mt-1 text-base font-semibold text-slate-900 group-hover:underline">How to build a sustainable workout habit</div>
                  </div>
                </a>
              ))}
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


