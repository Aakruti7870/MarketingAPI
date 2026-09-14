import React from 'react';

export default function LuminaLogo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: { mark: 'w-7 h-7', text: 'text-lg', badge: 'text-[9px]' },
    md: { mark: 'w-9 h-9', text: 'text-xl', badge: 'text-[10px]' },
    lg: { mark: 'w-12 h-12', text: 'text-2xl', badge: 'text-xs' },
    xl: { mark: 'w-16 h-16', text: 'text-3xl', badge: 'text-xs' },
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 360 Radial Geometric Mark */}
      <div className={`relative ${current.mark} shrink-0 flex items-center justify-center`}>
        {/* Ambient Halo */}
        <div className="absolute inset-0 rounded-full bg-[#0052FF]/10 blur-sm pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          <defs>
            <linearGradient id="luminaGradComponent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052FF" />
              <stop offset="100%" stopColor="#4D7CFF" />
            </linearGradient>
            <linearGradient id="luminaCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#0052FF" />
            </linearGradient>
          </defs>

          {/* 360-Degree Radial Orbit */}
          <circle
            cx="50"
            cy="50"
            r="43"
            stroke="url(#luminaGradComponent)"
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeOpacity="0.45"
          />
          <circle cx="50" cy="50" r="37" stroke="#0052FF" strokeWidth="1.2" strokeOpacity="0.2" />

          {/* 4 Precision Luminous Blades (Refraction Symmetry) */}
          <path
            d="M 50 14 C 68 14 82 28 84 46 C 72 44 60 38 52 28 Z"
            fill="url(#luminaGradComponent)"
            opacity="0.95"
          />
          <path
            d="M 86 50 C 86 68 72 82 54 84 C 56 72 62 60 72 52 Z"
            fill="url(#luminaGradComponent)"
            opacity="0.9"
          />
          <path
            d="M 50 86 C 32 86 18 72 16 54 C 28 56 40 62 48 72 Z"
            fill="url(#luminaGradComponent)"
            opacity="0.95"
          />
          <path
            d="M 14 50 C 14 32 28 18 46 16 C 44 28 38 40 28 48 Z"
            fill="url(#luminaGradComponent)"
            opacity="0.9"
          />

          {/* Inner Geometric Diamond */}
          <polygon
            points="50,26 74,50 50,74 26,50"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          <polygon
            points="50,30 70,50 50,70 30,50"
            fill="url(#luminaCoreGrad)"
            opacity="0.5"
          />

          {/* Core Light Emitting Node */}
          <circle cx="50" cy="50" r="7" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="4.5" fill="#0052FF" />
          <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" />

          {/* 4 Precision Coordinates */}
          <circle cx="50" cy="7" r="3.5" fill="#0052FF" />
          <circle cx="93" cy="50" r="3.5" fill="#4D7CFF" />
          <circle cx="50" cy="93" r="3.5" fill="#0052FF" />
          <circle cx="7" cy="50" r="3.5" fill="#4D7CFF" />
        </svg>
      </div>

      {/* Typography Lockup */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight font-display font-black">
            <span className={`text-[#0F172A] ${current.text} tracking-wider`}>LUMINA</span>
            <span
              className={`bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] bg-clip-text text-transparent font-sans font-black ${current.text} ml-0.5`}
            >
              360
            </span>
          </div>
          <span
            className={`font-mono ${current.badge} tracking-[0.2em] uppercase font-bold text-[#0052FF] opacity-90 mt-0.5`}
          >
            Autonomous AI OS
          </span>
        </div>
      )}
    </div>
  );
}
