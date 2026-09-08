import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Assistant from "./pages/Assistant";
import { ExplorePage, UseCasesPage, FilesPage, HistoryPage, SettingsPage } from "./pages/WorkspacePages";
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
import { PrivacyPolicy, TermsOfService, DataDeletion } from "./pages/LegalPages";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null) return <div className="flex h-screen items-center justify-center bg-violet-50"><div className="brand-gradient h-10 w-10 animate-pulse rounded-xl shadow-brand" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/assistant" replace />;
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
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="/login" element={<GuestOnly><Auth /></GuestOnly>} />

          <Route path="/assistant" element={<Protected><Assistant /></Protected>} />
          <Route path="/explore" element={<Protected><ExplorePage /></Protected>} />
          <Route path="/use-cases" element={<Protected><UseCasesPage /></Protected>} />
          <Route path="/files" element={<Protected><FilesPage /></Protected>} />
          <Route path="/history" element={<Protected><HistoryPage /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />

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
