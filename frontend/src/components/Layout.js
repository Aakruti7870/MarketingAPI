import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CommandCenter from "./CommandCenter";
import {
  LayoutDashboard, Users, Kanban, MessageSquare, Send, FileText, Sparkles,
  Zap, Receipt, KeyRound, Command, LogOut, Search, Plus, ChevronDown,
  ShieldCheck, UsersRound,
} from "lucide-react";

const NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Lead Engine", icon: Users, path: "/leads", badge: "AI" },
  { name: "Sales Pipeline", icon: Kanban, path: "/pipeline" },
  { name: "Unified Inbox", icon: MessageSquare, path: "/inbox" },
  { name: "Campaigns", icon: Send, path: "/campaigns" },
  { name: "Templates", icon: FileText, path: "/templates" },
  { name: "AI Studio", icon: Sparkles, path: "/ai-studio", badge: "HOT" },
  { name: "Automations", icon: Zap, path: "/automations" },
  { name: "Quotations", icon: Receipt, path: "/quotations" },
  { name: "Team", icon: UsersRound, path: "/team" },
  { name: "API Vault", icon: KeyRound, path: "/vault" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const title = NAV.find((n) => location.pathname.startsWith(n.path))?.name || "GOLD-e";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-ink flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center font-heading font-extrabold text-ink text-lg">G</div>
          <div>
            <p className="font-heading font-extrabold text-white text-lg leading-none">GOLD-e</p>
            <p className="text-[10px] text-slate-400 mt-0.5">AI Revenue Engine</p>
          </div>
        </div>

        <div className="px-3 py-3">
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-left transition" data-testid="workspace-switcher">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Workspace</p>
              <p className="text-sm font-semibold text-white truncate">{user?.workspace_name || "My Workspace"}</p>
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
              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.badge === "HOT" ? "bg-red-500/20 text-red-300" : "gold-gradient text-ink"}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>OpenAI usage</span><span className="font-mono">$14.20 / $50</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full gold-gradient" style={{ width: "28%" }} />
            </div>
          </div>
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">GOLD-e</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-gold-300 hover:shadow-sm text-sm text-slate-500 transition group"
              data-testid="open-command-center"
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>Ask GOLD-e</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">All systems active</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandCenter open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
