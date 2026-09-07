import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge } from "../components/ui";
import { Check, Coins, Crown, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function PlanCard({ title, price, suffix, description, features, badge, highlighted, action, actionText, footnote }) {
  return (
    <Card className={`relative p-6 md:p-7 flex flex-col ${highlighted ? "border-gold-300 shadow-lg ring-1 ring-gold-200" : "border-slate-200"}`}>
      {badge && <div className="absolute -top-3 left-6"><Badge tone="gold">{badge}</Badge></div>}
      <div className="mb-5">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <div className="flex items-end gap-1 mt-3">
          <span className="font-heading text-4xl font-extrabold text-slate-950">{price}</span>
          {suffix && <span className="text-sm text-slate-500 mb-1">{suffix}</span>}
        </div>
        <p className="text-sm text-slate-500 mt-3 min-h-[42px]">{description}</p>
      </div>
      <div className="space-y-3 flex-1">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
      <Button className="w-full mt-7" variant={highlighted ? "default" : "outline"} onClick={action}>{actionText}</Button>
      {footnote && <p className="text-[11px] text-slate-400 text-center mt-2">{footnote}</p>}
    </Card>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pricing, setPricing] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api.get("/billing/pricing").then((r) => setPricing(r.data));
    if (user) api.get("/billing/wallet").then((r) => setWallet(r.data)).catch(() => null);
  }, [user]);

  const choosePaid = async (interval) => {
    if (!user) return navigate("/login");
    setBusy(interval);
    try {
      const { data } = await api.post("/billing/upgrade-intent", { interval });
      if (data.checkout_ready) {
        window.location.assign(data.checkout_url);
      } else {
        toast.info("Plan selected. Secure payment checkout will be connected before subscription activation.");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not select plan");
    }
    setBusy("");
  };

  if (!pricing) return <div className="min-h-screen bg-slate-50 p-8"><div className="h-60 shimmer rounded-2xl max-w-5xl mx-auto" /></div>;

  const free = pricing.free;
  const monthly = pricing.monthly;
  const annual = pricing.annual;
  const costs = pricing.coin_costs || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-5 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-bold">
            <Coins className="w-4 h-4" /> Start with 100 free coins
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-extrabold text-slate-950 mt-5">Simple pricing. Pay when AI starts creating value.</h1>
          <p className="text-slate-500 mt-4 md:text-lg">Use your first 100 coins free. Upgrade only when you need a recurring AI allowance, more scale, automation and team capacity.</p>
          {wallet && (
            <div className="inline-flex items-center gap-2 mt-5 text-sm text-slate-600">
              <Badge tone="gold">{wallet.plan}</Badge>
              <span>{wallet.coin_balance.toLocaleString()} coins remaining</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-5 mt-12">
          <PlanCard
            title={free.name}
            price="₹0"
            suffix="forever"
            description={free.description}
            features={free.features}
            action={() => navigate(user ? "/dashboard" : "/login")}
            actionText={user ? "Continue Free" : "Start Free"}
            footnote="100 coins are granted once and do not reset."
          />
          <PlanCard
            title={monthly.name}
            price={money(monthly.price)}
            suffix="/ month"
            description={monthly.description}
            features={monthly.features}
            highlighted
            badge="Flexible"
            action={() => choosePaid("month")}
            actionText={busy === "month" ? "Selecting…" : "Choose Monthly"}
            footnote="Cancel before the next billing cycle."
          />
          <PlanCard
            title={annual.name}
            price={money(annual.price)}
            suffix="/ year"
            description={annual.description}
            features={annual.features}
            highlighted
            badge={`Best value · Save ${annual.save_percent}%`}
            action={() => choosePaid("year")}
            actionText={busy === "year" ? "Selecting…" : "Choose Annual"}
            footnote={`Equivalent to about ${money(annual.effective_monthly)}/month.`}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-8">
          <Card className="p-6">
            <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-gold-600" /><h2 className="font-heading font-bold text-slate-900">How coins work</h2></div>
            <p className="text-sm text-slate-500 mt-2">Coins are spent only on premium AI actions. CRM records and ordinary navigation do not consume coins.</p>
            <div className="grid sm:grid-cols-2 gap-2 mt-4 text-sm">
              <CoinRow label="AI copy / message" value={costs.ai_text || 1} />
              <CoinRow label="Lead AI rescore" value={costs.lead_rescore || 1} />
              <CoinRow label="AI inbox assist" value={costs.conversation_ai || 1} />
              <CoinRow label="Marketing concept" value={costs.ai_marketing || 2} />
              <CoinRow label="AI quotation draft" value={costs.quotation_ai || 2} />
              <CoinRow label="AI command" value={costs.ai_command || 2} />
              <CoinRow label="AI poster generation" value={costs.ai_poster || 10} />
            </div>
          </Card>

          <Card className="p-6 bg-ink text-white border-slate-800">
            <div className="flex items-center gap-2"><Crown className="w-5 h-5 text-gold-300" /><h2 className="font-heading font-bold">Why one Pro plan?</h2></div>
            <div className="space-y-3 mt-4 text-sm text-slate-300">
              <Reason icon={Zap}>No artificial feature maze. Monthly and Annual include the same Pro capabilities.</Reason>
              <Reason icon={Coins}>Annual billing does not dump 24,000 coins at once; 2,000 refresh each month to control cost and abuse.</Reason>
              <Reason icon={ShieldCheck}>WhatsApp/Meta message fees are not hidden inside the subscription and remain provider charges.</Reason>
            </div>
          </Card>
        </div>

        <p className="text-xs text-slate-400 text-center mt-8">{pricing.tax_note}</p>
      </div>
    </div>
  );
}

function CoinRow({ label, value }) {
  return <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50"><span className="text-slate-600">{label}</span><span className="font-mono font-bold text-slate-900">{value} coin{value === 1 ? "" : "s"}</span></div>;
}

function Reason({ icon: Icon, children }) {
  return <div className="flex gap-2.5"><Icon className="w-4 h-4 text-gold-300 mt-0.5 shrink-0" /><span>{children}</span></div>;
}
