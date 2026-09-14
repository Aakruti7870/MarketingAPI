import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Matches Poster 2:
 * "Connect Faster. Convert Smarter."
 * "We don't just reach your audience — we make them respond."
 * Dynamic agility leap visual, high-contrast typography, interactive response simulator.
 */
export default function SpeedConversionHeroSection() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-[36px] bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl relative">
        {/* Subtle Ambient Backing Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-14 lg:p-16 relative z-10">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Connect Faster. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                Convert Smarter.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
              We don't just reach your audience — <span className="text-white font-bold underline decoration-cyan-400 decoration-2">we make them respond.</span>
            </p>

            {/* Performance Metric Counters */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Response Latency</span>
                <span className="text-lg sm:text-xl font-black text-cyan-400">&lt; 1.2s</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Direct Read Rate</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">98.4%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Conversion Lift</span>
                <span className="text-lg sm:text-xl font-black text-indigo-300">+3.8x</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Agility Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 group">
              <div className="relative h-[320px] sm:h-[380px] w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=1200&q=80"
                  alt="Dynamic speed and agile leap metaphor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter contrast-115 brightness-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Floating Velocity Indicator */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  MAX VELOCITY
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
