import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { professionals } from "@/lib/mockData";
import { getAggregated } from "@/lib/ratings";
import { useState } from "react";

type Service = NonNullable<typeof professionals[number]["services"]>[number];

const ServicesTabs = ({ services = [], profId }: { services?: Service[]; profId: number }) => {
  const [active, setActive] = useState<"services" | "reviews">("services");
  const agg = getAggregated(prof.id, prof.rating, prof.reviews);
  return (
    <div>
      <div className="flex items-center gap-2 border-b px-4 pt-4">
        {(["services", "reviews"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={
              `rounded-md px-3 py-2 text-sm font-medium ` +
              (active === tab ? "bg-violet-600 text-white" : "text-slate-700 hover:bg-slate-50")
            }
          >
            {tab === "services" ? "Services" : "Reviews"}
          </button>
        ))}
      </div>

      {active === "services" && (
        <div className="p-6">
          {services && services.length > 0 ? (
            <div className="grid gap-4">
              {services.map((s) => (
                <div key={s.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="text-sm text-slate-600">{s.duration}</div>
                    </div>
                    <div className="text-base font-semibold text-slate-900">{s.price}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{s.description}</p>
                  <div className="mt-3 flex gap-2">
                    <Button as="link" to={`/book/${profId}`} size="sm">Book</Button>
                    <Button variant="secondary" size="sm">Details</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-700">No services listed.</div>
          )}
        </div>
      )}

      {active === "reviews" && (
        <div className="p-6">
          <div className="text-sm text-slate-700">Rated highly by patients. Reviews feature to be added.</div>
        </div>
      )}
    </div>
  );
};

const Professional = () => {
  const params = useParams();
  const id = Number(params.id);
  const prof = professionals.find((p) => p.id === id);

  if (!prof) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Professional not found</h1>
            <p className="mt-2 text-slate-600">The profile you are looking for does not exist.</p>
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
          <section className="lg:col-span-8">
            <div className="rounded-2xl border bg-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <img src={prof.image} alt={prof.name} className="h-20 w-20 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-slate-900">{prof.name}</h1>
                  <div className="mt-1 text-slate-600">{prof.title} • {prof.years} yrs experience</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prof.tags.map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="w-full sm:w-auto sm:text-right">
                  <div className="text-sm text-slate-600">Starting at</div>
                  <div className="text-base font-semibold text-slate-900">{prof.price}</div>
                  <div className="mt-3 flex gap-2 sm:justify-end">
                    <Button variant="secondary">Message</Button>
                    <Button as="link" to={`/book/${prof.id}`}>Book</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">About</h2>
                <p className="mt-2 text-slate-700 leading-relaxed">{prof.about || prof.bio}</p>
              </div>

              <div className="rounded-2xl border bg-white p-0 overflow-hidden">
                <ServicesTabs services={prof.services} profId={prof.id} />
              </div>

              <div className="rounded-2xl border bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Reviews</h2>
                <div className="mt-2 text-slate-700">Rated {agg.rating} by {agg.reviews}+ patients.</div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-violet-600 text-white p-6">
              <h3 className="text-lg font-semibold">Book an appointment</h3>
              <p className="mt-1 text-white/80 text-sm">Select a slot to get started. No payment required until confirmed.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["Mon 10:00", "Wed 14:00", "Fri 09:30", "Sat 11:15"].map((t) => (
                  <button key={t} className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">{t}</button>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="secondary">Continue</Button>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Clinic info</h3>
              <p className="mt-2 text-sm text-slate-700">123 Wellness St, Suite 200, Healthy City</p>
              <p className="text-sm text-slate-700">Mon–Fri • 9:00–17:00</p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Professional;


