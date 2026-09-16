import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import ThemeToggle from "./ThemeToggle";
import UpgradeModal from "./UpgradeModal";
import { BarChart3, Bell, Bot, ChevronDown, ChevronRight, Code2, FileText, FolderOpen, Gauge, GitBranch, History, Home, Kanban, KeyRound, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquare, PanelLeftClose, PanelLeftOpen, Phone, Receipt, Search, Send, Settings, ShieldCheck, Sparkles, Users, UsersRound, WandSparkles, X, Zap } from "lucide-react";

const AI_NAV = [
  { name: "AI Assistant", icon: Bot, path: "/assistant", description: "Ask, plan and create with AI" },
  { name: "Explore", icon: Search, path: "/explore", description: "Discover tools and workflows" },
  { name: "Use Cases", icon: WandSparkles, path: "/use-cases", description: "Business playbooks and ideas" },
  { name: "My Files", icon: FolderOpen, path: "/files", description: "Workspace files and knowledge" },
  { name: "History", icon: History, path: "/history", description: "Recent conversations" },
];
const BUSINESS_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", description: "Workspace overview" },
  { name: "Lead Engine", icon: Users, path: "/leads", badge: "AI", description: "Capture and qualify leads" },
  { name: "Broadcast Audiences", icon: Megaphone, path: "/audiences", badge: "NEW", description: "Segment and reach audiences" },
  { name: "Sales Pipeline", icon: Kanban, path: "/pipeline", description: "Manage opportunities" },
  { name: "Unified Inbox", icon: MessageSquare, path: "/inbox", description: "Conversations in one place" },
  { name: "Campaign Studio", icon: Send, path: "/campaigns", description: "Build and launch campaigns" },
  { name: "AI Studio", icon: Sparkles, path: "/ai-studio", badge: "AI", description: "Generate marketing creatives" },
  { name: "Industry Agents", icon: Bot, path: "/industry-bots", badge: "NEW", description: "Specialized AI agents" },
  { name: "Templates", icon: FileText, path: "/templates", description: "Reusable marketing templates" },
  { name: "Flows", icon: GitBranch, path: "/flows", badge: "NEW", description: "Visual automation flows" },
  { name: "Autopilot", icon: Zap, path: "/automations", description: "Automate recurring work" },
  { name: "Analytics", icon: BarChart3, path: "/analytics", description: "Performance and insights" },
];
const MORE_NAV = [
  { name: "Quotations", icon: Receipt, path: "/quotations", description: "Create and manage quotations" },
  { name: "Channels", icon: Phone, path: "/whatsapp", badge: "NEW", description: "Connected communication channels" },
  { name: "Consent Guard", icon: ShieldCheck, path: "/consent", description: "Messaging compliance controls" },
  { name: "Developer API", icon: Code2, path: "/developer", privileged: true, description: "API and developer tools" },
  { name: "Team", icon: UsersRound, path: "/team", description: "Workspace members and roles" },
  { name: "API Vault", icon: KeyRound, path: "/vault", privileged: true, description: "Secure integration credentials" },
  { name: "Workspace", icon: Gauge, path: "/workspace", description: "Workspace settings and profile" },
];
const RECENT = ["Brand identity ideas for launch", "Warm lead follow-up", "September campaign plan"];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [saas, setSaas] = useState(null);

  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    let active = true;
    const load = () => api.get("/saas/overview").then((r) => { if (active) setSaas(r.data); }).catch(() => { if (active) setSaas(null); });
    load();
    const timer = setInterval(load, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const canManageSecrets = user?.role === "owner" || user?.role === "admin";
  const visibleMoreNav = MORE_NAV.filter((item) => !item.privileged || canManageSecrets);
  const allNav = [...AI_NAV, ...BUSINESS_NAV, ...visibleMoreNav, { name: "Settings", icon: Settings, path: "/settings", description: "Account and preferences" }];
  const title = allNav.find((item) => location.pathname.startsWith(item.path))?.name || "GOLD-e AI";
  const coinBalance = saas?.wallet?.coin_balance ?? 0;
  const plan = saas?.workspace?.plan || user?.plan || "Free";
  const filteredNav = useMemo(() => {
    const q = commandQuery.trim().toLowerCase();
    if (!q) return allNav;
    return allNav.filter((item) => `${item.name} ${item.description || ""}`.toLowerCase().includes(q));
  }, [commandQuery]);

  const go = (path) => { setCommandOpen(false); setCommandQuery(""); navigate(path); };
  const signOut = () => { logout(); navigate("/login"); };

  const sidebar = (
    <aside className={`workspace-sidebar flex h-full shrink-0 flex-col border-r border-violet-100/80 bg-white/82 backdrop-blur-2xl ${sidebarCollapsed ? "w-[76px]" : "w-[280px]"}`}>
      <div className={`flex h-[72px] items-center border-b border-violet-100/70 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        <button onClick={() => navigate("/")} aria-label="GOLD-e AI home" className="flex min-w-0 items-center gap-3 text-left">
          <div className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
          {!sidebarCollapsed && <div className="min-w-0"><div className="font-heading text-lg font-extrabold tracking-tight text-slate-950">GOLD-e AI</div><div className="truncate text-[10px] font-semibold text-slate-400">AI Revenue Engine</div></div>}
        </button>
        <button onClick={() => setMobileOpen(false)} className="soft-round md:hidden" aria-label="Close navigation"><X className="h-4 w-4" /></button>
      </div>

      <div className="px-3 pb-2 pt-3">
        <button onClick={() => navigate("/assistant")} title="New Chat" className={`brand-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-extrabold text-white shadow-brand transition hover:-translate-y-0.5 ${sidebarCollapsed ? "h-11" : ""}`}>
          <Sparkles className="h-4 w-4" />{!sidebarCollapsed && "New Chat"}
        </button>
      </div>

      <nav className="space-y-1 px-3">
        {AI_NAV.map((item) => <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />)}
      </nav>
      <div className="mx-4 my-3 h-px bg-violet-100/80" />

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <SectionLabel label="Business tools" open={businessOpen} onClick={() => setBusinessOpen((v) => !v)} collapsed={sidebarCollapsed} />
        {businessOpen && <div className="space-y-1">{BUSINESS_NAV.map((item) => <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />)}</div>}
        <div className="mt-4" />
        <SectionLabel label="More tools" open={moreOpen} onClick={() => setMoreOpen((v) => !v)} collapsed={sidebarCollapsed} />
        {moreOpen && <div className="space-y-1">{visibleMoreNav.map((item) => <NavItem key={item.path} item={item} collapsed={sidebarCollapsed} />)}</div>}
        {!sidebarCollapsed && <div className="mt-5 px-2"><div className="mb-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">Recent Chats</div><div className="space-y-1">{RECENT.map((item) => <button key={item} onClick={() => navigate("/history")} className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs font-medium text-slate-500 transition hover:bg-violet-50 hover:text-violet-700">{item}</button>)}</div></div>}
      </div>

      <div className="border-t border-violet-100/80 p-3">
        {!sidebarCollapsed && <button onClick={() => setUpgradeOpen(true)} className="mb-2 w-full rounded-[22px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 text-left shadow-sm transition hover:border-violet-200 hover:shadow-card"><div className="flex items-center justify-between"><div className="soft-icon !h-9 !w-9"><Sparkles className="h-4 w-4" /></div><span className="rounded-full bg-slate-900 px-2 py-1 text-[9px] font-extrabold text-white">{plan.toUpperCase()}</span></div><div className="mt-3 text-sm font-extrabold text-slate-900">Upgrade to PRO</div><p className="mt-1 text-[11px] leading-4 text-slate-500">Unlock more coins, team capacity and advanced AI workflows.</p><div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400">{coinBalance.toLocaleString()} coins remaining</span><ChevronRight className="h-3.5 w-3.5 text-violet-500" /></div></button>}
        <div className={sidebarCollapsed ? "space-y-1" : "grid grid-cols-2 gap-1"}>
          <NavLink to="/settings" title="Settings" className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${isActive ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-white"} ${sidebarCollapsed ? "justify-center" : ""}`}><Settings className="h-4 w-4" />{!sidebarCollapsed && "Settings"}</NavLink>
          <button onClick={signOut} title="Sign out" className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 ${sidebarCollapsed ? "justify-center" : ""}`}><LogOut className="h-4 w-4" />{!sidebarCollapsed && "Sign out"}</button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div className="hidden md:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/25 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><div className="relative h-full w-[300px] shadow-2xl">{sidebar}</div></div>}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="workspace-header flex h-[72px] shrink-0 items-center justify-between border-b border-violet-100/70 bg-white/72 px-3 backdrop-blur-2xl sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button onClick={() => setMobileOpen(true)} className="soft-round md:hidden" aria-label="Open navigation"><Menu className="h-4 w-4" /></button>
            <button onClick={() => setSidebarCollapsed((v) => !v)} className="top-icon hidden md:flex" title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>{sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
            <div className="min-w-0"><div className="truncate font-heading text-base font-extrabold text-slate-950 sm:text-lg">{title}</div><div className="hidden text-[10px] font-semibold text-slate-400 sm:block">{user?.workspace_name || "My Workspace"}</div></div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={() => setCommandOpen(true)} title="Search tools (Ctrl/Cmd + K)" aria-label="Search tools" className="hidden h-9 items-center gap-2 rounded-xl border border-violet-100 bg-white/80 px-3 text-xs font-semibold text-slate-400 shadow-sm transition hover:border-violet-200 hover:text-violet-700 lg:flex"><Search className="h-4 w-4" /><span>Search tools</span><kbd className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] text-slate-400">⌘K</kbd></button>
            <button onClick={() => setCommandOpen(true)} title="Search tools" aria-label="Search tools" className="top-icon lg:hidden"><Search className="h-4 w-4" /></button>
            <button title="Notifications" aria-label="Notifications" className="top-icon relative"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button>
            <ThemeToggle compact />
            <button onClick={() => navigate("/dashboard")} title="Workspace dashboard" aria-label="Workspace dashboard" className="top-icon hidden sm:flex"><Home className="h-4 w-4" /></button>
            <button onClick={() => navigate("/workspace")} aria-label="Open workspace profile" className="ml-1 flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-sm font-extrabold text-white shadow-brand">{(user?.name || "U")[0]?.toUpperCase()}</button>
          </div>
        </header>
        <main className="app-content flex-1 overflow-y-auto">{children}</main>
      </div>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {commandOpen && <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/25 p-3 pt-[9vh] backdrop-blur-sm sm:p-6 sm:pt-[12vh]" onMouseDown={(e) => { if (e.target === e.currentTarget) setCommandOpen(false); }}>
        <div className="w-full max-w-2xl overflow-hidden rounded-[26px] border border-violet-100 bg-white/95 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-3 border-b border-violet-100 px-4 py-3 sm:px-5"><Search className="h-5 w-5 text-violet-500" /><input autoFocus value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} placeholder="Search tools, pages and workflows..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" /><kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 sm:block">ESC</kbd></div>
          <div className="max-h-[62vh] overflow-y-auto p-2 sm:p-3">{filteredNav.length ? filteredNav.map((item) => { const Icon = item.icon; const active = location.pathname.startsWith(item.path); return <button key={item.path} onClick={() => go(item.path)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-gradient-to-r from-violet-50 to-fuchsia-50" : "hover:bg-slate-50"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-white text-violet-600 shadow-sm" : "bg-violet-50 text-violet-500"}`}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-slate-900">{item.name}</span><span className="block truncate text-[11px] font-medium text-slate-400">{item.description}</span></span>{item.badge && <span className="brand-gradient rounded-md px-1.5 py-0.5 text-[8px] font-extrabold text-white">{item.badge}</span>}<ChevronRight className="h-4 w-4 text-slate-300" /></button>; }) : <div className="px-5 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500"><Search className="h-5 w-5" /></div><div className="mt-3 text-sm font-extrabold text-slate-900">No matching tool</div><p className="mt-1 text-xs text-slate-400">Try another search term.</p></div>}</div>
          <div className="flex items-center justify-between border-t border-violet-100 bg-slate-50/70 px-4 py-2.5 text-[10px] font-semibold text-slate-400 sm:px-5"><span>{filteredNav.length} destinations</span><span>GOLD-e AI workspace</span></div>
        </div>
      </div>}
    </div>
  );
}

function SectionLabel({ label, open, onClick, collapsed }) {
  if (collapsed) return <div className="my-2 h-px bg-violet-100/80" />;
  return <button onClick={onClick} className="mb-1 flex w-full items-center justify-between px-2 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400"><span>{label}</span><ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} /></button>;
}

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return <NavLink to={item.path} title={collapsed ? item.name : undefined} data-testid={`nav-${item.path.slice(1)}`} className={({ isActive }) => `group flex min-h-[40px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${collapsed ? "justify-center" : ""} ${isActive ? "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 shadow-sm ring-1 ring-violet-100" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}><Icon className="h-[17px] w-[17px] shrink-0" />{!collapsed && <><span className="min-w-0 flex-1 truncate">{item.name}</span>{item.badge && <span className="brand-gradient rounded-md px-1.5 py-0.5 text-[8px] font-extrabold text-white">{item.badge}</span>}</>}</NavLink>;
}
