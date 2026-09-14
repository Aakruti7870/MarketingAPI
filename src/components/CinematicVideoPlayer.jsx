import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

/**
 * Cinematic Auto-Advancing Video/Image Reel Player
 * Automatically advances continuously without pause, change controls, or timing displays.
 */
export default function CinematicVideoPlayer({ slide, onCompleteNext }) {
  const containerRef = useRef(null);

  const TOTAL_DURATION_MS = 5000;

  useEffect(() => {
    const timer = setInterval(() => {
      if (onCompleteNext) {
        onCompleteNext();
      }
    }, TOTAL_DURATION_MS);

    return () => clearInterval(timer);
  }, [slide, onCompleteNext]);

  // Cinematic metadata by slide
  const cinematicConfig = {
    healthcare: {
      headline: 'CLINICAL TRIAGE & PASS PROTOCOL',
      subtitle: 'Biometric Intake • E.164 Identity Gate • Instant Pass Issue',
      accentColor: 'from-emerald-500 to-teal-400',
      glowColor: 'rgba(16, 185, 129, 0.35)',
      badge: '4K HDR • 60 FPS',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      telemetry: ['AI TRIAGE: ACTIVE', 'META CLOUD: CONNECTED', 'LATENCY: 0.9s'],
    },
    education: {
      headline: 'ADMISSION COPILOT & DEMO MATRIX',
      subtitle: 'Curriculum Parsing • Lead Scoring • Instant 3-Day Passes',
      accentColor: 'from-indigo-500 to-purple-400',
      glowColor: 'rgba(99, 102, 241, 0.35)',
      badge: '4K MASTERCLASS REEL',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
      telemetry: ['PARENT PIPELINE: 99.1%', 'DEMO PASS: GENERATED', 'STATUS: SYNCED'],
    },
    broadcaster: {
      headline: 'OMNICHANNEL NEURAL ENERGY CORE',
      subtitle: '1-to-1 Masked Conduits: WhatsApp • Telegram • Instagram • Email',
      accentColor: 'from-cyan-400 to-blue-500',
      glowColor: 'rgba(6, 182, 212, 0.35)',
      badge: '5,000 MSG/MIN DISPATCH',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      telemetry: ['SHIELDED LEAKS: 0%', 'CHANNELS: 6 CONCURRENT', 'QUEUE: CLEARED'],
    },
    wholesale: {
      headline: 'IS 456 DYNAMIC CONCRETE & STEEL GUARD',
      subtitle: 'Dynamic Spot Calculator • Automated Counter-Offer Defense',
      accentColor: 'from-amber-400 to-orange-500',
      glowColor: 'rgba(245, 158, 11, 0.35)',
      badge: 'MARGIN SAFEGUARD 100%',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      telemetry: ['MARGIN FLOOR: LOCKED', 'IS 456 SPECS: COMPILED', 'UPI LINK: READY'],
    },
    googlemaps: {
      headline: 'GOOGLE MAPS 3-PACK AI SENTINEL',
      subtitle: 'Autonomous Geo-Tag Sync • Sub-30s Review Neutralizer',
      accentColor: 'from-emerald-400 to-sky-400',
      glowColor: 'rgba(56, 189, 248, 0.35)',
      badge: 'LOCAL 3-PACK RANK #1',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      telemetry: ['LOCAL RANK: #1', 'REVIEWS: 4.9★ DEFENDED', 'GBP SYNC: 100%'],
    },
  };

  const current = cinematicConfig[slide.id] || cinematicConfig.healthcare;

  return (
    <div
      ref={containerRef}
      id="cinematic-video-reel"
      className="relative w-full rounded-3xl overflow-hidden bg-slate-950 text-white shadow-2xl border border-slate-800 aspect-[16/10] sm:aspect-[16/9]"
    >
      {/* Background Cinematic Artwork with Continuous Ken Burns Motion */}
      <motion.div
        key={slide.id}
        initial={{ scale: 1, x: 0, opacity: 0.9 }}
        animate={{
          scale: 1.08,
          x: [0, -8, 6, 0],
          opacity: 1,
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src={current.image}
          alt={current.headline}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-65 contrast-110 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30"></div>
        <div
          className="absolute inset-0 opacity-40 mix-blend-color-dodge pointer-events-none"
          style={{ background: `radial-gradient(circle at 70% 30%, ${current.glowColor}, transparent 60%)` }}
        ></div>
      </motion.div>

      {/* Cinematic CRT Scanlines & Lens Flares */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-60"></div>
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>

      {/* Top HUD Status Bar without time numbers */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE CINEMATIC REEL
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/10 text-slate-300 font-semibold text-[10px] border border-white/10">
            {current.badge}
          </span>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-end gap-0.5 h-3 px-2 py-0.5 bg-black/40 rounded border border-white/10">
          {[40, 90, 60, 100, 75, 45, 80].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.5}%`] }}
              transition={{ duration: 0.4 + i * 0.08, repeat: Infinity, repeatType: 'reverse' }}
              className="w-0.5 bg-cyan-400 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Central Telemetry and Cinematic Information */}
      <div className="relative z-10 h-[65%] flex flex-col justify-center px-6 sm:px-10 pb-4">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-6 rounded-full bg-gradient-to-r ${current.accentColor}`}></span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-300 font-bold">
              INDUSTRY ARCHITECTURE
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {current.headline}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md line-clamp-2 drop-shadow">
            {current.subtitle}
          </p>

          {/* Real-time Telemetry Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {current.telemetry.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/15 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
