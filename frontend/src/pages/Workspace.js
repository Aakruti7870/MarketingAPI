import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Button, Card, Badge } from "../components/ui";
import { Activity, Bot, Coins, MessageSquare, Phone, Users, Zap, CreditCard } from "lucide-react";

const LABELS = {
  leads: "Leads",
  team_members: "Team members",
  monthly_messages: "Messages this month",
  api_keys: "Active API keys",
  monthly_ai_actions: "AI actions this month",
};

function UsageRow({ name, value, limit, percent }) {
  const unlimited = limit == null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{LABELS[name] || name}</span>
        <span className="font-mono text-xs text-slate-500">{value} / {unlimited ? "Tracked" : limit}</span>
      </div>
      {!unlimited && (
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-gold-400 rounded-full" style={{ width: `${Math.max(2, percent || 0)}%` }} />
        </div>
      )}
    </div>
  );
}

function Provider({ icon: Icon, title, configured, detail }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${configured ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
      <Badge tone={configured ? "green" : "slate"}>{configured ? "Ready" : "Setup"}</Badge>
    </Card>
  );
}

export default function Workspace() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/saas/overview").then((response) => setData(response.data));
  }, []);

  if (!data) return <div className="p-8"><div className="h-48 shimmer rounded-2xl" /></div>;

  const providerReady = Object.values(data.providers).filter((p) => p.configured).length;
  const currentPlan = data.workspace.plan;
  const coins = data.wallet?.coin_balance ?? 0;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Workspace & Usage</h1>
          <p className="text-slate-500 text-sm mt-1">Plan, coin wallet, provider readiness and real platform usage.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="gold">{currentPlan} plan</Badge>
          <Button size="sm" onClick={() => navigate("/pricing")}><CreditCard className="w-4 h-4" /> Pricing</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Users className="w-4 h-4" /> Workspace</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3 truncate">{data.workspace.name}</p>
          <p className="text-sm text-slate-500 mt-1">Tenant isolated</p>
        </Card>
        <Card className="p-5 border-gold-200 bg-gold-50/50">
          <div className="flex items-center gap-2 text-gold-700 text-xs uppercase tracking-wider"><Coins className="w-4 h-4" /> Coin wallet</div>
          <p className="font-heading font-extrabold text-3xl text-slate-900 mt-3">{coins.toLocaleString()}</p>
          <p className="text-sm text-slate-500 mt-1">{currentPlan === "Free" ? "100 one-time free coins" : "2,000 refresh monthly"}</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Activity className="w-4 h-4" /> Providers</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3">{providerReady} / 3 ready</p>
          <p className="text-sm text-slate-500 mt-1">AI, WhatsApp and scheduler</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Zap className="w-4 h-4" /> Automation</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3">{data.providers.scheduler.configured ? "Scheduler ready" : "Setup required"}</p>
          <p className="text-sm text-slate-500 mt-1">Cloud Scheduler execution</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-heading font-bold text-slate-900 mb-5">Current usage</h2>
          <div className="space-y-5">
            {Object.keys(data.usage).map((key) => (
              <UsageRow key={key} name={key} value={data.usage[key]} limit={data.limits[key]} percent={data.utilization[key]} />
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Provider icon={Bot} title="OpenAI" configured={data.providers.openai.configured} detail={data.providers.openai.configured ? "Text and image generation configured" : "Add MARKETINGAPI_OPENAI_API_KEY in Secret Manager"} />
          <Provider icon={Phone} title="WhatsApp Cloud API" configured={data.providers.whatsapp.configured} detail={data.providers.whatsapp.configured ? `Connection mode: ${data.providers.whatsapp.mode}` : "Connect a Meta WhatsApp Business account from WhatsApp settings"} />
          <Provider icon={MessageSquare} title="Cloud Scheduler" configured={data.providers.scheduler.configured} detail={data.providers.scheduler.configured ? "Scheduled campaigns and follow-ups enabled" : "Add MARKETINGAPI_CRON_SECRET and deploy scheduler"} />
        </div>
      </div>

      <Card className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-slate-900">Need more AI capacity?</h2>
          <p className="text-sm text-slate-500 mt-1">Free includes 100 coins once. Pro includes 2,000 coins every month with Monthly or Annual billing.</p>
        </div>
        <Button onClick={() => navigate("/pricing")}><Coins className="w-4 h-4" /> View plans</Button>
      </Card>
    </div>
  );
}
