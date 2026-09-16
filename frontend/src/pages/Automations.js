import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, EmptyState } from "../components/ui";
import { Plus, Zap, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = ["Lead Created", "Reply Received", "No Reply", "Demo Requested", "Quote Sent", "Quote Viewed", "Lead Won", "Lead Lost", "Lead Scored HOT"];
const ACTIONS = ["Send WhatsApp template", "Send Email", "Send SMS", "Assign to agent", "Move pipeline stage", "Alert sales team", "Add tag", "Start follow-up sequence"];

export default function Automations() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: TRIGGERS[0], condition: "", action: ACTIONS[0], enabled: true });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/automations").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/automations", form);
      toast.success("Automation created");
      setOpen(false); load();
      setForm({ name: "", trigger: TRIGGERS[0], condition: "", action: ACTIONS[0], enabled: true });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const toggle = async (id) => { await api.patch(`/automations/${id}/toggle`); load(); };
  const del = async (id) => { await api.delete(`/automations/${id}`); load(); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Automation Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Trigger → condition → AI decision → action → follow-up.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="new-automation-btn"><Plus className="w-4 h-4" /> New Automation</Button>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={Zap} title="No automations yet" sub="Automate follow-ups and lead routing." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Automation</Button>} /></Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Card key={a.id} className="p-5 flex items-center gap-4" data-testid={`automation-${a.id}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.enabled ? "gold-gradient text-ink" : "bg-slate-100 text-slate-400"}`}><Zap className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-slate-900">{a.name}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">{a.trigger}</span>
                  {a.condition && <><ArrowRight className="w-3 h-3 text-slate-300" /><span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600">{a.condition}</span></>}
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <span className="px-2 py-1 rounded-lg bg-gold-50 text-gold-700 font-medium">{a.action}</span>
                </div>
              </div>
              <button onClick={() => toggle(a.id)} data-testid={`toggle-${a.id}`}
                className={`relative w-11 h-6 rounded-full transition shrink-0 ${a.enabled ? "gold-gradient" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${a.enabled ? "left-5" : "left-0.5"}`} />
              </button>
              <button onClick={() => del(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Automation">
        <form onSubmit={save} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} required data-testid="automation-name" />
          <Select label="Trigger" value={form.trigger} onChange={set("trigger")}>{TRIGGERS.map((t) => <option key={t}>{t}</option>)}</Select>
          <Input label="Condition (optional)" value={form.condition} onChange={set("condition")} placeholder="e.g. score >= 75, 48 hours" />
          <Select label="Action" value={form.action} onChange={set("action")}>{ACTIONS.map((t) => <option key={t}>{t}</option>)}</Select>
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-automation-btn">{saving ? "Saving…" : "Create Automation"}</Button>
        </form>
      </Modal>
    </div>
  );
}
