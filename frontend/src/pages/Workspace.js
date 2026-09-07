import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, Badge } from "../components/ui";
import { Activity, Bot, Code2, MessageSquare, Phone, Users, Zap } from "lucide-react";

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
        <span className="font-mono text-xs text-slate-500">{value} / {unlimited ? "Unlimited" : limit}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-gold-400 rounded-full" style={{ width: `${unlimited ? 0 : Math.max(2, percent || 0)}%` }} />
      </div>
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
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/saas/overview"), api.get("/saas/plans")]).then(([overview, planData]) => {
      setData(overview.data);
      setPlans(planData.data);
    });
  }, []);

  if (!data || !plans) return <div className="p-8"><div className="h-48 shimmer rounded-2xl" /></div>;

  const providerReady = Object.values(data.providers).filter((p) => p.configured).length;
  const currentPlan = data.workspace.plan;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Workspace & Usage</h1>
          <p className="text-slate-500 text-sm mt-1">Real plan limits, provider readiness and monthly platform usage.</p>
        </div>
        <Badge tone="gold">{currentPlan} plan</Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Users className="w-4 h-4" /> Workspace</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3">{data.workspace.name}</p>
          <p className="text-sm text-slate-500 mt-1">Multi-tenant workspace isolation enabled</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Activity className="w-4 h-4" /> Providers</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3">{providerReady} / 3 ready</p>
          <p className="text-sm text-slate-500 mt-1">AI, WhatsApp and scheduler configuration</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider"><Zap className="w-4 h-4" /> Automation</div>
          <p className="font-heading font-bold text-xl text-slate-900 mt-3">{data.providers.scheduler.configured ? "Scheduler ready" : "Setup required"}</p>
          <p className="text-sm text-slate-500 mt-1">Cloud Scheduler drives campaigns and follow-ups</p>
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

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4"><Code2 className="w-5 h-5 text-gold-600" /><h2 className="font-heading font-bold text-slate-900">Available plans</h2></div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {Object.entries(plans.plans).map(([name, limits]) => (
            <div key={name} className={`rounded-xl border p-4 ${name === currentPlan ? "border-gold-300 bg-gold-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center justify-between"><p className="font-bold text-slate-900">{name}</p>{name === currentPlan && <Badge tone="gold">Current</Badge>}</div>
              <p className="text-xs text-slate-500 mt-3">{limits.leads == null ? "Unlimited leads" : `${limits.leads.toLocaleString()} leads`}</p>
              <p className="text-xs text-slate-500 mt-1">{limits.monthly_messages == null ? "Unlimited messages" : `${limits.monthly_messages.toLocaleString()} messages / month`}</p>
              <p className="text-xs text-slate-500 mt-1">{limits.monthly_ai_actions == null ? "Unlimited AI actions" : `${limits.monthly_ai_actions.toLocaleString()} AI actions / month`}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">Plan changes are billing-controlled; the client cannot self-upgrade by changing frontend state.</p>
      </Card>
    </div>
  );
}
