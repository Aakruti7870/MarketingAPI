import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Download, Lock, Mail, MessageSquare, Plus, Receipt, Search, Sparkles, Trash2, Upload, Users } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", company: "", email: "", phone: "", channel: "WhatsApp", source: "Manual", budget: "", notes: "" };

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function Leads() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState(null);
  const [q, setQ] = useState("");
  const [temp, setTemp] = useState(params.get("temperature") || "");
  const [channel, setChannel] = useState("");
  const [stage, setStage] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    const p = {};
    if (temp) p.temperature = temp;
    if (q) p.q = q;
    api.get("/leads", { params: p })
      .then((r) => setLeads(r.data))
      .catch((err) => toast.error(apiError(err.response?.data?.detail) || "Leads could not be loaded"));
  };

  useEffect(load, [temp]);
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [q]);
  useEffect(() => {
    if (params.get("new") !== "1") return;
    setAddOpen(true);
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
  }, [params, setParams]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/leads", form);
      toast.success("Lead added & AI scored");
      setAddOpen(false);
      setForm(empty);
      load();
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    }
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
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail), { id: "imp" });
    }
    e.target.value = "";
  };

  const rescore = async (id) => {
    toast.loading("Re-scoring…", { id: "rs" });
    try {
      const { data } = await api.post(`/leads/${id}/rescore`);
      toast.success(`AI score: ${data.score} (${data.temperature})`, { id: "rs" });
      load();
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Lead could not be rescored", { id: "rs" });
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      setSelected((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      load();
      toast.success("Lead deleted");
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Lead could not be deleted");
    }
  };

  const stats = leads ? {
    HOT: leads.filter((lead) => lead.temperature === "HOT").length,
    WARM: leads.filter((lead) => lead.temperature === "WARM").length,
    COLD: leads.filter((lead) => lead.temperature === "COLD").length,
  } : {};

  const channels = useMemo(() => [...new Set((leads || []).map((lead) => lead.channel).filter(Boolean))].sort(), [leads]);
  const stages = useMemo(() => [...new Set((leads || []).map((lead) => lead.stage).filter(Boolean))].sort(), [leads]);
  const visibleLeads = useMemo(() => (leads || []).filter((lead) => {
    if (channel && lead.channel !== channel) return false;
    if (stage && lead.stage !== stage) return false;
    return true;
  }), [leads, channel, stage]);

  const selectedLeads = useMemo(() => visibleLeads.filter((lead) => selected.has(lead.id)), [visibleLeads, selected]);
  const allVisibleSelected = visibleLeads.length > 0 && visibleLeads.every((lead) => selected.has(lead.id));

  const toggleOne = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleLeads.forEach((lead) => next.delete(lead.id));
      else visibleLeads.forEach((lead) => next.add(lead.id));
      return next;
    });
  };

  const exportCsv = () => {
    const rows = selectedLeads.length ? selectedLeads : visibleLeads;
    if (!rows.length) return toast.error("No leads to export");
    const header = ["Name", "Company", "Email", "Phone", "Channel", "Source", "AI Score", "Temperature", "Stage"];
    const body = rows.map((lead) => [
      lead.name,
      lead.company,
      lead.email,
      lead.phone_masked,
      lead.channel,
      lead.source,
      lead.score,
      lead.temperature,
      lead.stage,
    ].map(csvCell).join(","));
    const blob = new Blob([[header.map(csvCell).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `golde-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} lead${rows.length === 1 ? "" : "s"}`);
  };

  const deleteSelected = async () => {
    if (!selectedLeads.length) return;
    if (!window.confirm(`Delete ${selectedLeads.length} selected lead${selectedLeads.length === 1 ? "" : "s"}?`)) return;
    toast.loading("Deleting selected leads…", { id: "bulk-delete" });
    try {
      await Promise.all(selectedLeads.map((lead) => api.delete(`/leads/${lead.id}`)));
      setSelected(new Set());
      load();
      toast.success("Selected leads deleted", { id: "bulk-delete" });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Some leads could not be deleted", { id: "bulk-delete" });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Lead Engine</h1>
          <p className="text-slate-500 text-sm mt-1">CSV/XLSX import → normalize +91 → deduplicate → AI score. Bulk imports stay consent-pending until explicitly opted in.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" accept=".csv,.xlsx" ref={fileRef} onChange={importContacts} className="hidden" data-testid="csv-input" />
          <Button variant="outline" onClick={exportCsv} data-testid="export-leads-btn"><Download className="w-4 h-4" /> Export CSV</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()} data-testid="import-btn"><Upload className="w-4 h-4" /> Import CSV / XLSX</Button>
          <Button onClick={() => setAddOpen(true)} data-testid="add-lead-btn"><Plus className="w-4 h-4" /> New Lead</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads or companies…" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100" data-testid="lead-search" />
        </div>
        <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} className="min-w-[150px]">
          <option value="">All channels</option>
          {channels.map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <Select label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} className="min-w-[150px]">
          <option value="">All stages</option>
          {stages.map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
        <div className="flex flex-wrap gap-1.5">
          {["", "HOT", "WARM", "COLD"].map((value) => (
            <button key={value} onClick={() => setTemp(value)} data-testid={`filter-${value || "all"}`}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition ${temp === value ? "gold-gradient text-ink border-transparent" : "bg-white border-slate-200 text-slate-600 hover:border-gold-300"}`}>
              {value || "All"} {value && stats[value] != null ? `(${stats[value]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {selectedLeads.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">{selectedLeads.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/campaigns?new=1")}><MessageSquare className="w-4 h-4" /> Create Campaign</Button>
            <Button size="sm" variant="outline" onClick={exportCsv}><Download className="w-4 h-4" /> Export Selected</Button>
            <Button size="sm" variant="danger" onClick={deleteSelected}><Trash2 className="w-4 h-4" /> Delete Selected</Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {!leads ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : visibleLeads.length === 0 ? (
          <EmptyState icon={Users} title="No matching leads" sub="Adjust the filters, add a lead manually or import CSV/XLSX." action={<Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> New Lead</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="leads-table">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold"><input type="checkbox" aria-label="Select all visible leads" checked={allVisibleSelected} onChange={toggleAll} /></th>
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
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-gold-50/40 transition cursor-pointer" onClick={() => setDetail(lead)} data-testid={`lead-row-${lead.id}`}>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${lead.name || "lead"}`} checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-600">{(lead.name || "?")[0]}</div>
                        <div><p className="font-semibold text-slate-800">{lead.name}</p><p className="text-xs text-slate-500">{lead.company}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail className="w-3 h-3" />{lead.email || "—"}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5"><Lock className="w-3 h-3" />{lead.phone_masked || "—"}</div>
                    </td>
                    <td className="px-5 py-3.5"><Badge tone="slate">{lead.channel}</Badge></td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{lead.source}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2"><Badge tone={lead.temperature}>{lead.temperature}</Badge><span className="font-mono text-xs font-semibold text-slate-700">{lead.score}</span></div>
                    </td>
                    <td className="px-5 py-3.5"><span className="text-xs font-medium text-slate-600">{lead.stage}</span></td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/inbox?lead=${lead.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Open in Inbox"><MessageSquare className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/quotations?lead=${lead.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Create quotation"><Receipt className="w-4 h-4" /></button>
                        <button onClick={() => rescore(lead.id)} className="p-1.5 rounded-lg hover:bg-gold-100 text-gold-600" title="AI re-score" data-testid={`rescore-${lead.id}`}><Sparkles className="w-4 h-4" /></button>
                        <button onClick={() => del(lead.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete lead" data-testid={`delete-lead-${lead.id}`}><Trash2 className="w-4 h-4" /></button>
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
          <div className="grid grid-cols-2 gap-3"><Input label="Company" value={form.company} onChange={set("company")} /><Input label="Email" type="email" value={form.email} onChange={set("email")} /></div>
          <div className="grid grid-cols-2 gap-3"><Input label="Phone (encrypted)" value={form.phone} onChange={set("phone")} placeholder="+91…" /><Input label="Budget" value={form.budget} onChange={set("budget")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Channel" value={form.channel} onChange={set("channel")}>{["WhatsApp", "Email", "SMS", "Instagram", "Facebook", "Website Chat"].map((value) => <option key={value}>{value}</option>)}</Select>
            <Select label="Source" value={form.source} onChange={set("source")}>{["Manual", "Website Form", "Google Places", "Meta Ads", "WhatsApp Inbound", "CRM", "CSV / Excel", "API Import"].map((value) => <option key={value}>{value}</option>)}</Select>
          </div>
          <Textarea label="Notes (intent signals boost AI score)" rows={3} value={form.notes} onChange={set("notes")} />
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-lead-btn">{saving ? "Scoring…" : "Add & AI Score"}</Button>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Badge tone={detail.temperature}>{detail.temperature} · {detail.score}</Badge><Badge tone="slate">{detail.stage}</Badge><Badge tone="gold">{detail.channel}</Badge></div>
            <div className="p-4 rounded-xl bg-gold-50 border border-gold-200"><p className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-1.5 mb-1"><Sparkles className="w-3.5 h-3.5" /> AI Assessment</p><p className="text-sm text-slate-700">{detail.score_reason || "Scored from lead completeness and intent."}</p></div>
            <div className="grid grid-cols-2 gap-3 text-sm"><Info label="Company" value={detail.company} /><Info label="Email" value={detail.email} /><Info label="Phone" value={detail.phone_masked} icon={Lock} /><Info label="Source" value={detail.source} /><Info label="Budget" value={detail.budget} /><Info label="Owner" value={detail.owner} /></div>
            {detail.notes && <div><p className="text-xs font-semibold text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-700">{detail.notes}</p></div>}
            <div className="flex flex-wrap gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => navigate(`/inbox?lead=${detail.id}`)}><MessageSquare className="w-4 h-4" /> Open Inbox</Button><Button size="sm" variant="outline" onClick={() => navigate(`/quotations?lead=${detail.id}`)}><Receipt className="w-4 h-4" /> Create Quotation</Button><Button size="sm" onClick={() => rescore(detail.id)}><Sparkles className="w-4 h-4" /> Re-score</Button></div>
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
