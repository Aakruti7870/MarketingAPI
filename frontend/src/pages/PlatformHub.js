import React, { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, CloudCog, Coins, Globe2, LockKeyhole, Plug, RefreshCw, Route, ShieldCheck, Store } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../api";
import { Badge, Button, Card, Select } from "../components/ui";

const TABS = [
  ["plugins", "Plugin marketplace", Plug],
  ["ai", "AI router", Route],
  ["domains", "Domains & TLS", Globe2],
  ["revenue", "Revenue architecture", Coins],
];

export default function PlatformHub() {
  const [tab, setTab] = useState("plugins");
  const [catalog, setCatalog] = useState([]);
  const [providers, setProviders] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const load = async () => {
    try {
      const [o, c, a, p, r] = await Promise.all([
        api.get("/platform/overview"), api.get("/platform/plugins/catalog"),
        api.get("/platform/ai/providers"), api.get("/platform/ai/policy"), api.get("/platform/revenue/model"),
      ]);
      setOverview(o.data); setCatalog(c.data); setProviders(a.data); setPolicy(p.data); setRevenue(r.data);
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, []);

  const install = async (item) => {
    try {
      await api.post("/platform/plugins/install", { slug: item.slug, scopes: item.scopes });
      toast.success(`${item.name} installed; add credentials before verification`); await load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };
  const savePolicy = async () => {
    try { await api.put("/platform/ai/policy", policy); toast.success("AI routing policy saved"); }
    catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };
  const installed = useMemo(() => catalog.filter((x) => x.installation).length, [catalog]);

  return <div className="space-y-7 p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-heading text-2xl font-extrabold text-slate-950 md:text-3xl">Global Platform Hub</h1><p className="mt-1 max-w-3xl text-sm text-slate-500">Govern AI providers, business plugins, domains, certificates and monetization from one control plane.</p></div>
      <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4"/>Refresh</Button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[["Installed plugins", overview?.plugins ?? installed, Plug], ["Managed domains", overview?.domains ?? 0, Globe2], ["TLS orders", overview?.certificates ?? 0, LockKeyhole], ["Settled margin", `₹${((overview?.margin_minor || 0)/100).toLocaleString()}`, Coins]].map(([label, value, Icon]) => <Card key={label} className="p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p></div><div className="soft-icon"><Icon className="h-5 w-5"/></div></div></Card>)}
    </div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-violet-100 bg-white p-2">
      {TABS.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold ${tab === id ? "brand-gradient text-white shadow-brand" : "text-slate-500 hover:bg-violet-50"}`}><Icon className="h-4 w-4"/>{label}</button>)}
    </div>

    {tab === "plugins" && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{catalog.map((item) => <Card key={item.slug} className="flex flex-col p-5">
      <div className="flex items-start justify-between"><div className="soft-icon"><Plug className="h-5 w-5"/></div><Badge tone={item.trust === "verified" ? "green" : "blue"}>{item.trust}</Badge></div>
      <h3 className="mt-4 text-lg font-extrabold text-slate-900">{item.name}</h3><p className="text-xs font-bold text-violet-500">{item.category}</p>
      <div className="mt-3 flex flex-wrap gap-1">{item.capabilities.map((x) => <span key={x} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{x}</span>)}</div>
      <p className="mt-3 text-[11px] leading-5 text-slate-400">Permissions: {item.scopes.join(", ") || "No workspace data"}</p>
      <div className="mt-auto pt-5">{item.installation ? <div className="flex items-center gap-2 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4"/>{item.installation.status.replaceAll("_", " ")}</div> : <Button size="sm" onClick={() => install(item)}><Plug className="h-4 w-4"/>Install safely</Button>}</div>
    </Card>)}</div>}

    {tab === "ai" && policy && <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <Card className="p-6"><div className="flex items-center gap-3"><div className="soft-icon"><Bot className="h-5 w-5"/></div><div><h2 className="font-heading text-xl font-extrabold">Policy-based AI router</h2><p className="text-xs text-slate-500">One task interface; routing by quality, cost, latency, privacy and availability.</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><Select label="Routing strategy" value={policy.strategy} onChange={(e)=>setPolicy({...policy,strategy:e.target.value})}>{["balanced","quality","cost","latency","privacy"].map(x=><option key={x}>{x}</option>)}</Select><Select label="Data region" value={policy.data_region} onChange={(e)=>setPolicy({...policy,data_region:e.target.value})}>{["global","india","eu","us"].map(x=><option key={x}>{x}</option>)}</Select><Select label="PII handling" value={policy.pii_mode} onChange={(e)=>setPolicy({...policy,pii_mode:e.target.value})}>{["redact","block","allow"].map(x=><option key={x}>{x}</option>)}</Select><Select label="Fallback" value={String(policy.fallback_enabled)} onChange={(e)=>setPolicy({...policy,fallback_enabled:e.target.value === "true"})}><option value="true">Enabled</option><option value="false">Disabled</option></Select></div>
        <Button className="mt-5" onClick={savePolicy}><ShieldCheck className="h-4 w-4"/>Save governance policy</Button>
      </Card>
      <div className="space-y-3">{providers.map((p)=><Card key={p.slug} className="p-4"><div className="flex items-center justify-between"><div><p className="font-extrabold text-slate-900">{p.slug}</p><p className="mt-1 text-[11px] text-slate-400">{p.strengths.join(" · ")}</p></div><Badge tone={p.installation?.enabled ? "green" : "slate"}>{p.installation?.enabled ? "routable" : "not active"}</Badge></div></Card>)}</div>
    </div>}

    {tab === "domains" && <div className="grid gap-5 md:grid-cols-2"><Card className="p-6"><div className="soft-icon"><Globe2 className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-extrabold">Domain brokerage</h2><p className="mt-2 text-sm leading-6 text-slate-500">Search, registration, renewal, transfer, DNS and reseller-margin workflows. Live availability and pricing remain locked until an accredited registrar/reseller account is connected.</p><div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-700">Authoritative registrar adapter required before accepting payment.</div></Card><Card className="p-6"><div className="soft-icon"><LockKeyhole className="h-5 w-5"/></div><h2 className="mt-4 text-xl font-extrabold">SSL/TLS lifecycle</h2><p className="mt-2 text-sm leading-6 text-slate-500">Managed DV, wildcard DV and business OV requests with domain validation, issuance state, renewal policy and audit history. Private keys and certificate material are never returned by this dashboard.</p><div className="mt-4 flex flex-wrap gap-2">{["DV automation","Wildcard","OV workflow","Renewal alerts","CT monitoring"].map(x=><Badge key={x} tone="blue">{x}</Badge>)}</div></Card></div>}

    {tab === "revenue" && revenue && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{revenue.streams.map((s)=><Card key={s.id} className="p-5"><div className="flex items-center justify-between"><Store className="h-5 w-5 text-violet-600"/><Badge tone="blue">{s.model}</Badge></div><h3 className="mt-4 font-extrabold capitalize text-slate-900">{s.id.replaceAll("_", " ")}</h3><p className="mt-1 text-xs text-slate-500">Meter: {s.unit}</p></Card>)}<Card className="border-emerald-100 bg-emerald-50/60 p-5 md:col-span-2 xl:col-span-3"><div className="flex gap-3"><CloudCog className="mt-0.5 h-5 w-5 text-emerald-600"/><div><h3 className="font-extrabold text-emerald-900">Financial controls included</h3><p className="mt-1 text-xs leading-5 text-emerald-700">{revenue.controls.join(" · ")}</p></div></div></Card></div>}
  </div>;
}
