import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Plus, Search, Sparkles } from "lucide-react";
import { Button, Input, Modal } from "./ui";

const CREATE_ACTIONS = [
  { label: "New Lead", description: "Open Lead Engine and add a contact", path: "/leads?new=1" },
  { label: "New Campaign", description: "Create a consent-safe campaign", path: "/campaigns?new=1" },
  { label: "Generate Creative", description: "Open AI Studio", path: "/ai-studio" },
  { label: "Create Automation", description: "Open Autopilot automations", path: "/automations" },
  { label: "Create Flow", description: "Build a workflow", path: "/flows" },
  { label: "Create Quotation", description: "Open quotations", path: "/quotations" },
  { label: "Create Audience", description: "Build a broadcast audience", path: "/audiences" },
  { label: "Send Message", description: "Open unified inbox", path: "/inbox" },
  { label: "Upload File", description: "Open workspace files", path: "/files" },
  { label: "Connect Channel", description: "Open channel integrations", path: "/channels" },
];

const SEARCH_ITEMS = [
  ["AI Assistant", "/assistant", "chat ask generate analyse summarize"],
  ["Explore", "/explore", "agents workflows tools"],
  ["Use Cases", "/use-cases", "marketing playbooks business goals"],
  ["Files", "/files", "uploads assets documents creatives"],
  ["History", "/history", "activity generations actions"],
  ["Dashboard", "/dashboard", "revenue leads campaigns metrics"],
  ["Lead Engine", "/leads", "contacts crm score import"],
  ["Sales Pipeline", "/pipeline", "deals stages sales"],
  ["Unified Inbox", "/inbox", "messages whatsapp email sms"],
  ["Campaign Studio", "/campaigns", "broadcast launch schedule"],
  ["Audiences", "/audiences", "segments contacts targeting"],
  ["Templates", "/templates", "messages ads social"],
  ["AI Studio", "/ai-studio", "images creatives captions banners"],
  ["Automations", "/automations", "autopilot triggers actions"],
  ["Flows", "/flows", "workflow builder conditions webhook"],
  ["Quotations", "/quotations", "proposal quote pdf"],
  ["Consent Guard", "/consent", "privacy opt in compliance"],
  ["Analytics", "/analytics", "reports revenue roas conversion"],
  ["Developer API", "/developer", "keys webhooks logs"],
  ["Channels", "/channels", "plugins integrations providers"],
  ["WhatsApp Connection", "/whatsapp-connection", "meta waba phone webhook"],
  ["Team", "/team", "members roles permissions"],
  ["API Vault", "/vault", "credentials secrets providers"],
  ["Workspace", "/workspace", "organization billing usage"],
  ["Settings", "/settings", "account notifications security privacy"],
  ["Pricing", "/pricing", "plans billing coins subscription"],
].map(([label, path, keywords]) => ({ label, path, keywords }));

