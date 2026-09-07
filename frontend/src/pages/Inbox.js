import React, { useEffect, useState } from "react";
import api from "../api";
import { Badge, Button, EmptyState } from "../components/ui";
import { Send, Sparkles, MessageSquare, Mail, Smartphone, Instagram, FileText } from "lucide-react";
import { toast } from "sonner";

const CHANNEL_ICON = { WhatsApp: MessageSquare, Email: Mail, SMS: Smartphone, Instagram: Instagram, Facebook: MessageSquare };

export default function Inbox() {
  const [convs, setConvs] = useState(null);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");
  const [reply, setReply] = useState("");
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    const p = filter !== "All" ? { channel: filter } : {};
    api.get("/conversations", { params: p }).then((r) => { setConvs(r.data); if (!active && r.data[0]) open(r.data[0].id); });
  };
  useEffect(() => { load(); }, [filter]);

  const open = async (id) => {
    setSummary(null);
    const { data } = await api.get(`/conversations/${id}`);
    setActive(data);
  };

  const send = async () => {
    if (!reply.trim() || !active) return;
    const { data } = await api.post(`/conversations/${active.id}/reply`, { body: reply });
    setActive({ ...active, messages: [...active.messages, data] });
    setReply("");
  };

  const suggest = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/conversations/${active.id}/suggest`);
      setReply(data.suggestion);
      toast.success("AI reply drafted");
    } catch { toast.error("AI unavailable"); }
    setBusy(false);
  };

  const summarize = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/conversations/${active.id}/summarize`);
      setSummary(data.summary);
    } catch { toast.error("AI unavailable"); }
    setBusy(false);
  };

  return (
    <div className="h-full flex">
      {/* Thread list */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h1 className="font-heading text-lg font-extrabold text-slate-900">Unified Inbox</h1>
          <div className="flex gap-1 mt-3 flex-wrap">
            {["All", "WhatsApp", "Email", "SMS", "Instagram"].map((c) => (
              <button key={c} onClick={() => setFilter(c)} data-testid={`inbox-filter-${c}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${filter === c ? "gold-gradient text-ink" : "text-slate-500 hover:bg-slate-100"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs?.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No conversations</p>}
          {convs?.map((c) => {
            const Icon = CHANNEL_ICON[c.channel] || MessageSquare;
            const last = c.messages[c.messages.length - 1];
            return (
              <button key={c.id} onClick={() => open(c.id)} data-testid={`conv-${c.id}`}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-gold-50/40 transition ${active?.id === c.id ? "bg-gold-50/60" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">{c.lead_name}</span>
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{last?.body}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone="slate">{c.channel}</Badge>
                  {c.unread > 0 && <span className="w-2 h-2 rounded-full bg-gold-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active chat */}
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {!active ? (
          <EmptyState icon={MessageSquare} title="Select a conversation" sub="All your channels in one thread." />
        ) : (
          <>
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-5 shrink-0">
              <div>
                <p className="font-semibold text-slate-800">{active.lead_name}</p>
                <p className="text-xs text-slate-500">{active.channel} conversation</p>
              </div>
              <Button variant="outline" size="sm" onClick={summarize} disabled={busy} data-testid="summarize-btn"><Sparkles className="w-4 h-4 text-gold-500" /> AI Summary</Button>
            </div>

            {summary && (
              <div className="mx-5 mt-4 p-3.5 rounded-xl bg-gold-50 border border-gold-200 animate-fade-up">
                <p className="text-xs font-bold uppercase tracking-wider text-gold-700 mb-1 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Summary</p>
                <p className="text-sm text-slate-700">{summary}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-3" data-testid="chat-messages">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "agent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.from === "agent" ? "gold-gradient text-ink rounded-br-sm" : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"}`}>
                    <p>{m.body}</p>
                    <p className={`text-[10px] mt-1 ${m.from === "agent" ? "text-ink/60" : "text-slate-400"}`}>{m.author}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-end gap-2">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="Type a reply…"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 resize-none" data-testid="reply-input" />
                <Button variant="outline" onClick={suggest} disabled={busy} data-testid="ai-suggest-btn"><Sparkles className="w-4 h-4 text-gold-500" /></Button>
                <Button onClick={send} data-testid="send-reply-btn"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
