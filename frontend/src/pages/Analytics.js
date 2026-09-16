import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, Badge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, CheckCircle2, Eye, Reply, XCircle, ShieldOff, Zap } from "lucide-react";

const FUNNEL = [
  { key: "sent", label: "Sent", icon: Send, color: "#7C3AED" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "#06B6D4" },
  { key: "read", label: "Read", icon: Eye, color: "#8B5CF6" },
  { key: "replied", label: "Replied", icon: Reply, color: "#10B981" },
  { key: "failed", label: "Failed", icon: XCircle, color: "#F43F5E" },
  { key: "blocked", label: "Blocked", icon: ShieldOff, color: "#F59E0B" },
];

function Rate({ label, value }) {
  return <Card className="ge-glass-panel p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}%</p></Card>;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/analytics").then((r) => { if (active) setData(r.data); }).catch((err) => { if (active) setError(err); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="p-5 sm:p-6 lg:p-8"><Card className="p-8 text-center"><p className="text-sm font-semibold text-rose-600">Analytics could not be loaded.</p><p className="mt-1 text-xs text-slate-500">Please refresh and try again.</p></Card></div>;
  if (!data) return <div className="p-5 sm:p-6 lg:p-8"><div className="shimmer h-96 rounded-[22px]" /></div>;

  const funnelData = FUNNEL.map((f) => ({ ...f, value: data.funnel?.[f.key] || 0 }));
  const rates = data.rates || {};
  const autopilot = data.autopilot || {};
  const channels = data.channels || {};
  const campaigns = data.campaign_performance || [];

  return (
    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
      <div><h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Delivery & Conversion Analytics</h1><p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Full-funnel messaging performance across every channel.</p></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" data-testid="analytics-funnel">
        {funnelData.map((f) => { const Icon = f.icon; return <Card key={f.key} className="ge-glass-panel p-4"><Icon className="h-4 w-4" style={{ color: f.color }} /><p className="mt-3 text-2xl font-black text-slate-900">{f.value}</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</p></Card>; })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Rate label="Delivery" value={rates.delivery ?? 0} /><Rate label="Read" value={rates.read ?? 0} /><Rate label="Reply" value={rates.reply ?? 0} /><Rate label="Block" value={rates.block ?? 0} /><Rate label="Opt-out" value={rates.opt_out ?? 0} /><Rate label="Conversion" value={rates.conversion ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="ge-glass-panel p-5 sm:p-6 lg:col-span-2"><h2 className="mb-5 text-sm font-bold text-slate-950">Message Funnel</h2><ResponsiveContainer width="100%" height={280}><BarChart data={funnelData}><XAxis dataKey="label" stroke="#8A94AF" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#8A94AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid rgba(226,232,250,.9)", background: "rgba(255,255,255,.96)" }} /><Bar dataKey="value" radius={[8,8,0,0]} barSize={38}>{funnelData.map((f) => <Cell key={f.key} fill={f.color} />)}</Bar></BarChart></ResponsiveContainer></Card>
        <Card className="ge-glass-panel p-5 sm:p-6"><h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-950"><Zap className="h-4 w-4 text-violet-600" /> Autopilot</h2><div className="space-y-2">{Object.keys(autopilot).length === 0 ? <p className="text-xs text-slate-400">No autopilot activity yet.</p> : Object.entries(autopilot).map(([key,value]) => <div key={key} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"><span className="text-xs font-medium capitalize text-slate-500">{key.replace(/_/g," ")}</span><span className="text-sm font-bold text-slate-900">{value}</span></div>)}</div><h3 className="mb-3 mt-6 text-xs font-black uppercase tracking-wider text-slate-600">Channels</h3><div className="space-y-2">{Object.keys(channels).length === 0 ? <p className="text-xs text-slate-400">No messages yet.</p> : Object.entries(channels).map(([key,value]) => <div key={key} className="flex items-center justify-between"><span className="text-xs text-slate-600">{key}</span><Badge tone="purple">{value}</Badge></div>)}</div></Card>
      </div>

      <Card className="ge-glass-panel p-5 sm:p-6"><h2 className="mb-4 text-sm font-bold text-slate-950">Campaign Performance</h2>{campaigns.length === 0 ? <p className="text-xs text-slate-400">No campaigns yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-[10px] uppercase tracking-wider text-slate-400"><th className="py-2.5 font-semibold">Campaign</th><th className="py-2.5 font-semibold">Status</th><th className="py-2.5 font-semibold">Sent</th><th className="py-2.5 font-semibold">Replied</th><th className="py-2.5 font-semibold">Blocked</th></tr></thead><tbody>{campaigns.map((campaign,index) => <tr key={campaign.id || index} className="border-b border-slate-50"><td className="py-3 font-medium text-slate-800">{campaign.name}</td><td className="py-3"><Badge tone={campaign.status === "sent" ? "green" : "slate"}>{campaign.status}</Badge></td><td className="py-3 font-mono">{campaign.sent}</td><td className="py-3 font-mono">{campaign.replied}</td><td className="py-3 font-mono text-rose-600">{campaign.blocked}</td></tr>)}</tbody></table></div>}</Card>
    </div>
  );
}
