import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Heart, Sparkles, Phone, MapPin, ChevronRight, Clock, Shield, Lock
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export default function Navbar({ onOpenPlanVisit, onOpenAdminAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const church = useChurch();
  const settings = church?.settings || {};
  const isAdminLoggedIn = Boolean(church?.isAdminLoggedIn);

  // Secret Mobile Admin Trigger: Rapid 3-tap on the Church Cross icon opens Admin Auth Modal
  const tapTimesRef = useRef([]);
  const handleLogoSecretTap = (e) => {
    const now = Date.now();
    // Keep taps within the last 900ms window
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 900);
    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length >= 3) {
      e.preventDefault();
      e.stopPropagation();
      tapTimesRef.current = [];
      if (onOpenAdminAuth) {
        onOpenAdminAuth();
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Ministries', path: '/ministries' },
    { name: 'Sermons', path: '/sermons' },
    { name: 'Events', path: '/events' },
    { name: 'Prayer & Testimonies', path: '/prayer-wall' },
    { name: 'Contact & Visit', path: '/contact' },
  ];

  return (
    <>
      {/* Top Architecture Bar - Sleek 1-Line on Mobile, Rich on Desktop */}
      <div className="bg-[#FAF9F6] border-b border-slate-200/70 text-[10px] sm:text-[11px] py-1 sm:py-1.5">
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
          
          {/* Mobile Clean 1-Line View (< sm) */}
          <div className="flex sm:hidden items-center justify-between w-full text-[10px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>Sunday: <strong className="text-slate-900 font-bold">{settings.serviceTimings || '09:30 AM – 11:30 AM'}</strong></span>
            </span>
            <a 
              href={`tel:${(settings.phone || '+91 93605 88397').replace(/[^0-9+]/g, '')}`} 
              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 shrink-0 ml-2"
            >
              <Phone className="w-2.5 h-2.5 text-amber-600" />
              <span>{settings.phone || '+91 93605 88397'}</span>
            </a>
          </div>

          {/* Desktop Rich View (>= sm) */}
          <div className="hidden sm:flex items-center justify-between w-full">
            {/* Service Timings Pill */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-900 border border-amber-500/20 text-[10px] tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sunday Worship
              </span>
              <span className="text-slate-600 font-medium">
                Sunday Service: <strong className="text-slate-900 font-bold">{settings.serviceTimings || '09:30 AM – 11:30 AM'}</strong>
              </span>
            </div>

            {/* Quick Access Info */}
            <div className="flex items-center gap-4 font-semibold text-slate-500">
              <Link to="/contact" className="hidden md:inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="max-w-[220px] truncate">{(settings.address || 'Vattamalai, Tamil Nadu').replace(/^Grace Victory Church,\s*/i, '')}</span>
              </Link>
              <span className="hidden md:inline text-slate-300">|</span>
              <a href={`tel:${(settings.phone || '+91 93605 88397').replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{settings.phone || '+91 93605 88397'}</span>
              </a>
              {isAdminLoggedIn && (
                <>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <Link 
                    to="/admin" 
                    className="text-amber-800 font-bold hover:text-amber-950 text-[11px] flex items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 transition-colors"
                  >
                    <Shield className="w-3 h-3 text-amber-700" />
                    <span>Admin Panel</span>
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Navbar - Clean, High-Contrast Luxury White */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.06)] py-2 sm:py-2.5 border-b border-slate-200/90' 
          : 'bg-white py-2.5 sm:py-3 border-b border-slate-200/60'
      }`}>
        <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            
            {/* Ultra-Clean Modern Church Brand Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 shrink">
              <div 
                onClick={handleLogoSecretTap}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#0B192C] to-[#162D4A] p-1.5 sm:p-2 flex items-center justify-center shadow-md border border-amber-400/30 shrink-0 group-hover:scale-105 transition-transform duration-300 cursor-pointer select-none"
                title="Grace Victory Church"
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7V2z"/>
                </svg>
              </div>
              <div className="flex flex-col text-left leading-none min-w-0">
                {(() => {
                  const words = (settings.churchName || 'Grace Victory Church').trim().split(/\s+/);
                  const lastWord = words.length > 1 ? words[words.length - 1] : '';
                  const mainPart = words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
                  return (
                    <div className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                      <span className="font-serif font-black text-xs sm:text-base md:text-xl text-[#0B192C] tracking-tight sm:tracking-wide uppercase">
                        {mainPart}
                      </span>
                      {lastWord && (
                        <span className="font-serif font-black text-xs sm:text-base md:text-xl text-amber-600 tracking-tight sm:tracking-wide uppercase">
                          {lastWord}
                        </span>
                      )}
                    </div>
                  );
                })()}
                <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.10em] sm:tracking-[0.18em] text-slate-400 uppercase mt-0.5 truncate hidden xs:block">
                  Vattamalai • Established {settings.foundedYear || '1998'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive 
                        ? 'text-amber-800 font-bold' 
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-amber-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons: Prominent GIVE Button */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link
                to="/giving"
                className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Heart className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Give Online</span>
              </Link>
            </div>

            {/* Mobile Actions: Compact Give + Hamburger Menu (Visible ONLY on Mobile & Tablet < lg) */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/giving"
                className="px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-sm flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
              >
                <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950" />
                <span>Give</span>
              </Link>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'bg-amber-50 text-amber-900 font-bold border-l-4 border-amber-600' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
              <Link
                to="/giving"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-full text-center text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 shadow-md flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-slate-950" />
                <span>Tithes & Online Giving</span>
              </Link>

              {isAdminLoggedIn ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/admin';
                  }}
                  className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Open Admin Panel</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onOpenAdminAuth) onOpenAdminAuth();
                  }}
                  className="w-full py-2 text-center text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Pastoral & Admin Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
