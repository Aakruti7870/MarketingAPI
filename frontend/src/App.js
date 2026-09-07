import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Pipeline from "./pages/Pipeline";
import Inbox from "./pages/Inbox";
import Campaigns from "./pages/Campaigns";
import Templates from "./pages/Templates";
import AIStudio from "./pages/AIStudio";
import Automations from "./pages/Automations";
import Quotations from "./pages/Quotations";
import Team from "./pages/Team";
import Vault from "./pages/Vault";
import Consent from "./pages/Consent";
import Analytics from "./pages/Analytics";
import Developer from "./pages/Developer";
import WhatsApp from "./pages/WhatsApp";
import Workspace from "./pages/Workspace";
import Pricing from "./pages/Pricing";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="h-screen flex items-center justify-center bg-violet-50">
        <div className="w-10 h-10 rounded-xl brand-gradient animate-pulse shadow-brand" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<GuestOnly><Auth /></GuestOnly>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/leads" element={<Protected><Leads /></Protected>} />
          <Route path="/pipeline" element={<Protected><Pipeline /></Protected>} />
          <Route path="/inbox" element={<Protected><Inbox /></Protected>} />
          <Route path="/campaigns" element={<Protected><Campaigns /></Protected>} />
          <Route path="/templates" element={<Protected><Templates /></Protected>} />
          <Route path="/ai-studio" element={<Protected><AIStudio /></Protected>} />
          <Route path="/automations" element={<Protected><Automations /></Protected>} />
          <Route path="/quotations" element={<Protected><Quotations /></Protected>} />
          <Route path="/consent" element={<Protected><Consent /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/developer" element={<Protected><Developer /></Protected>} />
          <Route path="/whatsapp" element={<Protected><WhatsApp /></Protected>} />
          <Route path="/team" element={<Protected><Team /></Protected>} />
          <Route path="/vault" element={<Protected><Vault /></Protected>} />
          <Route path="/workspace" element={<Protected><Workspace /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
