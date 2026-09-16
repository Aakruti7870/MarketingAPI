import React, { useState } from "react";
import { Check, Crown, X } from "lucide-react";
import CashfreeCheckout from "./CashfreeCheckout";

const PLANS = {
  monthly: [
    { name: "Free", price: "₹0", suffix: "forever", badge: "FREE", features: ["100 one-time coins", "1 workspace owner", "Up to 1,000 leads", "CRM, pipeline and inbox"] },
    { name: "Pro Monthly", interval: "month", price: "₹1,999", suffix: "/ month", badge: "PRO", featured: true, features: ["2,000 coins every month", "Up to 10 team members", "Up to 10,000 leads", "AI Studio, Automations & WhatsApp", "Advanced analytics"] },
    { name: "Pro Annual", interval: "year", price: "₹19,990", suffix: "/ year", badge: "BEST VALUE", features: ["2,000 coins refreshed monthly", "Everything in Pro Monthly", "Save 16.7%", "Priority support"] },
  ],
  annual: [
    { name: "Free", price: "₹0", suffix: "forever", badge: "FREE", features: ["100 one-time coins", "1 workspace owner", "Up to 1,000 leads", "CRM, pipeline and inbox"] },
    { name: "Pro Annual", interval: "year", price: "₹19,990", suffix: "/ year", badge: "SAVE 16.7%", featured: true, features: ["2,000 coins refreshed monthly", "24,000 coins across the year", "Up to 10 team members", "AI Studio, Automations & WhatsApp", "Priority support"] },
    { name: "Pro Monthly", interval: "month", price: "₹1,999", suffix: "/ month", badge: "FLEXIBLE", features: ["2,000 coins every month", "No annual commitment", "Up to 10 team members", "Advanced analytics"] },
  ],
};

export default function UpgradeModal({ open, onClose }) {
  const [billing, setBilling] = useState("annual");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button aria-label="Close upgrade plans" className="absolute inset-0 bg-slate-950/35 backdrop-blur-md" onClick={onClose} />
      <section className="relative w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_35px_120px_rgba(70,45,120,.24)] backdrop-blur-2xl animate-fade-up">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-violet-100/55 via-white to-fuchsia-100/55" />
        <div className="relative flex flex-col gap-4 border-b border-violet-100/80 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><div className="soft-icon !h-9 !w-9"><Crown className="h-4 w-4" /></div><h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950">Upgrade Plans</h2></div>
            <p className="mt-2 text-sm text-slate-500">Choose more AI capacity when your workspace is ready.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="text-xs font-bold text-violet-600">Save 16.7% with Annual</span>
            <div className="flex rounded-xl border border-violet-100 bg-white p-1 shadow-sm">
              <button onClick={() => setBilling("monthly")} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${billing === "monthly" ? "bg-violet-600 text-white" : "text-slate-500"}`}>Monthly</button>
              <button onClick={() => setBilling("annual")} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${billing === "annual" ? "brand-gradient text-white" : "text-slate-500"}`}>Annually</button>
            </div>
            <button onClick={onClose} className="soft-round !h-9 !w-9"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="relative grid gap-4 p-6 md:grid-cols-3">
          {PLANS[billing].map((plan) => (
            <article key={plan.name} className={`relative flex min-h-[330px] flex-col rounded-[24px] border bg-white p-5 transition ${plan.featured ? "border-violet-300 shadow-[0_18px_55px_rgba(124,77,255,.16)] ring-1 ring-fuchsia-200" : "border-slate-200/80 shadow-sm"}`}>
              {plan.featured && <div className="absolute -top-3 left-5 rounded-full brand-gradient px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">Recommended</div>}
              <div className="flex items-center justify-between gap-2 pt-1"><h3 className="font-heading text-lg font-extrabold text-slate-950">{plan.name}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-extrabold text-slate-500">{plan.badge}</span></div>
              <div className="mt-4 flex items-end gap-1"><span className="font-heading text-4xl font-extrabold tracking-tight text-slate-950">{plan.price}</span><span className="pb-1 text-xs font-semibold text-slate-400">{plan.suffix}</span></div>
              <div className="my-5 h-px bg-slate-100" />
              <div className="space-y-3">
                {plan.features.map((feature) => <div key={feature} className="flex gap-2 text-sm text-slate-600"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3 w-3" /></span><span>{feature}</span></div>)}
              </div>
              {plan.name === "Free" ? (
                <button disabled className="mt-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-400">Current Plan</button>
              ) : (
                <CashfreeCheckout
                  interval={plan.interval}
                  onStarted={onClose}
                  className={`mt-auto rounded-xl px-4 py-3 text-sm font-extrabold transition ${plan.featured ? "brand-gradient text-white shadow-brand" : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200"}`}
                >
                  Upgrade with Cashfree
                </CashfreeCheckout>
              )}
            </article>
          ))}
        </div>
        <p className="px-6 pb-6 text-center text-[11px] text-slate-400">Pro activates only after Cashfree webhook or server-side order verification. Taxes and provider charges may apply separately.</p>
      </section>
    </div>
  );
}
