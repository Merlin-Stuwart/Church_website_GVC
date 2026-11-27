import React, { useState, useEffect } from 'react';
import { Clock, Radio, Play } from 'lucide-react';
import { useChurch } from '../context/ChurchContext';

export default function ServiceCountdown({ onWatchLive }) {
  const { settings } = useChurch();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false
  });

  useEffect(() => {
    function calculateCountdown() {
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if Sunday service is currently live (Sunday 9:30 AM to 11:30 AM)
      if (currentDay === 0 && ((currentHour === 9 && currentMinute >= 30) || (currentHour === 10) || (currentHour === 11 && currentMinute <= 30))) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }

      // Calculate next Sunday at 09:30 AM
      const nextSunday = new Date(now);
      const daysUntilSunday = (7 - currentDay) % 7;
      
      if (currentDay === 0 && (currentHour > 11 || (currentHour === 11 && currentMinute > 30))) {
        nextSunday.setDate(now.getDate() + 7);
      } else if (daysUntilSunday > 0) {
        nextSunday.setDate(now.getDate() + daysUntilSunday);
      }

      nextSunday.setHours(9, 30, 0, 0);

      const diff = nextSunday.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds, isLive: false });
      }
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isLive) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-4 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
          </span>
          <div>
            <h4 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
              Sunday Worship Service Is LIVE Now!
            </h4>
            <p className="text-slate-600 text-xs sm:text-sm">
              Tune in to experience the presence of God and receive your word of victory.
            </p>
          </div>
        </div>

        <button
          onClick={onWatchLive}
          className="w-full sm:w-auto justify-center shrink-0 px-6 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Join Live Stream</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 border border-amber-200/80 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-xl shadow-amber-500/5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 block">
              Next Sunday Service Begins In
            </span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Sunday Worship Service: {settings?.serviceTimings || '09:30 AM – 11:30 AM'}
            </h4>
          </div>
        </div>

        {/* Countdown digits */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-16 h-11 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-amber-700 text-base sm:text-xl shadow-sm">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Days</span>
          </div>

          <span className="text-slate-300 font-bold text-base sm:text-lg mb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-16 h-11 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-base sm:text-xl shadow-sm">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Hours</span>
          </div>

          <span className="text-slate-300 font-bold text-base sm:text-lg mb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-16 h-11 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-base sm:text-xl shadow-sm">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Mins</span>
          </div>

          <span className="text-slate-300 font-bold text-base sm:text-lg mb-4">:</span>

          <div className="flex flex-col items-center">
            <div className="w-12 sm:w-16 h-11 sm:h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-amber-700 text-base sm:text-xl shadow-sm">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">Secs</span>
          </div>
        </div>

      </div>
    </div>
  );
}
