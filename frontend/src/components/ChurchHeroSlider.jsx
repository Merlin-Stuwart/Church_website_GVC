import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Play, Phone, Instagram, 
  Facebook, Youtube, Sparkles, Heart, Calendar, ArrowRight, 
  MapPin, Clock, CheckCircle, ShieldCheck
} from 'lucide-react';
import { useChurch, sanitizeFranklinName, resolveSocialLinks } from '../context/ChurchContext';
import { 
  fetchEvents, 
  getEventNotices, 
  getStoredEvents, 
  getSortedActiveEvents, 
  formatEventDisplayDate, 
  isEventActive 
} from '../api/client';

export default function ChurchHeroSlider({ onOpenPlanVisit, onWatchSermon }) {
  const church = useChurch();
  const settings = church?.settings || {};
  const socialLinks = resolveSocialLinks(settings);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState(() => {
    const cached = getStoredEvents();
    return Array.isArray(cached) ? cached : [];
  });
  const touchStartXRef = useRef(null);

  // Speed in seconds customized from Admin Dashboard (default 3s)
  const speedSeconds = Math.max(1, Number(settings.sliderSpeedSeconds || 3));
  const sliderIntervalMs = speedSeconds * 1000;

  useEffect(() => {
    async function loadEventsData() {
      try {
        const eventsData = await fetchEvents();
        if (Array.isArray(eventsData)) {
          setEvents(eventsData);
        }
      } catch (err) {}
    }
    loadEventsData();

    // Instant real-time listener when an event is added or edited in Admin
    const handleEventsSync = () => {
      const cached = getStoredEvents();
      if (Array.isArray(cached)) {
        setEvents(cached);
      } else {
        loadEventsData();
      }
    };

    window.addEventListener('gvc_events_updated', handleEventsSync);
    window.addEventListener('storage', handleEventsSync);
    return () => {
      window.removeEventListener('gvc_events_updated', handleEventsSync);
      window.removeEventListener('storage', handleEventsSync);
    };
  }, []);

  // SLIDE 1: MAIN CHURCH THEME & LEADERSHIP (SANCTUARY BACKGROUND)
  const mainChurchSlide = {
    id: 'slide-church-theme',
    isEventSlide: false,
    themeName: settings.themeBadge || 'YEAR OF VICTORY',
    year: settings.yearBadge || '2026',
    tamilTheme: settings.tamilTheme || 'அற்புதங்கள் மற்றும் ஆசீர்வாதத்தின் ஆண்டு',
    tagline: settings.tagline || 'A House of Prayer for All Nations • Vattamalai',
    churchName: settings.churchName?.toUpperCase() || 'GRACE VICTORY CHURCH',
    pastorName: settings.seniorPastor || 'Pastor P. Rajendran',
    pastorTitle: settings.seniorPastorTitle || 'Founder & Senior Pastor',
    pastorImg: settings.pastorImage || '/images/pastor.jpg',
    associatePastorName: sanitizeFranklinName(settings.associatePastor),
    associatePastorTitle: settings.associatePastorTitle || 'Youth Pastor & Administrator',
    associatePastorImg: settings.associatePastorImage || settings.youthPastorImage || '/images/franklin.jpg',
  };

  // Filter active events whose deadline has not expired, sorted by closest upcoming date first!
  const activeUpcomingEvents = getSortedActiveEvents(events);

  // Dedicated Event Slides: Show ONLY the immediate next upcoming event (closest to current date!)
  const eventSlides = activeUpcomingEvents.slice(0, 1).map((evt, idx) => ({
    id: `slide-event-${evt.id || idx}`,
    isEventSlide: true,
    event: evt,
  }));

  // Build full slides list: Slide 1 (Church & Pastors), Slide 2 (Immediate Next Upcoming Event)
  // If NO active events exist, ONLY show the 1 main church slide (NO automatic fallback or dummy slides!)
  const slides = eventSlides.length > 0 
    ? [mainChurchSlide, ...eventSlides]
    : [mainChurchSlide];

  // Auto-advance whole slide continuously every X seconds (set from Admin Dashboard, default 3s)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, sliderIntervalMs);
    return () => clearInterval(timer);
  }, [slides.length, sliderIntervalMs]);

  // Keep current slide within bounds if slide count changes
  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#020B14] select-none shadow-2xl flex flex-col">
      
      {/* Viewport: Fluid height with comfortable breathing room across all screen sizes */}
      <div className="relative flex-1 overflow-hidden">
        
        {/* =========================================================================
            TRUE HORIZONTAL CAROUSEL TRACK: WHOLE SLIDE (BG + CONTENT) MOVES TOGETHER!
           ========================================================================= */}
        <div 
          className="flex w-full items-stretch transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((s, idx) => (
            <div 
              key={s.id || idx}
              className="relative w-full shrink-0 flex items-center justify-center overflow-hidden min-h-[500px] lg:min-h-[540px] xl:min-h-[580px]"
            >
              
              {/* =====================================================================
                  SLIDE BACKGROUND WITH CINEMATIC LIGHTING
                 ===================================================================== */}
              {s.isEventSlide ? (
                /* EVENT SLIDE BACKGROUND: 70%+ CLEAR VISIBILITY WITH CRISP VIBRANCE */
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <img 
                    src={s.event?.image_url || s.event?.image || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=80'} 
                    alt={s.event?.title || 'Church Event'} 
                    className="w-full h-full object-cover filter brightness-100 contrast-105 scale-105 transition-transform duration-1000"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1600&q=80';
                    }}
                  />
                  {/* Directional Vignettes: Left text legibility while right image stays 100% visible */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020B14]/85 via-[#020B14]/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020B14]/80 via-transparent to-[#020B14]/30"></div>
                </div>
              ) : (
                /* CHURCH THEME SLIDE BACKGROUND: Real Sanctuary Hall with Royal Midnight Blue & Gold Wash */
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-[#020D1A]"></div>
                  <div 
                    className="absolute inset-0 bg-cover bg-center scale-105 opacity-40 mix-blend-luminosity filter brightness-110 contrast-125"
                    style={{ backgroundImage: `url('${settings.churchHallImage || '/images/church_hall.jpg'}')` }}
                  ></div>
                  {/* Premium Radial Spotlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020B14]/90 via-[#062646]/50 to-[#020B14]/90"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(2,11,20,0.7)_85%)]"></div>
                </div>
              )}

              {/* Ambient watermark */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-between px-8 opacity-[0.03]">
                <span className="font-serif font-black text-8xl lg:text-[140px] text-white tracking-widest select-none">
                  JESUS
                </span>
                <span className="font-serif font-black text-8xl lg:text-[140px] text-white tracking-widest select-none">
                  VICTORY
                </span>
              </div>

              {/* =====================================================================
                  SLIDE FOREGROUND CONTENT STAGE
                 ===================================================================== */}
              <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-12 xl:px-20 py-8 sm:py-10 lg:py-12 flex flex-col justify-center">
                
                {s.isEventSlide ? (
                  /* =================================================================
                      SLIDE 2: ULTRA-MODERN EVENT SHOWCASE (BILLBOARD STYLE)
                     ================================================================= */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center w-full animate-in fade-in duration-500">
                    
                    {/* LEFT / CENTER: EVENT DETAILS & INVITATION */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5 sm:space-y-4">
                      
                      {/* Event Category Badge */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span>Upcoming Church Event • {s.event?.category || 'Special Gathering'}</span>
                      </div>

                      {/* Event Title */}
                      <h1 className="font-serif font-black text-2xl sm:text-4xl xl:text-5xl text-white tracking-tight uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[1.15]">
                        {s.event?.title}
                      </h1>

                      {/* Event Schedule Bar */}
                      <div className="w-full max-w-xl bg-slate-950/70 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 text-white shadow-2xl space-y-2.5">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm font-semibold">
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{formatEventDisplayDate(s.event?.date)}</span>
                          </div>
                          {s.event?.time && (
                            <div className="flex items-center gap-2 text-slate-200">
                              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{s.event?.time}</span>
                            </div>
                          )}
                        </div>
                        {s.event?.location && (
                          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-300 pt-2 border-t border-white/10">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{s.event?.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Event Description */}
                      <p className="text-slate-100 text-xs sm:text-sm lg:text-base max-w-2xl line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] font-normal">
                        {s.event?.description}
                      </p>

                      {/* Special Notice Banners (e.g. Food, Transportation, etc.) */}
                      {getEventNotices(s.event).length > 0 && (
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 max-w-xl">
                          {getEventNotices(s.event).map((notice, nIdx) => (
                            <div key={nIdx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-lg">
                              <span className="text-white font-medium">{notice}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                        <Link
                          to="/events"
                          className="px-6 py-3.5 rounded-full font-extrabold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                          <span>Join Us • Free Entry</span>
                          <ArrowRight className="w-4 h-4 text-slate-950" />
                        </Link>

                        <Link
                          to="/events"
                          className="px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-slate-900/80 border border-slate-600 hover:border-amber-400 hover:bg-slate-800 shadow-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
                        >
                          <span>View All Events</span>
                        </Link>

                        <Link
                          to="/giving"
                          className="px-4 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                          <span>Tithes & Giving</span>
                        </Link>
                      </div>

                    </div>

                    {/* RIGHT: ELEGANT EVENT HIGHLIGHTS / VIP PASS CARD */}
                    <div className="hidden lg:flex lg:col-span-5 items-center justify-end">
                      <div className="w-full max-w-md bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-amber-400/30 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Special Gathering</span>
                          </div>
                          <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wider">Free Entry</span>
                        </div>

                        {/* Special Notices Card */}
                        {getEventNotices(s.event).length > 0 && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 text-amber-200 text-xs space-y-1.5 shadow-sm">
                            <strong className="text-amber-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Special Notices / கூடுதல் தகவல்கள்</span>
                            </strong>
                            <div className="space-y-1">
                              {getEventNotices(s.event).map((notice, nIdx) => (
                                <div key={nIdx} className="flex items-center gap-2 text-xs text-slate-100 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                  <span className="truncate">{notice}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                          {Array.isArray(s.event?.highlights) && s.event.highlights.length > 0 ? (
                            s.event.highlights.map((h, hIdx) => (
                              <div key={hIdx} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="font-semibold text-white leading-snug">{h}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white block font-semibold">Anointed Praise & Intercession</strong>
                                  <span className="text-xs text-slate-300">Intensive prayer for families, healing & breakthrough</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white block font-semibold">Personal Blessing & Ministry</strong>
                                  <span className="text-xs text-slate-300">Pastoral counseling & individual anointing prayer</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-white block font-semibold">All Are Cordially Welcome</strong>
                                  <span className="text-xs text-slate-300">Bring your friends, loved ones, and relatives</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
                          <span className="truncate max-w-[220px]">📍 {s.event?.location || 'Grace Victory Church Sanctuary'}</span>
                          <Link to="/events" className="text-amber-400 hover:text-white font-bold flex items-center gap-1 shrink-0">
                            Details <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* =================================================================
                      SLIDE 1: ULTRA-LUXURY CHURCH & PASTORAL LEADERSHIP
                     ================================================================= */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center w-full animate-in fade-in duration-500">
                    
                    {/* LEFT: CHURCH IDENTITY, THEME & CALLS TO ACTION */}
                    <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-2.5 sm:space-y-3.5 min-w-0">
                      
                      {/* Established Crest Badge */}
                      <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest shadow-md max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                        <span>Established {settings.foundedYear || '1998'} • {(settings.address || 'Vattamalai, India').replace(/^Grace Victory Church,\s*/i, '')}</span>
                      </div>

                      {/* Main Church Title */}
                      <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl xl:text-6xl text-white tracking-wide uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[1.1]">
                        {s.churchName}
                      </h1>

                      {/* Subtitle / Slogan */}
                      <p className="font-serif italic text-amber-300 text-xs sm:text-sm md:text-base font-normal tracking-wide drop-shadow">
                        {s.tagline}
                      </p>

                      {/* THE LUXURY 2026 THEME EMBLEM */}
                      <div className="pt-1 max-w-full">
                        <div className="flex flex-col items-center lg:items-start">
                          
                          {/* Sleek Unified Architectural Badge */}
                          <div className="bg-gradient-to-r from-white via-slate-50 to-amber-50 text-[#041D35] px-3.5 sm:px-6 md:px-7 py-2 sm:py-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] border-2 border-amber-400/80 flex items-center gap-2.5 sm:gap-4 max-w-full">
                            <span className="font-serif font-black text-xl sm:text-3xl md:text-4xl text-amber-600 tracking-tight border-r border-slate-300 pr-2.5 sm:pr-4 leading-none shrink-0">
                              {s.year}
                            </span>
                            <div className="text-left leading-none min-w-0">
                              <span className="font-serif font-black text-xs sm:text-base md:text-xl lg:text-2xl tracking-wider uppercase text-[#031E3A] block">
                                {s.themeName}
                              </span>
                              <span className="text-[9px] sm:text-[11px] md:text-xs font-semibold text-slate-600 block mt-0.5 sm:mt-1 tracking-normal">
                                {s.tamilTheme}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                        <button
                          onClick={onOpenPlanVisit}
                          className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-full font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/25 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
                          <span>Plan Your Sunday Visit</span>
                        </button>

                        <button
                          onClick={onWatchSermon}
                          className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider text-white bg-slate-900/80 border border-slate-600 hover:border-amber-400 hover:bg-slate-800 shadow-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                          <span>Watch Sermon</span>
                        </button>

                        <Link
                          to="/giving"
                          className="px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-full font-bold text-[11px] sm:text-xs uppercase tracking-wider text-amber-300 hover:text-white transition-colors flex items-center gap-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                          <span>Tithes & Giving</span>
                        </Link>
                      </div>

                    </div>

                    {/* RIGHT: LUXURY PASTORAL COMPOSITION (CLEAN & BALANCED) */}
                    <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative">
                      
                      {/* Ambient Golden Glow Backlight */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-blue-500/15 to-amber-500/10 rounded-full blur-3xl transform scale-95 pointer-events-none"></div>

                      {/* Side-by-side Overlapping Duo */}
                      <div className="relative flex items-end justify-center gap-2.5 sm:gap-4">
                        
                        {/* 1. YOUTH PASTOR R. FRANKLIN RAJENDRAN */}
                        <div className="relative w-28 sm:w-36 lg:w-36 xl:w-44 mb-1 z-10 transition-transform hover:scale-105 duration-300">
                          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] aspect-[3/4] bg-slate-950 border border-amber-400/40">
                            <img 
                              src={s.associatePastorImg || '/images/franklin.jpg'} 
                              alt={s.associatePastorName || 'Associate Pastor'} 
                              className="w-full h-full object-cover object-top filter brightness-105"
                              onError={(e) => { e.target.src = '/images/franklin.jpg'; }}
                            />
                            
                            {/* Bottom Title Gradient Fade with Clear Typography */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#020B14] via-[#020B14]/90 to-transparent pt-6 sm:pt-8 pb-2 sm:pb-2.5 px-1.5 sm:px-2 text-center">
                              <span className="text-[7px] sm:text-[8.5px] uppercase tracking-wider font-extrabold text-amber-400 block mb-0.5 leading-tight line-clamp-2">
                                {s.associatePastorTitle}
                              </span>
                              <h4 className="font-serif font-black text-[10px] sm:text-xs xl:text-sm text-white drop-shadow leading-tight">
                                {s.associatePastorName}
                              </h4>
                            </div>
                          </div>
                        </div>

                        {/* 2. SENIOR PASTOR (PROMINENT & MAJESTIC) */}
                        <div className="relative w-36 sm:w-48 lg:w-48 xl:w-64 z-20 transition-transform hover:scale-105 duration-300">
                          <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] aspect-[3/4] bg-slate-950 border-2 border-amber-400/50">
                            <img 
                              src={s.pastorImg || '/images/pastor.jpg'} 
                              alt={s.pastorName || 'Senior Pastor'} 
                              className="w-full h-full object-cover object-top filter brightness-105"
                              onError={(e) => { e.target.src = '/images/pastor.jpg'; }}
                            />
                            
                            {/* Bottom Title Gradient Fade with Clear Typography */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#020B14] via-[#020B14]/90 to-transparent pt-8 sm:pt-10 pb-2.5 sm:pb-3 px-2 sm:px-3 text-center">
                              <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-extrabold text-amber-400 block mb-0.5">
                                {s.pastorTitle}
                              </span>
                              <h3 className="font-serif font-black text-xs sm:text-base xl:text-lg text-white drop-shadow leading-tight">
                                {s.pastorName}
                              </h3>
                              <span className="text-[8px] sm:text-[9px] text-slate-300 block mt-0.5">
                                {settings.churchName || 'Grace Victory Church'}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* =========================================================================
          BOTTOM SOCIAL & HELPLINE DOCK (NON-OVERLAPPING FLOW BAR)
         ========================================================================= */}
      <div className="relative z-20 w-full bg-[#020B14]/85 backdrop-blur-md border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 text-xs text-slate-200">
          
          {/* Social Channels (labels & links managed from Admin > Footer & Social Links) */}
          <div className="flex items-center gap-2.5 sm:gap-4 md:gap-6">
            {[
              { key: 'instagram', Icon: Instagram, iconClass: 'text-pink-400', hoverBg: 'group-hover:bg-pink-600/30', title: 'Follow GVC on Instagram' },
              { key: 'facebook', Icon: Facebook, iconClass: 'text-blue-400', hoverBg: 'group-hover:bg-blue-600/30', title: 'Follow GVC on Facebook' },
              { key: 'youtube', Icon: Youtube, iconClass: 'text-red-500', hoverBg: 'group-hover:bg-red-600/30', title: 'Watch GVC on YouTube' },
            ].map(({ key, Icon, iconClass, hoverBg, title }) => {
              const link = socialLinks[key];
              if (!link || !link.url) return null;
              return (
                <a
                  key={key}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-400 transition-colors group"
                  title={title}
                >
                  <div className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-white/10 ${hoverBg} flex items-center justify-center transition-colors`}>
                    <Icon className={`w-3 h-3 ${iconClass}`} />
                  </div>
                  {(link.label || link.sublabel) && (
                    <div className="hidden lg:block text-left leading-none">
                      {link.label && <span className="block text-[9px] font-bold text-white group-hover:text-amber-300">{link.label}</span>}
                      {link.sublabel && <span className="block text-[8px] text-slate-400">{link.sublabel}</span>}
                    </div>
                  )}
                </a>
              );
            })}
          </div>

          {/* Center Pagination & Slide Navigation Hub (Zero content obstruction) */}
          {slides.length > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-amber-400/30 shadow-lg">
              <button
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-5 sm:w-7 bg-amber-400 shadow-md shadow-amber-400/50' : 'w-1.5 sm:w-2 bg-white/35 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                aria-label="Next Slide"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          {/* 24/7 Helpline Phone */}
          <a
            href={`tel:${(settings.phone || '+91 93605 88397').replace(/[^0-9+]/g, '')}`}
            className="flex items-center gap-1.5 sm:gap-2 bg-white text-[#031527] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-bold shadow-md border border-amber-400 hover:scale-105 transition-transform shrink-0"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#072B4F] text-amber-400 flex items-center justify-center">
              <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
            </div>
            <div className="text-left leading-none">
              <span className="text-[7px] uppercase tracking-wider font-extrabold text-slate-500 block">24/7 Helpline</span>
              <span className="text-[10px] sm:text-[11px] font-black text-[#072B4F]">{settings.phone || '+91 93605 88397'}</span>
            </div>
          </a>

        </div>
      </div>

      {/* Slider Left / Right Side Floating Chevrons (Visible on xl+ wide screens with clear outer gutter) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-400 text-white hover:text-slate-950 items-center justify-center backdrop-blur-md border border-white/20 hover:border-amber-400 transition-all hover:scale-110 active:scale-95 z-20 shadow-2xl cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden xl:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-amber-400 text-white hover:text-slate-950 items-center justify-center backdrop-blur-md border border-white/20 hover:border-amber-400 transition-all hover:scale-110 active:scale-95 z-20 shadow-2xl cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

    </div>
  );
}
