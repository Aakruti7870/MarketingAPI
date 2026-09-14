import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContainerLayout, Badge } from './components/ui';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { PrivacyPolicy, TermsConditions } from './pages/LegalPages';
import Dashboard from './pages/Dashboard';
import AgenticBots from './pages/AgenticBots';
import CampaignSwarm from './pages/CampaignSwarm';
import ChannelHub from './pages/ChannelHub';
import LeadsDiscovery from './pages/LeadsDiscovery';
import GoogleMapsChatbot from './pages/GoogleMapsChatbot';
import AiStudio from './pages/AiStudio';
import PlaygroundStudio from './pages/PlaygroundStudio';
import SeoKeywordsEngine from './pages/SeoKeywordsEngine';
import GlobalKeywordSearch from './components/GlobalKeywordSearch';
import WhatsAppSetup from './pages/WhatsAppSetup';
import PricingEngine from './pages/PricingEngine';
import RevenuePricing from './pages/RevenuePricing';
import SettingsPermissions from './pages/SettingsPermissions';
import AdminApiKeys from './pages/AdminApiKeys';
import AgentPerformanceDashboard from './components/AgentPerformanceDashboard';
import N8nWorkflowStudio from './components/N8nWorkflowStudio';
import SocialMetaAdsManager from './pages/SocialMetaAdsManager';
import LuminaLogo from './components/LuminaLogo';
import {
  Sparkles,
  Smartphone,
  LayoutDashboard,
  Settings,
  MapPin,
  Bot,
  Zap,
  Radio,
  Search,
  Calculator,
  DollarSign,
  Share2,
  BarChart3,
  Workflow,
  Instagram,
  ShieldCheck,
  Code2,
  Tag,
  Key,
} from 'lucide-react';

function NavigationHeader() {
  const location = useLocation();
  const { user, isAdmin, isEverythingFree } = useAuth();
  const pathname = location.pathname;

  // Don't show the internal dashboard header on the public landing page, login, or register
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/legal')) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Playground', path: '/playground', icon: Sparkles, badge: 'AI Studio' },
    { label: 'Keywords #1', path: '/seo-keywords', icon: Tag, badge: 'Top Rank' },
    { label: 'Meta & Reels AI', path: '/social-ads', icon: Instagram, badge: 'Viral' },
    { label: 'IndustryBot Fleet', path: '/bots', icon: Bot, badge: 'Adaptive' },
    { label: 'n8n Workflows', path: '/n8n-studio', icon: Workflow, badge: 'Agentic' },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, badge: 'CTR' },
    { label: '5-Agent Swarm', path: '/campaign-swarm', icon: Zap },
    { label: 'Channel Hub', path: '/channels', icon: Share2, badge: 'New' },
    { label: 'Lead Discovery', path: '/leads', icon: Search },
    { label: 'AI Presets', path: '/ai-studio', icon: Bot },
    { label: 'Google Maps AI', path: '/google-maps', icon: MapPin },
    { label: 'Pricing Engine', path: '/pricing-engine', icon: Calculator },
    { label: 'Plans & Credits', path: '/revenue-pricing', icon: DollarSign },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#E2E8F0] px-4 sm:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 xl:gap-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
          <LuminaLogo size="sm" />
        </Link>

        {/* Universal Inbuilt Keyword Search */}
        <div className="hidden md:block">
          <GlobalKeywordSearch compact={true} />
        </div>

        {/* Navigation Items */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0052FF] text-white shadow-accent font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#0052FF]/10 text-[#0052FF] border border-[#0052FF]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Keyword Search Button */}
        <div className="md:hidden">
          <GlobalKeywordSearch compact={true} />
        </div>

        {/* Playground AI Studio Direct Launcher */}
        <Link
          to="/playground"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
            pathname === '/playground'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
          <span>AI Studio</span>
        </Link>

        {/* Super Admin Everything Free Badge */}
        {isEverythingFree && (
          <Link
            to="/admin/api-keys"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold hover:bg-amber-100 transition shadow-sm"
            title="Manage AI Model API Keys & Validation"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Admin</span>
            <span className="bg-amber-200/60 px-1 py-0.2 rounded text-[10px] flex items-center gap-0.5">
              <Key className="w-2.5 h-2.5" /> Keys
            </span>
          </Link>
        )}

        <Link
          to="/admin/api-keys"
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border shadow-sm ${
            pathname === '/admin/api-keys'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Secure AI API Key Configuration & Validation"
        >
          <Key className="w-3.5 h-3.5 text-blue-600" />
          <span>API Keys</span>
        </Link>

        <Link
          to="/channels"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#0052FF] border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition shadow-sm"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#0052FF]" />
          Channels
        </Link>

        <Link
          to="/settings"
          className={`p-2 rounded-lg border text-xs font-medium transition flex items-center gap-1 ${
            pathname === '/settings'
              ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-accent'
              : 'bg-white hover:bg-slate-50 text-[#0F172A] border-[#E2E8F0] shadow-sm'
          }`}
          title="Settings & API Permissions"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col font-sans relative selection:bg-[#0052FF] selection:text-white">
          <NavigationHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/playground" element={<PlaygroundStudio />} />
              <Route path="/seo-keywords" element={<SeoKeywordsEngine />} />
              <Route path="/social-ads" element={<SocialMetaAdsManager />} />
              <Route path="/bots" element={<AgenticBots />} />
              <Route
                path="/n8n-studio"
                element={
                  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
                    <N8nWorkflowStudio />
                  </div>
                }
              />
              <Route
                path="/analytics"
                element={
                  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
                    <AgentPerformanceDashboard />
                  </div>
                }
              />
              <Route path="/campaign-swarm" element={<CampaignSwarm />} />
              <Route path="/channels" element={<ChannelHub />} />
              <Route path="/leads" element={<LeadsDiscovery />} />
              <Route path="/google-maps" element={<GoogleMapsChatbot />} />
              <Route path="/ai-studio" element={<AiStudio />} />
              <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />
              <Route path="/pricing-engine" element={<PricingEngine />} />
              <Route path="/rmc-tools" element={<Navigate to="/pricing-engine" replace />} />
              <Route path="/revenue-pricing" element={<RevenuePricing />} />
              <Route path="/settings" element={<SettingsPermissions />} />
              <Route path="/admin/api-keys" element={<AdminApiKeys />} />
              <Route path="/admin-keys" element={<AdminApiKeys />} />
              <Route path="/settings/api-keys" element={<AdminApiKeys />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
