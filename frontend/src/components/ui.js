import React from "react";

export function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-base" };
  const variants = {
    primary: "gold-gradient text-ink font-semibold shadow-gold hover:shadow-hover hover:-translate-y-0.5",
    dark: "bg-ink text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-700 hover:border-gold-400 hover:text-gold-700",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Input({ className = "", label, ...props }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</span>}
      <input
        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({ className = "", label, ...props }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</span>}
      <textarea
        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ className = "", label, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="text-xs font-semibold text-slate-600 mb-1.5 block">{label}</span>}
      <select
        className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:border-gold-400 focus:ring-2 focus:ring-gold-100 outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Badge({ tone = "slate", children, className = "" }) {
  const tones = {
    HOT: "bg-red-50 text-red-600 border-red-200",
    WARM: "bg-yellow-50 text-yellow-700 border-yellow-200",
    COLD: "bg-sky-50 text-sky-600 border-sky-200",
    gold: "bg-gold-50 text-gold-700 border-gold-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[tone] || tones.slate} ${className}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, className = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up ${className}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-heading font-bold text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none" data-testid="modal-close">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mb-4"><Icon className="w-7 h-7 text-gold-600" /></div>}
      <h3 className="font-heading font-semibold text-slate-800">{title}</h3>
      {sub && <p className="text-sm text-slate-500 mt-1 max-w-sm">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
