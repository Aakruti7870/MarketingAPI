import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Modal, Input, Select, EmptyState } from "../components/ui";
import { Plus, KeyRound, Trash2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const PROVIDERS = {
  "Meta WhatsApp Business API": ["Phone Number ID", "System User Token", "WABA ID"],
  "OpenAI": ["API Key", "Model"],
  "Anthropic Claude": ["API Key", "Model"],
  "Google Gemini": ["API Key", "Model"],
  "NVIDIA NIM": ["API Key", "Model"],
  "SMTP / Email": ["Host", "Port", "User", "Password"],
  "Twilio SMS": ["Account SID", "Auth Token", "Sender Number"],
  "Google APIs": ["Client ID", "Client Secret", "API Key"],
};

export default function Vault() {
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState(Object.keys(PROVIDERS)[0]);
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/vault").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  useEffect(() => { setFields({}); }, [provider]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/vault", { provider, label: label || provider, fields });
      toast.success("Credential encrypted & stored");
      setOpen(false); load(); setLabel(""); setFields({});
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const del = async (id) => { try { await api.delete(`/vault/${id}`); load(); toast.success("Removed"); } catch (err) { toast.error(apiError(err.response?.data?.detail)); } };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Secure API Vault</h1>
          <p className="text-slate-500 text-sm mt-1">Bring your own credentials. Encrypted at rest, never exposed to the frontend.</p>
        </div>
        <Button onClick={() => setOpen(true)} data-testid="add-credential-btn"><Plus className="w-4 h-4" /> Add Credential</Button>
      </div>

      <div className="p-4 rounded-2xl bg-ink text-white flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-gold-300 shrink-0" />
        <p className="text-sm text-slate-300">All secrets are encrypted with AES (Fernet). Values are masked in the UI and never sent back in plaintext. Each workspace is fully isolated.</p>
      </div>

      {!items ? <div className="h-40 shimmer rounded-2xl" /> : items.length === 0 ? (
        <Card><EmptyState icon={KeyRound} title="No credentials yet" sub="Connect your WhatsApp, OpenAI, SMTP and more." action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add Credential</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="p-5" data-testid={`credential-${c.id}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center"><KeyRound className="w-5 h-5 text-gold-600" /></div>
                  <div><p className="font-heading font-bold text-slate-900 text-sm">{c.provider}</p><p className="text-xs text-slate-500">{c.label}</p></div>
                </div>
                <Badge tone="green">{c.status}</Badge>
              </div>
              <div className="mt-4 space-y-1.5">
                {Object.entries(c.fields).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-mono text-slate-700 flex items-center gap-1"><Lock className="w-3 h-3 text-slate-300" />{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => del(c.id)} className="mt-4 text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add API Credential">
        <form onSubmit={save} className="space-y-4">
          <Select label="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} data-testid="provider-select">
            {Object.keys(PROVIDERS).map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`e.g. Primary ${provider}`} />
          {PROVIDERS[provider].map((f) => (
            <Input key={f} label={f} value={fields[f] || ""} onChange={(e) => setFields({ ...fields, [f]: e.target.value })}
              type={/token|secret|password|key/i.test(f) ? "password" : "text"} data-testid={`field-${f}`} />
          ))}
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2.5 rounded-lg bg-slate-50"><Lock className="w-3.5 h-3.5" /> Encrypted before storage — never visible in plaintext again.</div>
          <Button type="submit" className="w-full" disabled={saving} data-testid="save-credential-btn">{saving ? "Encrypting…" : "Encrypt & Save"}</Button>
        </form>
      </Modal>
    </div>
  );
}
