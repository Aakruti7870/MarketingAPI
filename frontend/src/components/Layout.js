import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import CommandCenter from "./CommandCenter";
import {
  LayoutDashboard, Users, Kanban, MessageSquare, Send, FileText, Sparkles,
  Zap, Receipt, KeyRound, LogOut, ChevronDown, ShieldCheck, Coins,
  UsersRound, ShieldCheck as Shield, BarChart3, Code2, Phone, Gauge, CreditCard,
} from "lucide-react";

const NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Lead Engine", icon: Users, path: "/leads", badge: "AI" },
  { name: "Sales Pipeline", icon: Kanban, path: "/pipeline" },
  { name: "Unified Inbox", icon: MessageSquare, path: "/inbox" },
  { name: "Campaign Studio", icon: Send, path: "/campaigns" },
  { name: "AI Studio", icon: Sparkles, path: "/ai-studio", badge: "AI" },
  { name: "Templates", icon: FileText, path: "/templates" },
  { name: "Consent Guard", icon: Shield, path: "/consent" },
  { name: "Autopilot", icon: Zap, path: "/automations" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
  { name: "Quotations", icon: Receipt, path: "/quotations" },
  { name: "WhatsApp", icon: Phone, path: "/whatsapp" },
  { name: "Developer API", icon: Code2, path: "/developer" },
  { name: "Team", icon: UsersRound, path: "/team" },
  { name: "API Vault", icon: KeyRound, path: "/vault" },
  { name: "Workspace & Usage", icon: Gauge, path: "/workspace" },
  { name: "Pricing", icon: CreditCard, path: "/pricing" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [saas, setSaas] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => api.get("/saas/overview")
      .then((response) => { if (active) setSaas(response.data); })
      .catch(() => { if (active) setSaas(null); });
    load();
    const timer = setInterval(load, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const title = NAV.find((item) => location.pathname.startsWith(item.path))?.name || "GOLD-e AI";
  const providerCount = saas ? Object.values(saas.providers).filter((provider) => provider.configured).length : 0;
  const coinBalance = saas?.wallet?.coin_balance ?? 0;
  const paidRefill = saas?.wallet?.paid_monthly_refill ?? 2000;
  const plan = saas?.workspace?.plan || "Free";
  const coinPercent = plan === "Pro" ? Math.min(100, (coinBalance / paidRefill) * 100) : Math.min(100, coinBalance);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50/70">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/80 bg-white/75 backdrop-blur-xl md:flex">
        <button onClick={() => navigate("/")} className="flex items-center gap-3 border-b border-violet-100/70 px-5 py-5 text-left">
          <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
          <div>
            <p className="font-heading text-lg font-extrabold leading-none text-slate-950">GOLD-e AI</p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">AI Revenue Engine</p>
          </div>
        </button>

        <div className="px-3 py-3">
          <button onClick={() => navigate("/workspace")} className="w-full rounded-2xl border border-violet-100 bg-white/80 px-3 py-3 text-left shadow-sm transition hover:border-violet-200" data-testid="workspace-switcher">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Workspace</p>
                <p className="truncate text-sm font-bold text-slate-900">{user?.workspace_name || "My Workspace"}</p>
                {saas?.workspace?.plan && <p className="mt-0.5 text-[10px] font-bold text-violet-600">{saas.workspace.plan} plan</p>}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.path.slice(1)}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 shadow-sm"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.name}</span>
              {item.badge && <span className="brand-gradient rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-white">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-violet-100/70 p-3">
          <button onClick={() => navigate("/pricing")} className="mb-2 w-full rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-3 text-left">
            <div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 font-bold"><Coins className="h-3 w-3 text-violet-500" /> Coins</span>
              <span className="font-mono">{coinBalance.toLocaleString()} remaining</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white">
              <div className="brand-gradient h-full rounded-full" style={{ width: `${Math.max(2, coinPercent)}%` }} />
            </div>
          </button>
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-white/80">
            <div className="brand-gradient flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
              {user?.name?.[0] || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-[10px] capitalize text-slate-400">{user?.role}</p>
            </div>
            <button onClick={() => { logout(); navigate("/login"); }} className="text-slate-400 transition hover:text-rose-500" data-testid="logout-btn">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/80 bg-white/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate("/")} className="font-semibold text-violet-500 md:text-slate-400">GOLD-e AI</button>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-violet-200 hover:shadow-card" data-testid="open-command-center">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="hidden sm:inline">Ask GOLD-e</span>
              <kbd className="hidden rounded border border-violet-100 bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] text-violet-600 lg:inline">⌘K</kbd>
            </button>
            <button onClick={() => navigate("/workspace")} className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 md:flex ${providerCount === 3 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <ShieldCheck className={`h-3.5 w-3.5 ${providerCount === 3 ? "text-emerald-600" : "text-amber-600"}`} />
              <span className={`text-xs font-semibold ${providerCount === 3 ? "text-emerald-700" : "text-amber-700"}`}>{saas ? `${providerCount}/3 providers ready` : "Checking systems…"}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-transparent">{children}</main>
      </div>

      <CommandCenter open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
