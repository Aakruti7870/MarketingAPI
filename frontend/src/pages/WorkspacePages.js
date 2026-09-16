import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BarChart3, Bot, BriefcaseBusiness, Check, ChevronRight, FileText, FolderOpen,
  History as HistoryIcon, Image, Megaphone, MessageSquare, Search, Settings2,
  ShieldCheck, Sparkles, UploadCloud, Users, Zap,
} from "lucide-react";

const WORKFLOWS = [
  { icon: Megaphone, title: "Campaign Planner", category: "Marketing", text: "Turn a goal into campaign angles, hooks and channel ideas.", prompt: "Plan a campaign for my next business promotion." },
  { icon: Users, title: "Lead Research", category: "Sales", text: "Prioritize leads and identify the next best sales action.", prompt: "Review my leads and tell me who I should contact first." },
  { icon: MessageSquare, title: "WhatsApp Follow-up", category: "Sales", text: "Create short, professional follow-up messages that feel human.", prompt: "Write a WhatsApp follow-up for a warm lead." },
  { icon: Image, title: "Creative Direction", category: "Content", text: "Generate ideas for social creatives, posters and promotions.", prompt: "Give me creative directions for a premium social campaign." },
  { icon: BarChart3, title: "Analytics Explainer", category: "Insights", text: "Turn performance numbers into clear decisions and next actions.", prompt: "Explain my marketing performance and what to improve next." },
  { icon: BriefcaseBusiness, title: "Quotation Assistant", category: "Sales", text: "Structure clear offers and quotations for business prospects.", prompt: "Help me draft a professional quotation for a qualified lead." },
];

const HISTORY = [
  { group: "Today", items: ["Plan a September lead campaign", "Write a follow-up for a warm prospect", "Ideas for a premium launch"] },
  { group: "Yesterday", items: ["Review hot leads", "Improve our WhatsApp offer", "Create a short sales sequence"] },
  { group: "Previous 7 days", items: ["Campaign ideas for local customers", "Summarize workspace activity", "Prepare a quotation follow-up"] },
];

export function ExplorePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Marketing", "Sales", "Content", "Insights"];
  const rows = filter === "All" ? WORKFLOWS : WORKFLOWS.filter((item) => item.category === filter);
  return (
    <PageFrame eyebrow="Explore" title="Discover powerful ways to work with GOLD-e AI." sub="Curated workflows for marketing, sales, content and daily business decisions.">
      <div className="mb-6 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${filter === item ? "brand-gradient text-white shadow-brand" : "border border-violet-100 bg-white/80 text-slate-500 hover:text-violet-700"}`}>{item}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item) => <WorkflowCard key={item.title} {...item} onOpen={() => navigate(`/assistant?prompt=${encodeURIComponent(item.prompt)}`)} />)}</div>
    </PageFrame>
  );
}

export function UseCasesPage() {
  const navigate = useNavigate();
  const sections = [
    ["Marketing", Megaphone, ["Campaign ideation", "Social content", "Offer positioning", "Creative direction"]],
    ["Sales", Users, ["Lead prioritization", "Follow-ups", "Quotations", "Opportunity next steps"]],
    ["Operations", Zap, ["Daily planning", "Recurring workflows", "Team handoffs", "Workspace summaries"]],
    ["Insights", BarChart3, ["Performance review", "Trend explanations", "Funnel analysis", "Action recommendations"]],
  ];
  return (
    <PageFrame eyebrow="Use Cases" title="One assistant, built around real business work." sub="Choose a job to be done and move directly into a focused AI workflow.">
      <div className="grid gap-5 lg:grid-cols-2">{sections.map(([name, Icon, items]) => <article key={name} className="app-panel p-6"><div className="flex items-center gap-3"><div className="soft-icon"><Icon className="h-5 w-5" /></div><div><h3 className="font-heading text-lg font-extrabold text-slate-900">{name}</h3><p className="text-xs text-slate-400">Built-in GOLD-e AI workflows</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{items.map((item) => <button key={item} onClick={() => navigate(`/assistant?prompt=${encodeURIComponent(`Help me with ${item.toLowerCase()} for my business.`)}`)} className="flex items-center justify-between rounded-2xl border border-violet-100 bg-white/75 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"><span>{item}</span><ChevronRight className="h-4 w-4 text-violet-400" /></button>)}</div></article>)}</div>
    </PageFrame>
  );
}

