import React, { useMemo, useState } from "react";
import { ArrowRight, Bot, BrainCircuit, CheckCircle2, ChevronRight, Clock3, Filter, GitBranch, Mail, Megaphone, MessageSquare, Play, Search, Settings2, Sparkles, Target, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WORKFLOWS = [
  { id: "lead-capture", name: "Lead Capture", category: "Leads & CRM", description: "Capture leads from forms and connected ad channels and normalize them into the Lumina360 lead engine.", icon: Users, path: "/leads", tags: ["web forms", "ads", "crm"], status: "Ready" },
  { id: "ai-scoring", name: "AI Lead Scoring", category: "Leads & CRM", description: "Score intent and engagement signals so sales teams can focus on the leads that need attention first.", icon: BrainCircuit, path: "/leads", tags: ["AI", "qualification", "sales"], status: "Ready" },
  { id: "lead-nurture", name: "Lead Nurturing", category: "Leads & CRM", description: "Trigger follow-ups from lead behavior and move prospects through a structured nurture journey.", icon: Target, path: "/automations", tags: ["follow-up", "behavior", "CRM"], status: "Ready" },
  { id: "campaign-builder", name: "AI Campaign Builder", category: "Campaigns", description: "Turn a product, audience and objective into a campaign strategy, content plan and execution workflow.", icon: Megaphone, path: "/campaigns", tags: ["strategy", "AI", "campaign"], status: "Ready" },
  { id: "content-factory", name: "AI Content Factory", category: "Content", description: "Generate platform-ready posts, ads, captions, email copy and reusable campaign content.", icon: Sparkles, path: "/ai-studio", tags: ["content", "social", "AI"], status: "Ready" },
  { id: "content-calendar", name: "Content Calendar", category: "Content", description: "Plan, approve and schedule content across your marketing calendar without exposing automation complexity.", icon: Clock3, path: "/templates", tags: ["calendar", "approval", "schedule"], status: "Ready" },
  { id: "social-publishing", name: "Social Publishing", category: "Social Media", description: "Route approved content to connected social channels and keep publishing activity organized.", icon: MessageSquare, path: "/channels", tags: ["Instagram", "Facebook", "LinkedIn"], status: "Ready" },
  { id: "email-campaigns", name: "Email Campaigns", category: "Email", description: "Create segmented email campaigns, personalize with AI, schedule delivery and inspect engagement.", icon: Mail, path: "/campaigns", tags: ["email", "segments", "analytics"], status: "Ready" },
  { id: "competitor-intelligence", name: "Competitor Intelligence", category: "AI Intelligence", description: "Research competitor positioning, content patterns and market opportunities and turn findings into actions.", icon: Bot, path: "/ai-studio", tags: ["research", "competitors", "AI"], status: "Ready" },
  { id: "trend-intelligence", name: "Trend Intelligence", category: "AI Intelligence", description: "Identify relevant trends and convert them into content opportunities and campaign ideas.", icon: BrainCircuit, path: "/ai-studio", tags: ["trends", "research", "content"], status: "Ready" },
  { id: "customer-voice", name: "Customer Voice", category: "AI Intelligence", description: "Analyze feedback and reviews for sentiment, themes, complaints and actionable marketing signals.", icon: MessageSquare, path: "/analytics", tags: ["feedback", "sentiment", "insights"], status: "Ready" },
  { id: "utm-attribution", name: "UTM & Attribution", category: "Analytics", description: "Keep campaign tracking structured so traffic, leads and conversions can be connected to marketing activity.", icon: GitBranch, path: "/analytics", tags: ["UTM", "attribution", "ROI"], status: "Ready" },
  { id: "campaign-reporting", name: "Campaign Reporting", category: "Analytics", description: "Aggregate campaign performance and surface useful changes, trends and follow-up actions.", icon: Megaphone, path: "/analytics", tags: ["reports", "performance", "ROI"], status: "Ready" },
  { id: "landing-pages", name: "Campaign Landing Pages", category: "Campaigns", description: "Create a campaign destination around the offer, audience and conversion goal, then connect it to lead capture.", icon: ArrowRight, path: "/campaigns", tags: ["landing page", "conversion", "campaign"], status: "Ready" },
  { id: "whatsapp-followup", name: "WhatsApp Follow-up", category: "Communication", description: "Use connected messaging channels for lead notifications and follow-up journeys with consent controls.", icon: MessageSquare, path: "/whatsapp-connection", tags: ["WhatsApp", "follow-up", "consent"], status: "Ready" },
  { id: "crm-sync", name: "CRM Synchronization", category: "Integrations", description: "Keep Lumina360 records aligned with connected CRM systems and preserve a consistent customer model.", icon: GitBranch, path: "/channels", tags: ["HubSpot", "Salesforce", "Zoho"], status: "Ready" },
  { id: "payment-revenue", name: "Revenue Attribution", category: "Commerce", description: "Connect payment and commerce signals to campaigns so marketing performance can be understood beyond clicks.", icon: Target, path: "/analytics", tags: ["Stripe", "commerce", "revenue"], status: "Ready" },
];

const CATEGORIES = ["All", "Leads & CRM", "Campaigns", "Content", "Social Media", "Email", "AI Intelligence", "Analytics", "Communication", "Integrations", "Commerce"];

export default function AutomationCenter() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => WORKFLOWS.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const haystack = `${item.name} ${item.description} ${item.category} ${item.tags.join(" ")}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [category, query]);

  const run = (item) => navigate(item.path);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[30px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-fuchsia-200/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-violet-700"><Sparkles className="h-3.5 w-3.5" /> Lumina360 Automation Center</div>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Turn marketing work into visible, repeatable workflows.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Use curated automation patterns behind simple product actions. Users see the goal, inputs, status and result—not raw workflow-node complexity.</p>
          </div>
          <button onClick={() => navigate("/flows")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"><GitBranch className="h-4 w-4" /> Visual Flow Builder</button>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Workflow recipes", value: WORKFLOWS.length, icon: GitBranch }, { label: "AI-powered", value: WORKFLOWS.filter((x) => x.tags.includes("AI")).length, icon: BrainCircuit }, { label: "Product areas", value: new Set(WORKFLOWS.map((x) => x.category)).size, icon: Settings2 }, { label: "Ready actions", value: WORKFLOWS.filter((x) => x.status === "Ready").length, icon: CheckCircle2 }].map((stat) => <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500">{stat.label}</span><stat.icon className="h-4 w-4 text-violet-500" /></div><div className="mt-2 text-2xl font-extrabold text-slate-950">{stat.value}</div></div>)}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search workflows, channels, AI, CRM…" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />{query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search"><X className="h-4 w-4" /></button>}</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:max-w-[62%]"><Filter className="h-4 w-4 shrink-0 text-slate-400" />{CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-extrabold transition ${category === item ? "bg-violet-600 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-700"}`}>{item}</button>)}</div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <WorkflowCard key={item.id} item={item} onOpen={() => setSelected(item)} onRun={() => run(item)} />)}
      </div>
      {!filtered.length && <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 font-heading text-base font-extrabold text-slate-900">No matching workflows</h3><p className="mt-1 text-sm text-slate-500">Try a different category or search term.</p></div>}

      {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><div className="w-full max-w-xl rounded-[28px] border border-violet-100 bg-white p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><selected.icon className="h-5 w-5" /></div><h2 className="mt-4 font-heading text-2xl font-extrabold text-slate-950">{selected.name}</h2><p className="mt-1 text-xs font-bold text-violet-600">{selected.category}</p></div><button onClick={() => setSelected(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close"><X className="h-5 w-5" /></button></div><p className="mt-5 text-sm leading-6 text-slate-600">{selected.description}</p><div className="mt-5 flex flex-wrap gap-2">{selected.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">{tag}</span>)}</div><div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4"><div className="flex items-center gap-2 text-xs font-extrabold text-violet-800"><CheckCircle2 className="h-4 w-4" /> Product action ready</div><p className="mt-1 text-xs leading-5 text-slate-600">This entry maps to an existing Lumina360 workspace surface. Credentials and external execution remain controlled by the connected integration layer.</p></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-600">Close</button><button onClick={() => run(selected)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-violet-700"><Play className="h-4 w-4" /> Open & Run</button></div></div></div>}
    </div>
  );
}

function WorkflowCard({ item, onOpen, onRun }) {
  const Icon = item.icon;
  return <article className="group flex min-h-[270px] flex-col rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-card"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-100"><Icon className="h-5 w-5" /></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700">{item.status}</span></div><div className="mt-4"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-violet-600">{item.category}</div><h3 className="mt-1 font-heading text-lg font-extrabold text-slate-950">{item.name}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p></div><div className="mt-auto pt-4"><div className="mb-3 flex flex-wrap gap-1.5">{item.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500">{tag}</span>)}</div><div className="grid grid-cols-2 gap-2"><button onClick={onOpen} className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">View workflow</button><button onClick={onRun} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-violet-700">Open <ChevronRight className="h-3.5 w-3.5" /></button></div></div></article>;
}
