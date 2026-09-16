import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api";
import { Button, Input } from "../components/ui";
import { Sparkles, ShieldCheck, Zap, TrendingUp, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "demo@gold-e.ai", password: "demo1234", workspace_name: "" });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register({ name: form.name, email: form.email, password: form.password, workspace_name: form.workspace_name });
      toast.success(mode === "login" ? "Welcome back!" : "Workspace created!");
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="landing-shell relative min-h-screen overflow-hidden p-4 sm:p-6">
      <div className="hero-orb pointer-events-none absolute -left-40 -top-52 h-[540px] w-[540px] rounded-full opacity-40" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/90 bg-white/75 shadow-browser backdrop-blur-xl lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-violet-100/70 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-10 lg:flex">
          <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="font-heading text-xl font-extrabold leading-none text-slate-950">GOLD-e AI</p>
              <p className="mt-1 text-xs text-slate-400">AI Revenue Engine</p>
            </div>
          </div>
          <div className="relative">
            <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-violet-700">Your connected revenue workspace</div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-slate-950">One platform.<br /><span className="brand-text">Every channel.</span><br />More revenue.</h1>
            <p className="mt-5 max-w-md leading-relaxed text-slate-600">AI-powered lead scoring, campaigns, conversations and automation — with a clean interface your team can actually enjoy using.</p>
            <div className="mt-8 grid gap-3">
              {[
                { icon: Sparkles, t: "AI-assisted lead scoring and revenue workflows" },
                { icon: Zap, t: "WhatsApp, campaigns and automation in one place" },
                { icon: ShieldCheck, t: "Encrypted credentials and private workspace data" },
                { icon: TrendingUp, t: "Turn conversations into measurable opportunities" },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-3 rounded-2xl border border-white bg-white/70 p-3 text-slate-700 shadow-sm">
                  <div className="soft-icon h-9 w-9 rounded-xl"><f.icon className="h-4 w-4" /></div>
                  <span className="text-sm font-semibold">{f.t}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="relative text-xs text-slate-400">gold-etechapp.com · GOLD-e AI</p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-600"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
              <div><p className="font-heading text-xl font-extrabold">GOLD-e AI</p><p className="text-[10px] text-slate-400">AI Revenue Engine</p></div>
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-slate-950">{mode === "login" ? "Welcome back" : "Create your workspace"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "login" ? "Sign in to continue to your GOLD-e AI workspace." : "Start with 100 free coins and your own isolated workspace."}</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === "register" && <><Input label="Your name" value={form.name} onChange={set("name")} placeholder="Jane Doe" required data-testid="auth-name" /><Input label="Workspace / Business name" value={form.workspace_name} onChange={set("workspace_name")} placeholder="Acme Corp" required data-testid="auth-workspace" /></>}
              <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required data-testid="auth-email" />
              <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required data-testid="auth-password" />
              <Button type="submit" size="lg" className="w-full" disabled={loading} data-testid="auth-submit">{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create workspace"}</Button>
            </form>

            {mode === "login" && <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-3 text-xs text-violet-700"><b>Demo login</b> — email: demo@gold-e.ai · password: demo1234</div>}

            <p className="mt-6 text-center text-sm text-slate-500">{mode === "login" ? "New to GOLD-e AI?" : "Already have an account?"}{" "}<button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-bold text-violet-700 hover:underline" data-testid="auth-toggle">{mode === "login" ? "Create a workspace" : "Sign in"}</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}
