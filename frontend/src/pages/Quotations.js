import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, Textarea, EmptyState } from "../components/ui";
import { Plus, Receipt, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Quotations() {
  const [items, setItems] = useState(null);
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([{ name: "", qty: 1, price: 0 }]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/quotations").then((r) => setItems(r.data));
  useEffect(() => { load(); api.get("/leads").then((r) => setLeads(r.data)); }, []);

  const total = rows.reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.price) || 0), 0);
  const setRow = (i, k, v) => setRows(rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const aiDraft = async () => {
    if (!aiPrompt.trim()) return toast.error("Describe the requirement");
    setBusy(true);
    try {
      const { data } = await api.post("/quotations/ai-draft", { prompt: aiPrompt });
      setRows(data.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })));
      if (data.notes) setNotes(data.notes);
      toast.success("AI drafted quotation");
    } catch { toast.error("AI unavailable"); }
    setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!leadId) return toast.error("Select a lead");
    setSaving(true);
    try {
      await api.post("/quotations", { lead_id: leadId, items: rows, notes });
      toast.success("Quotation created & sent");
      setOpen(false); load();
      setRows([{ name: "", qty: 1, price: 0 }]); setNotes(""); setLeadId(""); setAiPrompt("");
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Quotations</h1>
          <p className="text-slate-500 text-sm mt-1">AI-drafted quotes → send → track → follow-up.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="new-quote-btn"><Plus className="w-4 h-4" /> New Quotation</Button>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={Receipt} title="No quotations yet" sub="Draft your first quote with AI." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> New Quotation</Button>} /></Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm" data-testid="quotes-table">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-5 py-3 font-semibold">Number</th>
                <th className="px-5 py-3 font-semibold">Lead</th>
                <th className="px-5 py-3 font-semibold">Items</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="border-b border-slate-50 hover:bg-gold-50/40" data-testid={`quote-${q.id}`}>
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gold-700">{q.number}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{q.lead_name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{q.items?.length} item(s)</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-slate-800">₹{new Intl.NumberFormat().format(q.total)}</td>
                  <td className="px-5 py-3.5"><Badge tone="green">{q.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Quotation" className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <Select label="Lead *" value={leadId} onChange={(e) => setLeadId(e.target.value)} data-testid="quote-lead">
            <option value="">— Select lead —</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.company}</option>)}
          </Select>

          <div className="p-3.5 rounded-xl bg-gold-50 border border-gold-200 flex gap-2">
            <input value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Describe requirement e.g. 200 m³ M25 concrete + pump" className="flex-1 px-3 py-2 rounded-lg border border-gold-200 text-sm bg-white outline-none" data-testid="quote-ai-prompt" />
            <Button type="button" size="sm" onClick={aiDraft} disabled={busy}><Sparkles className="w-4 h-4" /> {busy ? "…" : "AI Draft"}</Button>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
              <span className="col-span-6">Item</span><span className="col-span-2">Qty</span><span className="col-span-3">Price</span><span></span>
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-6 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none" value={r.name} onChange={(e) => setRow(i, "name", e.target.value)} placeholder="Item name" />
                <input type="number" className="col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none" value={r.qty} onChange={(e) => setRow(i, "qty", e.target.value)} />
                <input type="number" className="col-span-3 px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none" value={r.price} onChange={(e) => setRow(i, "price", e.target.value)} />
                <button type="button" onClick={() => setRows(rows.filter((_, idx) => idx !== i))} className="col-span-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => setRows([...rows, { name: "", qty: 1, price: 0 }])} className="text-sm text-gold-700 font-medium hover:underline">+ Add line item</button>
          </div>

          <Textarea label="Notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-sm text-slate-500">Total</span>
            <span className="font-heading font-extrabold text-xl text-slate-900">₹{new Intl.NumberFormat().format(total)}</span>
          </div>
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-quote-btn">{saving ? "Sending…" : "Create & Send Quotation"}</Button>
        </form>
      </Modal>
    </div>
  );
}
