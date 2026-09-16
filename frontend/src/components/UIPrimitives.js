import React from "react";
import { Button, Card, Badge, Input, Select, Textarea, Modal, EmptyState as BaseEmptyState } from "./ui";

export function GlassCard({ children, className = "", ...props }) {
  return <div className={`ge-glass-panel p-6 ${className}`} {...props}>{children}</div>;
}

export function StatCard({ title, value, change, icon: Icon, trend = "up" }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200/60 bg-gradient-to-tr from-violet-500/10 to-pink-500/10 text-violet-600"><Icon className="h-4 w-4" /></div>}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-900">{value}</span>
        {change != null && <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${trend === "up" ? "border-emerald-200/80 bg-emerald-50 text-emerald-700" : "border-rose-200/80 bg-rose-50 text-rose-700"}`}>{change}</span>}
      </div>
    </GlassCard>
  );
}

export function GradientButton({ children, icon: Icon, className = "", ...props }) {
  return <button className={`ge-btn-gloss-primary ${className}`} {...props}>{Icon && <Icon className="h-4 w-4" />}<span>{children}</span></button>;
}

export function SecondaryButton({ children, icon: Icon, className = "", ...props }) {
  return <button className={`ge-btn-gloss-secondary ${className}`} {...props}>{Icon && <Icon className="h-4 w-4" />}<span>{children}</span></button>;
}

export function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();
  const tone = ["HOT", "ACTIVE", "COMPLETED"].includes(normalized) ? "green" : ["WARM", "PENDING", "PROCESSING"].includes(normalized) ? "WARM" : ["COLD", "INACTIVE", "FAILED"].includes(normalized) ? "slate" : "purple";
  return <Badge tone={tone}>{status}</Badge>;
}

export function EmptyState({ title, description, actionText, onAction, icon: Icon }) {
  return <BaseEmptyState icon={Icon} title={title} sub={description} action={actionText && onAction ? <GradientButton onClick={onAction}>{actionText}</GradientButton> : null} />;
}

export { Button, Card, Badge, Input, Select, Textarea, Modal };
