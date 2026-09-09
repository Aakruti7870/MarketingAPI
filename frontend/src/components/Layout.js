import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import ThemeToggle from "./ThemeToggle";
import UpgradeModal from "./UpgradeModal";
import {
  BarChart3, Bell, Bot, ChevronDown, ChevronRight, Code2, FileText, FolderOpen,
  Gauge, GitBranch, History, Home, Kanban, KeyRound, LayoutDashboard, LogOut, Menu,
  MessageSquare, PanelLeftClose, Phone, Receipt, Search, Send, Settings,
  ShieldCheck, Sparkles, Users, UsersRound, WandSparkles, X, Zap,
} from "lucide-react";

const AI_NAV = [
  { name: "AI Assistant", icon: Bot, path: "/assistant" },
  { name: "Explore", icon: Search, path: "/explore" },
  { name: "Use Cases", icon: WandSparkles, path: "/use-cases" },
  { name: "My Files", icon: FolderOpen, path: "/files" },
  { name: "History", icon: History, path: "/history" },
];

const BUSINESS_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Lead Engine", icon: Users, path: "/leads", badge: "AI" },
  { name: "Sales Pipeline", icon: Kanban, path: "/pipeline" },
  { name: "Unified Inbox", icon: MessageSquare, path: "/inbox" },
  { name: "Campaign Studio", icon: Send, path: "/campaigns" },
  { name: "AI Studio", icon: Sparkles, path: "/ai-studio", badge: "AI" },
  { name: "Templates", icon: FileText, path: "/templates" },
  { name: "Flows", icon: GitBranch, path: "/flows", badge: "NEW" },
  { name: "Autopilot", icon: Zap, path: "/automations" },
  { name: "Analytics", icon: BarChart3, path: "/analytics" },
];

const MORE_NAV = [
  { name: "Quotations", icon: Receipt, path: "/quotations" },
  { name: "Channels", icon: Phone, path: "/whatsapp", badge: "NEW" },
  { name: "Consent Guard", icon: ShieldCheck, path: "/consent" },
  { name: "Developer API", icon: Code2, path: "/developer", privileged: true },
  { name: "Team", icon: UsersRound, path: "/team" },
  { name: "API Vault", icon: KeyRound, path: "/vault", privileged: true },
  { name: "Workspace", icon: Gauge, path: "/workspace" },
];

