import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiError } from "../api";
import { Bot, CalendarDays, Building2, BriefcaseBusiness, Store, Megaphone, CheckCircle2, Crown, ExternalLink, Power, Save } from "lucide-react";

const ICONS = { healthcare: CalendarDays, infrastructure: Building2, b2b: BriefcaseBusiness, "small-business": Store, "social-growth": Megaphone };

export default function IndustryBots() {
 const navigate = useNavigate();
 const [catalog, setCatalog] = useState(null);
 const [workspace, setWorkspace] = useState(null);
 const [selected, setSelected] = useState(null);
 const [businessName, setBusinessName] = useState("");
 const [instructions, setInstructions] = useState("");
 const [whatsapp, setWhatsapp] = useState(false);
 const [status, setStatus] = useState("");
 const [busy, setBusy] = useState(false);

 const load = async () => {
  try {
   const [catalogRes, workspaceRes] = await Promise.all([api.get("/agentic-platform/catalog"), api.get("/agentic-platform/workspace")]);
   setCatalog(catalogRes.data); setWorkspace(workspaceRes.data);
   if (workspaceRes.data.agent) {
    const a = workspaceRes.data.agent;
    setSelected(a.bot_id); setBusinessName(a.business_name || ""); setInstructions(a.instructions || ""); setWhatsapp((a.channels || []).includes("whatsapp"));
   }
  } catch (e) { setStatus(apiError(e.response?.data?.detail) || "Could not load Agentic AI platform"); }
 };
 useEffect(() => { load(); }, []);

 const bots = useMemo(() => catalog?.industries || [], [catalog]);
 const proActive = workspace?.plan === "Pro" && workspace?.subscription_status === "active";

 const setup = async () => {
  if (!selected || !businessName.trim()) { setStatus("Select an agent and enter your business name"); return; }
  setBusy(true); setStatus("Deploying your Agentic AI business bot...");
  try {
   await api.post("/agentic-platform/setup", { business_name: businessName.trim(), industry: selected, bot_id: selected, channels: ["web", ...(whatsapp ? ["whatsapp"] : [])], instructions });
   setStatus("Agent deployed and ready"); await load();
  } catch (e) { setStatus(apiError(e.response?.data?.detail) || "Agent deployment failed"); }
  finally { setBusy(false); }
 };

 const toggle = async () => {
  if (!workspace?.agent) return;
  setBusy(true);
  try { await api.post("/agentic-platform/state", { enabled: !workspace.agent.enabled }); await load(); setStatus(!workspace.agent.enabled ? "Agent is live" : "Agent paused"); }
  catch (e) { setStatus(apiError(e.response?.data?.detail) || "Could not change agent state"); }
  finally { setBusy(false); }
 };

 return <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
  <header>
   <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-violet-500"><Bot className="h-4 w-4"/> GOLD-e AI Agentic Business Platform</div>
   <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">One platform. Your business. Your Agent.</h1>
   <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">Choose your business, deploy the matching Agentic AI bot, connect approved channels and give it the operating rules it should follow.</p>
  </header>

  {!proActive && <section className="app-panel flex flex-col gap-4 border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
   <div><div className="flex items-center gap-2 font-heading font-extrabold text-slate-950"><Crown className="h-5 w-5 text-amber-600"/> Pro plan unlocks Agentic deployment</div><p className="mt-1 text-sm text-slate-600">Any business can create an account and purchase Pro Monthly or Pro Annual from the public pricing page.</p></div>
   <button onClick={() => navigate("/pricing")} className="brand-gradient inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-brand">View plans <ExternalLink className="h-4 w-4"/></button>
  </section>}

  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {bots.map(bot => { const I = ICONS[bot.id] || Bot; return <button key={bot.id} onClick={() => { setSelected(bot.id); setStatus(""); }} className={`app-panel p-5 text-left transition hover:-translate-y-0.5 ${selected === bot.id ? "ring-2 ring-violet-400" : ""}`}>
    <div className="flex items-start justify-between"><div className="soft-icon"><I className="h-5 w-5"/></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-violet-600">Agent</span></div>
    <h2 className="mt-5 font-heading text-lg font-extrabold text-slate-900">{bot.agent}</h2><p className="mt-2 text-xs text-slate-500">{bot.name}</p>
   </button>; })}
  </section>

  <section className="app-panel p-5 sm:p-7">
   <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-heading text-2xl font-extrabold text-slate-950">Deploy your business agent</h2><p className="mt-1 text-sm text-slate-500">Configuration is workspace-scoped and only owners/admins can deploy it.</p></div>{workspace?.agent && <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${workspace.agent.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{workspace.agent.enabled ? "LIVE" : "PAUSED"}</span>}</div>
   <div className="mt-6 grid gap-4 lg:grid-cols-2">
    <label className="text-sm font-bold text-slate-700">Business name<input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your company / shop name" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-400"/></label>
    <label className="text-sm font-bold text-slate-700">Selected agent<div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold text-slate-800">{bots.find(b => b.id === selected)?.agent || "Choose an agent above"}</div></label>
   </div>
   <label className="mt-4 block text-sm font-bold text-slate-700">Operating instructions<textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={4} placeholder="Describe your rates, working hours, escalation rules, products, services or sales process..." className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-violet-400"/></label>
   <div className="mt-4 flex flex-wrap items-center gap-3"><label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)}/> WhatsApp channel</label><span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">Web channel is always enabled</span></div>
   <div className="mt-6 flex flex-wrap gap-3">
    <button disabled={busy || !proActive || !selected} onClick={setup} className="brand-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-brand disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-4 w-4"/>{workspace?.agent ? "Update & deploy" : "Deploy agent"}</button>
    {workspace?.agent && <button disabled={busy} onClick={toggle} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 disabled:opacity-50"><Power className="h-4 w-4"/>{workspace.agent.enabled ? "Pause agent" : "Enable agent"}</button>}
   </div>
   {status && <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4"/>{status}</div>}
  </section>
 </div>;
}
