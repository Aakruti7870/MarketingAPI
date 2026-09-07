import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiError } from "../api";
import { Button, Input } from "../components/ui";
import { Sparkles, ShieldCheck, Zap, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-1/2 bg-ink flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-gold-600/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center font-heading font-extrabold text-ink text-xl">G</div>
          <div>
            <p className="font-heading font-extrabold text-white text-2xl leading-none">GOLD-e</p>
            <p className="text-xs text-slate-400 mt-1">AI Revenue Engine</p>
          </div>
        </div>
        <div className="relative">
          <h1 className="font-heading text-4xl font-extrabold text-white leading-tight">
            One platform.<br /><span className="gold-text">Every channel.</span><br />More revenue.
          </h1>
          <p className="text-slate-400 mt-5 max-w-md leading-relaxed">
            AI-powered lead scoring, omnichannel campaigns, and automated sales — with your own API keys, private contacts, and full tenant isolation.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: Sparkles, t: "AI scores every lead HOT / WARM / COLD" },
              { icon: Zap, t: "WhatsApp, Email, SMS & Social in one inbox" },
              { icon: ShieldCheck, t: "Encrypted API vault & private contact numbers" },
              { icon: TrendingUp, t: "Command center: run your sales with a sentence" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center"><f.icon className="w-4 h-4 text-gold-300" /></div>
                <span className="text-sm">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-slate-600">© 2026 GOLD-e · Multi-tenant SaaS</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center font-heading font-extrabold text-ink">G</div>
            <p className="font-heading font-extrabold text-2xl">GOLD-e</p>
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login" ? "Sign in to your GOLD-e workspace" : "Start your isolated multi-tenant workspace"}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "register" && (
              <>
                <Input label="Your name" value={form.name} onChange={set("name")} placeholder="Jane Doe" required data-testid="auth-name" />
                <Input label="Workspace / Business name" value={form.workspace_name} onChange={set("workspace_name")} placeholder="Acme Corp" required data-testid="auth-workspace" />
              </>
            )}
            <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required data-testid="auth-email" />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required data-testid="auth-password" />

            <Button type="submit" size="lg" className="w-full" disabled={loading} data-testid="auth-submit">
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create workspace"}
            </Button>
          </form>

          {mode === "login" && (
            <div className="mt-4 p-3 rounded-xl bg-gold-50 border border-gold-200 text-xs text-gold-700">
              <b>Demo login</b> — email: demo@gold-e.ai · password: demo1234
            </div>
          )}

          <p className="text-sm text-slate-500 mt-6 text-center">
            {mode === "login" ? "New to GOLD-e?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-semibold text-gold-700 hover:underline" data-testid="auth-toggle">
              {mode === "login" ? "Create a workspace" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
