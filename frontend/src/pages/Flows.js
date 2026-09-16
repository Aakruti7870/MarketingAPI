import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight, BarChart3, Bot, CheckCircle2, ChevronRight, CopyPlus, GitBranch,
  Globe2, Layers3, MessageCircleMore, Play, Plus, RefreshCw, Rocket, ShieldCheck,
  Smartphone, Sparkles, X,
} from "lucide-react";

const CHANNELS = {
  web: { label: "Web", icon: Globe2 },
  support_widget: { label: "Support Widget", icon: MessageCircleMore },
  whatsapp: { label: "WhatsApp", icon: Smartphone },
};

const CATEGORY_LABELS = {
  CUSTOMER_SUPPORT: "Customer Support",
  LEAD_GENERATION: "Lead Generation",
  SURVEY: "Survey",
  APPOINTMENT_BOOKING: "Appointment Booking",
  CONTACT_US: "Contact Us",
};

export default function Flows() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [flows, setFlows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [runner, setRunner] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const canPublish = ["owner", "admin"].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const [templateRes, flowRes] = await Promise.all([api.get("/flows/templates"), api.get("/flows")]);
      setTemplates(templateRes.data || []);
      setFlows(flowRes.data || []);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not load flows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openFlow = async (flow) => {
    setRunner(null);
    setAnalytics(null);
    try {
      const { data } = await api.get(`/flows/${flow.id}`);
      setSelected(data);
      const metrics = await api.get(`/flows/${flow.id}/analytics`);
      setAnalytics(metrics.data);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not open flow");
    }
  };

  const createFromTemplate = async (template) => {
    setCreating(template.key);
    try {
      const { data } = await api.post(`/flows/from-template/${template.key}`);
      toast.success(`${template.name} created as a draft`);
      await load();
      await openFlow(data);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not create flow");
    } finally {
      setCreating("");
    }
  };

  const createBlank = async () => {
    setCreating("blank");
    try {
      const { data } = await api.post("/flows", {
        name: "New Support Flow",
        category: "CUSTOMER_SUPPORT",
        description: "A new GOLD-e flow ready to customize.",
        channels: ["web", "support_widget"],
        definition: {
          entry_screen: "start",
          screens: [
            {
              id: "start",
              title: "Start",
              body: "Collect the first piece of information.",
              fields: [{ name: "request", type: "textarea", label: "How can we help?", required: true }],
              next_screen: "complete",
            },
            { id: "complete", title: "Complete", body: "Thank you. Your response has been recorded.", fields: [], terminal: true },
          ],
        },
      });
      toast.success("Blank flow created");
      await load();
      await openFlow(data);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not create flow");
    } finally {
      setCreating("");
    }
  };

  const publish = async () => {
    if (!selected || !canPublish) return;
    setPublishing(true);
    try {
      const { data } = await api.post(`/flows/${selected.id}/publish`);
      toast.success(`Flow v${data.version} published`);
      await load();
      await openFlow(selected);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not publish flow");
    } finally {
      setPublishing(false);
    }
  };

  const startPreview = async () => {
    if (!selected) return;
    try {
      const { data } = await api.post(`/flows/${selected.id}/sessions`, { channel: "web", mode: "preview" });
      setRunner(data);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Could not start preview");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-7 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-violet-500"><GitBranch className="h-4 w-4" /> GOLD-e Flow Engine</div>
          <h1 className="font-heading text-3xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-4xl">Build one workflow. Run it across every customer channel.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Flows are versioned, workspace-isolated and channel-neutral. Web and Support Widget can run now; the WhatsApp renderer will attach to the same published versions after WABA activation.</p>
        </div>
        <button onClick={createBlank} disabled={!!creating} className="brand-gradient flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-brand disabled:opacity-50"><Plus className="h-4 w-4" /> New Flow</button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard icon={Layers3} title="Single source of truth" text="GOLD-e schema stays independent from Meta's channel-specific format." />
        <StatusCard icon={ShieldCheck} title="Safe support intake" text="Passwords, OTPs, API keys and secrets are blocked from flow field definitions." />
        <StatusCard icon={Rocket} title="WhatsApp-ready" text="Publish stable versions now and add the Meta Flow adapter after WABA is active." />
      </section>

      <section>
        <SectionTitle title="Starter flows" sub="Create a production-safe draft from a reusable template." />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {templates.map((template) => (
            <article key={template.key} className="app-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="soft-icon"><Sparkles className="h-5 w-5" /></div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-violet-600">{CATEGORY_LABELS[template.category] || template.category}</span>
              </div>
              <h3 className="mt-5 font-heading text-lg font-extrabold text-slate-900">{template.name}</h3>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-500">{template.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">{template.channels?.map((channel) => <ChannelBadge key={channel} channel={channel} />)}</div>
              <button onClick={() => createFromTemplate(template)} disabled={creating === template.key} className="mt-5 flex items-center gap-2 text-xs font-extrabold text-violet-700 disabled:opacity-50"><CopyPlus className="h-4 w-4" /> {creating === template.key ? "Creating…" : "Use template"}</button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <div>
          <SectionTitle title="My flows" sub={`${flows.length} flow${flows.length === 1 ? "" : "s"} in this workspace`} />
          <div className="mt-4 app-panel overflow-hidden">
            {loading ? <div className="p-8 text-center text-sm text-slate-400">Loading flows…</div> : flows.length === 0 ? (
              <div className="p-8 text-center"><GitBranch className="mx-auto h-8 w-8 text-violet-300" /><p className="mt-3 text-sm font-bold text-slate-600">No flows yet</p><p className="mt-1 text-xs text-slate-400">Start with GOLD-e AI Support above.</p></div>
            ) : (
              <div className="divide-y divide-violet-50">{flows.map((flow) => (
                <button key={flow.id} onClick={() => openFlow(flow)} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-violet-50/45 ${selected?.id === flow.id ? "bg-violet-50/55" : ""}`}>
                  <div className="soft-mini"><GitBranch className="h-3.5 w-3.5" /></div>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-slate-800">{flow.name}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span>{CATEGORY_LABELS[flow.category] || flow.category}</span><span>•</span><StatusBadge status={flow.status} /></div></div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}</div>
            )}
          </div>
        </div>

        <div>
          <SectionTitle title="Flow workspace" sub="Inspect the draft, publish an immutable version and run a safe preview." />
          <div className="mt-4 app-panel min-h-96 p-5 sm:p-6">
            {!selected ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center"><GitBranch className="h-10 w-10 text-violet-300" /><p className="mt-4 text-sm font-extrabold text-slate-700">Select a flow to open the builder workspace</p><p className="mt-1 max-w-md text-xs leading-5 text-slate-400">The first coding pass focuses on versioned definitions, branching, sessions, validation and analytics. A drag-and-drop canvas can sit on this same API next.</p></div>
            ) : runner ? (
              <FlowRunner initial={runner} onClose={() => setRunner(null)} />
            ) : (
              <FlowDetail flow={selected} analytics={analytics} canPublish={canPublish} publishing={publishing} onPublish={publish} onPreview={startPreview} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowDetail({ flow, analytics, canPublish, publishing, onPublish, onPreview }) {
  const screens = flow.definition?.screens || [];
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-2xl font-extrabold text-slate-950">{flow.name}</h2><StatusBadge status={flow.status} /></div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{flow.description}</p><div className="mt-3 flex flex-wrap gap-2">{flow.channels?.map((channel) => <ChannelBadge key={channel} channel={channel} />)}</div></div>
        <div className="flex gap-2"><button onClick={onPreview} className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-extrabold text-violet-700 shadow-sm"><Play className="h-3.5 w-3.5" /> Preview</button>{canPublish && <button onClick={onPublish} disabled={publishing} className="brand-gradient flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold text-white shadow-brand disabled:opacity-50"><Rocket className="h-3.5 w-3.5" /> {publishing ? "Publishing…" : "Publish"}</button>}</div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Screens" value={screens.length} />
        <Metric label="Published" value={flow.published_version ? `v${flow.published_version}` : "Draft"} />
        <Metric label="Sessions" value={analytics?.started ?? 0} />
        <Metric label="Completion" value={`${analytics?.completion_rate ?? 0}%`} />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between"><h3 className="font-heading text-sm font-extrabold text-slate-900">Flow map</h3><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entry: {flow.definition?.entry_screen}</span></div>
        <div className="space-y-2">{screens.map((screen, index) => (
          <div key={screen.id} className="rounded-2xl border border-violet-100 bg-white/70 p-4">
            <div className="flex items-start gap-3"><div className="brand-gradient flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold text-white">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="text-sm font-extrabold text-slate-800">{screen.title}</div><code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{screen.id}</code>{screen.terminal && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">Terminal</span>}</div><p className="mt-1 text-xs leading-5 text-slate-500">{screen.body || "No helper text"}</p><div className="mt-2 flex flex-wrap gap-1.5">{screen.fields?.map((field) => <span key={field.name} className="rounded-lg border border-violet-100 bg-violet-50/50 px-2 py-1 text-[10px] font-bold text-violet-600">{field.label} · {field.type}</span>)}</div>{screen.branches?.length > 0 && <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-cyan-600"><GitBranch className="h-3 w-3" /> {screen.branches.length} conditional branch{screen.branches.length === 1 ? "" : "es"}</div>}</div></div>
          </div>
        ))}</div>
      </div>

      {flow.versions?.length > 0 && <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/35 p-4"><div className="text-xs font-extrabold uppercase tracking-[.14em] text-slate-400">Published versions</div><div className="mt-2 flex flex-wrap gap-2">{flow.versions.map((item) => <span key={item.version} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">v{item.version}</span>)}</div></div>}
    </div>
  );
}

function FlowRunner({ initial, onClose }) {
  const [state, setState] = useState(initial);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const session = state?.session;
  const screen = state?.screen;
  const completed = session?.status === "completed";

  const submit = async () => {
    if (!session || !screen || busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/flows/sessions/${session.id}/submit`, { answers });
      setState(data);
      setAnswers({});
      if (data.session?.status === "completed") toast.success("Flow preview completed");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail?.fields) toast.error(Object.values(detail.fields)[0]);
      else toast.error(apiError(detail) || "Could not continue flow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between"><div><div className="text-xs font-extrabold uppercase tracking-[.16em] text-violet-500">Preview session</div><div className="mt-1 text-xs text-slate-400">Channel: {CHANNELS[session?.channel]?.label || session?.channel}</div></div><button onClick={onClose} className="soft-round"><X className="h-4 w-4" /></button></div>
      {completed ? (
        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/55 p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" /><h3 className="mt-4 font-heading text-xl font-extrabold text-slate-900">Flow completed</h3><p className="mt-2 text-sm text-slate-500">This preview followed the same server-side validation and branching used by live sessions.</p><button onClick={onClose} className="mt-5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-violet-700 shadow-sm">Back to builder</button></div>
      ) : (
        <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/35 to-fuchsia-50/30 p-6 shadow-sm sm:p-8"><div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-brand"><Bot className="h-5 w-5" /></div><h3 className="mt-5 font-heading text-2xl font-extrabold text-slate-950">{screen?.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{screen?.body}</p><div className="mt-6 space-y-4">{screen?.fields?.map((field) => <FlowField key={field.name} field={field} value={answers[field.name]} onChange={(value) => setAnswers((prev) => ({ ...prev, [field.name]: value }))} />)}</div><button onClick={submit} disabled={busy} className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-brand disabled:opacity-50">{busy ? "Continuing…" : "Continue"}<ArrowRight className="h-4 w-4" /></button></div>
      )}
    </div>
  );
}

function FlowField({ field, value, onChange }) {
  const common = "mt-1.5 w-full rounded-2xl border border-violet-100 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none shadow-sm transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100/60";
  return (
    <label className="block"><span className="text-xs font-extrabold text-slate-600">{field.label}{field.required && <span className="ml-1 text-rose-500">*</span>}</span>
      {field.type === "textarea" ? <textarea rows={4} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={`${common} resize-none`} />
        : field.type === "select" ? <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={common}><option value="">Choose…</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        : field.type === "radio" ? <div className="mt-2 flex flex-wrap gap-2">{field.options?.map((option) => <button type="button" key={option.value} onClick={() => onChange(option.value)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${value === option.value ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500"}`}>{option.label}</button>)}</div>
        : field.type === "checkbox" ? <button type="button" onClick={() => onChange(!value)} className={`mt-2 rounded-xl border px-3 py-2 text-xs font-bold ${value ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>{value ? "Selected" : "Select"}</button>
        : <input type={field.type === "number" || field.type === "date" || field.type === "email" ? field.type : "text"} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={common} />}
    </label>
  );
}

function StatusCard({ icon: Icon, title, text }) {
  return <article className="app-panel p-5"><div className="soft-icon"><Icon className="h-5 w-5" /></div><h3 className="mt-4 font-heading text-base font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></article>;
}

function SectionTitle({ title, sub }) {
  return <div><h2 className="font-heading text-lg font-extrabold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-400">{sub}</p></div>;
}

function ChannelBadge({ channel }) {
  const config = CHANNELS[channel] || { label: channel, icon: Layers3 };
  const Icon = config.icon;
  return <span className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-2.5 py-1 text-[10px] font-extrabold text-slate-500"><Icon className="h-3 w-3 text-violet-500" />{config.label}</span>;
}

function StatusBadge({ status }) {
  const label = (status || "draft").replaceAll("_", " ");
  const cls = status === "published" ? "bg-emerald-50 text-emerald-700" : status === "published_with_draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500";
  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${cls}`}>{label}</span>;
}

function Metric({ label, value }) {
  return <div className="rounded-2xl border border-violet-100 bg-white/70 p-3"><div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400"><BarChart3 className="h-3 w-3" />{label}</div><div className="mt-1 text-lg font-extrabold text-slate-900">{value}</div></div>;
}
