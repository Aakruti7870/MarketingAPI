import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, EmptyState } from "../components/ui";
import { Code2, Plus, Copy, Trash2, RefreshCw, KeyRound, Check, Terminal } from "lucide-react";
import { toast } from "sonner";

const SCOPES = ["leads:read", "leads:write", "campaigns:read", "campaigns:create", "campaigns:send", "messages:read", "webhooks:manage"];

export default function Developer() {
  const [keys, setKeys] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState(["leads:read", "leads:write"]);
  const [rate, setRate] = useState(120);
  const [newKey, setNewKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/dev/keys").then((r) => setKeys(r.data));
  useEffect(() => { load(); }, []);

  const toggleScope = (s) => setScopes(scopes.includes(s) ? scopes.filter((x) => x !== s) : [...scopes, s]);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/dev/keys", { name, scopes, rate_limit: Number(rate) });
      setNewKey(data.key);
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const rotate = async (id) => {
    const { data } = await api.post(`/dev/keys/${id}/rotate`);
    setNewKey(data.key); setOpen(true); load();
  };
  const revoke = async (id) => { await api.delete(`/dev/keys/${id}`); load(); toast.success("Key revoked"); };
  const copy = (t) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  const closeModal = () => { setOpen(false); setNewKey(null); setName(""); setScopes(["leads:read", "leads:write"]); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2"><Code2 className="w-7 h-7 text-gold-500" /> Developer API</h1>
          <p className="text-slate-500 text-sm mt-1">Create GOLD-e API keys with scopes & rate limits. Keys are hashed — shown once.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="create-key-btn"><Plus className="w-4 h-4" /> Create API Key</Button>
      </div>

      {!keys ? <div className="h-40 shimmer rounded-2xl" /> : keys.length === 0 ? (
        <Card><EmptyState icon={KeyRound} title="No API keys" sub="Create a key to access the GOLD-e API from external apps." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Create API Key</Button>} /></Card>
      ) : (
        <div className="space-y-3">
          {keys.map((k) => (
            <Card key={k.id} className="p-5" data-testid={`apikey-${k.id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold text-slate-900">{k.name}</p>
                    {k.revoked ? <Badge tone="HOT">Revoked</Badge> : <Badge tone="green">Active</Badge>}
                  </div>
                  <p className="font-mono text-xs text-slate-500 mt-1">{k.prefix}••••••••••••</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {k.scopes.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gold-50 text-gold-700 font-mono">{s}</span>)}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Rate: {k.rate_limit}/min · Used {k.usage_count}× · Last: {k.last_used ? new Date(k.last_used).toLocaleString() : "never"}</p>
                </div>
                {!k.revoked && (
                  <div className="flex gap-1">
                    <button onClick={() => rotate(k.id)} className="p-1.5 rounded-lg hover:bg-gold-100 text-gold-600" title="Rotate"><RefreshCw className="w-4 h-4" /></button>
                    <button onClick={() => revoke(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Revoke"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6">
        <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><Terminal className="w-4 h-4 text-gold-500" /> Quick reference</h3>
        <div className="bg-ink rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
          <p><span className="text-emerald-400">POST</span> /api/v1/leads <span className="text-slate-500"># create a lead (leads:write)</span></p>
          <p><span className="text-blue-400">GET</span>  /api/v1/leads <span className="text-slate-500"># list leads (leads:read)</span></p>
          <p><span className="text-emerald-400">POST</span> /api/v1/campaigns <span className="text-slate-500"># create campaign (campaigns:create)</span></p>
          <p><span className="text-emerald-400">POST</span> /api/v1/campaigns/&#123;id&#125;/send <span className="text-slate-500"># send (campaigns:send, requires approval)</span></p>
          <p><span className="text-blue-400">GET</span>  /api/v1/campaigns/&#123;id&#125;/status</p>
          <p className="text-slate-500 pt-2">Header: <span className="text-gold-300">X-API-Key: gde_live_xxxxx</span> · rate limited · IP allowlist supported</p>
        </div>
      </Card>

      <Modal open={open} onClose={closeModal} title={newKey ? "API Key Created" : "Create API Key"}>
        {newKey ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800">Copy this key now. For security it will <b>never be shown again</b>.</p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-ink">
              <code className="flex-1 font-mono text-xs text-gold-200 break-all" data-testid="new-api-key">{newKey}</code>
              <button onClick={() => copy(newKey)} className="text-slate-400 hover:text-gold-300"><Copy className="w-4 h-4" /></button>
            </div>
            <Button className="w-full" onClick={closeModal}>Done</Button>
          </div>
        ) : (
          <form onSubmit={create} className="space-y-4">
            <Input label="Key name *" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Zapier integration" data-testid="key-name" />
            <div>
              <span className="text-xs font-semibold text-slate-600 mb-2 block">Scopes</span>
              <div className="grid grid-cols-2 gap-2">
                {SCOPES.map((s) => (
                  <button type="button" key={s} onClick={() => toggleScope(s)} data-testid={`scope-${s}`}
                    className={`px-3 py-2 rounded-lg text-xs font-mono border transition text-left ${scopes.includes(s) ? "gold-gradient text-ink border-transparent" : "bg-white border-slate-200 text-slate-600"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Rate limit (requests / minute)" type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
            <Button type="submit" className="w-full" disabled={saving} data-testid="save-key-btn">{saving ? "Creating…" : "Create Key"}</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
