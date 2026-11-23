import React, { useState, useEffect } from 'react';
import { 
  Heart, Sparkles, Plus, BookOpen, Quote, Lock, CheckCircle, ShieldCheck,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { TESTIMONIES } from '../data/mockData';
import { fetchTestimonies, getStoredTestimonies } from '../api/client';
import { useChurch } from '../context/ChurchContext';

export default function PrayerWall({ onOpenPrayerModal, onOpenTestimonyModal }) {
  const { settings } = useChurch();
  const [testimonies, setTestimonies] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [expandedTestimonies, setExpandedTestimonies] = useState({});

  const toggleTestimonyExpand = (id) => {
    setExpandedTestimonies(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    async function loadTestimonies() {
      const data = await fetchTestimonies();
      if (Array.isArray(data)) {
        setTestimonies(data);
      }
    }
    loadTestimonies();

    const handleUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setTestimonies(e.detail);
      } else {
        setTestimonies(getStoredTestimonies());
      }
    };
    window.addEventListener('gvc_testimonies_updated', handleUpdate);
    return () => window.removeEventListener('gvc_testimonies_updated', handleUpdate);
  }, []);

  const types = ['All', 'Miraculous Healing', 'Life Transformation', 'Financial Breakthrough'];

  const filteredTestimonies = selectedType === 'All'
    ? testimonies
    : testimonies.filter(t => t.type?.toLowerCase() === selectedType.toLowerCase());

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* PAGE HEADER - LIGHT THEME */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2 sm:mb-3">
            Intercession & Answered Prayers • ஜெபமும் சாட்சிகளும்
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-6xl text-[#0B192C] mb-3 sm:mb-6 leading-tight">
            Prayer & <span className="gold-text-gradient">Testimonies</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8">
            {settings?.prayerWallVerse || "“Again I say unto you, That if two of you shall agree on earth as touching any thing that they shall ask, it shall be done for them of my Father which is in heaven.” — Matthew 18:19"}
          </p>

          {/* TWO SEPARATE ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl mx-auto sm:max-w-none">
            <button
              onClick={onOpenTestimonyModal}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-500/25 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
              <span>Share Your Testimony</span>
            </button>

            <button
              onClick={onOpenPrayerModal}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500 shrink-0" />
              <span>Submit Confidential Prayer Request</span>
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Prayer requests are held strictly confidential. Only testimonies of God's goodness are publicly shared.</span>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedType === type
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* TESTIMONIES GRID */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Answered Prayers & Miracles</span>
          </div>
          <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-950 mb-3">
            Real Stories of God's Power
          </h2>
          <p className="text-slate-600 text-sm">
            Read how God answered prayer and supernaturally transformed lives at Grace Victory Church.
          </p>
        </div>

        {filteredTestimonies.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">
              No Testimonies Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Testimonies shared by believers or published from the Admin Portal will appear here.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {filteredTestimonies.map((item, idx) => {
            const cardId = item.id || `testimony-${idx}`;
            const isExpanded = Boolean(expandedTestimonies[cardId]);
            const isLong = (item.story || '').length > 140;

            return (
              <div 
                key={cardId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between relative group text-left h-full min-h-[280px]"
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
        )}

        {/* Pastoral Prayer Promise Banner */}
        <div className="mt-16 bg-[#F8F6F0] text-slate-800 rounded-3xl p-8 sm:p-12 border border-amber-200/80 text-center max-w-3xl mx-auto shadow-md">
          <BookOpen className="w-10 h-10 text-amber-700 mx-auto mb-4" />
          <h3 className="font-serif font-bold text-2xl text-slate-950 mb-3">
            Every Request Is Lifted Up In Prayer
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            Our Senior Pastor {settings?.seniorPastor || 'Pastor P. Rajendran'} and church intercessory prayer warriors gather every Friday morning ({settings?.fridayTiming || '10:30 AM to 01:30 PM'}) to lay hands on and pray over every submitted petition.
          </p>
          <button
            onClick={onOpenPrayerModal}
            className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center gap-2 mx-auto"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Submit Confidential Prayer Request</span>
          </button>
        </div>

      </section>

    </div>
  );
}
