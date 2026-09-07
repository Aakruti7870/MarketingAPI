import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, Badge } from "../components/ui";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";
import { Users, Flame, MessageSquare, TrendingUp, DollarSign, Send, Bot, Timer } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat().format(n);

function Kpi({ icon: Icon, label, value, sub, tone = "gold" }) {
  const tones = { gold: "bg-gold-50 text-gold-600", red: "bg-red-50 text-red-500", blue: "bg-blue-50 text-blue-500", green: "bg-emerald-50 text-emerald-500" };
  return (
    <Card className="p-5 hover:shadow-hover transition-all animate-fade-up">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon className="w-5 h-5" /></div>
        {sub && <Badge tone="green">{sub}</Badge>}
      </div>
      <p className="text-3xl font-heading font-extrabold text-slate-900 mt-4">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);

  useEffect(() => { api.get("/dashboard").then((r) => setD(r.data)); }, []);

  if (!d) return <div className="p-8"><div className="h-40 shimmer rounded-2xl" /></div>;
  const k = d.kpis;
  const PIE = ["#EF4444", "#EAB308", "#38BDF8"];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Command Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your revenue engine at a glance — live across every channel.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-grid">
        <Kpi icon={Users} label="Total Leads" value={fmt(k.total_leads)} tone="gold" />
        <Kpi icon={Flame} label="Hot Leads" value={fmt(k.hot_leads)} tone="red" sub="AI scored" />
        <Kpi icon={DollarSign} label="Pipeline Value" value={`₹${fmt(k.revenue)}`} tone="green" />
        <Kpi icon={TrendingUp} label="Conversion" value={`${k.conversion}%`} tone="blue" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Send} label="Campaigns" value={fmt(k.campaigns)} tone="gold" />
        <Kpi icon={MessageSquare} label="Replies" value={fmt(k.replies)} tone="blue" />
        <Kpi icon={Timer} label="Avg Response" value={k.avg_response} tone="green" />
        <Kpi icon={Bot} label="AI Spend" value={`$${k.ai_cost}`} sub={`of $${k.ai_budget}`} tone="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-slate-900">Lead Acquisition — Last 7 days</h3>
            <Badge tone="gold">Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={d.trend}>
              <defs>
                <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="leads" stroke="#B8860B" strokeWidth={2.5} fill="url(#gold)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4">Lead Temperature</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={d.temperature_split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {d.temperature_split.map((e, i) => <Cell key={i} fill={PIE[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {d.temperature_split.map((t, i) => (
              <div key={t.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE[i] }} />
                <span className="text-slate-600">{t.name} {t.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-heading font-bold text-slate-900 mb-6">Sales Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={d.funnel} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="stage" stroke="#94a3b8" fontSize={12} width={90} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="count" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
