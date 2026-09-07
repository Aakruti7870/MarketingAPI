import React, { useEffect, useState } from "react";
import api, { apiError } from "../api";
import { Button, Card, Badge, EmptyState } from "../components/ui";
import { ShieldCheck, ShieldOff, UserCheck, UserX, Clock, Save } from "lucide-react";
import { toast } from "sonner";

function Stat({ icon: Icon, label, value, tone }) {
  const t = { green: "text-emerald-500 bg-emerald-50", red: "text-red-500 bg-red-50", gold: "text-gold-600 bg-gold-50", slate: "text-slate-500 bg-slate-100" }[tone];
  return (
    <Card className="p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t}`}><Icon className="w-5 h-5" /></div>
      <p className="text-3xl font-heading font-extrabold text-slate-900 mt-4">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  );
}

export default function Consent() {
  const [summary, setSummary] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [optouts, setOptouts] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/consent/summary").then((r) => setSummary(r.data));
    api.get("/consent/policy").then((r) => setPolicy(r.data));
    api.get("/consent/opt-outs").then((r) => setOptouts(r.data));
  };
  useEffect(() => { load(); }, []);

  const savePolicy = async () => {
    setSaving(true);
    try {
      await api.put("/consent/policy", {
        sending_enabled: policy.sending_enabled,
        frequency_limit: Number(policy.frequency_limit),
        frequency_window_hours: Number(policy.frequency_window_hours),
        quiet_hours: policy.quiet_hours || "",
      });
      toast.success("Policy updated");
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setSaving(false);
  };

  if (!summary || !policy) return <div className="p-8"><div className="h-40 shimmer rounded-2xl" /></div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-emerald-500" /> Consent Guard
        </h1>
        <p className="text-slate-500 text-sm mt-1">The hard gate. Every outbound message must pass consent, opt-out and frequency checks before sending.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={UserCheck} label="Contacts" value={summary.total} tone="slate" />
        <Stat icon={ShieldCheck} label="Opted In" value={summary.opted_in} tone="green" />
        <Stat icon={Clock} label="Pending" value={summary.pending} tone="gold" />
        <Stat icon={UserX} label="Opted Out" value={summary.opted_out} tone="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-5">Sending Policy</h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 text-sm">Workspace sending</p>
                <p className="text-xs text-slate-500">Master switch for all outbound messages</p>
              </div>
              <button onClick={() => setPolicy({ ...policy, sending_enabled: !policy.sending_enabled })} data-testid="sending-toggle"
                className={`relative w-11 h-6 rounded-full transition ${policy.sending_enabled ? "gold-gradient" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${policy.sending_enabled ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Frequency limit (msgs)</span>
                <input type="number" value={policy.frequency_limit} onChange={(e) => setPolicy({ ...policy, frequency_limit: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-gold-400" data-testid="freq-limit" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Window (hours)</span>
                <input type="number" value={policy.frequency_window_hours} onChange={(e) => setPolicy({ ...policy, frequency_window_hours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-gold-400" data-testid="freq-window" />
              </label>
            </div>
            <Button onClick={savePolicy} disabled={saving} data-testid="save-policy"><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Policy"}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-5 flex items-center gap-2"><ShieldOff className="w-4 h-4 text-red-500" /> Opt-out Registry</h3>
          {optouts.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No opt-outs" sub="Contacts who reply STOP or opt out appear here and are permanently blocked." />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {optouts.map((o) => (
                <div key={o.lead_id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-50/50 border border-red-100" data-testid={`optout-${o.lead_id}`}>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{o.lead_name}</p>
                    <p className="text-xs text-slate-500">{o.reason} · {o.channel || "all channels"}</p>
                  </div>
                  <Badge tone="HOT">Blocked</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="p-4 rounded-2xl bg-ink text-white flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-gold-300 shrink-0" />
        <p className="text-sm text-slate-300">Consent-first architecture: no integration can bypass <span className="font-mono text-gold-200">can_send()</span>. Messages are blocked for missing consent, opt-out, suppression, block list, frequency limits, unapproved templates, or a paused workspace/campaign.</p>
      </div>
    </div>
  );
}
