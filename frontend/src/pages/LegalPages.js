import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

const SITE = "https://gold-etechapp.com";
const UPDATED = "8 September 2026";

function useLegalMeta(title, description, path) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionNode = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionNode?.getAttribute("content") || "";
    const canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute("href") || "";

    document.title = `${title} | GOLD-e AI`;
    if (descriptionNode) descriptionNode.setAttribute("content", description);
    if (canonical) canonical.setAttribute("href", `${SITE}${path}`);

    return () => {
      document.title = previousTitle;
      if (descriptionNode) descriptionNode.setAttribute("content", previousDescription);
      if (canonical) canonical.setAttribute("href", previousCanonical || `${SITE}/`);
    };
  }, [title, description, path]);
}

function LegalShell({ icon: Icon, eyebrow, title, summary, children }) {
  return (
    <div className="landing-shell min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
            <div>
              <div className="font-heading text-sm font-extrabold tracking-tight">GOLD-e AI</div>
              <div className="text-[10px] text-slate-500">AI Revenue Engine</div>
            </div>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to GOLD-e AI
          </Link>
        </div>
      </header>

      <main className="px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[30px] border border-white bg-white/85 p-7 shadow-soft backdrop-blur-xl md:p-10">
            <div className="flex items-start gap-4">
              <div className="soft-icon !h-12 !w-12 shrink-0"><Icon className="h-5 w-5" /></div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[.18em] text-violet-600">{eyebrow}</div>
                <h1 className="mt-2 font-heading text-3xl font-extrabold tracking-[-.035em] text-slate-950 md:text-5xl">{title}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{summary}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">Last updated: {UPDATED}</p>
              </div>
            </div>

            <div className="legal-copy mt-10 space-y-8">{children}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/70 px-5 py-7 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/privacy" className="font-semibold hover:text-violet-700">Privacy Policy</Link>
          <Link to="/terms" className="font-semibold hover:text-violet-700">Terms of Service</Link>
          <Link to="/data-deletion" className="font-semibold hover:text-violet-700">Data Deletion</Link>
          <span>© 2026 GOLD-e AI · gold-etechapp.com</span>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading text-xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function Bullets({ items }) {
  return <ul className="list-disc space-y-2 pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function PrivacyPolicy() {
  useLegalMeta(
    "Privacy Policy",
    "GOLD-e AI Privacy Policy describing how account, workspace, marketing, AI and connected-service data is handled.",
    "/privacy"
  );
  return (
    <LegalShell
      icon={ShieldCheck}
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This policy explains how GOLD-e AI collects, uses, protects and shares information when you use gold-etechapp.com, the GOLD-e AI workspace, APIs and connected services."
    >
      <Section title="1. Scope and who we are">
        <p>GOLD-e AI is an AI-assisted revenue and marketing workspace available through {SITE}. This policy applies to the GOLD-e AI website, authenticated application, APIs and integrations that we control.</p>
        <p>Third-party services such as Meta/WhatsApp, OpenAI, cloud infrastructure, databases and payment providers operate under their own terms and privacy notices as well.</p>
      </Section>

      <Section title="2. Information we may process">
        <Bullets items={[
          "Account information, such as name, email address, role, workspace membership and authentication/session data.",
          "Workspace and CRM information, including leads, companies, notes, pipeline stages, campaign content, templates, quotations and team activity.",
          "Communications information, including message content and delivery metadata when you connect channels such as WhatsApp.",
          "Connected-service credentials and identifiers needed to operate integrations. Sensitive provider credentials are stored encrypted and are not intentionally exposed back in plaintext through normal product APIs.",
          "AI prompts, generated outputs, usage counters and related operational metadata needed to provide AI features and manage coin usage.",
          "Billing and subscription information, such as selected plan, billing interval, transaction references and entitlement status. Payment-card data is handled by the applicable payment provider rather than stored directly by GOLD-e AI when a hosted checkout is used.",
          "Technical and security information, such as IP-derived request information, logs, browser/device information, abuse-prevention signals and audit events."
        ]} />
      </Section>

      <Section title="3. How we use information">
        <Bullets items={[
          "Provide, secure and maintain the GOLD-e AI service and your workspace.",
          "Authenticate users, enforce roles and isolate tenant/workspace data.",
          "Operate CRM, campaigns, automation, analytics, AI assistance, developer APIs and connected communications.",
          "Prevent abuse, enforce consent and opt-out rules, investigate failures and maintain auditability.",
          "Measure product usage, administer plans and coins, and improve reliability and user experience.",
          "Comply with legal obligations and enforce our Terms of Service."
        ]} />
      </Section>

      <Section title="4. WhatsApp, Meta and marketing communications">
        <p>GOLD-e AI is designed to support consent-aware messaging. Customers using GOLD-e AI are responsible for having an appropriate lawful basis, permission or opt-in before sending marketing or business-initiated communications and for honoring opt-outs such as STOP requests.</p>
        <p>When a Meta WhatsApp Business Account is connected, message data and identifiers may be transmitted to Meta so the requested communication can be delivered. Meta independently processes that data under its own policies.</p>
      </Section>

      <Section title="5. AI processing">
        <p>When you use AI features, the prompt and relevant workspace context required for the requested task may be sent to the configured AI provider. GOLD-e AI is designed to minimize unnecessary data transfer and requests non-persistent processing where supported by the provider.</p>
        <p>AI outputs may be incomplete or inaccurate. Do not rely on generated content as the sole basis for legal, medical, financial, safety-critical or other high-impact decisions.</p>
      </Section>

      <Section title="6. Sharing and service providers">
        <p>We do not sell personal data. We may share information with infrastructure, database, AI, communications, analytics, security and payment providers only as reasonably necessary to operate the service, fulfill a user request, protect the service or comply with law.</p>
      </Section>

      <Section title="7. Security">
        <p>We use measures including authenticated APIs, role-based authorization, tenant scoping, encrypted provider credentials, restricted production secrets, audit logging and transport encryption. No online system can guarantee absolute security, and users must protect their own login credentials and connected-provider accounts.</p>
      </Section>

      <Section title="8. Retention and deletion">
        <p>We retain information for as long as reasonably required to provide the service, maintain legitimate business/security records and meet legal obligations. Retention periods vary by data type and purpose.</p>
        <p>You can request deletion through the in-product privacy controls. See the <Link to="/data-deletion" className="font-bold text-violet-700 hover:underline">Data Deletion page</Link> for the current process.</p>
      </Section>

      <Section title="9. Your choices and rights">
        <p>Depending on applicable law, you may have rights to access, correct, export, object to certain processing, withdraw consent or request deletion of personal information. Workspace owners may also control business data belonging to their organization.</p>
      </Section>

      <Section title="10. Children">
        <p>GOLD-e AI is a business productivity service and is not intended for children. Do not use the service to knowingly collect children's personal information unless you have a lawful basis and all required permissions.</p>
      </Section>

      <Section title="11. Changes and contact">
        <p>We may update this policy as the product, providers or legal requirements change. Material changes will be reflected by an updated date on this page.</p>
        <p>For privacy questions or requests, use the support/contact channel available in your GOLD-e AI account or the contact information published on {SITE}.</p>
      </Section>
    </LegalShell>
  );
}

export function TermsOfService() {
  useLegalMeta(
    "Terms of Service",
    "GOLD-e AI Terms of Service for the website, AI revenue workspace, APIs and connected marketing services.",
    "/terms"
  );
  return (
    <LegalShell
      icon={Scale}
      eyebrow="Legal"
      title="Terms of Service"
      summary="These Terms govern access to and use of GOLD-e AI, including the website, authenticated workspace, APIs, AI tools, campaign features and connected services."
    >
      <Section title="1. Acceptance and eligibility">
        <p>By creating an account, accessing or using GOLD-e AI, you agree to these Terms and the Privacy Policy. You must be legally capable of entering into this agreement and, when acting for an organization, have authority to bind that organization.</p>
      </Section>

      <Section title="2. Accounts and workspace responsibility">
        <p>You are responsible for accurate account information, keeping credentials secure and all activity performed through your account or workspace. Workspace owners and administrators are responsible for assigning appropriate access to team members.</p>
      </Section>

      <Section title="3. Acceptable use">
        <Bullets items={[
          "Do not use GOLD-e AI for unlawful, fraudulent, deceptive, abusive, harassing or rights-infringing activity.",
          "Do not attempt to bypass authentication, role controls, rate limits, billing controls or provider safeguards.",
          "Do not upload or transmit malware, stolen credentials, illegal content or data you do not have the right to process.",
          "Do not use messaging or campaign features for spam. You are responsible for lawful consent/permission, applicable messaging rules and honoring opt-outs.",
          "Do not resell, reverse engineer or misuse the service in a way that threatens availability, security or other users."
        ]} />
      </Section>

      <Section title="4. AI-generated content">
        <p>AI features are assistive tools. You remain responsible for reviewing generated content, verifying important facts and deciding whether an output is appropriate to use. Similar outputs may be generated for different users, and generated material is not guaranteed to be unique, accurate or fit for a particular purpose.</p>
      </Section>

      <Section title="5. Third-party integrations">
        <p>Features that connect to Meta/WhatsApp, OpenAI, cloud services, databases, payment providers or other external services depend on those providers. Your use of an external service is also subject to that provider's terms, policies, availability, pricing and account status.</p>
      </Section>

      <Section title="6. WhatsApp and outreach obligations">
        <p>You must comply with applicable law and Meta/WhatsApp policies, including requirements for business-initiated messaging, templates, consent and opt-outs. GOLD-e AI safety controls reduce accidental misuse but do not replace your compliance obligations.</p>
      </Section>

      <Section title="7. Plans, coins and billing">
        <p>Plan features, limits and coin allowances are shown on the Pricing page and may change prospectively. Free workspaces currently begin with a one-time coin grant. Paid plans, when available through checkout, may refresh coin allowances according to the displayed billing interval.</p>
        <p>Taxes and third-party communication/provider charges may be additional. Provider fees, including Meta/WhatsApp messaging charges, are separate unless a checkout page expressly states otherwise.</p>
      </Section>

      <Section title="8. Your content and our service">
        <p>You retain rights you hold in content and business data you submit. You grant GOLD-e AI the limited rights needed to host, process, transmit and transform that content solely to provide, secure and improve the requested service.</p>
        <p>The GOLD-e AI software, branding, product design and service technology remain protected by applicable intellectual-property laws.</p>
      </Section>

      <Section title="9. Suspension and termination">
        <p>We may restrict or suspend access when reasonably necessary to protect users, providers or the service; respond to unlawful activity; enforce these Terms; or comply with legal requirements. You may stop using the service at any time and may request account/data deletion through the published deletion process.</p>
      </Section>

      <Section title="10. Service availability and disclaimers">
        <p>GOLD-e AI is provided on an "as available" basis to the extent permitted by law. We work to maintain a reliable production service but cannot guarantee uninterrupted availability, error-free operation, provider uptime or a particular business outcome.</p>
      </Section>

      <Section title="11. Limitation of liability">
        <p>To the maximum extent permitted by applicable law, GOLD-e AI and its operators will not be liable for indirect, incidental, special, consequential or punitive losses arising from use of the service, third-party providers, AI outputs or unauthorized account activity. Any mandatory rights that cannot legally be excluded remain unaffected.</p>
      </Section>

      <Section title="12. Changes and contact">
        <p>We may update these Terms as the service evolves. Continued use after an effective update constitutes acceptance where permitted by law. For questions, use the support/contact channel available in your account or the contact information published on {SITE}.</p>
      </Section>
    </LegalShell>
  );
}

export function DataDeletion() {
  useLegalMeta(
    "Data Deletion",
    "How GOLD-e AI users can request deletion of their account, workspace and personal information.",
    "/data-deletion"
  );
  return (
    <LegalShell
      icon={Trash2}
      eyebrow="Privacy request"
      title="Data Deletion"
      summary="GOLD-e AI provides an authenticated deletion-request process so the request can be tied to the correct account and workspace without exposing private data."
    >
      <Section title="How to submit a deletion request">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Sign in to your GOLD-e AI account.</li>
          <li>Open <strong>Settings</strong>.</li>
          <li>Find <strong>Security & privacy</strong>.</li>
          <li>Select <strong>Request data deletion</strong> and confirm the request.</li>
          <li>The request is recorded with a status so it can be reviewed and completed safely.</li>
        </ol>
      </Section>

      <Section title="What the request covers">
        <p>For a workspace owner, the request is treated as a request to remove the owner's account and the workspace data controlled by that owner, subject to verification and any retention obligations that legally apply.</p>
        <p>For a non-owner team member, the request applies to that user's own GOLD-e AI account/profile and does not automatically delete organization data controlled by the workspace owner.</p>
      </Section>

      <Section title="Connected Meta/WhatsApp data">
        <p>Deletion covers Meta/WhatsApp connection information and message records held by GOLD-e AI to the extent they are part of the account/workspace being deleted. Information independently retained by Meta or WhatsApp is controlled by Meta and must be handled under Meta's own privacy and account tools.</p>
      </Section>

      <Section title="Security, fraud and legal retention">
        <p>Some records may be retained where reasonably necessary for security, fraud prevention, dispute resolution, financial/accounting obligations or other legal requirements. Deleted production data may also remain temporarily in encrypted backups until normal backup rotation removes it.</p>
      </Section>

      <Section title="If you cannot sign in">
        <p>Use the support/contact channel published on {SITE} and provide enough information to identify the account. We may ask for additional verification before acting on a request so that one person cannot delete another user's data.</p>
      </Section>

      <Section title="Related documents">
        <div className="flex flex-wrap gap-3">
          <Link to="/privacy" className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-xs font-bold text-violet-700 shadow-sm"><ShieldCheck className="h-4 w-4" /> Privacy Policy</Link>
          <Link to="/terms" className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-4 py-2.5 text-xs font-bold text-violet-700 shadow-sm"><FileText className="h-4 w-4" /> Terms of Service</Link>
        </div>
      </Section>
    </LegalShell>
  );
}
