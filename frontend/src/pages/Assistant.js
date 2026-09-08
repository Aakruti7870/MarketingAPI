import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowUp, Bot, Copy, Globe2, Lightbulb, RefreshCw,
  Sparkles, ThumbsDown, ThumbsUp, WandSparkles, X,
} from "lucide-react";

const PROMPTS = [
  { label: "Give me campaign ideas", icon: Lightbulb, prompt: "Give me 5 campaign ideas for my business this month." },
  { label: "Find hot leads", icon: Globe2, prompt: "Show my hottest leads and what I should do next." },
  { label: "Write a follow-up", icon: WandSparkles, prompt: "Write a short follow-up message for a warm lead who has not replied." },
  { label: "Plan my sales day", icon: Sparkles, prompt: "Plan my sales priorities for today based on the most important opportunities." },
  { label: "Improve an offer", icon: Bot, prompt: "Help me improve a promotional offer so it feels clear, valuable and professional." },
];

export default function Assistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [messages, setMessages] = useState([]);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const promptHandled = useRef("");
  const firstName = useMemo(() => (user?.name || "there").trim().split(/\s+/)[0], [user]);
  const requestedThread = searchParams.get("thread") || "";
  const starterPrompt = searchParams.get("prompt") || "";

  const setThreadInUrl = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id) next.set("thread", id); else next.delete("thread");
    next.delete("prompt");
    setSearchParams(next, { replace: true });
  };

  const submit = async (text = input) => {
    const command = (text || "").trim();
    if (!command || busy || loadingThread) return;
    const userMessage = { id: `u-${Date.now()}`, role: "user", text: command };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPromptsOpen(false);
    setBusy(true);
    try {
      const { data } = await api.post("/ai/command", { command, thread_id: threadId || undefined });
      if (data?.thread_id && data.thread_id !== threadId) {
        setThreadId(data.thread_id);
        setThreadInUrl(data.thread_id);
      }
      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data?.reply || "I’m ready to help with leads, campaigns, follow-ups, creative work and workspace actions.",
        action: data?.action || null,
        data: Array.isArray(data?.data) ? data.data : null,
        sourcePrompt: command,
      }]);
    } catch (err) {
      if (err.response?.status === 402) {
        navigate("/pricing");
        toast.error("Your coin balance is empty. Choose a plan to continue.");
      } else {
        const message = apiError(err.response?.data?.detail) || err.message || "Assistant request failed";
        setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", text: message, error: true }]);
      }
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!requestedThread || requestedThread === threadId) return;
    let active = true;
    setLoadingThread(true);
    api.get(`/assistant/threads/${requestedThread}`)
      .then(({ data }) => {
        if (!active) return;
        setThreadId(requestedThread);
        setMessages((data?.messages || []).map((message) => ({
          id: message.id,
          role: message.role,
          text: message.text,
          action: message.action || null,
          data: Array.isArray(message.data) ? message.data : null,
        })));
      })
      .catch((err) => {
        if (!active) return;
        toast.error(apiError(err.response?.data?.detail) || "Conversation could not be loaded");
        setThreadId(null);
        setMessages([]);
        setThreadInUrl(null);
      })
      .finally(() => active && setLoadingThread(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedThread]);

  useEffect(() => {
    if (!starterPrompt || requestedThread || busy || loadingThread || messages.length) return;
    if (promptHandled.current === starterPrompt) return;
    promptHandled.current = starterPrompt;
    submit(starterPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starterPrompt, requestedThread, loadingThread]);

  const newChat = () => {
    setMessages([]);
    setInput("");
    setThreadId(null);
    promptHandled.current = "";
    setThreadInUrl(null);
  };

  return (
    <div className="assistant-page flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-5 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-500"><Sparkles className="h-4 w-4" /> GOLD-e AI Assistant</div>
          <button onClick={newChat} className="rounded-xl border border-violet-100 bg-white/85 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700">New chat</button>
        </div>

        {loadingThread ? (
          <div className="flex flex-1 items-center justify-center py-20"><div className="brand-gradient h-10 w-10 animate-pulse rounded-xl shadow-brand" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center lg:py-20">
            <div className="assistant-halo mb-8 flex h-24 w-24 items-center justify-center rounded-full"><Sparkles className="h-9 w-9 text-violet-600" /></div>
            <h1 className="font-heading max-w-3xl text-4xl font-medium tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">What’s on your mind<br className="hidden sm:block" /> today, {firstName}?</h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Ask about leads, campaigns, follow-ups, content, analytics or the next best action for your workspace.</p>
            <div className="mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
              {PROMPTS.map(({ label, icon: Icon, prompt }, index) => (
                <button key={label} onClick={() => submit(prompt)} className="prompt-pill group">
                  <span className={`soft-mini ${index % 2 ? "!text-cyan-600" : "!text-violet-600"}`}><Icon className="h-3.5 w-3.5" /></span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-8 py-8">
            <div className="text-center text-xs font-semibold text-slate-400">Conversation</div>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onOpenAction={(action) => {
                if (action?.startsWith("navigate:")) navigate(action.slice("navigate:".length));
              }} onRegenerate={() => message.sourcePrompt && submit(message.sourcePrompt)} />
            ))}
            {busy && (
              <div className="flex items-start gap-3">
                <div className="brand-gradient mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-4 w-4" /></div>
                <div className="assistant-bubble max-w-2xl px-5 py-4"><div className="flex gap-1.5"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div></div>
              </div>
            )}
          </div>
        )}

        <div className="sticky bottom-0 z-10 pt-5">
          <div className="assistant-composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 3000))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              placeholder="Ask me anything"
              rows={2}
              className="w-full resize-none border-0 bg-transparent px-1 py-1 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <ComposerAction icon={WandSparkles} label="Browse Prompts" onClick={() => setPromptsOpen((v) => !v)} />
              </div>
              <div className="flex items-center gap-3"><span className="text-[11px] font-semibold text-slate-400">{input.length}/3000</span><button onClick={() => submit()} disabled={!input.trim() || busy || loadingThread} className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-brand transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp className="h-5 w-5" /></button></div>
            </div>
          </div>

          {promptsOpen && (
            <div className="absolute bottom-[118px] left-0 right-0 z-20 rounded-[24px] border border-white/90 bg-white/95 p-4 shadow-[0_25px_80px_rgba(76,59,122,.18)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between"><div><div className="text-sm font-extrabold text-slate-900">Prompt Library</div><div className="text-xs text-slate-400">Start faster with curated business prompts.</div></div><button onClick={() => setPromptsOpen(false)} className="soft-round"><X className="h-4 w-4" /></button></div>
              <div className="grid gap-2 sm:grid-cols-2">{PROMPTS.map(({ label, prompt, icon: Icon }) => <button key={label} onClick={() => submit(prompt)} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 to-fuchsia-50/50 p-3 text-left transition hover:border-violet-200"><span className="soft-mini"><Icon className="h-3.5 w-3.5" /></span><span className="text-sm font-bold text-slate-700">{label}</span></button>)}</div>
            </div>
          )}
          <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">GOLD-e AI may make mistakes. Verify critical business information before acting.</p>
        </div>
      </div>
    </div>
  );
}

function ComposerAction({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="composer-action"><Icon className="h-3.5 w-3.5" /><span>{label}</span></button>;
}

function MessageBubble({ message, onOpenAction, onRegenerate }) {
  if (message.role === "user") {
    return <div className="flex justify-end"><div className="max-w-2xl rounded-[22px] border border-slate-100 bg-white/92 px-5 py-3.5 text-[15px] leading-6 text-slate-800 shadow-sm">{message.text}</div></div>;
  }
  return (
    <div className="flex items-start gap-3">
      <div className="brand-gradient mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-4 w-4" /></div>
      <div className="max-w-3xl flex-1">
        <div className={`assistant-bubble px-5 py-4 text-[15px] leading-7 ${message.error ? "!border-rose-200 !bg-rose-50/80 text-rose-700" : "text-slate-800"}`}>
          <div className="whitespace-pre-wrap">{message.text}</div>
          {message.data?.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{message.data.slice(0, 6).map((item, index) => <div key={item.id || index} className="rounded-xl border border-violet-100 bg-white/75 p-3"><div className="text-sm font-extrabold text-slate-800">{item.name || item.company || `Result ${index + 1}`}</div>{item.company && item.name && <div className="mt-0.5 text-xs text-slate-500">{item.company}</div>}{item.score != null && <div className="mt-2 text-xs font-bold text-violet-600">AI score {item.score}</div>}</div>)}</div>}
          {message.action?.startsWith("navigate:") && <button onClick={() => onOpenAction(message.action)} className="mt-4 rounded-xl border border-violet-200 bg-white px-3 py-2 text-xs font-extrabold text-violet-700 shadow-sm hover:bg-violet-50">Open recommended workspace</button>}
        </div>
        {!message.error && <div className="mt-2 flex items-center gap-1 text-slate-400"><TinyAction icon={Copy} label="Copy" onClick={() => { navigator.clipboard?.writeText(message.text); toast.success("Copied"); }} /><TinyAction icon={ThumbsUp} label="Helpful" /><TinyAction icon={ThumbsDown} label="Not helpful" />{message.sourcePrompt && <TinyAction icon={RefreshCw} label="Regenerate" onClick={onRegenerate} />}</div>}
      </div>
    </div>
  );
}

function TinyAction({ icon: Icon, label, onClick }) {
  return <button title={label} onClick={onClick} className="rounded-lg p-1.5 transition hover:bg-white hover:text-violet-600"><Icon className="h-4 w-4" /></button>;
}
