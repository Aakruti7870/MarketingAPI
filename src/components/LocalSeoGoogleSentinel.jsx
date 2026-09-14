import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  Star,
  Search,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Sparkles,
  Bot,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  BarChart2,
} from 'lucide-react';

/**
 * Matches Poster 6:
 * "Be seen where it matters - On top of Google"
 * Featuring:
 * - SEO-Friendly Content
 * - Technical SEO
 * - On-Page & Off-Page SEO
 * - Keyword Research & Strategy
 * - Performance Tracking & Reports
 * Matte black robot AI sentinel graphic, floating Google & LinkedIn badges, green cyber lighting.
 */
export default function LocalSeoGoogleSentinel() {
  const [activeKeyword, setActiveKeyword] = useState('cardiologist near me');

  const KEYWORDS = [
    { query: 'cardiologist near me', rank: '#1', reviews: '4.9★ (480 reviews)', intent: 'High Local Intent' },
    { query: 'best class 10 coaching vashi', rank: '#1', reviews: '4.9★ (320 reviews)', intent: 'Demo Masterclass Booking' },
    { query: 'fe 550d tmt steel suppliers navi mumbai', rank: '#1', reviews: '4.8★ (210 reviews)', intent: 'Bulk Wholesale Quote' },
  ];

  const PILL_BADGES = [
    'SEO-Friendly Content',
    'Technical SEO',
    'On-Page & Off-Page SEO',
    'Keyword Research & Strategy',
    'Performance Tracking & Reports',
  ];

  return (
    <section id="local-seo-sentinel" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Visual: Matte Black Robot Mascot & Google Search Rank #1 Display */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-md rounded-[32px] overflow-hidden bg-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-2xl">
            {/* Green Cyber Accent Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Robot Mascot in Pod Chair Graphic Visual */}
            <div className="relative z-10 text-center space-y-4 py-4">
              {/* Pod Chair & Laptop Simulation Container */}
              <div className="relative w-48 h-48 mx-auto rounded-full bg-slate-900 border-2 border-emerald-500/40 p-3 shadow-2xl shadow-emerald-500/20 flex items-center justify-center">
                {/* Floating Google & LinkedIn Badges */}
                <div className="absolute -top-2 -left-2 w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black text-sm shadow-lg border border-slate-200">
                  <span className="text-red-500 font-extrabold text-base">G</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-black text-sm shadow-lg">
                  <span className="text-white font-bold text-xs">in</span>
                </div>

                {/* Robot Head with Glowing Headphones & Laptop */}
                <div className="w-28 h-28 rounded-2xl bg-slate-950 border border-emerald-500/50 flex flex-col items-center justify-center p-3 text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-sm"></span>
                  </div>
                  <Bot className="w-10 h-10 text-emerald-400" />
                  <span className="text-[8px] font-mono text-emerald-300 font-bold tracking-widest">
                    SEO SENTINEL
                  </span>
                </div>
              </div>

              {/* Simulated Google Search Result Rank #1 */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 text-left shadow-lg border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">google.com/search?q={activeKeyword}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                    RANK #1 IN 3-PACK
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-blue-800 hover:underline cursor-pointer">
                  Metro Health Clinic & Diagnostic Hub - Vashi Sector 17
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-amber-500 font-bold flex items-center">
                    4.9 <Star className="w-3 h-3 fill-amber-400 ml-0.5" />
                  </span>
                  <span className="text-slate-500">(1,280+ Meta & Google Reviews)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Autonomous review defense active: Sub-30s AI response rate. Auto WhatsApp booking link attached.
                </p>
              </div>
            </div>

            {/* Bottom Status */}
            <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Geo-Tagged Sync
              </span>
              <span>Google Cloud & Maps API</span>
            </div>
          </div>
        </div>

        {/* Right Column: Exact Copy & Pills Matching Poster 6 */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>LOCAL SEARCH DOMINANCE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-[1.1]">
            Be seen where it matters — <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
              On top of Google.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            When high-intent customers search for your service nearby, our autonomous agent ensures you own the coveted Google Maps 3-Pack with instant review responses and direct WhatsApp conversions.
          </p>

          {/* 5 Exact Pills from Poster 6 */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {PILL_BADGES.map((pill, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{pill}</span>
              </span>
            ))}
          </div>

          {/* Live Keyword Search Switcher */}
          <div className="pt-4 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Simulate Live Local Keywords:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {KEYWORDS.map((k, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveKeyword(k.query)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                    activeKeyword === k.query
                      ? 'bg-slate-950 text-white border-slate-900 shadow-sm'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate">{k.query}</span>
                    <span className="text-emerald-500 font-mono ml-1">{k.rank}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
