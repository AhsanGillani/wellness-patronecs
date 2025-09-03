import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Button from "@/components/ui/button";
import { useEvents } from "@/hooks/useDatabase";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
<<<<<<< HEAD
import { formatTime12h } from "@/lib/time";
=======
>>>>>>> main
import article1 from "@/assets/article-1.jpg";
import article2 from "@/assets/article-2.jpg";
import article3 from "@/assets/article-3.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import Breadcrumbs from "@/components/site/Breadcrumbs";
<<<<<<< HEAD
import Skeleton from "@/components/ui/Skeleton";
=======
>>>>>>> main

const categories = ["All", "Mental Health", "Cardiology", "Nutrition", "Fitness"];

const Events = () => {
  const { events, loading, error } = useEvents();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  
  // Fallback images for events
  const eventImages = [article1, article2, article3, avatar1, avatar2, avatar3];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <Header />

      <main className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header row */}
          <Breadcrumbs />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
<<<<<<< HEAD
            {loading ? (
              // Skeleton loading for header
              <>
                <div>
                  <Skeleton className="h-10 w-32 mb-4" />
                  <Skeleton className="h-6 w-80" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-48" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                      Events
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600">Workshops, webinars, and sessions led by experts.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select className="w-full sm:w-40 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300">
                    <option>Upcoming</option>
                    <option>Past</option>
                  </select>
                  <select className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300">
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
=======
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Events
                </span>
              </h1>
              <p className="text-lg text-slate-600">Workshops, webinars, and sessions led by experts.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <select className="w-full sm:w-40 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300">
                <option>Upcoming</option>
                <option>Past</option>
              </select>
              <select className="w-full sm:w-48 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition-all duration-300">
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
>>>>>>> main
          </div>

          {/* Events grid */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
<<<<<<< HEAD
              // Skeleton loading for events
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border bg-white">
                  <div className="h-48 bg-gradient-to-br from-violet-50 to-blue-50 relative overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-6 w-full mb-3" />
                    <div className="space-y-2 mb-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-9 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">Error loading events: {error}</p>
              </div>
            ) : events?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 text-violet-600 mb-6">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No events found</h3>
                <p className="text-slate-600 mb-6">Check back soon for upcoming wellness events!</p>
                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            ) : (
              (events || []).slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map((ev, idx) => {
                const index = ((page-1)*pageSize) + idx;
                const imageSrc = ev.imageUrl || eventImages[index % eventImages.length];
                return (
                  <div
                    key={ev.id}
                    className="group overflow-hidden rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
                    onClick={() => navigate(`/events/${ev.slug || ev.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') {
                        navigate(`/events/${ev.slug || ev.id}`);
                      }
                    }}
                  >
                    <div className="h-48 bg-gradient-to-br from-violet-50 to-blue-50 relative overflow-hidden">
                      <img 
                        src={imageSrc} 
                        alt={ev.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Event type badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        {ev.type || 'Event'}
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute top-3 right-3 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-3 right-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="text-xs font-medium text-violet-700 mb-2">{ev.type || 'Event'}</div>
                      <div className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">{ev.title}</div>
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                        <span>📅</span>
                        {new Date(ev.date).toLocaleDateString()} • {ev.time ? ev.time : (ev.startTime ? formatTime12h(ev.startTime) : 'TBD')}
                      </div>
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <span>📍</span>
                        {ev.location || 'Location TBD'}
                      </div>
                      <p className="mt-3 text-sm text-slate-700 line-clamp-2 leading-relaxed">{ev.summary || ev.details}</p>
                      <div className="mt-4">
                        <Button
                          as="link"
                          to={ev.registrationUrl || `/events/${ev.slug || ev.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white transition-all duration-300 transform hover:scale-105"
                        >
                          {typeof ev.ticketPrice === 'number' && ev.ticketPrice > 0
                            ? `Buy ticket $${ev.ticketPrice}`
                            : 'Register'}
                        </Button>
                      </div>
                    </div>
                  </div>
=======
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading events...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <p className="text-red-600">Error loading events: {error}</p>
              </div>
            ) : events?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-100 text-violet-600 mb-6">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No events found</h3>
                <p className="text-slate-600 mb-6">Check back soon for upcoming wellness events!</p>
                <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            ) : (
              (events || []).slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map((ev, idx) => {
                const index = ((page-1)*pageSize) + idx;
                const imageSrc = ev.image_url || eventImages[index % eventImages.length];
                return (
                  <div
                    key={ev.id}
                    className="group overflow-hidden rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-violet-300 cursor-pointer"
                    onClick={() => navigate(`/events/${ev.slug || ev.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') {
                        navigate(`/events/${ev.slug || ev.id}`);
                      }
                    }}
                  >
                    <div className="h-48 bg-gradient-to-br from-violet-50 to-blue-50 relative overflow-hidden">
                      <img 
                        src={imageSrc} 
                        alt={ev.title} 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Event type badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        {ev.type || 'Event'}
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute top-3 right-3 w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-3 right-3 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="text-xs font-medium text-violet-700 mb-2">{ev.type || 'Event'}</div>
                      <div className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">{ev.title}</div>
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                        <span>📅</span>
                        {new Date(ev.date).toLocaleDateString()} • {ev.start_time || 'TBD'}
                      </div>
                      <div className="mt-2 text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <span>📍</span>
                        {ev.location || 'Location TBD'}
                      </div>
                      <p className="mt-3 text-sm text-slate-700 line-clamp-2 leading-relaxed">{ev.summary || ev.details}</p>
                      <div className="mt-4 flex gap-2">
                        <Button 
                          as="link" 
                          to={ev.registration_url || "#"} 
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-300 transform hover:scale-105"
                        >
                          {ev.ticket_price_cents && ev.ticket_price_cents > 0 
                            ? `Buy ticket $${(ev.ticket_price_cents / 100).toFixed(0)}` 
                            : "Register"}
                        </Button>
                        <Button 
                          as="link" 
                          to={`/events/${ev.slug || ev.id}`} 
                          variant="secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="rounded-full px-4 py-2 hover:text-violet-700 transition-colors duration-300"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
>>>>>>> main
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && events && events.length > 0 && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="text-sm text-slate-600">
                {(() => { const total=events.length; const start=(page-1)*pageSize+1; const end=Math.min(total, page*pageSize); return `Showing ${start}–${end} of ${total}`; })()}
              </div>
              <div className="inline-flex items-center gap-3">
                <Button variant="secondary" size="sm" disabled={page===1} onClick={() => setPage(p=>Math.max(1,p-1))} className="rounded-full px-4 py-2">Previous</Button>
                <span className="text-xs text-slate-500">Page {page} of {Math.max(1, Math.ceil((events?.length||0)/pageSize))}</span>
                <Button size="sm" disabled={page*pageSize >= (events?.length || 0)} onClick={() => setPage(p=>p+1)} className="rounded-full px-4 py-2">Next</Button>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 px-8 py-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="grid lg:grid-cols-2 items-center gap-8 relative z-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Host an event</h2>
                <p className="text-lg text-white/90 leading-relaxed">Are you a professional? Share your expertise with the community.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button variant="secondary" className="rounded-full px-6 py-3 hover:bg-white/90 transition-all duration-300">
                  Submit proposal
                </Button>
                <Button className="bg-white text-violet-700 hover:bg-white/90 rounded-full px-6 py-3 transition-all duration-300 transform hover:scale-105">
                  Contact us
                </Button>
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


