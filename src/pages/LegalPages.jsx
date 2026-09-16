import React from 'react';
import { PublicNavbar, PublicFooter } from '../components/PublicNav';

function LegalLayout({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="max-w-4xl mx-auto px-6 py-14 sm:py-20">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
          <div className="mt-8 space-y-7 text-sm sm:text-base leading-7 text-slate-700">{children}</div>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="September 16, 2026">
      <section><h2 className="text-xl font-semibold text-slate-900">1. Scope</h2><p>LUMINA360 provides AI-powered digital marketing tools. This policy describes the categories of information the application may process when you use the website, dashboard, integrations, or related services.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">2. Information we process</h2><p>Depending on the features you use, information may include account and contact details, workspace configuration, campaign and content data, uploaded files, integration settings, usage events, and technical information such as browser, device, IP address, and service logs.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">3. AI and third-party services</h2><p>AI requests and connected-channel operations may be processed by configured third-party providers. Do not submit information to an AI or integration feature unless you are authorized to share it. Provider-specific processing is also subject to the applicable provider terms and privacy documentation.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">4. How information is used</h2><p>Information may be used to provide requested features, operate and secure the service, troubleshoot failures, measure product usage, prevent abuse, maintain integrations, and communicate service-related information.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">5. Retention and security</h2><p>Retention depends on the feature, account configuration, operational requirements, and applicable law. LUMINA360 uses technical and organizational safeguards appropriate to the service, but no internet service can guarantee absolute security.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">6. Your responsibilities</h2><p>You are responsible for obtaining appropriate consent and permissions before importing contacts, sending marketing communications, connecting third-party accounts, or processing personal information through the platform.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">7. Contact</h2><p>For privacy questions or requests, use the support contact published for your LUMINA360 account or deployment.</p></section>
    </LegalLayout>
  );
}

export function TermsConditions() {
  return (
    <LegalLayout title="Terms of Service" updated="September 16, 2026">
      <section><h2 className="text-xl font-semibold text-slate-900">1. Service</h2><p>LUMINA360 provides software tools for digital marketing, content generation, campaign workflows, messaging channels, lead management, and analytics. Features can change as the product evolves.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">2. Acceptable use</h2><p>You must use the service lawfully and in accordance with applicable platform rules. You may not use LUMINA360 for spam, fraud, impersonation, unauthorized access, unlawful data collection, or communications for which you lack the required permission.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">3. Third-party integrations</h2><p>Connected services such as messaging, advertising, AI, storage, or analytics providers are governed by their own terms and availability. LUMINA360 does not control third-party service interruptions or policy decisions.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">4. User content and authorization</h2><p>You retain responsibility for content, contact lists, assets, credentials, and instructions supplied to the platform. You represent that you have the rights and permissions necessary for their intended use.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">5. AI-generated output</h2><p>AI output can be inaccurate, incomplete, or unsuitable for a particular purpose. Review generated content and campaign settings before publishing or sending them, especially where legal, financial, medical, or other high-impact decisions are involved.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">6. Availability and changes</h2><p>The service is provided on an evolving basis. Features may be modified, suspended, or retired for maintenance, security, legal, or product reasons.</p></section>
      <section><h2 className="text-xl font-semibold text-slate-900">7. Contact</h2><p>For service questions, billing matters, or legal notices, use the support contact published for your LUMINA360 account or deployment.</p></section>
    </LegalLayout>
  );
}
