import React from "react";

export function Button({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-base" };
  const variants = {
    primary: "brand-gradient text-white shadow-brand hover:-translate-y-0.5 hover:shadow-hover",
    dark: "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
    outline: "border border-violet-100 bg-white/85 text-slate-700 shadow-sm hover:border-violet-200 hover:text-violet-700",
    ghost: "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
    danger: "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}

export function Card({ className = "", children, ...props }) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}

export function Input({ className = "", label, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>}
      <input className={`w-full rounded-xl border border-violet-100 bg-white/88 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70 ${className}`} {...props} />
    </label>
  );
}

export function Textarea({ className = "", label, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>}
      <textarea className={`w-full rounded-xl border border-violet-100 bg-white/88 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70 ${className}`} {...props} />
    </label>
  );
}

export function Select({ className = "", label, children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span>}
      <select className={`w-full rounded-xl border border-violet-100 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/70 ${className}`} {...props}>{children}</select>
    </label>
  );
}

export function Badge({ tone = "slate", children, className = "" }) {
  const tones = {
    HOT: "border-rose-200 bg-rose-50 text-rose-600",
    WARM: "border-amber-200 bg-amber-50 text-amber-700",
    COLD: "border-sky-200 bg-sky-50 text-sky-600",
    gold: "border-violet-200 bg-violet-50 text-violet-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-600",
    slate: "border-slate-200 bg-white/80 text-slate-600",
    blue: "border-cyan-200 bg-cyan-50 text-cyan-700",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.slate} ${className}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children, className = "" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close modal" className="absolute inset-0 bg-slate-950/35 backdrop-blur-md" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[26px] border border-white/90 bg-white/95 shadow-[0_30px_100px_rgba(76,59,122,.22)] backdrop-blur-2xl animate-fade-up ${className}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[26px] border-b border-violet-100/80 bg-white/94 px-6 py-4 backdrop-blur-xl">
          <h3 className="font-heading text-lg font-extrabold text-slate-900">{title}</h3>
          <button onClick={onClose} className="soft-round !h-8 !w-8 text-lg leading-none" data-testid="modal-close">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="soft-icon mb-4 !h-14 !w-14"><Icon className="h-7 w-7" /></div>}
      <h3 className="font-heading font-extrabold text-slate-800">{title}</h3>
      {sub && <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
