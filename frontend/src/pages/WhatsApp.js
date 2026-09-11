import React, { useEffect, useMemo, useState } from "react";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Card, Badge, Input, EmptyState, Modal, Select, Textarea } from "../components/ui";
import { CheckCircle2, Lock, Phone, Plug, RefreshCw, Search, Send, ShieldOff } from "lucide-react";
import { toast } from "sonner";

const STATUS_TONE = { sent: "blue", delivered: "gold", read: "green", failed: "HOT", blocked: "WARM", received: "purple" };

export default function WhatsApp() {
  const { user } = useAuth();
  const canManageConnection = user?.role === "owner" || user?.role === "admin";
  const [conn, setConn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ phone_number_id: "", waba_id: "", access_token: "", app_secret: "" });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testForm, setTestForm] = useState({ lead_id: "", body: "Hello {{first_name}}, this is a GOLD-e AI WhatsApp connection test." });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  const load = async ({ quiet = false } = {}) => {
    if (!quiet) setRefreshing(true);
    try {
      const [connectionRes, messagesRes, leadsRes] = await Promise.all([
        api.get("/whatsapp/connection"),
        api.get("/whatsapp/messages"),
        api.get("/leads"),
      ]);
      setConn(connectionRes.data);
      setMessages(messagesRes.data || []);
      setLeads(leadsRes.data || []);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "WhatsApp data could not be loaded");
    }
    setRefreshing(false);
  };

  useEffect(() => { load({ quiet: true }); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const connect = async (e) => {
    e.preventDefault();
    if (!canManageConnection) return toast.error("Owner or Admin access is required to manage WhatsApp credentials");
    setSaving(true);
    try {
      await api.post("/whatsapp/connection", form);
      toast.success("WhatsApp connected in live mode");
      setForm({ phone_number_id: "", waba_id: "", access_token: "", app_secret: "" });
      await load({ quiet: true });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    }
    setSaving(false);
  };

  const disconnect = async () => {
    if (!canManageConnection) return toast.error("Owner or Admin access is required");
    if (!window.confirm("Disconnect WhatsApp Cloud API from this workspace?")) return;
    try {
      await api.delete("/whatsapp/connection");
      toast.success("WhatsApp disconnected");
      await load({ quiet: true });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "WhatsApp could not be disconnected");
    }
  };

  const sendTest = async (event) => {
    event.preventDefault();
    if (!testForm.lead_id) return toast.error("Choose a lead for the test message");
    if (!testForm.body.trim()) return toast.error("Enter a test message");
    setTestSending(true);
    toast.loading("Running consent guard and sending test…", { id: "wa-test" });
    try {
      const { data } = await api.post("/whatsapp/test-send", { lead_id: testForm.lead_id, channel: "WhatsApp", body: testForm.body.trim() });
      if (data.status === "blocked") toast.warning(data.reason || "Test was blocked by Consent Guard", { id: "wa-test" });
      else if (data.status === "failed") toast.error(`Test failed: ${data.code || "provider error"}`, { id: "wa-test" });
      else toast.success(`Test ${data.status}${data.mode ? ` · ${data.mode}` : ""}`, { id: "wa-test" });
      setTestOpen(false);
      await load({ quiet: true });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || "Test message could not be sent", { id: "wa-test" });
    }
    setTestSending(false);
  };

  const statuses = useMemo(() => [...new Set(messages.map((message) => message.status).filter(Boolean))].sort(), [messages]);
  const filteredMessages = useMemo(() => messages.filter((message) => {
    const needle = query.trim().toLowerCase();
    if (needle && !`${message.lead_name || ""} ${message.body || ""}`.toLowerCase().includes(needle)) return false;
    if (statusFilter && message.status !== statusFilter) return false;
    if (directionFilter && message.direction !== directionFilter) return false;
    return true;
  }), [messages, query, statusFilter, directionFilter]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2"><Phone className="w-7 h-7 text-emerald-500" /> WhatsApp Cloud API</h1>
          <p className="text-slate-500 text-sm mt-1">Connect your own Meta WhatsApp account. Credentials are encrypted and never exposed to the browser.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => load()} disabled={refreshing}><RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh Status</Button>
          <Button onClick={() => setTestOpen(true)}><Send className="w-4 h-4" /> Send Test</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-slate-900">Connection</h3>
            {conn?.connected ? <Badge tone="green"><CheckCircle2 className="w-3 h-3" /> Live</Badge> : <Badge tone="gold">{conn?.mode === "simulation" ? "Simulation" : "Disconnected"}</Badge>}
          </div>

          {conn?.connected ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200"><p className="text-sm text-emerald-800">Connected in live mode. Messages route through Meta WhatsApp Cloud API.</p></div>
              <div className="text-sm space-y-1">
                <p className="text-slate-500">Phone Number ID: <span className="font-mono text-slate-800">{conn.phone_number_id}</span></p>
                <p className="text-slate-500">WABA ID: <span className="font-mono text-slate-800">{conn.waba_id}</span></p>
                <p className="text-slate-500">Last updated: <span className="text-slate-800">{conn.updated_at ? new Date(conn.updated_at).toLocaleString() : "—"}</span></p>
              </div>
              {canManageConnection ? <Button variant="danger" onClick={disconnect} data-testid="disconnect-btn">Disconnect</Button> : <p className="text-xs text-slate-500">Only an Owner or Admin can change this connection.</p>}
            </div>
          ) : canManageConnection ? (
            <>
              <div className="p-3 rounded-xl bg-gold-50 border border-gold-200 mb-4 text-xs text-gold-700">
                {conn?.mode === "simulation" ? <>Running in <b>simulation mode</b>. Add real Meta credentials to go live.</> : <>WhatsApp is not connected. Add Meta credentials to enable live delivery.</>}
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
          ) : (
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600">WhatsApp is not connected. Ask a workspace Owner or Admin to configure the Meta credentials.</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="font-heading font-bold text-slate-900 flex items-center gap-2"><Send className="w-4 h-4 text-gold-500" /> Message Log</h3><span className="text-xs text-slate-400">{filteredMessages.length} of {messages.length}</span></div>
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lead or message…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm" /></div>
            <Select value={directionFilter} onChange={(event) => setDirectionFilter(event.target.value)}><option value="">All directions</option><option value="outbound">Outbound</option><option value="inbound">Inbound</option></Select>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
          </div>
          {filteredMessages.length === 0 ? (
            <EmptyState icon={Send} title={messages.length ? "No matching messages" : "No messages yet"} sub={messages.length ? "Adjust the message filters." : "Send a campaign or test message to see delivery events here."} />
          ) : (
            <div className="space-y-2 max-h-[26rem] overflow-y-auto" data-testid="message-log">
              {filteredMessages.map((m) => (
                <div key={m.id} className="px-4 py-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-800">{m.lead_name}</span><div className="flex items-center gap-1.5">{m.direction === "inbound" && <Badge tone="purple">inbound</Badge>}<Badge tone={STATUS_TONE[m.status] || "slate"}>{m.status}</Badge></div></div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{m.body}</p>
                  {m.block_reason && <p className="text-[11px] text-amber-600 mt-0.5 flex items-center gap-1"><ShieldOff className="w-3 h-3" /> {m.block_reason}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={testOpen} onClose={() => setTestOpen(false)} title="Send WhatsApp Test">
        <form onSubmit={sendTest} className="space-y-4">
          <Select label="Lead" value={testForm.lead_id} onChange={(event) => setTestForm((current) => ({ ...current, lead_id: event.target.value }))} required>
            <option value="">Choose a lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}{lead.company ? ` · ${lead.company}` : ""}</option>)}
          </Select>
          <Textarea label="Message" rows={4} value={testForm.body} onChange={(event) => setTestForm((current) => ({ ...current, body: event.target.value }))} />
          <div className="text-xs text-slate-500">The normal Consent Guard and provider configuration are used. A blocked or failed test will not be reported as delivered.</div>
          <Button type="submit" className="w-full" disabled={testSending}><Send className="w-4 h-4" /> {testSending ? "Sending…" : "Run Test Send"}</Button>
        </form>
      </Modal>
    </div>
  );
}
