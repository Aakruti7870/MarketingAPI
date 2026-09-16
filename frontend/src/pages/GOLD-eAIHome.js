import React, { useEffect, useState } from 'react';
import './GOLD-eAIHome.css';

const slides = [
  { title: 'TrackMyRMC', kicker: 'REAL-TIME CONCRETE LOGISTICS', text: 'Track. Dispatch. Deliver.', image: 'https://images.unsplash.com/photo-1751221701301-b02ca1b4b49e?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2200', cta: 'Explore', href: '/industry-bots' },
  { title: 'GOLD-e AI', kicker: 'AI BUSINESS GROWTH', text: 'Create. Automate. Grow.', image: 'https://images.unsplash.com/photo-1646583288948-24548aedffd8?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2200', cta: 'Explore', href: '/ai-studio' },
  { title: 'AutomationBot', kicker: 'AGENTIC AUTOMATION', text: 'Workflows that keep moving.', image: 'https://images.unsplash.com/photo-1773558057882-5a9015d6db28?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2200', cta: 'Activate', href: '/industry-bots' },
  { title: 'Free Perks', kicker: 'START FREE', text: 'Try the essentials. Scale when ready.', image: 'https://images.unsplash.com/photo-1646583288948-24548aedffd8?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2200', cta: 'Start Free', href: '/login' },
  { title: 'One Platform', kicker: 'ONE CONNECTED WORKSPACE', text: 'Marketing. Sales. AI. One place.', image: 'https://images.unsplash.com/photo-1773558057882-5a9015d6db28?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=82&w=2200', cta: 'View Plans', href: '/pricing' },
];

const industries = ['Healthcare', 'Infrastructure', 'B2B', 'Small Business', 'Digital Marketing'];

export default function GoldeAIHome() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return undefined; const timer = window.setInterval(() => setActive((v) => (v + 1) % slides.length), 5500); return () => window.clearInterval(timer); }, [paused]);
  return <div className="gold-eai-shell">
    <header className="gold-eai-header">
      <a className="gold-eai-brand" href="/" aria-label="GOLD-e AI home"><span className="gold-eai-brand-mark">G</span><span>GOLD-e AI<small>Build · Automate · Grow</small></span></a>
      <nav className="gold-eai-nav" aria-label="Primary navigation"><a href="#products">Products</a><a href="#industries">Industries</a><a href="#solutions">Solutions</a><a href="/pricing">Pricing</a><a href="#company">Company</a></nav>
      <a className="gold-eai-cta" href="/pricing">Get Started →</a>
    </header>

    <main className="gold-eai-main">
      <section id="home" className="gold-eai-carousel-section" aria-label="GOLD-e AI showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="gold-eai-carousel-head">
          <div><span className="gold-eai-eyebrow">✦ AI-powered business platform</span><h1>AI for business.<br/><span className="gold-eai-gradient-text">Without the clutter.</span></h1><p>Marketing · Sales · Automation.</p></div>
          <div className="gold-eai-carousel-controls"><button aria-label="Previous" onClick={() => setActive((active - 1 + slides.length) % slides.length)}>←</button><button aria-label="Next" onClick={() => setActive((active + 1) % slides.length)}>→</button></div>
        </div>
        <div className="gold-eai-carousel-stage"><div className="gold-eai-carousel-track" style={{ transform: `translateX(-${active * 100}%)` }}>{slides.map((item, index) => <article className="gold-eai-carousel-slide" key={item.title}><img src={item.image} alt={`${item.title} GOLD-e AI visual`} loading={index === 0 ? 'eager' : 'lazy'} /><div className="gold-eai-slide-overlay"><span>{item.kicker}</span><h2>{item.title}</h2><p>{item.text}</p><a href={item.href}>{item.cta} →</a></div></article>)}</div></div>
        <div className="gold-eai-carousel-dots" role="tablist" aria-label="Product slides">{slides.map((item, index) => <button key={item.title} className={index === active ? 'active' : ''} aria-label={`Show ${item.title}`} aria-selected={index === active} onClick={() => setActive(index)} />)}</div>
      </section>

      <section id="products" className="gold-eai-proof" aria-label="Platform highlights"><div><strong>AI</strong><span>Business agents</span></div><div><strong>CRM</strong><span>Lead to sale</span></div><div><strong>Auto</strong><span>Workflows</span></div><div><strong>WA</strong><span>Connected channels</span></div></section>

      <section id="industries" className="gold-eai-section"><span className="gold-eai-eyebrow">Built for business</span><h2>One platform.<br/><span className="gold-eai-gradient-text">Your way.</span></h2><div className="gold-eai-grid">{industries.map((name) => <a className="gold-eai-industry" href="/industry-bots" key={name}><span className="gold-eai-industry-icon">✦</span><h3>{name}</h3><span className="gold-eai-arrow">→</span></a>)}</div></section>

      <section id="solutions" className="gold-eai-section gold-eai-split"><div><span className="gold-eai-eyebrow">Simple by design</span><h2>Build. Automate. Grow.</h2></div><a className="gold-eai-btn gold-eai-btn-primary" href="/pricing">Choose your plan →</a></section>
    </main>

    <footer className="gold-eai-footer" id="company"><div><a className="gold-eai-brand" href="/"><span className="gold-eai-brand-mark">G</span><span>GOLD-e AI<small>Build · Automate · Grow</small></span></a></div><div><a href="#products">Products</a><a href="#industries">Industries</a><a href="#solutions">Solutions</a><a href="/pricing">Pricing</a></div><div><span>© 2026 GOLD-e AI</span><br/><a href="/privacy">Privacy</a><a href="/terms">Terms</a></div></footer>
  </div>;
}
