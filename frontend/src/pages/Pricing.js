import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge } from "../components/ui";
import {
  ArrowRight,
  Check,
  Coins,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    eyebrow: "Start here",
    price: "₹0",
    suffix: "forever",
    description: "Explore GOLD-e with a one-time AI coin balance and the essential revenue workflow.",
    coins: "100 coins once",
    icon: Sparkles,
    features: [
      "100 one-time AI coins",
      "1 workspace owner",
      "Up to 1,000 leads",
      "CRM & sales pipeline",
      "Unified inbox",
      "Campaign drafts",
      "Basic analytics",
      "1 developer API key",
    ],
  },
  {
    key: "monthly",
    name: "Pro Monthly",
    eyebrow: "Flexible growth",
    price: "₹1,999",
    suffix: "/ month",
    description: "Full GOLD-e capabilities for businesses that want flexibility without an annual commitment.",
    coins: "2,000 coins / month",
    icon: Zap,
    featured: true,
    badge: "Most flexible",
    features: [
      "2,000 AI coins every month",
      "Up to 10 team members",
      "Up to 10,000 leads",
      "25,000 platform messages / month",
      "AI Studio & AI assistance",
      "Autopilot automations",
      "Advanced analytics",
      "Live WhatsApp integration",
      "10 developer API keys",
    ],
  },
  {
    key: "annual",
    name: "Pro Annual",
    eyebrow: "Best value",
    price: "₹19,990",
    suffix: "/ year",
    description: "The best-value plan for teams using GOLD-e as their ongoing AI revenue operating system.",
    coins: "2,000 coins / month",
    icon: Crown,
    featured: true,
    badge: "Save ₹3,998 · 16.7%",
    effective: "≈ ₹1,666/month",
    features: [
      "2,000 AI coins refreshed monthly",
      "24,000 AI coins across the year",
      "Everything in Pro Monthly",
      "Up to 10 team members",
      "Up to 10,000 leads",
      "25,000 platform messages / month",
      "Advanced automation & analytics",
      "Priority product support",
      "Best effective monthly price",
    ],
  },
];

const coinExamples = [
  ["AI copy / message", "1 coin"],
  ["Lead AI rescore", "1 coin"],
  ["Inbox AI assist", "1 coin"],
  ["Marketing concept", "2 coins"],
  ["AI quotation draft", "2 coins"],
  ["AI poster / image", "10 coins"],
];

function PricingCard({ plan, onFree }) {
  const Icon = plan.icon;
  const isFree = plan.key === "free";

  return (
    <Card
      className={`relative overflow-hidden p-0 flex flex-col min-h-full transition-all duration-300 ${
        plan.featured
          ? "border-gold-300 shadow-xl shadow-amber-100/50 ring-1 ring-gold-100"
          : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
      }`}
    >
      {plan.featured && <div className="h-1.5 gold-gradient" />}

      {plan.badge && (
        <div className="absolute right-5 top-5">
          <Badge tone="gold">{plan.badge}</Badge>
        </div>
      )}

      <div className="p-6 md:p-7 flex flex-col flex-1">
        <div className="flex items-center gap-3 pr-24">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              plan.featured ? "gold-gradient text-ink" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {plan.eyebrow}
            </p>
            <h2 className="font-heading text-xl font-extrabold text-slate-950">{plan.name}</h2>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-end gap-1.5">
            <span className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950">
              {plan.price}
            </span>
            <span className="text-sm text-slate-500 mb-1.5">{plan.suffix}</span>
          </div>
          {plan.effective && <p className="text-xs font-semibold text-emerald-600 mt-1.5">{plan.effective}</p>}
          <p className="text-sm leading-6 text-slate-500 mt-4 min-h-[72px]">{plan.description}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-gold-100 bg-gold-50/60 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-gold-100 flex items-center justify-center text-gold-700">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gold-700">AI allowance</p>
            <p className="font-heading font-bold text-slate-900">{plan.coins}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 flex-1">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {isFree ? (
          <Button className="w-full mt-7" onClick={onFree}>
            Start Free <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="w-full mt-7" variant="outline" disabled>
            Paid plan · Coming Soon
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[620px] h-[320px] rounded-full bg-amber-100/50 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3.5 py-1.5 text-xs font-bold text-gold-700">
            <Gem className="w-4 h-4" /> Simple SaaS pricing
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight text-slate-950 mt-5 max-w-4xl mx-auto">
            Start free. Upgrade when your AI revenue engine grows.
          </h1>
          <p className="text-slate-500 mt-5 md:text-lg max-w-2xl mx-auto leading-7">
            Every new workspace starts with <strong className="text-slate-800">100 free coins</strong>.
            Monthly and annual Pro plans unlock higher scale, automation and recurring AI capacity.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> No card required for Free</span>
            <span className="inline-flex items-center gap-1.5"><Coins className="w-4 h-4 text-gold-600" /> Transparent coin usage</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Monthly or annual Pro</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-10 md:py-14">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <PricingCard
              key={plan.key}
              plan={plan}
              onFree={() => navigate(user ? "/dashboard" : "/login")}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 mt-8">
          <Card className="p-6 md:p-7 border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-950">How GOLD-e coins work</h3>
                <p className="text-sm text-slate-500">Only premium AI actions use coins.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5 mt-5">
              {coinExamples.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-mono font-bold text-slate-900">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-7 bg-ink text-white border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-400/15 text-gold-200 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold">Why Annual is best value</h3>
                <p className="text-sm text-slate-400">Same Pro capabilities, lower effective monthly cost.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div className="flex gap-2.5"><Check className="w-4 h-4 text-gold-300 mt-0.5 shrink-0" /><span>₹3,998 saved versus 12 monthly payments.</span></div>
              <div className="flex gap-2.5"><Check className="w-4 h-4 text-gold-300 mt-0.5 shrink-0" /><span>2,000 AI coins refresh every month for controlled usage.</span></div>
              <div className="flex gap-2.5"><Check className="w-4 h-4 text-gold-300 mt-0.5 shrink-0" /><span>Priority support for teams using GOLD-e as an ongoing revenue platform.</span></div>
            </div>
          </Card>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">Paid checkout is not enabled yet.</p>
            <p className="text-sm text-slate-500 mt-0.5">This is the pricing page only. Payment integration can be added separately when you are ready.</p>
          </div>
          <Badge tone="slate">Pricing Preview</Badge>
        </div>

        <p className="text-xs text-slate-400 text-center mt-6">
          Prices are in Indian Rupees. GST/taxes may apply. Meta/WhatsApp messaging charges are separate provider charges.
        </p>
      </section>
    </div>
  );
}
