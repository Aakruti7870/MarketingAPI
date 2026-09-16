import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, Badge } from "../components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Send, CheckCircle2, Eye, Reply, XCircle, ShieldOff, TrendingUp, Zap } from "lucide-react";

const FUNNEL = [
  { key: "sent", label: "Sent", icon: Send, color: "#D4AF37" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "#3B82F6" },
  { key: "read", label: "Read", icon: Eye, color: "#8B5CF6" },
  { key: "replied", label: "Replied", icon: Reply, color: "#10B981" },
  { key: "failed", label: "Failed", icon: XCircle, color: "#EF4444" },
  { key: "blocked", label: "Blocked", icon: ShieldOff, color: "#F59E0B" },
];

function Rate({ label, value, tone = "gold" }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1">{value}%</p>
    </Card>
  );
}

export default function Analytics() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/analytics").then((r) => setD(r.data)); }, []);
  if (!d) return <div className="p-8"><div className="h-40 shimmer rounded-2xl" /></div>;

  const funnelData = FUNNEL.map((f) => ({ ...f, value: d.funnel[f.key] || 0 }));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Delivery & Conversion Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Full-funnel messaging performance across every channel.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3" data-testid="analytics-funnel">
        {funnelData.map((f) => (
          <Card key={f.key} className="p-4">
            <f.icon className="w-5 h-5" style={{ color: f.color }} />
            <p className="text-2xl font-heading font-extrabold text-slate-900 mt-3">{f.value}</p>
            <p className="text-xs text-slate-500">{f.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Rate label="Delivery" value={d.rates.delivery} />
        <Rate label="Read" value={d.rates.read} />
        <Rate label="Reply" value={d.rates.reply} />
        <Rate label="Block" value={d.rates.block} />
        <Rate label="Opt-out" value={d.rates.opt_out} />
        <Rate label="Conversion" value={d.rates.conversion} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-6">Message Funnel</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData}>
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                {funnelData.map((f, i) => <Cell key={i} fill={f.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-gold-500" /> Autopilot</h3>
          <div className="space-y-3">
            {Object.entries(d.autopilot).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm text-slate-600 capitalize">{k}</span>
                <span className="font-heading font-bold text-slate-900">{v}</span>
              </div>
            ))}
          </div>
          <h4 className="font-semibold text-slate-800 text-sm mt-6 mb-3">Channels</h4>
          <div className="space-y-2">
            {Object.keys(d.channels).length === 0 && <p className="text-xs text-slate-400">No messages yet</p>}
            {Object.entries(d.channels).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{k}</span><Badge tone="gold">{v}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-heading font-bold text-slate-900 mb-4">Campaign Performance</h3>
        {d.campaign_performance.length === 0 ? <p className="text-sm text-slate-400">No campaigns yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-2.5 font-semibold">Campaign</th><th className="py-2.5 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Sent</th><th className="py-2.5 font-semibold">Replied</th><th className="py-2.5 font-semibold">Blocked</th>
              </tr></thead>
              <tbody>
                {d.campaign_performance.map((c, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="py-3"><Badge tone={c.status === "sent" ? "green" : "slate"}>{c.status}</Badge></td>
                    <td className="py-3 font-mono">{c.sent}</td><td className="py-3 font-mono">{c.replied}</td>
                    <td className="py-3 font-mono text-amber-600">{c.blocked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
