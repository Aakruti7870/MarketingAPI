import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Plus, Upload, Search, Sparkles, Trash2, Users, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", company: "", email: "", phone: "", channel: "WhatsApp", source: "Manual", budget: "", notes: "" };

export default function Leads() {
  const [params] = useSearchParams();
  const [leads, setLeads] = useState(null);
  const [q, setQ] = useState("");
  const [temp, setTemp] = useState(params.get("temperature") || "");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    const p = {};
    if (temp) p.temperature = temp;
    if (q) p.q = q;
    api.get("/leads", { params: p }).then((r) => setLeads(r.data));
  };
  useEffect(load, [temp]);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [q]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/leads", form);
      toast.success("Lead added & AI scored");
      setAddOpen(false); setForm(empty); load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const importContacts = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".xlsx")) {
      toast.error("Upload a CSV or XLSX file");
      e.target.value = "";
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("country_code", "+91");
    toast.loading("Importing, deduplicating & scoring…", { id: "imp" });
    try {
      const { data } = await api.post("/leads/import", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Imported ${data.imported} contacts · ${data.skipped} skipped · consent pending`, { id: "imp", duration: 5500 });
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail), { id: "imp" }); }
    e.target.value = "";
  };

  const rescore = async (id) => {
    toast.loading("Re-scoring…", { id: "rs" });
    const { data } = await api.post(`/leads/${id}/rescore`);
    toast.success(`AI score: ${data.score} (${data.temperature})`, { id: "rs" });
    load();
  };

  const del = async (id) => { await api.delete(`/leads/${id}`); load(); toast.success("Lead deleted"); };

  const stats = leads ? { HOT: leads.filter(l=>l.temperature==="HOT").length, WARM: leads.filter(l=>l.temperature==="WARM").length, COLD: leads.filter(l=>l.temperature==="COLD").length } : {};

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Lead Engine</h1>
          <p className="text-slate-500 text-sm mt-1">CSV/XLSX import → normalize +91 → deduplicate → AI score. Bulk imports stay consent-pending until explicitly opted in.</p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".csv,.xlsx" ref={fileRef} onChange={importContacts} className="hidden" data-testid="csv-input" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} data-testid="import-btn"><Upload className="w-4 h-4" /> Import CSV / XLSX</Button>
          <Button onClick={() => setAddOpen(true)} data-testid="add-lead-btn"><Plus className="w-4 h-4" /> New Lead</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads or companies…" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100" data-testid="lead-search" />
        </div>
        <div className="flex gap-1.5">
          {["", "HOT", "WARM", "COLD"].map((t) => (
            <button key={t} onClick={() => setTemp(t)} data-testid={`filter-${t || "all"}`}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition ${temp === t ? "gold-gradient text-ink border-transparent" : "bg-white border-slate-200 text-slate-600 hover:border-gold-300"}`}>
              {t || "All"} {t && stats[t] != null ? `(${stats[t]})` : ""}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {!leads ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : leads.length === 0 ? (
          <EmptyState icon={Users} title="No leads yet" sub="Add a lead manually or import CSV/XLSX to get started." action={<Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> New Lead</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="leads-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold">Lead</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Channel</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">AI Score</th>
                  <th className="px-5 py-3 font-semibold">Stage</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-gold-50/40 transition cursor-pointer" onClick={() => setDetail(l)} data-testid={`lead-row-${l.id}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">{l.name[0]}</div>
                        <div><p className="font-semibold text-slate-800">{l.name}</p><p className="text-xs text-slate-500">{l.company}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail className="w-3 h-3" />{l.email || "—"}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5"><Lock className="w-3 h-3" />{l.phone_masked || "—"}</div>
                    </td>
                    <td className="px-5 py-3.5"><Badge tone="slate">{l.channel}</Badge></td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{l.source}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Badge tone={l.temperature}>{l.temperature}</Badge>
                        <span className="font-mono text-xs font-semibold text-slate-700">{l.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs font-medium text-slate-600">{l.stage}</span></td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => rescore(l.id)} className="p-1.5 rounded-lg hover:bg-gold-100 text-gold-600" title="AI re-score" data-testid={`rescore-${l.id}`}><Sparkles className="w-4 h-4" /></button>
                        <button onClick={() => del(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" data-testid={`delete-lead-${l.id}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Lead">
        <form onSubmit={save} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={set("name")} required data-testid="form-name" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Company" value={form.company} onChange={set("company")} />
            <Input label="Email" type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone (encrypted)" value={form.phone} onChange={set("phone")} placeholder="+91…" />
            <Input label="Budget" value={form.budget} onChange={set("budget")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={set("channel")}>
              {["WhatsApp", "Email", "SMS", "Instagram", "Facebook", "Website Chat"].map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Source" value={form.source} onChange={set("source")}>
              {["Manual", "Website Form", "Google Places", "Meta Ads", "WhatsApp Inbound", "CRM", "CSV / Excel", "API Import"].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <Textarea label="Notes (intent signals boost AI score)" rows={3} value={form.notes} onChange={set("notes")} />
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-lead-btn">{saving ? "Scoring…" : "Add & AI Score"}</Button>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge tone={detail.temperature}>{detail.temperature} · {detail.score}</Badge>
              <Badge tone="slate">{detail.stage}</Badge>
              <Badge tone="gold">{detail.channel}</Badge>
            </div>
            <div className="p-4 rounded-xl bg-gold-50 border border-gold-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5" /> AI Assessment</p>
              <p className="text-sm text-slate-700">{detail.score_reason || "Scored from lead completeness and intent."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Company" value={detail.company} />
              <Info label="Email" value={detail.email} />
              <Info label="Phone" value={detail.phone_masked} icon={Lock} />
              <Info label="Source" value={detail.source} />
              <Info label="Budget" value={detail.budget} />
              <Info label="Owner" value={detail.owner} />
            </div>
            {detail.notes && <div><p className="text-xs font-semibold text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-700">{detail.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="text-slate-800 flex items-center gap-1.5 mt-0.5">{Icon && <Icon className="w-3 h-3 text-slate-400" />}{value || "—"}</p>
    </div>
  );
}
