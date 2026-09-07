import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Plus, Send, Trash2, Users, CheckCircle2, Reply, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Campaigns() {
  const [items, setItems] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "WhatsApp", segment: "All Leads", template_id: "", message: "", scheduled_at: "" });
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/campaigns").then((r) => setItems(r.data));
  useEffect(() => { load(); api.get("/templates").then((r) => setTemplates(r.data)); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/campaigns", { ...form, template_id: form.template_id || null, scheduled_at: form.scheduled_at || null });
      toast.success(form.scheduled_at ? "Campaign scheduled" : "Campaign sent!");
      setOpen(false); load();
      setForm({ name: "", channel: "WhatsApp", segment: "All Leads", template_id: "", message: "", scheduled_at: "" });
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const del = async (id) => { await api.delete(`/campaigns/${id}`); load(); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 text-sm mt-1">Segment → template → AI personalize → send → track.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="new-campaign-btn"><Plus className="w-4 h-4" /> New Campaign</Button>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={Send} title="No campaigns yet" sub="Launch your first omnichannel campaign." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Campaign</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="p-5 hover:shadow-hover transition" data-testid={`campaign-${c.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-slate-900">{c.name}</h3>
                    <Badge tone={c.status === "Sent" ? "green" : "gold"}>{c.status === "Sent" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{c.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone="slate">{c.channel}</Badge>
                    <Badge tone="blue">{c.segment}</Badge>
                  </div>
                </div>
                <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
                <Stat icon={Users} label="Audience" value={c.stats.audience} />
                <Stat icon={Send} label="Sent" value={c.stats.sent} />
                <Stat icon={CheckCircle2} label="Delivered" value={c.stats.delivered} />
                <Stat icon={Reply} label="Replied" value={c.stats.replied} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Campaign">
        <form onSubmit={save} className="space-y-4">
          <Input label="Campaign name *" value={form.name} onChange={set("name")} required data-testid="campaign-name" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={set("channel")}>
              {["WhatsApp", "Email", "SMS", "Instagram"].map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Segment" value={form.segment} onChange={set("segment")}>
              {["All Leads", "HOT", "WARM", "COLD"].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <Select label="Template" value={form.template_id} onChange={set("template_id")}>
            <option value="">— No template —</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Textarea label="Message (optional if template chosen)" rows={3} value={form.message} onChange={set("message")} placeholder="Hi {{name}}, …" />
          <Input label="Schedule (leave empty to send now)" type="datetime-local" value={form.scheduled_at} onChange={set("scheduled_at")} />
          <Button type="submit" className="w-full" disabled={saving} data-testid="launch-campaign-btn">{saving ? "Launching…" : form.scheduled_at ? "Schedule Campaign" : "Send Now"}</Button>
        </form>
      </Modal>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 text-slate-400 mx-auto" />
      <p className="font-heading font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