const RECENT = ["Brand identity ideas for launch", "Warm lead follow-up", "September campaign plan"];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [saas, setSaas] = useState(null);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const load = () => api.get("/saas/overview")
      .then((response) => { if (active) setSaas(response.data); })
      .catch(() => { if (active) setSaas(null); });
    load();
    const timer = setInterval(load, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const canManageSecrets = user?.role === "owner" || user?.role === "admin";
  const visibleMoreNav = MORE_NAV.filter((item) => !item.privileged || canManageSecrets);
  const allNav = [...AI_NAV, ...BUSINESS_NAV, ...visibleMoreNav, { name: "Settings", path: "/settings" }];
  const title = allNav.find((item) => location.pathname.startsWith(item.path))?.name || "GOLD-e AI";
  const coinBalance = saas?.wallet?.coin_balance ?? 0;
  const plan = saas?.workspace?.plan || user?.plan || "Free";

  const sidebar = (
    <aside className="workspace-sidebar flex h-full w-[270px] shrink-0 flex-col border-r border-violet-100/80 bg-white/82 backdrop-blur-2xl">
      <div className="flex h-[72px] items-center justify-between border-b border-violet-100/70 px-4">
        <button onClick={() => navigate("/")} className="flex min-w-0 items-center gap-3 text-left">
          <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
          <div className="min-w-0"><div className="font-heading text-lg font-extrabold tracking-tight text-slate-950">GOLD-e AI</div><div className="truncate text-[10px] font-semibold text-slate-400">AI Revenue Engine</div></div>
        </button>
        <button onClick={() => setMobileOpen(false)} className="soft-round md:hidden"><X className="h-4 w-4" /></button>
      </div>

      <div className="px-3 pb-2 pt-3">
        <button onClick={() => navigate("/assistant")} className="brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5"><Sparkles className="h-4 w-4" /> New Chat</button>
      </div>

      <nav className="space-y-1 px-3">{AI_NAV.map((item) => <NavItem key={item.path} item={item} />)}</nav>
      <div className="mx-4 my-3 h-px bg-violet-100/80" />

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div>
          <button onClick={() => setBusinessOpen((v) => !v)} className="mb-1 flex w-full items-center justify-between px-2 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400"><span>Business tools</span><ChevronDown className={`h-3.5 w-3.5 transition ${businessOpen ? "rotate-180" : ""}`} /></button>
          {businessOpen && <div className="space-y-1">{BUSINESS_NAV.map((item) => <NavItem key={item.path} item={item} />)}</div>}
        </div>

        <div className="mt-4">
          <button onClick={() => setMoreOpen((v) => !v)} className="mb-1 flex w-full items-center justify-between px-2 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400"><span>More tools</span><ChevronDown className={`h-3.5 w-3.5 transition ${moreOpen ? "rotate-180" : ""}`} /></button>
          {moreOpen && <div className="space-y-1">{visibleMoreNav.map((item) => <NavItem key={item.path} item={item} />)}</div>}
        </div>

        <div className="mt-5 px-2"><div className="mb-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Recent Chats</div><div className="space-y-1">{RECENT.map((item) => <button key={item} onClick={() => navigate("/history")} className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700">{item}</button>)}</div></div>
      </div>

      <div className="border-t border-violet-100/80 p-3">
        <button onClick={() => setUpgradeOpen(true)} className="mb-2 w-full rounded-[22px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 text-left shadow-sm transition hover:border-violet-200 hover:shadow-card">
          <div className="flex items-center justify-between"><div className="soft-icon !h-9 !w-9"><Sparkles className="h-4 w-4" /></div><span className="rounded-full bg-slate-900 px-2 py-1 text-[9px] font-extrabold text-white">{plan.toUpperCase()}</span></div>
          <div className="mt-3 text-sm font-extrabold text-slate-900">Upgrade to PRO</div>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Unlock more coins, team capacity and advanced AI workflows.</p>
          <div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400">{coinBalance.toLocaleString()} coins remaining</span><ChevronRight className="h-3.5 w-3.5 text-violet-500" /></div>
        </button>

        <div className="grid grid-cols-2 gap-1">
          <NavLink to="/settings" className={({isActive}) => `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${isActive ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-white"}`}><Settings className="h-4 w-4" /> Settings</NavLink>
          <button onClick={() => { logout(); navigate("/login"); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div className="hidden md:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><div className="relative h-full w-[286px] shadow-2xl">{sidebar}</div></div>}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="workspace-header flex h-[72px] shrink-0 items-center justify-between border-b border-violet-100/70 bg-white/72 px-4 backdrop-blur-2xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="soft-round md:hidden" aria-label="Open navigation"><Menu className="h-4 w-4" /></button>
            <div className="hidden h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-white text-violet-600 shadow-sm sm:flex"><PanelLeftClose className="h-4 w-4" /></div>
            <div className="min-w-0"><div className="truncate font-heading text-base font-extrabold text-slate-950 sm:text-lg">{title}</div><div className="hidden text-[10px] font-semibold text-slate-400 sm:block">{user?.workspace_name || "My Workspace"}</div></div>
          </div>

          <div className="flex items-center gap-2">
            <button title="Notifications" aria-label="Notifications" className="top-icon relative"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button>
            <ThemeToggle compact />
            <button onClick={() => navigate("/dashboard")} title="Workspace dashboard" aria-label="Workspace dashboard" className="top-icon hidden sm:flex"><Home className="h-4 w-4" /></button>
            <button onClick={() => navigate("/workspace")} aria-label="Open workspace profile" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-extrabold text-white shadow-brand">{(user?.name || "U")[0]?.toUpperCase()}</button>
          </div>
        </header>

        <main className="app-content flex-1 overflow-y-auto">{children}</main>
      </div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}

function NavItem({ item }) {
  const Icon = item.icon;
  return <NavLink to={item.path} data-testid={`nav-${item.path.slice(1)}`} className={({isActive}) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 shadow-sm ring-1 ring-violet-100" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}><Icon className="h-[17px] w-[17px] shrink-0" /><span className="min-w-0 flex-1 truncate">{item.name}</span>{item.badge && <span className="brand-gradient rounded-md px-1.5 py-0.5 text-[8px] font-extrabold text-white">{item.badge}</span>}</NavLink>;
}
