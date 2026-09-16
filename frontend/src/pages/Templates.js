import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Plus, FileText, Trash2, Sparkles, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const CATS = ["General", "Follow-up", "Offers", "Festival Campaign", "Product", "Sales"];

export default function Templates() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "General", channel: "WhatsApp", language: "English", body: "", buttons: [] });
  const [buttonsRaw, setButtonsRaw] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Persuasive");
  const [genning, setGenning] = useState(false);

  const load = () => api.get("/templates").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const generate = async () => {
    if (!aiPrompt.trim()) return toast.error("Describe what you need");
    setGenning(true);
    try {
      const { data } = await api.post("/ai/generate", { kind: "template", prompt: aiPrompt, tone: aiTone, channel: form.channel, language: form.language });
      setForm({ ...form, body: data.text });
      toast.success("AI generated template");
    } catch { toast.error("AI unavailable"); }
    setGenning(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/templates", { ...form, buttons: buttonsRaw.split(",").map((s) => s.trim()).filter(Boolean) });
      toast.success("Template saved");
      setOpen(false); load();
      setForm({ name: "", category: "General", channel: "WhatsApp", language: "English", body: "", buttons: [] });
      setButtonsRaw(""); setAiPrompt("");
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const del = async (id) => { await api.delete(`/templates/${id}`); load(); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Content Studio</h1>
          <p className="text-slate-500 text-sm mt-1">Reusable multi-language templates with smart action buttons.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="new-template-btn"><Plus className="w-4 h-4" /> New Template</Button>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={FileText} title="No templates yet" sub="Create reusable messages or let AI write one." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Template</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <Card key={t.id} className="p-5 flex flex-col hover:shadow-hover transition" data-testid={`template-${t.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-bold text-slate-900">{t.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge tone="gold">{t.category}</Badge>
                    <Badge tone="slate">{t.channel}</Badge>
                  </div>
                </div>
                <button onClick={() => del(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-slate-600 mt-3 flex-1 leading-relaxed">{t.body}</p>
              {t.buttons?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {t.buttons.map((b, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">{b}</span>)}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400"><span>{t.language}</span></div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Template" className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Template name *" value={form.name} onChange={set("name")} required data-testid="template-name" />
            <Select label="Category" value={form.category} onChange={set("category")}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={set("channel")}>{["WhatsApp", "Email", "SMS", "Instagram"].map((c) => <option key={c}>{c}</option>)}</Select>
            <Select label="Language" value={form.language} onChange={set("language")}>{["English", "Hindi", "Marathi", "Spanish", "Arabic"].map((c) => <option key={c}>{c}</option>)}</Select>
          </div>

          <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Writer</p>
            <div className="flex gap-2">
              <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. Diwali 20% off on cement" className="flex-1 px-3 py-2 rounded-lg border border-gold-200 text-sm outline-none bg-white" data-testid="ai-template-prompt" />
              <select value={aiTone} onChange={(e) => setAiTone(e.target.value)} className="px-2 py-2 rounded-lg border border-gold-200 text-sm bg-white">{["Persuasive", "Luxury", "Urgency", "Casual", "Formal"].map((t) => <option key={t}>{t}</option>)}</select>
              <Button type="button" size="sm" onClick={generate} disabled={genning} data-testid="ai-generate-template">{genning ? "…" : "Generate"}</Button>
            </div>
          </div>

          <Textarea label="Message body *" rows={4} value={form.body} onChange={set("body")} required placeholder="Hi {{name}}, …" data-testid="template-body" />
          <Input label="Action buttons (comma separated)" value={buttonsRaw} onChange={(e) => setButtonsRaw(e.target.value)} placeholder="Get Quotation, Call Now, Book Demo" />
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-template-btn">{saving ? "Saving…" : "Save Template"}</Button>
        </form>
      </Modal>
    </div>
  );
}
