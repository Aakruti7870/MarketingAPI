import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, Input, EmptyState } from "../components/ui";
import { Phone, Plug, CheckCircle2, Send, ShieldOff, Lock } from "lucide-react";
import { toast } from "sonner";

const STATUS_TONE = { sent: "blue", delivered: "gold", read: "green", failed: "HOT", blocked: "WARM", received: "purple" };

export default function WhatsApp() {
  const [conn, setConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ phone_number_id: "", waba_id: "", access_token: "", app_secret: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/whatsapp/connection").then((r) => setConn(r.data));
    api.get("/whatsapp/messages").then((r) => setMessages(r.data));
  };
  useEffect(load, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const connect = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/whatsapp/connection", form);
      toast.success("WhatsApp connected (live mode)");
      load();
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  const disconnect = async () => { await api.delete("/whatsapp/connection"); toast.success("Disconnected — back to simulation"); load(); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2"><Phone className="w-7 h-7 text-emerald-500" /> WhatsApp Cloud API</h1>
        <p className="text-slate-500 text-sm mt-1">Connect your own Meta WhatsApp account. Credentials are encrypted and never exposed to the browser.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-slate-900">Connection</h3>
            {conn?.connected
              ? <Badge tone="green"><CheckCircle2 className="w-3 h-3" /> Live</Badge>
              : <Badge tone="gold">Simulation</Badge>}
          </div>

          {conn?.connected ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-800">Connected in live mode. Messages route through Meta WhatsApp Cloud API.</p>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-slate-500">Phone Number ID: <span className="font-mono text-slate-800">{conn.phone_number_id}</span></p>
                <p className="text-slate-500">WABA ID: <span className="font-mono text-slate-800">{conn.waba_id}</span></p>
              </div>
              <Button variant="danger" onClick={disconnect} data-testid="disconnect-btn">Disconnect</Button>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 mb-4 text-xs text-gold-700">
                Running in <b>simulation mode</b> — the full pipeline (consent → send → webhooks → autopilot) works end-to-end. Add real Meta credentials to go live.
              </div>
              <form onSubmit={connect} className="space-y-3">
                <Input label="Phone Number ID" value={form.phone_number_id} onChange={set("phone_number_id")} required data-testid="wa-phone-id" />
                <Input label="WABA ID" value={form.waba_id} onChange={set("waba_id")} required data-testid="wa-waba-id" />
                <Input label="System User Access Token" type="password" value={form.access_token} onChange={set("access_token")} required data-testid="wa-token" />
                <Input label="App Secret (webhook signing)" type="password" value={form.app_secret} onChange={set("app_secret")} required data-testid="wa-secret" />
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2.5 rounded-lg bg-slate-50"><Lock className="w-3.5 h-3.5" /> Encrypted at rest · never logged · never returned to frontend</div>
                <Button type="submit" className="w-full" disabled={saving} data-testid="connect-btn"><Plug className="w-4 h-4" /> {saving ? "Connecting…" : "Connect WhatsApp"}</Button>
              </form>
            </>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-gold-500" /> Message Log</h3>
          {messages.length === 0 ? (
            <EmptyState icon={Send} title="No messages yet" sub="Send a campaign to see delivery events here." />
          ) : (
            <div className="space-y-2 max-h-[26rem] overflow-y-auto" data-testid="message-log">
              {messages.map((m) => (
                <div key={m.id} className="px-4 py-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800">{m.lead_name}</span>
                    <div className="flex items-center gap-1.5">
                      {m.direction === "inbound" && <Badge tone="purple">inbound</Badge>}
                      <Badge tone={STATUS_TONE[m.status] || "slate"}>{m.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{m.body}</p>
                  {m.block_reason && <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1"><ShieldOff className="w-3 h-3" /> {m.block_reason}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
