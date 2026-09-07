import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import CommandCenter from "./CommandCenter";
import {
  LayoutDashboard, Users, Kanban, MessageSquare, Send, FileText, Sparkles,
  Zap, Receipt, KeyRound, LogOut, ChevronDown, ShieldCheck,
  UsersRound, ShieldCheck as Shield, BarChart3, Code2, Phone, Gauge,
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

  const title = NAV.find((item) => location.pathname.startsWith(item.path))?.name || "GOLD-e";
  const providerCount = saas ? Object.values(saas.providers).filter((provider) => provider.configured).length : 0;
  const messages = saas?.usage?.monthly_messages ?? 0;
  const messageLimit = saas?.limits?.monthly_messages;
  const usagePercent = saas?.utilization?.monthly_messages ?? 0;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-ink flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center font-heading font-extrabold text-ink text-lg">G</div>
          <div>
            <p className="font-heading font-extrabold text-white text-lg leading-none">GOLD-e</p>
            <p className="text-[10px] text-slate-400 mt-0.5">AI Revenue Engine</p>
          </div>
        </div>

        <div className="px-3 py-3">
          <button onClick={() => navigate("/workspace")} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left transition" data-testid="workspace-switcher">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Workspace</p>
              <p className="text-sm font-semibold text-white truncate">{user?.workspace_name || "My Workspace"}</p>
              {saas?.workspace?.plan && <p className="text-[10px] text-gold-200 mt-0.5">{saas.workspace.plan} plan</p>}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.path.slice(1)}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-gold-400/10 text-gold-200" : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.name}</span>
              {item.badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded gold-gradient text-ink">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button onClick={() => navigate("/workspace")} className="w-full text-left px-3 py-2 mb-2 rounded-lg hover:bg-slate-800/40">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Messages this month</span>
              <span className="font-mono">{messages} / {messageLimit == null ? "∞" : messageLimit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full gold-gradient" style={{ width: `${messageLimit == null ? 0 : Math.max(2, usagePercent)}%` }} />
            </div>
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-200 font-semibold text-sm">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={() => { logout(); navigate("/login"); }} className="text-slate-500 hover:text-red-400" data-testid="logout-btn">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">GOLD-e</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-gold-300 hover:shadow-sm text-sm text-slate-500 transition" data-testid="open-command-center">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Ask GOLD-e</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>
            <button onClick={() => navigate("/workspace")} className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${providerCount === 3 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${providerCount === 3 ? "text-emerald-600" : "text-amber-600"}`} />
              <span className={`text-xs font-medium ${providerCount === 3 ? "text-emerald-700" : "text-amber-700"}`}>{saas ? `${providerCount}/3 providers ready` : "Checking systems…"}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandCenter open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
