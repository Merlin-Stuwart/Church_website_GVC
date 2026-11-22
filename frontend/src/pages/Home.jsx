import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Calendar, Clock, MapPin, Heart, ChevronRight, 
  Sparkles, Users, BookOpen, Quote, ArrowRight,
  Radio, CheckCircle, Send,
  HelpCircle, MessageCircle, Phone, Volume2, Camera,
  ChevronDown, ChevronUp
} from 'lucide-react';
import ChurchHeroSlider from '../components/ChurchHeroSlider';
import ServiceCountdown from '../components/ServiceCountdown';
import SermonPlayerModal from '../components/SermonPlayerModal';
import { CHURCH_INFO, CHURCH_STATS, TESTIMONIES, FAQ_LIST } from '../data/mockData';
import { fetchSermons, fetchEvents, fetchTestimonies, getStoredTestimonies } from '../api/client';
import { INITIAL_SERMONS, INITIAL_EVENTS } from '../data/mockData';
import { useChurch } from '../context/ChurchContext';

export default function Home({ onOpenPlanVisit, onOpenPrayerModal, onOpenTestimonyModal }) {
  const { settings } = useChurch();
  const [sermons, setSermons] = useState(INITIAL_SERMONS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [testimonies, setTestimonies] = useState(() => getStoredTestimonies());
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [expandedTestimonies, setExpandedTestimonies] = useState({});

  const toggleTestimonyExpand = (id) => {
    setExpandedTestimonies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    async function loadData() {
      const sData = await fetchSermons();
      if (sData && sData.length > 0) setSermons(sData);

      const eData = await fetchEvents();
      if (eData && eData.length > 0) setEvents(eData);

      const tData = await fetchTestimonies();
      if (tData && tData.length > 0) setTestimonies(tData);
    }
    loadData();

    // Listen for instant real-time updates when testimonies are added or deleted anywhere
    const handleTestimoniesUpdated = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setTestimonies(e.detail);
      } else {
        setTestimonies(getStoredTestimonies());
      }
    };
    window.addEventListener('gvc_testimonies_updated', handleTestimoniesUpdated);
    return () => window.removeEventListener('gvc_testimonies_updated', handleTestimoniesUpdated);
  }, []);

  const handlePlaySermon = (sermon) => {
    setSelectedSermon(sermon);
    setIsPlayerOpen(true);
  };

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* =========================================================================
          SECTION 1: FGAG-INSPIRED CINEMATIC HERO SLIDER
         ========================================================================= */}
      <ChurchHeroSlider 
        onOpenPlanVisit={onOpenPlanVisit}
        onWatchSermon={() => sermons[0] && handlePlaySermon(sermons[0])}
      />

      {/* =========================================================================
          SECTION 2: SUNDAY SERVICE COUNTDOWN
         ========================================================================= */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="w-full">
            <ServiceCountdown onWatchLive={() => sermons[0] && handlePlaySermon(sermons[0])} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: REAL SANCTUARY SHOWCASE (USING THE USER'S REAL CHURCH PHOTO)
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* REAL CHURCH PHOTO */}
          <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full min-h-[280px] sm:min-h-[440px] overflow-hidden bg-slate-950">
            <img 
              src={settings.churchHallImage || "/images/church_hall.jpg"} 
              alt="Grace Victory Church Sanctuary Interior" 
              className="w-full h-full object-cover filter brightness-105 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8 text-white text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider mb-2 w-fit">
                <Camera className="w-3.5 h-3.5" />
                <span>Our Sanctuary in Vattamalai</span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
                Main Worship Sanctuary • Victory Hall
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                {settings.churchName || 'Grace Victory Church'}, Vattamalai — Filled with prayer, worship, and joy every week.
              </p>
            </div>
          </div>

          {/* INVITATION & DETAILS */}
          <div className="lg:col-span-5 p-6 sm:p-10 text-left space-y-5">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>A Warm House of Prayer</span>
            </div>

            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-950 leading-tight">
              A Living Sanctuary Where Every Soul Belongs
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              When you step through the doors of Grace Victory Church, you are greeted not as a stranger, but as beloved family. From anointed keyboard worship and spirit-led praise to practical verse-by-verse preaching, our sanctuary is consecrated for you to encounter Jesus.
            </p>

            <div className="space-y-3 pt-2 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Air-cooled sanctuary with comfortable seating for all families</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated nursery & Champions Kids church during Sunday 09:30 AM service</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal prayer & blessing from Senior Pastor after every service</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Get Directions & Map</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SENIOR PASTOR'S WELCOME (FEATURING THE USER'S REAL PASTOR PHOTO)
         ========================================================================= */}
      <section className="bg-[#F8F6F0] py-20 px-4 sm:px-6 lg:px-8 border-y border-amber-200/60">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* DUAL PASTORAL LEADERSHIP PHOTOS (SENIOR PASTOR & ELDER SON) */}
            <div className="lg:col-span-5 relative grid grid-cols-2 gap-2 h-72 sm:h-96 lg:h-full min-h-[280px] sm:min-h-[420px] bg-slate-950 p-2 sm:p-2.5 rounded-2xl">
              {/* Senior Pastor */}
              <div className="relative h-full rounded-xl overflow-hidden shadow-lg border border-amber-400/20">
                <img 
                  src={settings.pastorImage || "/images/pastor.jpg"} 
                  alt={settings.seniorPastor || "Pastor P. Rajendran - Senior Pastor"} 
                  className="w-full h-full object-cover object-top filter brightness-105"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#041628]/95 via-[#041628]/60 to-transparent p-3 text-white text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">{settings.seniorPastorTitle || 'Founder & Senior Pastor'}</span>
                  <h4 className="font-serif font-bold text-sm text-white leading-tight">{settings.seniorPastor || 'Pastor P. Rajendran'}</h4>
                </div>
              </div>

              {/* Second Pastor (Youth Pastor R. Franklin Rajendran) */}
              <div className="relative h-full rounded-xl overflow-hidden shadow-lg border border-amber-400/20">
                <img 
                  src={settings.associatePastorImage || "/images/franklin.jpg"} 
                  alt={settings.associatePastor || "Pastor R. Franklin Rajendran - Youth Pastor & Administrator"} 
                  className="w-full h-full object-cover object-top filter brightness-105"
                  onError={(e) => { e.target.src = '/images/franklin.jpg'; }}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#041628]/95 via-[#041628]/60 to-transparent p-3 text-white text-left">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">{settings.associatePastorTitle || 'Youth Pastor & Admin'}</span>
                  <h4 className="font-serif font-bold text-sm text-white leading-tight">{settings.associatePastor || 'Pastor R. Franklin Rajendran'}</h4>
                </div>
              </div>
            </div>

            {/* PASTORAL WELCOME MESSAGE */}
            <div className="lg:col-span-7 p-6 sm:p-10 text-left space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Quote className="w-3.5 h-3.5 text-amber-700" />
                <span>{settings.pastorWelcomeBadge || 'A Personal Word from Our Pastoral Leadership'}</span>
              </div>

              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-950 leading-tight">
                {settings.pastorWelcomeTitle || '“You Were Born to Walk in Divine Favor and Supernatural Victory!”'}
              </h2>

              <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
                <p>
                  {settings.pastorWelcomeP1 || `Beloved brother and sister, welcome to ${settings.churchName || 'Grace Victory Church'}. For over 28 years, God has granted us the privilege of shepherding precious families across Vattamalai with love, truth, and the supernatural power of the Holy Spirit.`}
                </p>
                <p>
                  {settings.pastorWelcomeP2 || 'No matter what challenge, illness, or heartbreak you are carrying today, our Lord Jesus Christ is alive and His grace is more than sufficient. We believe that when you step into our church, you will experience the tangible presence of God, deep fellowship, and supernatural peace.'}
                </p>
                <p className="italic text-slate-900 font-serif font-bold">
                  {settings.pastorWelcomeQuote || `“Together with our pastoral leadership and our youth pastor, ${settings.associatePastor || 'Pastor R. Franklin Rajendran'}, we personally invite you to worship with us this Sunday. We look forward to welcoming you and your family!”`}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-slate-950 hover:bg-slate-900 transition-colors shadow-md flex items-center gap-2"
                >
                  <span>Meet {settings.seniorPastor || 'Pastor Rajendran'} This Sunday</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <a
                  href={`tel:${(settings.phone || '+91 93605 88397').replace(/[^0-9+]/g, '')}`}
                  className="px-5 py-3.5 rounded-xl border border-slate-300 hover:border-amber-500 text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>Call Pastoral Hotline</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CINEMA MEDIA & SERMON LIBRARY SHOWCASE
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 text-left">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-700 block mb-2">
              Spiritual Nourishment & Truth
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-5xl text-slate-950">
              Anointed Sermons & Media
            </h2>
          </div>

          <Link
            to="/sermons"
            className="text-sm font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View Full Sermon Library</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Cinema Viewport (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              <img 
                src={sermons[0]?.thumbnail || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80"} 
                alt="Sermon Thumbnail" 
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              
              <button
                onClick={() => sermons[0] && handlePlaySermon(sermons[0])}
                className="absolute inset-0 flex items-center justify-center group"
                aria-label="Play Featured Message"
              >
                <div className="w-18 h-18 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-amber-600 transition-all p-5">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-white">
                <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md font-bold uppercase">
                  {sermons[0]?.category}
                </span>
                <span className="font-bold text-amber-300">
                  {sermons[0]?.duration || '48 mins'}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-bold text-amber-700">{sermons[0]?.speaker}</span>
                <span>•</span>
                <span>{sermons[0]?.date}</span>
                <span>•</span>
                <span>{sermons[0]?.series}</span>
              </div>

              <h3 className="font-serif font-bold text-2xl text-slate-950 mb-3">
                {sermons[0]?.title}
              </h3>

              {sermons[0]?.scripture && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs font-semibold text-amber-900 mb-4 inline-flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>Scripture: {sermons[0]?.scripture}</span>
                </div>
              )}

              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                {sermons[0]?.summary}
              </p>

              <button
                onClick={() => sermons[0] && handlePlaySermon(sermons[0])}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Video & Listen to Audio</span>
              </button>
            </div>
          </div>

          {/* Vertical Recent Playlist (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h4 className="font-serif font-bold text-lg text-slate-900 mb-2">
              Recent Teachings by Pastor P. Rajendran
            </h4>

            {sermons.slice(1, 4).map((sermon) => (
              <div 
                key={sermon.id}
                onClick={() => handlePlaySermon(sermon)}
                className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4 items-center group"
              >
                <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <img 
                    src={sermon.thumbnail || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=400&q=80"} 
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    {sermon.series || 'Sunday Service'}
                  </span>
                  <h5 className="font-serif font-bold text-sm text-slate-950 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {sermon.title}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sermon.speaker}</p>
                  <span className="text-[11px] text-slate-400 font-medium">{sermon.date}</span>
                </div>
              </div>
            ))}

            <Link
              to="/sermons"
              className="block w-full py-3.5 rounded-2xl text-center text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Search All Audio Podcasts & Series &rarr;
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: REAL STORIES OF GRACE & MIRACLES (TESTIMONIES)
         ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 border border-amber-200/90 rounded-3xl p-5 sm:p-8 md:p-12 shadow-sm text-left">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Miracles & Supernatural Breakthroughs • சாட்சிகள்</span>
              </div>
              <h2 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-5xl text-slate-950">
                Real Stories of God's Grace
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Read how Jesus is miraculously healing bodies, restoring broken families, and breaking financial chains in Grace Victory Church.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
              {/* SEPARATE BUTTON 1: SHARE YOUR TESTIMONY */}
              <button
                onClick={onOpenTestimonyModal}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Share Your Testimony</span>
              </button>

              {/* SEPARATE BUTTON 2: SUBMIT PRAYER REQUEST */}
              <button
                onClick={onOpenPrayerModal}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                <span>Submit Prayer Request</span>
              </button>
            </div>
          </div>

          {/* Testimonies Grid (Only 3 Testimonies Shown on Home Page - Admin Selected & Equal Height) */}
          {(() => {
            const featuredIds = Array.isArray(settings?.featuredHomeTestimonyIds) && settings.featuredHomeTestimonyIds.length > 0
              ? settings.featuredHomeTestimonyIds
              : ['testimony-1', 'testimony-2', 'testimony-3'];

            const featuredSelected = featuredIds
              .map(id => testimonies.find(t => String(t.id) === String(id) || String(t._id) === String(id)))
              .filter(Boolean);

            const remaining = testimonies.filter(t => !featuredSelected.some(ft => String(ft.id) === String(t.id) || String(ft._id) === String(t.id)));
            const homeDisplayTestimonies = [...featuredSelected, ...remaining].slice(0, 3);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {homeDisplayTestimonies.map((item, idx) => {
                  const cardId = item.id || `testimony-${idx}`;
                  const isExpanded = Boolean(expandedTestimonies[cardId]);
                  const isLong = (item.story || '').length > 140;

                  return (
                    <div 
                      key={cardId} 
                      className="bg-white p-6 sm:p-7 rounded-3xl border border-amber-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group h-full min-h-[280px]"
                    >
                      <div className="absolute top-6 right-6 text-amber-400/20 group-hover:text-amber-400/40 transition-colors pointer-events-none">
                        <Quote className="w-10 h-10" />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold uppercase tracking-wider">
                            {item.type || 'Miraculous Healing'}
                          </span>
                        </div>
                        <p className={`text-sm text-slate-700 leading-relaxed italic relative z-10 transition-all ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                          “{item.story}”
                        </p>
                        {isLong && (
                          <button
                            type="button"
                            onClick={() => toggleTestimonyExpand(cardId)}
                            className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors inline-flex items-center gap-1 cursor-pointer focus:outline-none z-20 relative self-start"
                          >
                            <span>{isExpanded ? 'Show Less' : 'Show More...'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="pt-4 mt-6 border-t border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                          {item.name?.charAt(0) || 'G'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-sm text-slate-950 truncate">{item.name}</h4>
                          <span className="text-[11px] text-slate-400 truncate block">{item.location || 'GVC Believer'} • {item.date || 'Testimony'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* View All Testimonies Button (Navigates to full Testimonies page) */}
          <div className="mt-8 text-center">
            <Link
              to="/prayer-wall"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 hover:border-amber-400 text-amber-900 font-bold text-xs uppercase tracking-wider shadow-sm transition-all group"
            >
              <span>View All Testimonies & Praise Reports &rarr;</span>
            </Link>
          </div>

          {/* Reassuring Pastoral Prayer Notice Banner (Clean Info Banner without duplicate buttons) */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white/80 border border-amber-200/90 flex items-start sm:items-center gap-3 text-xs text-slate-700">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Heart className="w-4 h-4 fill-amber-600 text-amber-600" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold text-xs sm:text-sm">Need Personal Prayer & Pastoral Intercession?</strong>
              <span className="text-slate-600">All prayer petitions submitted via the button above are kept 100% confidential and interceded over privately by Pastor P. Rajendran and our prayer warriors.</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 8: VISITOR FAQ & COMMON QUESTIONS
         ========================================================================= */}
      <section className="bg-[#F8F6F0] py-20 px-4 sm:px-6 lg:px-8 border-t border-amber-200/60">
        <div className="max-w-5xl mx-auto text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-800 block mb-2">
              First Time at GVC?
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-950 mb-3">
              Everything You Need to Know
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We want you to feel relaxed and welcomed. Here are answers to the questions visitors ask most often.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(Array.isArray(settings?.faqList) && settings.faqList.length > 0 ? settings.faqList : FAQ_LIST).map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all"
            >
              <span>View Service Timings & Church Location</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Sermon Player Modal */}
      <SermonPlayerModal 
        sermon={selectedSermon} 
        isOpen={isPlayerOpen} 
        onClose={() => setIsPlayerOpen(false)} 
      />

    </div>
  );
}
