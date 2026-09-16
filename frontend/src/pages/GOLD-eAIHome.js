import React from 'react';
import './GOLD-eAIHome.css';

const industries = [
  ['Healthcare', 'Appointments · Patients · Clinics'],
  ['Infrastructure', 'Projects · Site visits · Quotations'],
  ['B2B Business', 'Enquiries · Sales · Follow-up'],
  ['Small Business', 'Orders · Payments · Customer care'],
  ['Digital Marketing', 'Social · Ads · Campaigns · Leads'],
];

export default function GoldeAIHome() {
  return (
    <div className="gold-eai-shell">
      <header className="gold-eai-header">
        <a className="gold-eai-brand" href="/" aria-label="GOLD-e AI home"><span className="gold-eai-brand-mark">G</span><span>GOLD-e AI<small>Build · Automate · Grow</small></span></a>
        <nav className="gold-eai-nav" aria-label="Primary navigation"><a href="#home">Home</a><a href="#products">Products</a><a href="#industries">Industries</a><a href="#solutions">Solutions</a><a href="/pricing">Pricing</a><a href="#resources">Resources</a><a href="#company">Company</a></nav>
        <a className="gold-eai-cta" href="/pricing">Get Started →</a>
      </header>
      <main className="gold-eai-main">
        <section id="home" className="gold-eai-hero">
          <div><span className="gold-eai-eyebrow">✦ AI-powered business automation</span><h1>The Modern<br/>Business <span className="gold-eai-gradient-text">Automation Platform.</span></h1><p className="gold-eai-lead">Build · Automate · Grow with Agentic AI</p><p>One platform for every business — AI agents, marketing, sales and operations working together to turn everyday work into measurable growth.</p><div className="gold-eai-actions"><a className="gold-eai-btn gold-eai-btn-primary" href="/pricing">Get Started →</a><a className="gold-eai-btn gold-eai-btn-secondary" href="#solutions">Explore Platform</a></div><div className="gold-eai-trust"><span>✓ No credit card required</span><span>◷ Setup in minutes</span><span>◇ Business-ready security</span></div></div>
          <div className="gold-eai-visual" aria-label="GOLD-e AI automation ecosystem"><div className="gold-eai-pipeline">✦</div><div className="gold-eai-card a"><strong>Marketing Automation</strong><span>Plan · Create · Publish</span></div><div className="gold-eai-card b"><strong>AI Agents</strong><span>Industry-specific assistants</span></div><div className="gold-eai-card c"><strong>Sales & Lead Generation</strong><span>Capture · Nurture · Convert</span></div><div className="gold-eai-card d"><strong>Operations Automation</strong><span>Save time · Reduce cost</span></div></div>
        </section>
        <section className="gold-eai-proof" aria-label="Platform highlights"><div><strong>500+</strong><span>Business workflows</span></div><div><strong>3×</strong><span>Faster execution</span></div><div><strong>70%</strong><span>Time-saving potential</span></div><div><strong>99.9%</strong><span>Platform availability target</span></div><div><strong>10+</strong><span>Business use cases</span></div></section>
        <section id="industries" className="gold-eai-section"><span className="gold-eai-eyebrow">Built for every industry</span><h2>Choose your industry.<br/><span className="gold-eai-gradient-text">Activate AI agents.</span></h2><p className="gold-eai-section-intro">Pre-built agent experiences are organized around the way your business operates. Select a business type and configure its agent from one platform.</p><div className="gold-eai-grid">{industries.map(([name, desc]) => <a className="gold-eai-industry" href="/industry-bots" key={name}><span className="gold-eai-industry-icon">✦</span><h3>{name}</h3><p>{desc}</p><span className="gold-eai-arrow">→</span></a>)}</div></section>
        <section id="solutions" className="gold-eai-section gold-eai-split"><div><span className="gold-eai-eyebrow">One connected platform</span><h2>From first lead to loyal customer.</h2></div><p className="gold-eai-section-intro">Connect your website, marketing, sales and business operations through a consistent AI layer. Start with a plan, configure your business agent, and expand as your needs grow.</p></section>
      </main>
      <footer className="gold-eai-footer" id="company"><div><a className="gold-eai-brand" href="/"><span className="gold-eai-brand-mark">G</span><span>GOLD-e AI<small>Build · Automate · Grow</small></span></a><p>Agentic AI for modern businesses.</p></div><div><a href="/">About</a><a href="#products">Products</a><a href="#industries">Industries</a><a href="#solutions">Solutions</a><a href="/pricing">Pricing</a><a href="#resources">Resources</a></div><div><span>© 2026 GOLD-e AI</span><br/><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/sitemap.xml">Sitemap</a></div></footer>
    </div>
  );
}
