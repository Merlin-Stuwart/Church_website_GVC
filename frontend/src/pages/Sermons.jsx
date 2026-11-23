import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play, Volume2, Search, Filter, BookOpen, Clock,
  Calendar, Share2, Sparkles, Video, ArrowRight
} from 'lucide-react';
import SermonPlayerModal from '../components/SermonPlayerModal';
import { fetchSermons } from '../api/client';

function getSermonThumbnail(sermon) {
  if (sermon?.thumbnail && !sermon.thumbnail.includes('unsplash.com')) {
    return sermon.thumbnail;
  }
  const match = sermon?.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return sermon?.thumbnail || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80';
}

export default function Sermons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSeries, setSelectedSeries] = useState('All');
  const [activeSermon, setActiveSermon] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    async function loadSermons() {
      setLoading(true);
      const data = await fetchSermons({
        q: searchTerm,
        category: selectedCategory,
        series: selectedSeries
      });
      if (Array.isArray(data)) {
        setSermons(data);
        const sharedId = searchParams.get('id');
        if (sharedId) {
          const found = data.find(s => String(s.id) === String(sharedId));
          if (found) {
            setActiveSermon(found);
            setIsPlayerOpen(true);
          }
        }
      }
      setLoading(false);
    }

    const timer = setTimeout(() => {
      loadSermons();
    }, 250);

    const handleSync = () => loadSermons();
    window.addEventListener('gvc_sermons_updated', handleSync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('gvc_sermons_updated', handleSync);
    };
  }, [searchTerm, selectedCategory, selectedSeries, searchParams]);

  const handleOpenSermon = (sermon) => {
    setActiveSermon(sermon);
    setIsPlayerOpen(true);
  };

  const baseCategories = ['கூடாரப் பண்டிகை', 'Sunday Worship', 'Youth Service', 'Revival Night', 'Family Sunday', 'Bible Study'];
  const dynamicCats = Array.from(new Set([...baseCategories, ...sermons.map(s => s.category).filter(Boolean)]));
  const categories = ['All', ...dynamicCats];

  const baseSeries = ['கூடாரப் பண்டிகை பெருவிழா', 'Victorious Living Series', 'Grace Unveiled', 'Holy Spirit Empowerment', 'Kingdom Family'];
  const dynamicSeries = Array.from(new Set([...baseSeries, ...sermons.map(s => s.series).filter(Boolean)]));
  const seriesList = ['All', ...dynamicSeries];

  return (
    <div className="bg-[#FAF9F6] text-slate-800">

      {/* PAGE HEADER - LIGHT THEME */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-amber-700 block mb-2 sm:mb-3">
            GVC Media Ministry
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-6xl text-[#0B192C] mb-3 sm:mb-6 leading-tight">
            Watch & Listen to <span className="gold-text-gradient">Anointed Sermons</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Feast on the uncompromising Word of God. Receive supernatural faith, revelation, and peace through our weekly teachings.
          </p>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR */}
      <section className="sticky top-[60px] sm:top-[73px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 sm:py-4 px-3 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4">

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sermon, preacher, scripture..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter Dropdowns - Clean 2-column grid on mobile, inline on desktop */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-slate-500 font-bold shrink-0 hidden sm:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-600 truncate cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-slate-500 font-bold shrink-0 hidden sm:inline">Series:</span>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-600 truncate cursor-pointer"
              >
                {seriesList.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Series' : s}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED LATEST MESSAGE - LIGHT CARD */}
      {sermons.length > 0 && !searchTerm && selectedCategory === 'All' && selectedSeries === 'All' && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-7 relative aspect-video bg-slate-950">
              <img
                src={getSermonThumbnail(sermons[0])}
                alt={sermons[0].title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              <button
                onClick={() => handleOpenSermon(sermons[0])}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-amber-600 transition-all">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </button>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 lg:pr-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-4 border border-amber-200/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Featured Message of the Week</span>
              </div>

              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-950 mb-3">
                {sermons[0].title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-4">
                <span className="font-bold text-amber-700">{sermons[0].speaker}</span>
                <span>•</span>
                <span>{sermons[0].date}</span>
                <span>•</span>
                <span>{sermons[0].duration}</span>
              </div>

              {sermons[0].scripture && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-900 mb-6">
                  <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Scripture: <strong>{sermons[0].scripture}</strong></span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {sermons[0].summary}
              </p>

              <button
                onClick={() => handleOpenSermon(sermons[0])}
                className="px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch & Listen Now</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ALL SERMONS GRID */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h3 className="font-serif font-bold text-2xl text-slate-950 mb-8 flex items-center gap-3">
          <span>All Messages</span>
          <span className="text-sm font-sans font-medium text-slate-500">
            ({sermons.length} sermons)
          </span>
        </h3>

        {loading && sermons.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
                <div className="aspect-video rounded-2xl bg-slate-200"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <BookOpen className="w-12 h-12 text-amber-500/70 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-xl text-slate-800 mb-1">
              {searchTerm || selectedCategory !== 'All' || selectedSeries !== 'All'
                ? 'No Sermons Found'
                : 'No Sermons Published Yet'}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {searchTerm || selectedCategory !== 'All' || selectedSeries !== 'All'
                ? 'Try searching with a different keyword or resetting filters.'
                : 'Sermons published through the Admin Portal will appear here automatically.'}
            </p>
            {(searchTerm || selectedCategory !== 'All' || selectedSeries !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedSeries('All'); }}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={getSermonThumbnail(sermon)}
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  <button
                    onClick={() => handleOpenSermon(sermon)}
                    className="absolute inset-0 flex items-center justify-center"
                    aria-label="Play Sermon"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-amber-600 transition-all">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-sm font-medium">
                      {sermon.series || sermon.category}
                    </span>
                    <span className="font-semibold text-amber-300">
                      {sermon.duration || '45 mins'}
                    </span>
                  </div>
                </div>

                {/* Sermon Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-amber-700">{sermon.speaker}</span>
                      <span>{sermon.date}</span>
                    </div>

                    <h4 className="font-serif font-bold text-lg text-slate-950 group-hover:text-amber-700 transition-colors mb-2 line-clamp-2">
                      {sermon.title}
                    </h4>

                    {sermon.scripture && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-3">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>{sermon.scripture}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {sermon.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenSermon(sermon)}
                      className="text-xs font-bold text-slate-950 hover:text-amber-700 inline-flex items-center gap-1"
                    >
                      <span>Listen / Watch</span> &rarr;
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">{sermon.language}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sermon Player Modal */}
      <SermonPlayerModal
        sermon={activeSermon}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

    </div>
  );
}
