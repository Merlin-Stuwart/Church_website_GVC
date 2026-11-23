import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, ChevronRight, 
  Youtube, Facebook, Instagram, MessageCircle, Lock
} from 'lucide-react';
import { useChurch } from '../context/ChurchContext';
import { CHURCH_INFO } from '../data/mockData';
import { getGmailComposeUrl } from '../api/client';

export default function Footer({ onOpenAdminAuth }) {
  const church = useChurch();
  const settings = church?.settings || {};
  const isAdminLoggedIn = Boolean(church?.isAdminLoggedIn);

  return (
    <footer className="bg-[#071320] text-slate-300 border-t border-slate-800">
      {/* Top Slim Scripture Strip */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-2 sm:py-2.5 px-4 text-white text-xs font-medium shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-center sm:text-left">
          <p className="font-serif italic text-xs sm:text-sm">
            {settings?.verse || '“Now thanks be unto God, which always causeth us to triumph in Christ!” — 2 Cor 2:14'}
          </p>
          <Link
            to="/prayer-wall"
            className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white text-slate-950 hover:bg-slate-100 transition-colors shrink-0 inline-flex items-center gap-1 shadow-sm"
          >
            <span>Need Prayer?</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Footer - Compact, Sleek & Modern */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 text-xs">
          
          {/* Col 1: Brand & Social */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 flex items-center justify-center shrink-0 shadow-md">
                <div className="w-full h-full bg-[#071320] rounded-[10px] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 2h2v7h7v2h-7v11h-2V11H4V9h7V2z"/>
                  </svg>
                </div>
              </div>
              <div className="leading-tight">
                <h3 className="font-serif font-black text-xs sm:text-sm text-white tracking-wide uppercase">
                  {settings?.churchName || CHURCH_INFO.name}
                </h3>
                <p className="text-[10px] text-amber-400 font-medium">
                  {settings?.tamilName || CHURCH_INFO.tamilName}
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
              Apostolic, Bible-believing family rooted in the gospel of grace. Established {settings?.foundedYear || '1998'} in Vattamalai.
            </p>

            <div className="flex items-center gap-2 pt-0.5">
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500/40 transition-colors" title="YouTube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/40 transition-colors" title="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-500/40 transition-colors" title="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              {(() => {
                const digits = (settings?.whatsappNumber || '919360588397').replace(/[^0-9]/g, '');
                const waNum = digits.length === 10 ? `91${digits}` : (digits || '919360588397');
                return (
                  <a href={`https://wa.me/${waNum}`} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors" title="WhatsApp">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          </div>

          {/* Col 2: Quick Links (Clean 2-col on mobile) */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Explore GVC
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-2 gap-y-1 text-[11px]">
              <Link to="/about" className="hover:text-amber-400 transition-colors truncate">About & Pastors</Link>
              <Link to="/ministries" className="hover:text-amber-400 transition-colors truncate">Ministries</Link>
              <Link to="/sermons" className="hover:text-amber-400 transition-colors truncate">Sermons & Media</Link>
              <Link to="/events" className="hover:text-amber-400 transition-colors truncate">Church Events</Link>
              <Link to="/prayer-wall" className="hover:text-amber-400 transition-colors truncate">Prayer Wall</Link>
              <Link to="/giving" className="hover:text-amber-400 transition-colors truncate">Give Online</Link>
              {isAdminLoggedIn ? (
                <Link to="/admin" className="text-amber-400 hover:underline font-bold truncate">Admin Portal</Link>
              ) : (
                <button onClick={onOpenAdminAuth} className="text-slate-500 hover:text-amber-400 text-left cursor-pointer truncate" title="Admin Portal (Ctrl+Shift+A)">
                  Admin Access
                </button>
              )}
            </div>
          </div>

          {/* Col 3: Service Schedule (Compact) */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Service Schedule
            </h4>
            <div className="space-y-1 text-[11px]">
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-amber-300">Sunday Service</span>
                <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">{settings.serviceTimings || '09:30 AM'}</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Wednesday Study</span>
                <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">{settings.wednesdayTiming || '07:00 PM'}</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-300">Friday Fasting</span>
                <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">{settings.fridayTiming || '10:30 AM'}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-2">
            <h4 className="font-serif font-bold text-white text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Contact & Location
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{settings.address || 'Grace Victory Church, Vattamalai, Tamil Nadu, India'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                <a href={`tel:${(settings.phone || '+91 93605 88397').replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors font-medium">
                  {settings.phone || '+91 93605 88397'}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                <a 
                  href={getGmailComposeUrl({ to: settings.email || 'contact@gracevictorychurch.org' })} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors truncate"
                >
                  {settings.email || 'contact@gracevictorychurch.org'}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright - Slim & Minimal */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {settings?.churchName || CHURCH_INFO.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/about" className="hover:text-amber-400 transition-colors">Beliefs</Link>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Location Map</Link>
            <Link to="/giving" className="hover:text-amber-400 transition-colors">Donate</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
