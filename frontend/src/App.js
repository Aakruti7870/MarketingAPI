import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ContainerLayout, Badge } from './components/ui';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { PrivacyPolicy, TermsConditions } from './pages/LegalPages';
import Dashboard from './pages/Dashboard';
import SettingsPermissions from './pages/SettingsPermissions';
import RmcTools from './pages/RmcTools';
import AiStudio from './pages/AiStudio';
import WhatsAppSetup from './pages/WhatsAppSetup';
import GoogleMapsChatbot from './pages/GoogleMapsChatbot';
import { Sparkles, Smartphone, LayoutDashboard, Settings, Wrench, MapPin } from 'lucide-react';

function NavigationHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/80 px-8 py-4 flex items-center justify-between shadow-sm">
      <Link to="/dashboard" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white font-black text-xl shadow-md">M</div>
        <div>
          <span className="font-black text-base text-slate-900 tracking-tight">MarketingAPI</span>
          <Badge status="purple" className="ml-2 text-[10px] py-0.5 px-2">v4.0 Local OS</Badge>
        </div>
      </Link>

      <nav className="flex items-center gap-6 text-xs font-extrabold text-slate-700">
        <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-indigo-600"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</Link>
        <Link to="/google-maps" className="flex items-center gap-1.5 hover:text-indigo-600"><MapPin className="w-3.5 h-3.5 text-red-500" /> Google Maps AI</Link>
        <Link to="/ai-studio" className="flex items-center gap-1.5 hover:text-indigo-600"><Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Studio</Link>
        <Link to="/whatsapp-setup" className="flex items-center gap-1.5 hover:text-indigo-600"><Smartphone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp API</Link>
        <Link to="/rmc-tools" className="flex items-center gap-1.5 hover:text-indigo-600"><Wrench className="w-3.5 h-3.5" /> RMC Tools</Link>
        <Link to="/settings" className="flex items-center gap-1.5 hover:text-indigo-600"><Settings className="w-3.5 h-3.5" /> Settings</Link>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <ContainerLayout>
      <Router>
        <NavigationHeader />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/google-maps" element={<GoogleMapsChatbot />} />
          <Route path="/ai-studio" element={<AiStudio />} />
          <Route path="/whatsapp-setup" element={<WhatsAppSetup />} />
          <Route path="/settings" element={<SettingsPermissions />} />
          <Route path="/rmc-tools" element={<RmcTools />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ContainerLayout>
  );
}