const CONTEXT_ACTIONS = {
  "/dashboard": [
    ["Lead Engine", "/leads"], ["Campaigns", "/campaigns"], ["Analytics", "/analytics"], ["AI Studio", "/ai-studio"],
  ],
  "/leads": [
    ["Pipeline", "/pipeline"], ["Campaigns", "/campaigns"], ["Inbox", "/inbox"], ["Audiences", "/audiences"],
  ],
  "/pipeline": [
    ["Lead Engine", "/leads"], ["Inbox", "/inbox"], ["Quotations", "/quotations"], ["Analytics", "/analytics"],
  ],
  "/inbox": [
    ["Lead Engine", "/leads"], ["Templates", "/templates"], ["Campaigns", "/campaigns"], ["Channels", "/channels"],
  ],
  "/campaigns": [
    ["Audiences", "/audiences"], ["Templates", "/templates"], ["Analytics", "/analytics"], ["Consent", "/consent"],
  ],
  "/audiences": [
    ["Lead Engine", "/leads"], ["Campaigns", "/campaigns"], ["Consent", "/consent"],
  ],
  "/templates": [
    ["Campaigns", "/campaigns"], ["Inbox", "/inbox"], ["AI Studio", "/ai-studio"],
  ],
  "/ai-studio": [
    ["Files", "/files"], ["Campaigns", "/campaigns"], ["Templates", "/templates"],
  ],
  "/automations": [
    ["Flows", "/flows"], ["Campaigns", "/campaigns"], ["Analytics", "/analytics"],
  ],
  "/flows": [
    ["Automations", "/automations"], ["Developer API", "/developer"], ["Channels", "/channels"],
  ],
  "/quotations": [
    ["Lead Engine", "/leads"], ["Pipeline", "/pipeline"], ["Inbox", "/inbox"],
  ],
  "/consent": [
    ["Audiences", "/audiences"], ["Campaigns", "/campaigns"], ["Channels", "/channels"],
  ],
  "/analytics": [
    ["Dashboard", "/dashboard"], ["Campaigns", "/campaigns"], ["Lead Engine", "/leads"],
  ],
  "/developer": [
    ["API Vault", "/vault"], ["Channels", "/channels"], ["Workspace", "/workspace"],
  ],
  "/channels": [
    ["WhatsApp Setup", "/whatsapp-connection"], ["API Vault", "/vault"], ["Developer API", "/developer"],
  ],
  "/whatsapp": [
    ["WhatsApp Setup", "/whatsapp-connection"], ["Inbox", "/inbox"], ["Campaigns", "/campaigns"], ["Consent", "/consent"],
  ],
  "/whatsapp-connection": [
    ["Channels", "/channels"], ["Inbox", "/inbox"], ["Campaigns", "/campaigns"], ["Consent", "/consent"],
  ],
  "/team": [
    ["Workspace", "/workspace"], ["Settings", "/settings"],
  ],
  "/vault": [
    ["Channels", "/channels"], ["Developer API", "/developer"], ["Settings", "/settings"],
  ],
  "/workspace": [
    ["Team", "/team"], ["Pricing", "/pricing"], ["Settings", "/settings"], ["Channels", "/channels"],
  ],
  "/settings": [
    ["Workspace", "/workspace"], ["Team", "/team"], ["API Vault", "/vault"], ["Pricing", "/pricing"],
  ],
  "/assistant": [
    ["Explore", "/explore"], ["Files", "/files"], ["History", "/history"], ["AI Studio", "/ai-studio"],
  ],
  "/explore": [
    ["Use Cases", "/use-cases"], ["AI Assistant", "/assistant"], ["Automations", "/automations"],
  ],
  "/use-cases": [
    ["Explore", "/explore"], ["Campaigns", "/campaigns"], ["Automations", "/automations"],
  ],
  "/files": [
    ["AI Studio", "/ai-studio"], ["Campaigns", "/campaigns"], ["History", "/history"],
  ],
  "/history": [
    ["AI Assistant", "/assistant"], ["Files", "/files"], ["Analytics", "/analytics"],
  ],
};

function routeKey(pathname) {
  return Object.keys(CONTEXT_ACTIONS).find((key) => pathname === key || pathname.startsWith(`${key}/`));
}

export default function ProductActionBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setCreateOpen(false);
    setSearchOpen(false);
    setQuery("");
  }, [location.pathname]);

  const contextActions = CONTEXT_ACTIONS[routeKey(location.pathname)] || [];
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return SEARCH_ITEMS.slice(0, 10);
    return SEARCH_ITEMS.filter((item) => `${item.label} ${item.keywords}`.toLowerCase().includes(needle)).slice(0, 12);
  }, [query]);

  const go = (path) => {
    navigate(path);
    setCreateOpen(false);
    setSearchOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSearchOpen(true)} data-testid="global-search-btn">
            <Search className="h-4 w-4" /> Search <span className="hidden text-[10px] font-semibold text-slate-400 sm:inline">Ctrl K</span>
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/assistant")} data-testid="global-ai-btn">
            <Bot className="h-4 w-4" /> Ask GOLD-e AI
          </Button>
          {contextActions.slice(0, 4).map(([label, path]) => (
            <button key={`${label}-${path}`} onClick={() => navigate(path)} className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 md:inline-flex">
              {label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} data-testid="global-create-btn">
          <Plus className="h-4 w-4" /> Create
        </Button>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New" className="max-w-xl">
        <div className="grid gap-2 sm:grid-cols-2">
          {CREATE_ACTIONS.map((item) => (
            <button key={item.label} onClick={() => go(item.path)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900">{item.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search GOLD-e AI" className="max-w-2xl">
        <div className="space-y-3">
          <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages, tools and workflows…" data-testid="global-search-input" />
          <div className="max-h-[55vh] space-y-1 overflow-y-auto">
            {results.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">No matching page or tool.</div>
            ) : results.map((item) => (
              <button key={item.path} onClick={() => go(item.path)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-slate-50">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.path}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
          <button onClick={() => go("/assistant")} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Sparkles className="h-4 w-4" /> Ask GOLD-e AI instead
          </button>
        </div>
      </Modal>
    </>
  );
}
