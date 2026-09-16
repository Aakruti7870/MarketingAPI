import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, X, CornerDownLeft } from "lucide-react";
import { Badge } from "./ui";

const SUGGESTIONS = [
  "Show Pune hot leads",
  "Create a campaign",
  "Generate a poster",
  "Follow up unanswered quotes",
  "Check API costs this month",
];

export default function CommandCenter({ open, onClose }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) { setQ(""); setResult(null); }
  }, [open]);

  const run = async (cmd) => {
    const command = cmd || q;
    if (!command.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/ai/command", { command });
      setResult(data);
      if (data.action?.startsWith("navigate:") && !data.data) {
        const path = data.action.replace("navigate:", "");
        setTimeout(() => { onClose(); navigate(path); }, 800);
      }
    } catch {
      setResult({ reply: "Something went wrong. Please try again." });
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4" data-testid="command-center">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-gold-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Ask GOLD-e anything… e.g. Show Pune hot leads"
            className="flex-1 text-base outline-none placeholder:text-slate-400"
            data-testid="ai-command-input"
          />
          <button onClick={() => run()} className="gold-gradient text-ink rounded-lg p-2" data-testid="command-run">
            <Send className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto">
          {!result && !loading && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gold-700 mb-3">Try asking</p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => { setQ(s); run(s); }}
                    className="w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl hover:bg-gold-50 text-sm text-slate-700 group transition"
                    data-testid={`command-suggestion`}>
                    <span>{s}</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-300 group-hover:text-gold-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {loading && <div className="py-8 text-center text-slate-500 text-sm">GOLD-e is thinking…</div>}
          {result && (
            <div className="animate-fade-up" data-testid="command-result">
              <p className="text-sm text-slate-800 mb-3">{result.reply}</p>
              {result.data && result.data.length > 0 && (
                <div className="space-y-2">
                  {result.data.map((l) => (
                    <div key={l.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-gold-300 cursor-pointer"
                      onClick={() => { onClose(); navigate("/leads"); }}>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{l.name}</p>
                        <p className="text-xs text-slate-500">{l.company}</p>
                      </div>
                      <Badge tone={l.temperature}>{l.temperature} {l.score}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
