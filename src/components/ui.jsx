import React from 'react';

export function ContainerLayout({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-[#FAFAFA] text-[#0F172A] font-sans antialiased selection:bg-[#0052FF] selection:text-white ${className}`}>
      {children}
    </div>
  );
}

// Section Label Component following the Minimalist Modern design system
export function SectionLabel({ children, className = '', pulse = true }) {
  return (
    <div className={`inline-flex items-center gap-2.5 rounded-full border border-[#0052FF]/30 bg-[#0052FF]/5 px-4 py-1.5 ${className}`}>
      <span className={`h-2 w-2 rounded-full bg-[#0052FF] ${pulse ? 'animate-pulse-accent' : ''}`} />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#0052FF] font-medium">
        {children}
      </span>
    </div>
  );
}

export function Card({ children, className = '', hover = true, featured = false }) {
  if (featured) {
    return (
      <div className={`rounded-2xl bg-gradient-to-br from-[#0052FF] via-[#4D7CFF] to-[#0052FF] p-[2px] shadow-accent ${hover ? 'hover:shadow-accent-lg hover:-translate-y-0.5' : ''} transition-all duration-300 ${className}`}>
        <div className="h-full w-full rounded-[calc(1rem-2px)] bg-white p-6 sm:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-md transition-all duration-300 ${
        hover ? 'hover:shadow-xl hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function InvertedCard({ children, className = '' }) {
  return (
    <div className={`bg-[#0F172A] text-white border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden bg-dot-pattern ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0052FF] focus:ring-offset-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white shadow-sm hover:shadow-accent-lg hover:-translate-y-0.5 hover:brightness-110",
    secondary: "bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] hover:border-[#0052FF]/30 hover:shadow-md",
    ghost: "bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100",
    inverted: "bg-white text-[#0F172A] hover:bg-slate-100 hover:shadow-lg hover:-translate-y-0.5",
    outline: "bg-transparent border border-[#E2E8F0] text-[#0F172A] hover:border-[#0052FF] hover:bg-white",
    dark: "bg-[#0F172A] hover:bg-slate-800 text-white shadow-md hover:-translate-y-0.5"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 h-9",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 h-11",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5 h-13 sm:h-14 font-semibold"
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, status = 'default', className = '' }) {
  const styles = {
    default: "bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]",
    accent: "bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/25 font-mono uppercase tracking-[0.1em]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    info: "bg-blue-50 text-blue-900 border-blue-200",
    purple: "bg-purple-50 text-purple-900 border-purple-200",
    cyan: "bg-cyan-50 text-cyan-900 border-cyan-200",
    glass: "bg-white/80 text-[#0F172A] border-white/90 shadow-sm backdrop-blur-md"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.default} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, subtext, trend, icon: Icon, featured = false }) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-3 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${featured ? 'border-[#0052FF]/40 ring-1 ring-[#0052FF]/20' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium text-[#64748B] uppercase tracking-[0.12em]">{label}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-sans">{value}</div>
      <div className="flex items-center justify-between pt-1 text-xs">
        {subtext && <span className="text-[#64748B] font-medium">{subtext}</span>}
        {trend && (
          <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
