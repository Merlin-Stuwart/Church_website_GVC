import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, BookOpen, Users, Compass, CheckCircle, 
  Sparkles, Award, ArrowRight, ChevronRight, Calendar, Flag
} from 'lucide-react';
import { CHURCH_INFO, CORE_BELIEFS, LEADERSHIP_TEAM, CHURCH_STATS, DEFAULT_MILESTONES } from '../data/mockData';
import { useChurch } from '../context/ChurchContext';

export default function About({ onOpenPlanVisit }) {
  const { settings } = useChurch();
  const [activeBeliefTab, setActiveBeliefTab] = useState(0);

  const churchStats = settings?.churchStats && settings.churchStats.length > 0 
    ? settings.churchStats 
    : CHURCH_STATS;

  const milestones = settings?.milestones && settings.milestones.length > 0 
    ? settings.milestones 
    : DEFAULT_MILESTONES;

  const coreBeliefs = settings?.coreBeliefs && settings.coreBeliefs.length > 0 
    ? settings.coreBeliefs 
    : CORE_BELIEFS;

  const leadershipTeam = settings?.leadershipTeam && settings.leadershipTeam.length > 0 
    ? settings.leadershipTeam 
    : LEADERSHIP_TEAM;

  return (
    <div className="bg-[#FAF9F6] text-slate-800">
      
      {/* PAGE HEADER */}
      <section className="bg-gradient-to-b from-amber-50/70 via-white to-[#FAF9F6] py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center text-left">
            
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <span className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white border border-amber-300 text-[11px] sm:text-xs font-bold text-amber-900 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Our Heritage & Purpose</span>
              </span>

              <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-6xl text-[#0B192C] leading-tight">
                Rooted in Grace, Built on Faith, <span className="gold-text-gradient italic">Growing in Victory.</span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-lg leading-relaxed max-w-2xl">
                Grace Victory Church exists to build whole disciples of Jesus Christ who manifest God’s love, walk in supernatural power, and bring transforming hope to their families, workplace, and world.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/contact"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all"
                >
                  Join Us This Sunday
                </Link>
                <Link
                  to="/contact"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  Visit & Map
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {churchStats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-left">
                    <span className="font-serif font-extrabold text-4xl text-amber-700 block mb-1">{stat.value}</span>
                    <span className="text-xs font-bold text-slate-900 block">{stat.label}</span>
                    {stat.desc && <p className="text-[11px] text-slate-500 mt-1">{stat.desc}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MISSION, VISION & DNA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-950 mb-3">Our Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be a vibrant, Christ-centered, multicultural church that reveals the Father’s heart, manifests the power of the Holy Spirit, and equips every believer to reign victoriously in life.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-6 block">Ephesians 1:17-19</span>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-950 mb-3">Our Mission</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Loving God passionately, loving people unconditionally, building strong families, and taking the good news of Jesus Christ across cities, villages, and nations.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-6 block">Matthew 28:19-20</span>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-2xl text-slate-950 mb-3">Our Core DNA</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Anchored in Infallible Biblical Truth, overflowing with Grace, hungry for Revival, committed to Radical Generosity, and relentless in Compassion.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-6 block">2 Corinthians 2:14</span>
          </div>

        </div>
      </section>

      {/* 28-YEAR HISTORICAL TIMELINE */}
      <section className="bg-[#F8F6F0] py-20 px-4 sm:px-6 lg:px-8 border-y border-amber-200/60">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-800 block mb-2">
              Our Journey of Faith
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-5xl text-slate-950 mb-3">
              Milestones of God’s Faithfulness
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              From a small prayer gathering in 1998 to a global family today, every step has been guided by God’s grace.
            </p>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-400 space-y-12 text-left">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative group">
                {/* Node circle */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 rounded-full bg-white border-4 border-amber-500 shadow-md"></div>
                
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    {m.year}
                  </span>
                  <h4 className="font-serif font-bold text-xl text-slate-950 mb-2">
                    {m.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* STATEMENT OF FAITH - INTERACTIVE TABBED VIEWER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest font-extrabold text-amber-700 block mb-2">
            Biblical Foundation
          </span>
          <h2 className="font-serif font-extrabold text-3xl sm:text-5xl text-slate-950 mb-3">
            What We Believe
          </h2>
          <p className="text-slate-600 text-base">
            Our beliefs are firmly anchored in the historic Christian faith and the unchanging truths of the Holy Bible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreBeliefs.map((belief, idx) => (
            <div 
              key={idx}
              className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-4 inline-block">
                  {belief.verse}
                </span>
                <h3 className="font-serif font-bold text-xl text-slate-950 mb-2.5">
                  {belief.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {belief.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PASTORAL LEADERSHIP */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 text-left">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-700 block mb-2">
              Leadership & Shepherds
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-5xl text-slate-950 mb-3">
              Our Pastoral Leadership Team
            </h2>
            <p className="text-slate-600 text-base">
              Servant leaders dedicated to prayer, biblical truth, and nurturing the flock of God with love and integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leadershipTeam.map((leader, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-900">
                  {leader.image ? (
                    <img 
                      src={leader.image} 
                      alt={leader.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.target.src = '/images/pastor.jpg'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-amber-400 p-4 text-center">
                      <Users className="w-16 h-16 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">{leader.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      {leader.role}
                    </span>
                    <h3 className="font-serif font-bold text-xl text-white">
                      {leader.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {leader.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/contact"
              className="inline-block px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-xl shadow-amber-500/20 transition-all"
            >
              Meet Our Pastors This Sunday
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
