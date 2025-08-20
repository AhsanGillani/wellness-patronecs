import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { events } from "@/lib/eventsData";

const EventDetail = () => {
  const params = useParams();
  const id = Number(params.id);
  const ev = events.find((e) => e.id === id);

  if (!ev) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="text-2xl font-bold text-slate-900">Event not found</h1>
            <p className="mt-2 text-slate-600">The event you are looking for does not exist.</p>
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
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl overflow-hidden border bg-white">
              <div className="h-48 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(124,58,237,0.12),rgba(255,255,255,0))] relative">
                {ev.imageUrl && (
                  <img src={ev.imageUrl} alt={ev.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900">{ev.title}</h1>
                <div className="mt-2 text-slate-600 text-sm">{ev.type || 'Event'} • {ev.category}</div>
                <div className="mt-2 text-slate-700">{ev.description}</div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Details</h2>
              {ev.summary && <p className="text-slate-700">{ev.summary}</p>}
              {ev.details && <p className="mt-2 text-slate-700">{ev.details}</p>}
              {ev.agenda && ev.agenda.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-900">Agenda</h3>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-slate-700 text-sm">
                    {ev.agenda.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">When & where</h3>
              <div className="mt-2 text-slate-700">{ev.date}</div>
              <div className="text-slate-700">{ev.startTime || ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</div>
              <div className="mt-2 text-slate-700">{ev.location}</div>
              {ev.registrationUrl && (
                <a href={ev.registrationUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 w-full">
                  {typeof ev.ticketPrice === 'number' && ev.ticketPrice > 0 ? `Buy ticket $${ev.ticketPrice}` : 'Register'}
                </a>
              )}
            </div>

            <div className="rounded-2xl bg-violet-600 text-white p-6">
              <h3 className="text-lg font-semibold">Share with friends</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Copy link</button>
                <button className="rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Invite</button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;


