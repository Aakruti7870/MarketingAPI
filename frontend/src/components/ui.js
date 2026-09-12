import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
    dark: "bg-slate-900 hover:bg-slate-800 text-white",
    outline: "bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5"
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, status = 'default', className = '' }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    dark: "bg-slate-900 text-white border-slate-900"
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]} ${className}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, subtext, trend }) {
  return (
    <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-5 space-y-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
      {trend && <span className="inline-block text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{trend}</span>}
    </div>
  );
}
