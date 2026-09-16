import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, Badge } from "../components/ui";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Users, Flame, MessageSquare, TrendingUp, DollarSign, Send, Bot, Gauge } from "lucide-react";

const fmt = (n) => new Intl.NumberFormat().format(n ?? 0);

function Kpi({ icon: Icon, label, value, sub, tone = "violet" }) {
  const tones = { violet: "bg-violet-50 text-violet-600", red: "bg-rose-50 text-rose-500", blue: "bg-cyan-50 text-cyan-600", green: "bg-emerald-50 text-emerald-600" };
  return <Card className="ge-glass-panel p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(124,58,237,.12)]"><div className="flex items-start justify-between gap-2"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>{sub && <Badge tone="green">{sub}</Badge>}</div><p className="mt-4 font-heading text-3xl font-extrabold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></Card>;
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [saas, setSaas] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/saas/overview")]).then(([dashboard, workspace]) => { setD(dashboard.data); setSaas(workspace.data); }).catch(() => setError(true));
  }, []);

  if (error) return <div className="p-5 sm:p-6 lg:p-8"><Card className="p-8 text-center"><p className="text-sm font-semibold text-rose-600">Dashboard data could not be loaded.</p><p className="mt-1 text-xs text-slate-500">Please refresh and try again.</p></Card></div>;
  if (!d || !saas) return <div className="p-5 sm:p-6 lg:p-8"><div className="shimmer h-96 rounded-[22px]" /></div>;

  const k = d.kpis;
  const PIE = ["#F43F5E", "#F59E0B", "#06B6D4"];

  return <div className="space-y-6 p-5 sm:p-6 lg:p-8">
    <div><h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Command Dashboard</h1><p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Live workspace, pipeline and platform usage at a glance.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" data-testid="kpi-grid"><Kpi icon={Users} label="Total Leads" value={fmt(k.total_leads)} /><Kpi icon={Flame} label="Hot Leads" value={fmt(k.hot_leads)} tone="red" sub="Scored" /><Kpi icon={DollarSign} label="Pipeline Value" value={`₹${fmt(k.revenue)}`} tone="green" /><Kpi icon={TrendingUp} label="Conversion" value={`${k.conversion}%`} tone="blue" /></div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"><Kpi icon={Send} label="Campaigns" value={fmt(k.campaigns)} /><Kpi icon={MessageSquare} label="Replies" value={fmt(k.replies)} tone="blue" /><Kpi icon={Gauge} label="Messages This Month" value={fmt(saas.usage.monthly_messages)} sub={saas.workspace.plan} tone="green" /><Kpi icon={Bot} label="AI Actions This Month" value={fmt(saas.usage.monthly_ai_actions)} sub={saas.providers.openai.configured ? "AI ready" : "Setup AI"} /></div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="ge-glass-panel p-5 sm:p-6 lg:col-span-2"><div className="mb-6 flex items-center justify-between"><h2 className="text-sm font-bold text-slate-950">Lead Acquisition — Last 7 days</h2><Badge tone="purple">Live</Badge></div><ResponsiveContainer width="100%" height={260}><AreaChart data={d.trend}><defs><linearGradient id="violetLeadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.28} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="day" stroke="#8A94AF" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="#8A94AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid rgba(226,232,250,.9)", background: "rgba(255,255,255,.96)" }} /><Area type="monotone" dataKey="leads" stroke="#7C3AED" strokeWidth={2.5} fill="url(#violetLeadFill)" /></AreaChart></ResponsiveContainer></Card>
      <Card className="ge-glass-panel p-5 sm:p-6"><h2 className="mb-4 text-sm font-bold text-slate-950">Lead Temperature</h2><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={d.temperature_split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>{d.temperature_split.map((e, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="mt-2 flex justify-center gap-4">{d.temperature_split.map((t, i) => <div key={t.name} className="flex items-center gap-1.5 text-xs"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE[i % PIE.length] }} /><span className="text-slate-600">{t.name} {t.value}</span></div>)}</div></Card>
    </div>
    <Card className="ge-glass-panel p-5 sm:p-6"><h2 className="mb-6 text-sm font-bold text-slate-950">Sales Conversion Funnel</h2><ResponsiveContainer width="100%" height={240}><BarChart data={d.funnel} layout="vertical" margin={{ left: 20 }}><XAxis type="number" hide /><YAxis type="category" dataKey="stage" stroke="#8A94AF" fontSize={11} width={90} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 14, border: "1px solid rgba(226,232,250,.9)", background: "rgba(255,255,255,.96)" }} /><Bar dataKey="count" fill="#7C3AED" radius={[0,8,8,0]} barSize={22} /></BarChart></ResponsiveContainer></Card>
  </div>;
}
