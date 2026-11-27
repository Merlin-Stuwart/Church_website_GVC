import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Flame, HeartHandshake, ShieldCheck, Music, 
  Globe, Baby, Clock, CheckCircle, ArrowRight, Sparkles,
  ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { fetchMinistries } from '../api/client';

export default function Ministries({ onOpenPlanVisit }) {
  const church = useChurch();
  const settings = church?.settings || {};
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCardIds, setExpandedCardIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const loadMinistries = useCallback(async () => {
    const data = await fetchMinistries();
    if (Array.isArray(data)) {
      setMinistries(data);
      setLoading(false);
      return true;
    }
    setLoading(false);
    return false;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let retryTimer;

    async function init() {
      const ok = await loadMinistries();
      if (!ok && isMounted) {
        retryTimer = setTimeout(() => {
          if (isMounted) loadMinistries();
        }, 4000);
      }
    }
    init();

    const handleSync = () => loadMinistries();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadMinistries();
    };
    const handleStorage = (e) => {
      if (e.key === 'gvc_ministries_sync_ts') loadMinistries();
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('gvc_ministries_updated', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      clearTimeout(retryTimer);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('gvc_ministries_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadMinistries]);

  // Extract distinct category pills
  const categories = ['all', ...Array.from(new Set(ministries.map(m => m.category || m.age || 'General').filter(Boolean)))];

  const filteredMinistries = selectedCategory === 'all'
    ? ministries
    : ministries.filter(m => (m.category === selectedCategory || m.id === selectedCategory || m.age === selectedCategory));

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* PAGE HEADER - LIGHT THEME */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2">
            Get Connected & Grow
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#0B192C] mb-2.5 sm:mb-3 tracking-tight leading-tight">
            Ministries & Services of <span className="gold-text-gradient">{settings.churchName || 'Grace Victory Church'}</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Experience our prayer gatherings, Bible study fellowships, and departmental ministries to connect, intercede, and flourish in Christ.
          </p>
        </div>
      </section>

      {/* MINISTRIES SHOWCASE */}
      <section className="pt-6 pb-14 sm:pt-8 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Category Filter Pills (shown only when ministries exist) */}
        {ministries.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Ministries & Services ({ministries.length})
            </button>

            {categories.filter(c => c !== 'all').map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 animate-pulse">
                <div className="aspect-video rounded-2xl bg-slate-200"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredMinistries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <Layers className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-80" />
            <h3 className="font-serif font-bold text-lg text-slate-900 mb-1.5">
              No Ministries or Prayer Services Listed Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ministries and prayer gatherings added through the Admin Portal will appear here automatically.
            </p>
          </div>
        ) : (
        /* Ministries Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMinistries.map((m, idx) => {
            const cardId = m.id || `ministry-${idx}`;
            const isExpanded = Boolean(expandedCardIds[cardId]);
            const isLong = (m.desc || '').length > 130;

            return (
              <div 
                key={cardId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group text-left"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img 
                    src={m.image || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'} 
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-xs font-bold shadow">
                      {m.badge || m.age || m.category || 'Ministry'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-950 mb-1.5 group-hover:text-amber-700 transition-colors">
                      {m.title}
                    </h3>
                    
                    {m.tagline && (
                      <p className="text-xs text-amber-800 font-semibold mb-3 italic">
                        “{m.tagline}”
                      </p>
                    )}

                    <div className="mb-6">
                      <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed transition-all ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                        {m.desc}
                      </p>
                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(cardId)}
                          className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                        >
                          <span>{isExpanded ? 'Show Less' : 'Show More...'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                    {(m.meeting_time || m.meetingTime) && (
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-semibold min-w-0 break-words">{m.meeting_time || m.meetingTime}</span>
                      </div>
                    )}
                    
                    {m.leader && (
                      <div className="flex items-center gap-2 text-slate-700 min-w-0">
                        <Users className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="min-w-0 break-words">Led by: <strong>{m.leader}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

      </section>

    </div>
  );
}
