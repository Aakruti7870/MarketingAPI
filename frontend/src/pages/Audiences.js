import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, EmptyState, Input, Modal, Select, Textarea } from "../components/ui";
import { Filter, Megaphone, Plus, Search, Trash2, Users, Zap } from "lucide-react";
import { toast } from "sonner";

const initial = () => ({
  name: "",
  description: "",
  kind: "static",
  lead_ids: [],
  rules: { state: "", district: "", taluka: "", temperature: "", stage: "", consent_status: "", source: "", tag: "" },
});

export default function Audiences() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canDelete = user?.role === "owner" || user?.role === "admin";
  const [items, setItems] = useState(null);
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    try {
      const [audienceRes, leadRes] = await Promise.all([api.get("/audiences"), api.get("/leads")]);
      setItems(audienceRes.data || []);
      setLeads(leadRes.data || []);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Audiences could not be loaded");
    }
  };
  useEffect(() => { load(); }, []);

  const filteredLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) => `${lead.name || ""} ${lead.company || ""} ${lead.email || ""}`.toLowerCase().includes(needle));
  }, [leads, query]);

  const toggleLead = (id) => setForm((current) => ({
    ...current,
    lead_ids: current.lead_ids.includes(id) ? current.lead_ids.filter((value) => value !== id) : [...current.lead_ids, id],
  }));

  const create = async (e) => {
    e.preventDefault();
    if (form.kind === "static" && form.lead_ids.length === 0) return toast.error("Select at least one contact");
    const rules = Object.fromEntries(Object.entries(form.rules).filter(([, value]) => String(value || "").trim()));
    if (form.kind === "dynamic" && Object.keys(rules).length === 0) return toast.error("Add at least one dynamic rule");
    setSaving(true);
    try {
      const { data } = await api.post("/audiences", {
        name: form.name,
        description: form.description,
        kind: form.kind,
        lead_ids: form.kind === "static" ? form.lead_ids : [],
        rules: form.kind === "dynamic" ? rules : {},
      });
      toast.success(`${data.name} saved · ${data.member_count} contacts`);
      setOpen(false); setForm(initial()); setQuery(""); load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const inspect = async (item) => {
    try {
      const { data } = await api.get(`/audiences/${item.id}`);
      setDetail(data);
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/audiences/${id}`);
      toast.success("Audience deleted");
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Broadcast Audiences</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">Create reusable static lists or dynamic CRM segments. Campaign Studio deduplicates contacts across selected audiences and still applies Consent Guard at send time.</p>
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => navigate("/campaigns")}><Megaphone className="w-4 h-4" /> Campaigns</Button><Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Audience</Button></div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Saved Audiences</p><p className="mt-1 text-2xl font-heading font-extrabold text-slate-900">{items?.length ?? "—"}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Static</p><p className="mt-1 text-2xl font-heading font-extrabold text-violet-600">{items ? items.filter((a) => a.kind === "static").length : "—"}</p></Card>
        <Card className="p-4"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Dynamic</p><p className="mt-1 text-2xl font-heading font-extrabold text-cyan-600">{items ? items.filter((a) => a.kind === "dynamic").length : "—"}</p></Card>
      </div>

      {!items ? <div className="h-44 shimmer rounded-3xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={Users} title="No saved audiences" sub="Build a reusable audience from CRM contacts or dynamic filters." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Create Audience</Button>} /></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => <Card key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-3"><div className="soft-icon">{item.kind === "dynamic" ? <Filter className="w-5 h-5" /> : <Users className="w-5 h-5" />}</div><Badge tone={item.kind === "dynamic" ? "blue" : "slate"}>{item.kind}</Badge></div>
            <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900">{item.name}</h3>
            <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{item.description || (item.kind === "dynamic" ? "Dynamic audience from CRM rules" : "Saved contact list")}</p>
            <div className="mt-4 rounded-xl bg-violet-50/70 p-3"><div className="text-[10px] font-extrabold uppercase tracking-wider text-violet-500">Current members</div><div className="mt-1 text-xl font-heading font-extrabold text-violet-700">{item.member_count ?? 0}</div></div>
            {item.kind === "dynamic" && Object.keys(item.rules || {}).length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{Object.entries(item.rules).map(([key, value]) => <span key={key} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500">{key}: {String(value)}</span>)}</div>}
            <div className="mt-5 flex gap-2"><Button size="sm" variant="outline" onClick={() => inspect(item)}>View Contacts</Button><Button size="sm" onClick={() => navigate("/campaigns")}><Zap className="w-4 h-4" /> Use in Campaign</Button>{canDelete && <button onClick={() => remove(item.id)} className="ml-auto rounded-xl p-2 text-rose-500 hover:bg-rose-50" aria-label={`Delete ${item.name}`}><Trash2 className="w-4 h-4" /></button>}</div>
          </Card>)}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Broadcast Audience" className="max-w-2xl">
        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2"><Input label="Audience name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><Select label="Audience type" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, lead_ids: [], rules: initial().rules })}><option value="static">Static contact list</option><option value="dynamic">Dynamic CRM rules</option></Select></div>
          <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          {form.kind === "static" ? <div>
            <div className="relative mb-2"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-300" placeholder="Search contacts" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-violet-100 bg-white/70 p-2">
              {filteredLeads.length === 0 ? <div className="p-6 text-center text-sm text-slate-400">No contacts match.</div> : filteredLeads.map((lead) => {
                const checked = form.lead_ids.includes(lead.id);
                return <label key={lead.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 ${checked ? "border-violet-300 bg-violet-50" : "border-transparent hover:bg-slate-50"}`}><input type="checkbox" checked={checked} onChange={() => toggleLead(lead.id)} /><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-slate-700">{lead.name}</div><div className="truncate text-[11px] text-slate-400">{lead.company || lead.email || lead.phone_masked || "Contact"}</div></div><Badge tone={lead.temperature || "slate"}>{lead.temperature || "LEAD"}</Badge></label>;
              })}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">{form.lead_ids.length} selected</p>
          </div> : <div className="grid gap-3 sm:grid-cols-2">
            <Input label="State" value={form.rules.state} onChange={(e) => setForm({ ...form, rules: { ...form.rules, state: e.target.value } })} placeholder="Maharashtra" />
            <Input label="District" value={form.rules.district} onChange={(e) => setForm({ ...form, rules: { ...form.rules, district: e.target.value } })} placeholder="Raigad" />
            <Input label="Taluka" value={form.rules.taluka} onChange={(e) => setForm({ ...form, rules: { ...form.rules, taluka: e.target.value } })} placeholder="Panvel" />
            <Select label="Lead temperature" value={form.rules.temperature} onChange={(e) => setForm({ ...form, rules: { ...form.rules, temperature: e.target.value } })}><option value="">Any</option><option>HOT</option><option>WARM</option><option>COLD</option></Select>
            <Select label="Consent" value={form.rules.consent_status} onChange={(e) => setForm({ ...form, rules: { ...form.rules, consent_status: e.target.value } })}><option value="">Any</option><option value="opted_in">Opted in</option><option value="pending">Pending</option><option value="opted_out">Opted out</option></Select>
            <Input label="Stage" value={form.rules.stage} onChange={(e) => setForm({ ...form, rules: { ...form.rules, stage: e.target.value } })} placeholder="QUALIFIED" />
            <Input label="Source" value={form.rules.source} onChange={(e) => setForm({ ...form, rules: { ...form.rules, source: e.target.value } })} placeholder="CSV / Excel" />
            <Input label="Tag" value={form.rules.tag} onChange={(e) => setForm({ ...form, rules: { ...form.rules, tag: e.target.value } })} placeholder="premium" />
          </div>}

          <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-700"><b>Consent-safe:</b> audience membership never implies messaging consent. Campaign Studio runs Consent Guard again for every contact at send time.</div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving…" : "Save Audience"}</Button>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || "Audience Contacts"} className="max-w-xl">
        {detail && <div className="space-y-3"><div className="flex items-center gap-2"><Badge tone="blue">{detail.member_count} contacts</Badge><Badge tone="slate">{detail.kind}</Badge></div><div className="max-h-96 divide-y divide-violet-50 overflow-y-auto rounded-2xl border border-violet-100">{(detail.contacts || []).length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No contacts currently match.</div> : detail.contacts.map((lead) => <div key={lead.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><div className="truncate text-sm font-bold text-slate-700">{lead.name}</div><div className="truncate text-[11px] text-slate-400">{lead.company || lead.phone_masked}</div></div><div className="flex gap-1"><Badge tone={lead.temperature || "slate"}>{lead.temperature || "LEAD"}</Badge><Badge tone={lead.consent_status === "opted_in" ? "green" : "slate"}>{lead.consent_status || "pending"}</Badge></div></div>)}</div></div>}
      </Modal>
    </div>
  );
}
