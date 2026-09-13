import React from 'react';

export function ContainerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EEF9] via-[#F3EBF9] to-[#E3EDF7] text-[#0F172A] font-sans antialiased">
      {children}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white/75 backdrop-blur-xl border border-white/90 rounded-3xl p-6 shadow-xl shadow-indigo-950/5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/10 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 active:scale-[0.98]";
  const variants = {
    primary: "bg-[#1E3A8A] hover:bg-[#1E293B] text-white shadow-lg shadow-blue-900/20 focus:ring-blue-300",
    secondary: "bg-white/90 hover:bg-white text-slate-900 border border-slate-200/80 shadow-sm focus:ring-slate-200",
    gradient: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 focus:ring-indigo-300",
    outline: "bg-transparent border border-slate-300 hover:bg-white/50 text-slate-800 focus:ring-slate-200"
  };
  const sizes = {
    sm: "px-4 py-2 text-xs gap-2",
    md: "px-5 py-2.5 text-sm gap-2.5",
    lg: "px-7 py-3.5 text-base gap-3"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, status = 'default', className = '' }) {
  const styles = {
    default: "bg-white/90 text-slate-800 border-slate-200 shadow-sm",
    success: "bg-emerald-50/90 text-emerald-800 border-emerald-200 shadow-sm",
    warning: "bg-amber-50/90 text-amber-800 border-amber-200 shadow-sm",
    info: "bg-blue-50/90 text-blue-900 border-blue-200 shadow-sm",
    purple: "bg-purple-50/90 text-purple-900 border-purple-200 shadow-sm"
  };
  return (
    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${styles[status]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, subtext, trend }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/90 rounded-3xl p-6 space-y-2 shadow-lg shadow-indigo-950/5">
      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="text-3xl font-black text-[#0F172A] tracking-tight">{value}</div>
      {subtext && <p className="text-xs text-slate-600 font-medium">{subtext}</p>}
      {trend && <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">{trend}</span>}
    </div>
  );
}