export function FilesPage() {
  const [files, setFiles] = useState([]);
  const addFiles = (list) => {
    const next = Array.from(list || []).map((file) => ({ name: file.name, size: file.size, type: file.type || "File" }));
    setFiles((prev) => [...next, ...prev].slice(0, 20));
    if (next.length) toast.success(`${next.length} file${next.length > 1 ? "s" : ""} added to this session`);
  };
  return (
    <PageFrame eyebrow="My Files" title="Bring useful context into your AI workspace." sub="A polished file workspace is ready for the storage and retrieval layer when it is connected.">
      <label className="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-violet-200 bg-white/65 px-6 text-center shadow-sm transition hover:border-violet-300 hover:bg-white/85">
        <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <div className="soft-icon !h-14 !w-14"><UploadCloud className="h-6 w-6" /></div>
        <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900">Drop files here or browse</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">PDF, documents, spreadsheets and images can appear here as workspace context once persistent storage is enabled.</p>
        <span className="mt-4 rounded-xl border border-violet-100 bg-white px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm">Choose files</span>
      </label>
      <div className="mt-7 app-panel overflow-hidden"><div className="flex items-center justify-between border-b border-violet-100/80 px-5 py-4"><div><h3 className="font-heading font-extrabold text-slate-900">Recent files</h3><p className="text-xs text-slate-400">Session preview</p></div><FolderOpen className="h-5 w-5 text-violet-400" /></div>{files.length === 0 ? <div className="px-5 py-12 text-center"><FileText className="mx-auto h-8 w-8 text-violet-300" /><p className="mt-3 text-sm font-bold text-slate-600">No files selected yet</p><p className="mt-1 text-xs text-slate-400">Selected files will appear here for this UI session.</p></div> : <div className="divide-y divide-violet-50">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center gap-3 px-5 py-3"><div className="soft-mini"><FileText className="h-3.5 w-3.5" /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-700">{file.name}</div><div className="text-[11px] text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</div></div><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">Ready</span></div>)}</div>}</div>
    </PageFrame>
  );
}

