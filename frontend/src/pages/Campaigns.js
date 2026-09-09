import React, { useEffect, useMemo, useState } from "react";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Plus, Send, Trash2, Users, CheckCircle2, Reply, Sparkles, ShieldCheck, Eye, PlayCircle, PauseCircle, Zap, XCircle } from "lucide-react";
import { toast } from "sonner";

const freshForm = () => ({
  name: "", objective: "Lead nurturing", channel: "WhatsApp", segment: "All Leads",
  target_mode: "segment", audience_ids: [],
  message: "", cta1: "", cta1url: "", reply_buttons: "",
  fu_enabled: false, fu_unit: "days", fu_steps: [{ day: 2, message: "" }],
});

const statusTone = (s) => ({ draft: "slate", approved: "blue", sending: "gold", sent: "green", Sent: "green", failed: "red", paused: "WARM", scheduled: "gold", Scheduled: "gold" }[s] || "slate");

export default function Campaigns() {
  const { user } = useAuth();
  const canApprove = user?.role === "owner" || user?.role === "admin";
  const [items, setItems] = useState(null);
  const [audiences, setAudiences] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(freshForm);
  const [saving, setSaving] = useState(false);
  const [genning, setGenning] = useState(false);
  const [preview, setPreview] = useState(null);

  const audienceById = useMemo(() => Object.fromEntries(audiences.map((a) => [a.id, a])), [audiences]);
  const load = async () => {
    try {
      const [campaignRes, audienceRes] = await Promise.all([api.get("/campaigns"), api.get("/audiences")]);
      setItems(campaignRes.data);
      setAudiences(audienceRes.data || []);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Campaign data could not be loaded");
    }
  };
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const aiWrite = async () => {
    if (!form.objective && !form.name) return toast.error("Add a name/objective first");
    setGenning(true);
    try {
      const { data } = await api.post("/ai/generate", { kind: "template", prompt: `${form.objective} — ${form.name}`, tone: "Persuasive", channel: form.channel });
      setForm((f) => ({ ...f, message: data.text }));
      toast.success("AI drafted message");
    } catch { toast.error("AI unavailable"); }
    setGenning(false);
  };

  const toggleAudience = (id) => {
    setForm((current) => ({
      ...current,
      audience_ids: current.audience_ids.includes(id)
        ? current.audience_ids.filter((item) => item !== id)
        : [...current.audience_ids, id],
    }));
  };

  const create = async (e) => {
    e.preventDefault();
    if (form.target_mode === "saved" && form.audience_ids.length === 0) {
      toast.error("Select at least one saved audience");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      objective: form.objective,
      channel: form.channel,
      segment: form.target_mode === "segment" ? form.segment : "All Leads",
      audience_ids: form.target_mode === "saved" ? form.audience_ids : [],
      message: form.message,
      cta_buttons: form.cta1 ? [{ label: form.cta1, url: form.cta1url }] : [],
      reply_buttons: form.reply_buttons.split(",").map((s) => s.trim()).filter(Boolean),
      followup: { enabled: form.fu_enabled, time_unit: form.fu_unit, steps: form.fu_enabled ? form.fu_steps.filter((s) => s.message) : [] },
    };
    try {
      const { data } = await api.post("/studio/campaigns", payload);
      toast.success(`Campaign created for ${data.stats?.audience ?? 0} contact${data.stats?.audience === 1 ? "" : "s"}`);
      setOpen(false); setForm(freshForm()); load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const doPreview = async (c) => {
    try {
      const { data } = await api.post(`/studio/campaigns/${c.id}/preview`);
      setPreview({ campaign: c, ...data });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };
  const approve = async (id) => { try { await api.post(`/studio/campaigns/${id}/approve`); toast.success("Approved"); load(); } catch (err) { toast.error(apiError(err.response?.data?.detail)); } };
  const send = async (id) => {
    toast.loading("Running pre-send safety checks…", { id: "s" });
    try {
      const { data } = await api.post(`/studio/campaigns/${id}/send`);
      toast.success(`Sent ${data.sent} · ${data.blocked} blocked by Consent Guard`, { id: "s" });
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail), { id: "s" }); }
  };
  const pause = async (id) => { await api.post(`/studio/campaigns/${id}/pause`); toast.success("Paused"); load(); };
  const del = async (id) => { await api.delete(`/campaigns/${id}`); load(); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Campaign Studio</h1>
          <p className="text-slate-500 text-sm mt-1">Segment or saved audience → AI message → approval → consent-safe send → autopilot.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="new-campaign-btn"><Plus className="w-4 h-4" /> New Campaign</Button>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={Send} title="No campaigns yet" sub="Build your first consent-safe campaign." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Campaign</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((c) => {
            const st = (c.status || "").toLowerCase();
            const selectedNames = (c.audience_ids || []).map((id) => audienceById[id]?.name).filter(Boolean);
            return (
              <Card key={c.id} className="p-5 hover:shadow-hover transition" data-testid={`campaign-${c.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-slate-900">{c.name}</h3>
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{c.objective || "Campaign"}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge tone="slate">{c.channel}</Badge>
                      {(c.audience_ids || []).length > 0
                        ? <Badge tone="blue">{selectedNames.length ? selectedNames.join(" + ") : `${c.audience_ids.length} saved audience${c.audience_ids.length === 1 ? "" : "s"}`}</Badge>
                        : <Badge tone="blue">{c.segment}</Badge>}
                      {c.followup?.enabled && <Badge tone="gold"><Zap className="w-3 h-3" /> Autopilot</Badge>}
                    </div>
                  </div>
                  <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <St icon={Users} label="Aud" value={c.stats?.audience ?? 0} />
                  <St icon={Send} label="Sent" value={c.stats?.sent ?? 0} />
                  <St icon={CheckCircle2} label="Deliv" value={c.stats?.delivered ?? 0} />
                  <St icon={Reply} label="Reply" value={c.stats?.replied ?? 0} />
                  <St icon={XCircle} label="Block" value={c.stats?.blocked ?? 0} tone="text-amber-500" />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(st === "draft" || st === "approved") && <Button size="sm" variant="outline" onClick={() => doPreview(c)} data-testid={`preview-${c.id}`}><Eye className="w-4 h-4" /> Preview</Button>}
                  {st === "draft" && canApprove && <Button size="sm" variant="dark" onClick={() => approve(c.id)} data-testid={`approve-${c.id}`}><ShieldCheck className="w-4 h-4" /> Approve</Button>}
                  {st === "draft" && !canApprove && <span className="text-xs text-slate-400 self-center">Awaiting owner approval</span>}
                  {st === "approved" && <Button size="sm" onClick={() => send(c.id)} data-testid={`send-${c.id}`}><PlayCircle className="w-4 h-4" /> Send</Button>}
                  {(st === "sending" || st === "sent") && <Button size="sm" variant="outline" onClick={() => pause(c.id)}><PauseCircle className="w-4 h-4" /> Pause</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Campaign" className="max-w-2xl">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Campaign name *" value={form.name} onChange={set("name")} required data-testid="campaign-name" />
            <Input label="Objective" value={form.objective} onChange={set("objective")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={set("channel")}>{["WhatsApp", "Email", "SMS", "Instagram"].map((c) => <option key={c}>{c}</option>)}</Select>
            <Select label="Audience source" value={form.target_mode} onChange={set("target_mode")}>
              <option value="segment">Lead segment</option>
              <option value="saved">Saved Broadcast audience</option>
            </Select>
          </div>

          {form.target_mode === "segment" ? (
            <Select label="Audience segment" value={form.segment} onChange={set("segment")}>{["All Leads", "HOT", "WARM", "COLD"].map((c) => <option key={c}>{c}</option>)}</Select>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-600">Saved audiences · choose one or more</span><span className="text-[11px] text-slate-400">Duplicates are removed automatically</span></div>
              {audiences.length === 0 ? (
                <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 text-sm text-slate-500">No saved audiences yet. Create one from Broadcast Audiences or during a contact import.</div>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-violet-100 bg-white/70 p-3">
                  {audiences.map((audience) => {
                    const checked = form.audience_ids.includes(audience.id);
                    return <label key={audience.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${checked ? "border-violet-300 bg-violet-50" : "border-slate-100 bg-white hover:border-violet-200"}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleAudience(audience.id)} />
                      <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-700">{audience.name}</div><div className="text-[11px] text-slate-400">{audience.kind} · {audience.member_count ?? 0} contacts</div></div>
                    </label>;
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Message · use {"{{first_name}}"}, {"{{company}}"}</span>
              <button type="button" onClick={aiWrite} disabled={genning} className="text-xs font-semibold text-gold-700 flex items-center gap-1 hover:underline" data-testid="ai-write-btn"><Sparkles className="w-3.5 h-3.5" /> {genning ? "Writing…" : "AI Write"}</button>
            </div>
            <Textarea rows={3} value={form.message} onChange={set("message")} placeholder="Hi {{first_name}}, …" data-testid="campaign-message" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="CTA button label" value={form.cta1} onChange={set("cta1")} placeholder="Get Quotation" />
            <Input label="CTA button URL" value={form.cta1url} onChange={set("cta1url")} placeholder="https://…" />
          </div>
          <Input label="Quick reply buttons (comma separated)" value={form.reply_buttons} onChange={set("reply_buttons")} placeholder="Yes, No, Tell me more" />

          <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gold-800">
              <input type="checkbox" checked={form.fu_enabled} onChange={(e) => setForm({ ...form, fu_enabled: e.target.checked })} data-testid="fu-enabled" />
              <Zap className="w-4 h-4" /> Follow-up Autopilot
            </label>
            {form.fu_enabled && (
              <div className="space-y-2">
                <Select label="Timing" value={form.fu_unit} onChange={set("fu_unit")}>
                  <option value="days">Days (production)</option>
                  <option value="minutes">Minutes (demo)</option>
                  <option value="seconds">Seconds (demo)</option>
                </Select>
                {form.fu_steps.map((s, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2">
                    <input type="number" className="col-span-1 px-2 py-2 rounded-lg border border-gold-200 text-sm bg-white" value={s.day}
                      onChange={(e) => { const st = [...form.fu_steps]; st[i].day = Number(e.target.value); setForm({ ...form, fu_steps: st }); }} />
                    <input className="col-span-3 px-3 py-2 rounded-lg border border-gold-200 text-sm bg-white" placeholder={`Follow-up ${i + 1} message`} value={s.message}
                      onChange={(e) => { const st = [...form.fu_steps]; st[i].message = e.target.value; setForm({ ...form, fu_steps: st }); }} />
                  </div>
                ))}
                <button type="button" className="text-xs text-gold-700 font-medium" onClick={() => setForm({ ...form, fu_steps: [...form.fu_steps, { day: (form.fu_steps.length + 1) * 2, message: "" }] })}>+ Add follow-up step</button>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={saving} data-testid="create-campaign-btn">{saving ? "Creating…" : "Create Draft"}</Button>
        </form>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Pre-send Safety Preview">
        {preview && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">Sample (personalized)</p>
              <p className="text-sm text-slate-800">{preview.sample || preview.campaign.message}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100"><p className="text-2xl font-heading font-extrabold text-slate-800">{preview.audience}</p><p className="text-xs text-slate-500">Audience</p></div>
              <div className="p-3 rounded-xl bg-emerald-50"><p className="text-2xl font-heading font-extrabold text-emerald-600">{preview.allowed}</p><p className="text-xs text-emerald-600">Will send</p></div>
              <div className="p-3 rounded-xl bg-amber-50"><p className="text-2xl font-heading font-extrabold text-amber-600">{preview.blocked}</p><p className="text-xs text-amber-600">Blocked</p></div>
            </div>
            {Object.keys(preview.block_reasons || {}).length > 0 && (
              <div className="text-xs text-slate-500">
                <p className="font-semibold mb-1">Blocked by Consent Guard:</p>
                {Object.entries(preview.block_reasons).map(([k, v]) => <span key={k} className="inline-block mr-2 px-2 py-1 rounded bg-amber-50 text-amber-700">{k}: {v}</span>)}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-emerald-700 p-2.5 rounded-lg bg-emerald-50"><ShieldCheck className="w-4 h-4" /> Saved audiences are resolved again and Consent Guard runs again at send time for every recipient.</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function St({ icon: Icon, label, value, tone = "text-slate-400" }) {
  return (
    <div className="text-center">
      <Icon className={`w-4 h-4 mx-auto ${tone}`} />
      <p className="font-heading font-bold text-slate-800 mt-1 text-sm">{value}</p>
      <p className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
