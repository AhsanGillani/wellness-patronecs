import { useParams } from "react-router-dom";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEvents } from "@/hooks/useDatabase";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import { useState, useEffect } from "react";
import { formatTime12h } from "@/lib/time";

const EventDetail = () => {
  const params = useParams();
  const eventSlug = params.id; // This is now the slug
  const { events, loading, error } = useEvents();
  const [event, setEvent] = useState<any>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    // Only proceed if events have finished loading AND we have a slug/ID
    if (!loading && events && eventSlug) {
      // Find the event by slug first, fallback to ID if needed
      let foundEvent = events.find((e) => e.slug === eventSlug);
      
      // If no slug match, try to find by ID as fallback
      if (!foundEvent && !isNaN(Number(eventSlug))) {
        foundEvent = events.find((e) => String(e.id) === String(eventSlug));
      }
      
      setEvent(foundEvent || null);
    }
  }, [loading, events, eventSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading event details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading while we're waiting to find the specific event
  if (!loading && events && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Finding event...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Error Loading Event</h1>
            <p className="mt-2 text-slate-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <Header />
        <main className="py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
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
          <div className="lg:col-span-12">
            <Breadcrumbs />
          </div>
          <section className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl overflow-hidden border bg-white">
              <div className="h-48 bg-[radial-gradient(60%_60%_at_20%_10%,rgba(124,58,237,0.12),rgba(255,255,255,0))] relative">
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
                <div className="mt-2 text-slate-600 text-sm">{event.type || 'Event'} • {event.category}</div>
                <div className="mt-2 text-slate-700">{event.description}</div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Details</h2>
              {event.details && <p className="mt-2 text-slate-700">{event.details}</p>}
              {event.agenda && event.agenda.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-900">Agenda</h3>
                  <ul className="mt-2 grid sm:grid-cols-2 gap-2 text-slate-700 text-sm">
                    {event.agenda.map((a: string, i: number) => (
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
              <div className="mt-2 text-slate-700">{new Date(event.date).toLocaleDateString()}</div>
              <div className="text-slate-700">{event.startTime ? formatTime12h(event.startTime) : 'TBD'}{event.endTime ? ` – ${formatTime12h(event.endTime)}` : ''}</div>
              <div className="mt-2 text-slate-700">{event.location}</div>
              {typeof event.ticketPrice === 'number' && (
                <div className="mt-3 rounded-lg border bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowCheckout(true)}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-700 hover:to-indigo-700 w-full shadow-sm"
              >
                {typeof event.ticketPrice === 'number' && event.ticketPrice > 0 ? `Buy ticket $${event.ticketPrice}` : 'Register for free'}
              </button>
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

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCheckout(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900">Checkout</h4>
              <button onClick={() => setShowCheckout(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <div className="px-5 py-5 space-y-3">
              <div>
                <div className="text-sm text-slate-600">Event</div>
                <div className="text-base font-medium text-slate-900">{event.title}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                <div>
                  <div className="text-slate-500">Date</div>
                  <div>{new Date(event.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">Time</div>
                  <div>{event.startTime ? formatTime12h(event.startTime) : 'TBD'}{event.endTime ? ` – ${formatTime12h(event.endTime)}` : ''}</div>
                </div>
                <div>
                  <div className="text-slate-500">Location</div>
                  <div>{event.location || 'Online'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Price</div>
                  <div className="font-semibold">{typeof event.ticketPrice === 'number' && event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}</div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t bg-slate-50 flex items-center justify-end gap-2">
              <button onClick={() => setShowCheckout(false)} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancel</button>
              <button
                onClick={() => {
                  try {
                    if (event.registrationUrl) {
                      window.open(event.registrationUrl, '_blank');
                    }
                  } catch {}
                  setShowCheckout(false);
                }}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
              >
                {typeof event.ticketPrice === 'number' && event.ticketPrice > 0 ? 'Proceed to payment' : 'Complete registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;


