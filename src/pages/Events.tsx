import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { events } from "@/lib/eventsData";
import { Link } from "react-router-dom";

const categories = ["All", "Mental Health", "Cardiology", "Nutrition", "Fitness"];

const Events = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Events</h1>
              <p className="mt-1 text-slate-600">Workshops, webinars, and sessions led by experts.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select className="w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                <option>Upcoming</option>
                <option>Past</option>
              </select>
              <select className="w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Events grid */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <Link key={ev.id} to={`/events/${ev.id}`} className="group overflow-hidden rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-violet-300">
                <div className="h-36 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(124,58,237,0.12),rgba(255,255,255,0))] relative">
                  {ev.imageUrl && (
                    <img src={ev.imageUrl} alt={ev.title} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs font-medium text-violet-700">{ev.category}</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{ev.title}</div>
                  <div className="mt-2 text-sm text-slate-600">{ev.date} • {ev.time}</div>
                  <div className="text-sm text-slate-600">{ev.location}</div>
                  <p className="mt-3 text-sm text-slate-700 line-clamp-2">{ev.description}</p>
                  <div className="mt-4 flex gap-2">
                    <Button as="link" to={ev.registrationUrl || "#"} onClick={(e) => e.stopPropagation()}>{typeof ev.ticketPrice === 'number' && ev.ticketPrice > 0 ? `Buy ticket $${ev.ticketPrice}` : "Register"}</Button>
                    <Button as="link" to={`/events/${ev.id}`} variant="secondary" onClick={(e) => e.stopPropagation()}>Details</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-violet-600 px-6 py-10 sm:px-10 sm:py-12 text-white">
            <div className="grid lg:grid-cols-2 items-center gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">Host an event</h2>
                <p className="mt-2 text-white/80">Are you a professional? Share your expertise with the community.</p>
              </div>
              <div className="flex gap-3 lg:justify-end">
                <Button variant="secondary">Submit proposal</Button>
                <Button className="bg-white text-violet-700 hover:bg-white/90">Contact us</Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;


