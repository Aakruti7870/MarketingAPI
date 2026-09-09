import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, Input, Modal } from "../components/ui";
import {
  CheckCircle2, Globe2, Link2, Mail, MessageCircleMore, Phone, Plug, RefreshCw,
  Send, Settings2, Sheet, Smartphone, Unplug, Webhook,
} from "lucide-react";
import { toast } from "sonner";

const ICONS = {
  whatsapp: Phone,
  email: Mail,
  sms: Smartphone,
  instagram: MessageCircleMore,
  facebook: MessageCircleMore,
  "website-chat": Globe2,
  "google-places": Globe2,
  "meta-ads": Send,
  "website-forms": Globe2,
  "google-sheets": Sheet,
  crm: Link2,
  "zapier-make": Webhook,
  "custom-webhook": Webhook,
};

const FIELD_LABELS = {
  provider: "Provider",
  host: "SMTP Host",
  port: "Port",
  username: "Username",
  password: "Password",
  from_email: "From Email",
  api_key: "API Key",
  auth_key: "Auth Key",
  sender_id: "Sender ID",
  template_id: "Template ID",
  base_url: "API Base URL",
  instagram_account_id: "Instagram Account ID",
  page_id: "Page ID",
  access_token: "Access Token",
  app_secret: "App Secret",
  page_access_token: "Page Access Token",
  site_name: "Website / Widget Name",
  allowed_origin: "Allowed Website Origin",
  region: "Region",
  ad_account_id: "Ad Account ID",
  pixel_id: "Pixel ID",
  form_name: "Form Name",
  spreadsheet_id: "Spreadsheet ID",
  sheet_name: "Sheet Name",
  service_account_json: "Service Account JSON",
  webhook_url: "Webhook URL",
  secret: "Signing Secret",
};

const SECRET_FIELDS = new Set(["password", "api_key", "auth_key", "access_token", "app_secret", "page_access_token", "service_account_json", "secret"]);

function statusTone(status) {
  if (status === "live") return "green";
  if (status === "configured") return "blue";
  return "slate";
}

export default function Channels() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === "owner" || user?.role === "admin";
  const [items, setItems] = useState(null);
  const [selected, setSelected] = useState(null);
  const [label, setLabel] = useState("");
  const [fields, setFields] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/channels").then((r) => setItems(r.data)).catch((err) => toast.error(apiError(err.response?.data?.detail)));
  useEffect(load, []);

  const grouped = useMemo(() => {
    const out = {};
    (items || []).forEach((item) => { (out[item.group] ||= []).push(item); });
    return out;
  }, [items]);

  const openConfig = (item) => {
    if (item.id === "whatsapp") {
      navigate("/whatsapp-connection");
      return;
    }
    setSelected(item);
    setLabel(item.label || "");
    setFields({});
  };

  const save = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/channels/${selected.id}`, { label, enabled: true, fields });
      toast.success(`${selected.name} configuration saved securely`);
      setSelected(null);
      await load();
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    }
    setSaving(false);
  };

  const disconnect = async (item) => {
    if (!canManage) return;
    if (item.id === "whatsapp") return navigate("/whatsapp-connection");
    try {
      await api.delete(`/channels/${item.id}`);
      toast.success(`${item.name} disconnected`);
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
  };

  return (
    <div className="p-6 md:p-8 space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Channels & Integrations</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-3xl">Connect messaging, lead sources and business systems from one place. Credentials are encrypted; only verified provider adapters are marked Live.</p>
        </div>
        <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live</p><p className="mt-1 text-2xl font-heading font-extrabold text-emerald-600">{(items || []).filter((x) => x.status === "live").length}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured</p><p className="mt-1 text-2xl font-heading font-extrabold text-violet-600">{(items || []).filter((x) => x.status === "configured").length}</p></Card>
        <Card className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</p><p className="mt-1 text-2xl font-heading font-extrabold text-slate-800">{(items || []).length}</p></Card>
      </div>

      {!items ? <div className="h-52 shimmer rounded-3xl" /> : Object.entries(grouped).map(([group, rows]) => (
        <section key={group} className="space-y-3">
          <div><h2 className="font-heading text-lg font-extrabold text-slate-900">{group}</h2><p className="text-xs text-slate-400">{group === "Messaging" ? "Customer conversations and outbound messaging" : group === "Lead Sources" ? "Capture and enrich new opportunities" : "Connect GOLD-e AI with the rest of your stack"}</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((item) => {
              const Icon = ICONS[item.id] || Plug;
              return <Card key={item.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="soft-icon"><Icon className="w-5 h-5" /></div>
                  <Badge tone={statusTone(item.status)}>{item.status === "live" ? "Live" : item.status === "configured" ? "Configured" : "Setup required"}</Badge>
                </div>
                <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900">{item.name}</h3>
                <p className="mt-1 text-xs font-semibold text-violet-500">{item.provider}</p>
                <p className="mt-3 min-h-10 text-xs leading-5 text-slate-500">{item.note}</p>
                {item.configured_fields?.length > 0 && <p className="mt-2 text-[11px] text-slate-400">Saved: {item.configured_fields.join(", ")}</p>}
                <div className="mt-5 flex gap-2">
                  <Button size="sm" onClick={() => openConfig(item)} disabled={!canManage && item.id !== "whatsapp"}><Settings2 className="w-4 h-4" /> {item.connected ? "Manage" : "Connect"}</Button>
                  {item.connected && canManage && <Button size="sm" variant="outline" onClick={() => disconnect(item)}><Unplug className="w-4 h-4" /> Disconnect</Button>}
                </div>
              </Card>;
            })}
          </div>
        </section>
      ))}

      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-xs leading-5 text-violet-700">
        <b>Provider state:</b> WhatsApp is marked <b>Live</b> only when the Meta Cloud API connection is live. Email, SMS, Instagram, Facebook, Google and webhook connectors show <b>Configured</b> after encrypted credentials are saved; provider-specific delivery/verification remains explicit so the UI never invents a successful live connection.
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Connect ${selected.name}` : "Connect channel"} className="max-w-xl">
        {selected && <form onSubmit={save} className="space-y-4">
          <Input label="Connection label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Primary ${selected.name}`} />
          <div className="grid gap-3 sm:grid-cols-2">
            {(selected.fields || []).map((field) => <Input key={field} label={FIELD_LABELS[field] || field} type={SECRET_FIELDS.has(field) ? "password" : "text"} value={fields[field] || ""} onChange={(e) => setFields((prev) => ({ ...prev, [field]: e.target.value }))} placeholder={selected.configured_fields?.includes(field) ? "Saved — enter to replace" : ""} />)}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secrets are encrypted at rest and are never returned to the browser.</div>
          <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving…" : "Save Connection"}</Button>
        </form>}
      </Modal>
    </div>
  );
}