export function HistoryPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => HISTORY.map((group) => ({ ...group, items: group.items.filter((item) => item.toLowerCase().includes(query.toLowerCase())) })).filter((group) => group.items.length), [query]);
  return (
    <PageFrame eyebrow="History" title="Pick up exactly where you left off." sub="A clean conversation history layout for recent AI work and reusable context.">
      <div className="relative mb-6 max-w-xl"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" className="w-full rounded-2xl border border-violet-100 bg-white/85 py-3 pl-11 pr-4 text-sm outline-none shadow-sm transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/60" /></div>
      <div className="space-y-6">{filtered.map((group) => <section key={group.group}><h3 className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-slate-400">{group.group}</h3><div className="app-panel divide-y divide-violet-50 overflow-hidden">{group.items.map((item) => <button key={item} className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-violet-50/45"><div className="soft-mini"><HistoryIcon className="h-3.5 w-3.5" /></div><div className="flex-1"><div className="text-sm font-bold text-slate-700">{item}</div><div className="mt-0.5 text-[11px] text-slate-400">GOLD-e AI conversation</div></div><ChevronRight className="h-4 w-4 text-slate-300" /></button>)}</div></section>)}</div>
    </PageFrame>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({ notifications: true, suggestions: true, autoSave: true, productTips: false });
  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  return (
    <PageFrame eyebrow="Settings" title="Personalize your GOLD-e AI workspace." sub="Keep account, assistant and notification preferences clear and easy to manage.">
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="app-panel p-6"><SectionTitle icon={Bot} title="Assistant preferences" sub="Tune the everyday AI experience." /><div className="mt-5 space-y-3"><SettingRow label="Smart prompt suggestions" text="Show contextual starter prompts in the assistant." enabled={settings.suggestions} onClick={() => toggle("suggestions")} /><SettingRow label="Auto-save conversations" text="Keep chat history available in your workspace." enabled={settings.autoSave} onClick={() => toggle("autoSave")} /><SettingRow label="Product tips" text="Show occasional workflow tips and feature guidance." enabled={settings.productTips} onClick={() => toggle("productTips")} /></div></section>
          <section className="app-panel p-6"><SectionTitle icon={ShieldCheck} title="Security & privacy" sub="Workspace controls remain server-enforced." /><div className="mt-5 grid gap-3 sm:grid-cols-2"><InfoCard label="Tenant isolation" value="Enabled" /><InfoCard label="Credential vault" value="Encrypted" /><InfoCard label="Session" value="Secure token" /><InfoCard label="Contact privacy" value="Protected" /></div></section>
        </div>
        <div className="space-y-5">
          <section className="app-panel p-6"><SectionTitle icon={Settings2} title="Workspace experience" sub="Keep the interface focused and calm." /><div className="mt-5 space-y-4"><div><label className="mb-1.5 block text-xs font-bold text-slate-500">Interface theme</label><div className="grid grid-cols-3 gap-2"><button className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700">Light</button><button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">System</button><button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">Dark</button></div></div><SettingRow label="Notifications" text="Workspace activity and important updates." enabled={settings.notifications} onClick={() => toggle("notifications")} /></div></section>
          <section className="rounded-[26px] border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 shadow-sm"><div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div><h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900">GOLD-e AI</h3><p className="mt-1 text-sm leading-6 text-slate-500">One professional workspace for AI assistance, lead operations, campaigns and automation.</p><div className="mt-4 text-xs font-bold text-violet-600">gold-etechapp.com</div></section>
        </div>
      </div>
    </PageFrame>
  );
}

function PageFrame({ eyebrow, title, sub, children }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8"><div className="mb-8 max-w-3xl"><div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-violet-500"><Sparkles className="h-4 w-4" />{eyebrow}</div><h1 className="font-heading text-3xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-4xl">{title}</h1><p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">{sub}</p></div>{children}</div>;
}

function WorkflowCard({ icon: Icon, title, category, text, onOpen }) {
  return <article className="app-panel group p-5 transition hover:-translate-y-1 hover:shadow-hover"><div className="flex items-center justify-between"><div className="soft-icon"><Icon className="h-5 w-5" /></div><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-600">{category}</span></div><h3 className="mt-5 font-heading text-lg font-extrabold text-slate-900">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{text}</p><button onClick={onOpen} className="mt-5 flex items-center gap-2 text-xs font-extrabold text-violet-700">Try this workflow <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></button></article>;
}

function SectionTitle({ icon: Icon, title, sub }) {
  return <div className="flex items-start gap-3"><div className="soft-icon"><Icon className="h-5 w-5" /></div><div><h3 className="font-heading text-lg font-extrabold text-slate-900">{title}</h3><p className="mt-0.5 text-xs text-slate-400">{sub}</p></div></div>;
}

function SettingRow({ label, text, enabled, onClick }) {
  return <button onClick={onClick} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white/70 px-4 py-3 text-left"><div><div className="text-sm font-bold text-slate-700">{label}</div><div className="mt-0.5 text-xs leading-5 text-slate-400">{text}</div></div><span className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "brand-gradient" : "bg-slate-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} /></span></button>;
}

function InfoCard({ label, value }) {
  return <div className="rounded-2xl border border-violet-100 bg-white/70 p-4"><div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Check className="h-3.5 w-3.5 text-emerald-500" />{label}</div><div className="mt-2 text-sm font-extrabold text-slate-700">{value}</div></div>;
}
