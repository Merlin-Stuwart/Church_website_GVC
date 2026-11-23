import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Users, CheckCircle, 
  Sparkles, ArrowRight, Phone 
} from 'lucide-react';
import { 
  fetchEvents, 
  getEventNotices, 
  getStoredEvents, 
  getSortedActiveEvents, 
  formatEventDisplayDate 
} from '../api/client';

export default function Events() {
  const [events, setEvents] = useState(() => {
    const cached = getStoredEvents();
    return Array.isArray(cached) ? cached : [];
  });
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function loadEvents() {
      const data = await fetchEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    }
    loadEvents();

    const handleSync = () => {
      const cached = getStoredEvents();
      if (Array.isArray(cached)) {
        setEvents(cached);
      } else {
        loadEvents();
      }
    };

    window.addEventListener('gvc_events_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('gvc_events_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter ONLY active / non-expired events, sorted closest to now!
  const activeEvents = getSortedActiveEvents(events);

  const categories = ['All', ...Array.from(new Set(activeEvents.map(e => e.category).filter(Boolean)))];

  const filteredEvents = selectedCategory === 'All'
    ? activeEvents
    : activeEvents.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* PAGE HEADER - LIGHT THEME */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2 sm:mb-3">
            Fellowship & Gatherings
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-6xl text-[#0B192C] mb-3 sm:mb-6 leading-tight">
            Upcoming <span className="gold-text-gradient">Church Events</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Mark your calendar! Join us for soul-refreshing worship services, powerful conferences, and vibrant youth retreats. All services are completely free and open to all.
          </p>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* EVENTS SHOWCASE LIST */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-lg mx-auto shadow-sm">
              <Calendar className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
              <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">No Upcoming Events Scheduled</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                There are no special conferences or retreats scheduled at the moment. Please join us for our regular weekly worship services!
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                <span>Sunday Worship: Every Sunday 09:30 AM – 11:30 AM</span>
              </div>
            </div>
          ) : (
            filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
            >
              {/* Event Image Column (Compact, controlled width) */}
              <div className="w-full md:w-64 lg:w-72 h-44 sm:h-52 md:h-auto min-h-[190px] relative overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={evt.image_url || 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80'}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow">
                    {evt.category || 'Gathering'}
                  </span>
                  {evt.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Event Details Column (Compact & Balanced) */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-950 mb-2 group-hover:text-amber-700 transition-colors tracking-tight">
                    {evt.title}
                  </h3>

                  {/* Schedule Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{formatEventDisplayDate(evt.date)}</span>
                    </span>

                    {evt.time && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{evt.time}</span>
                      </span>
                    )}

                    {evt.location && (
                      <span className="inline-flex items-center gap-1.5 text-slate-600 truncate max-w-xs text-xs">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Description (Clean & Clamped) */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-2.5 line-clamp-2 sm:line-clamp-3">
                    {evt.description}
                  </p>

                  {/* Special Notices (Compact Pills) */}
                  {getEventNotices(evt).length > 0 && (
                    <div className="mb-2.5 p-2 sm:p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs flex flex-wrap items-center gap-2">
                      <span className="font-bold text-amber-900 text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Special:</span>
                      </span>
                      {getEventNotices(evt).map((notice, nIdx) => (
                        <span key={nIdx} className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-amber-300/60 shadow-2xs text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          <span>{notice}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Event Highlights / Key Amenities */}
                  {Array.isArray(evt.highlights) && evt.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {evt.highlights.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium border border-slate-200/80">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Free entry badge + Helpline */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Free Entry • All Welcome</span>
                  </span>

                  <a
                    href="tel:+919360588397"
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Helpline: +91 93605 88397</span>
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </section>

    </div>
  );
}
