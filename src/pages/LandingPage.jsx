import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../components/PublicNav';
import { SectionLabel, Button, Card } from '../components/ui';
import LuminaLogo from '../components/LuminaLogo';
import GlobalKeywordSearch from '../components/GlobalKeywordSearch';
import {
  Zap,
  Bot,
  Sparkles,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Globe,
  Star,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Check,
  CreditCard,
  MessageSquare,
  Instagram,
  Facebook,
  Smartphone,
  ChevronRight,
  Layers,
  BarChart3,
  MapPin,
  Play,
  Tag
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] font-sans antialiased selection:bg-[#0052FF] selection:text-white flex flex-col">
      <PublicNavbar />

      {/* 01. HERO SECTION - ASYMMETRIC MINIMALIST MODERN WITH LIVING GRAPHIC */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-6 sm:px-12 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Ambient Corner Glow */}
        <div className="absolute top-12 -right-24 w-96 h-96 bg-[#0052FF]/[0.05] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-[#4D7CFF]/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center relative z-10">
          {/* Left Column: Dominant Text */}
          <div className="space-y-8">
            <SectionLabel pulse={true}>
              LUMINA360 • Autonomous Marketing Intelligence v4.5
            </SectionLabel>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.75rem] text-[#0F172A] leading-[1.06] tracking-tight">
              LUMINA360 for{' '}
              <span className="relative inline-block">
                <span className="gradient-text">hyperlocal growth</span>
                <span className="gradient-underline" />
              </span>
              .
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl font-normal">
              Acquire nearby customers effortlessly on Instagram and Facebook, trigger 15-second WhatsApp conversions, and automate appointment bookings with zero lead leakage.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="primary"
                size="lg"
                className="group"
              >
                <span>Launch Autonomous Agents</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/social-ads')}
                variant="secondary"
                size="lg"
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4 text-[#0052FF]" />
                <span>Meta Ads & Reels Studio</span>
              </Button>
            </div>

            {/* Inbuilt Keywords System & Search Dominance Bar */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Inbuilt Keywords Engine: Type below to see rank #1 results:
                </span>
                <Link to="/seo-keywords" className="text-blue-600 font-bold hover:underline text-[11px]">
                  SEO Dominance Matrix →
                </Link>
              </div>
              <GlobalKeywordSearch compact={false} />
            </div>

            {/* Micro Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[#64748B] border-t border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-semibold text-[#0F172A]">10 Vertical AI Bots Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0052FF]" />
                <span className="font-mono text-xs font-semibold text-[#0F172A]">Zero Lead Leakage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-mono text-xs font-semibold text-[#0F172A]">1.4s Instant Triage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Abstract Living Generative Composition */}
          <div className="relative flex justify-center items-center py-6">
            {/* Generative Composition Canvas */}
            <div className="relative w-full max-w-[440px] h-[480px] flex items-center justify-center">
              {/* Rotating Dashed Outer Ring (60s continuous rotation) */}
              <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-[#0052FF]/20 animate-slow-rotate pointer-events-none" />
              
              {/* Geometric Ambient Accent Shape */}
              <div className="absolute -top-4 -right-4 w-28 h-28 rounded-tl-[3rem] rounded-br-[3rem] bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] opacity-90 shadow-accent pointer-events-none" />
              
              {/* Decorative 3x3 Dot Grid */}
              <div className="absolute top-8 left-4 grid grid-cols-3 gap-2 opacity-30 pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
                ))}
              </div>

              {/* Central LUMINA360 Brand Core Node */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-md border border-[#0052FF]/20 p-4 shadow-xl flex items-center justify-center animate-pulse">
                  <LuminaLogo size="lg" showText={false} />
                </div>
              </div>

              {/* Floating Living Card 1: Meta Ads & CTWA Sentinel */}
              <div className="absolute top-4 left-2 w-[340px] bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xl animate-gentle-float z-20">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-sm">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">Meta Hyperlocal Sentinel</div>
                      <div className="text-[10px] text-[#64748B] font-mono">Radius: 5km around Vashi</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-mono text-sm font-bold text-[#0F172A]">₹61.80</div>
                    <div className="text-[10px] text-[#64748B]">Cost per WhatsApp Chat</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-mono text-sm font-bold text-[#0052FF]">3.42%</div>
                    <div className="text-[10px] text-[#64748B]">Hyperlocal CTR</div>
                  </div>
                </div>
              </div>

              {/* Floating Living Card 2: 15-Second Lead Capture Sentinel */}
              <div className="absolute bottom-6 right-2 w-[340px] bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xl animate-gentle-float-lagged z-30">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">OPD Clinic Sentinel</div>
                      <div className="text-[10px] text-emerald-600 font-mono font-medium">WhatsApp Booking Confirmed</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#64748B]">1.2s reply</span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#0F172A]">Dr. R. Mehta (Cardiology)</span>
                    <span className="font-mono font-bold text-[#0052FF]">PASS #A-104</span>
                  </div>
                  <div className="text-[10px] text-[#64748B]">Metro Multispeciality Clinic • Today, 5:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02. STRATEGIC INVERTED CONTRAST SECTION (DEEP SLATE BACKGROUND WITH DOT TEXTURE) */}
      <section className="bg-[#0F172A] text-white py-24 sm:py-32 px-6 sm:px-12 relative overflow-hidden bg-dot-pattern">
        {/* Radial Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0052FF]/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#4D7CFF]/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#4D7CFF] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#4D7CFF]">
                  PERFORMANCE BENCHMARKS
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight">
                Engineered for speed, built for conversion.
              </h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md font-normal leading-relaxed">
              Traditional websites lose over 60% of clicks on landing pages. Our Click-to-WhatsApp and Comment-to-DM flows deliver unparalleled conversion velocity.
            </p>
          </div>

          {/* 4 Inverted Stat Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400">COST PER WHATSAPP LEAD</div>
              <div className="font-display text-4xl sm:text-6xl text-white tracking-tight">₹61.8</div>
              <div className="text-xs text-[#4D7CFF] font-medium flex items-center gap-1">
                <span>↓ 56% lower than forms</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400">BOT RESPONSE VELOCITY</div>
              <div className="font-display text-4xl sm:text-6xl text-white tracking-tight">1.4s</div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <span>Direct Comment-to-DM</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400">MESSAGE OPEN RATE</div>
              <div className="font-display text-4xl sm:text-6xl text-white tracking-tight">94.8%</div>
              <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
                <span>WhatsApp vs 18% Email</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-xs uppercase tracking-[0.15em] text-slate-400">DATA SOVEREIGNTY</div>
              <div className="font-display text-4xl sm:text-6xl text-white tracking-tight">100%</div>
              <div className="text-xs text-blue-300 font-medium flex items-center gap-1">
                <span>Zero aggregator leakage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. FEATURES BENTO GRID - RESTRAINT IN QUANTITY, CONFIDENCE IN DETAIL */}
      <section id="features" className="py-24 sm:py-36 px-6 sm:px-12 max-w-6xl mx-auto w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <SectionLabel>
            CORE ARCHITECTURE
          </SectionLabel>
          <h2 className="font-display text-3xl sm:text-5xl text-[#0F172A] tracking-tight">
            Minimalist restraint,{' '}
            <span className="gradient-text">maximum impact</span>.
          </h2>
          <p className="text-base text-[#64748B] leading-relaxed">
            Every feature is deliberately focused on driving local revenue for neighborhood businesses.
          </p>
        </div>

        {/* Asymmetric Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Featured Card 1 (Span 7) with 2px Gradient Border */}
          <div className="md:col-span-7 rounded-2xl bg-gradient-to-br from-[#0052FF] via-[#4D7CFF] to-[#0052FF] p-[2px] shadow-accent">
            <div className="h-full w-full rounded-[calc(1rem-2px)] bg-white p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
                  <Instagram className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#0F172A]">
                  Agentic Meta Ads & Click-to-WhatsApp
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Pin-drop 1km to 15km geofencing around your physical clinic, salon, or store. Autonomous generation of 3 high-converting ad variants that bypass slow landing pages by routing directly into WhatsApp.
                </p>
              </div>

              {/* Live Geofence Tag Strip */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#E2E8F0]">
                {['Sector 17 Vashi', 'Nerul Station', 'Kharghar Hub', 'Belapur CBD'].map((loc, i) => (
                  <span key={i} className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-[#0F172A] border border-[#E2E8F0] font-medium">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 (Span 5) */}
          <div className="md:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 space-y-8">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-[#0F172A]">
                15-Second Comment-to-DM Sentinel
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Detects keywords like "PRICE" or "PASS" on your Reels and posts, responds publicly in 1.4 seconds, and dispatches a private booking token straight into their inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5">
              <div className="text-[#64748B]">Trigger: "PRICE" detected</div>
              <div className="text-emerald-700 font-semibold">✓ DM Dispatched with VIP Pass Token</div>
            </div>
          </div>

          {/* Card 3 (Span 4) */}
          <div className="md:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-semibold text-xl text-[#0F172A]">
                Hyperlocal Reels Virality
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                4-scene video blueprints optimized for the Instagram Explore Nearby algorithm, paired with local transit hub tags.
              </p>
            </div>
            <div className="font-mono text-xs text-[#0052FF] font-medium">
              Explore Nearby Ready →
            </div>
          </div>

          {/* Card 4 (Span 4) */}
          <div className="md:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-semibold text-xl text-[#0F172A]">
                Zero Platform Commission
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Avoid paying 20% to 30% aggregator platform cuts. Own your customer relationships and contact database directly.
              </p>
            </div>
            <div className="font-mono text-xs text-emerald-600 font-medium">
              100% Direct Revenue
            </div>
          </div>

          {/* Card 5 (Span 4) */}
          <div className="md:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col justify-between shadow-md hover:shadow-xl transition-all duration-300 space-y-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052FF] to-[#4D7CFF] text-white flex items-center justify-center shadow-accent">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-semibold text-xl text-[#0F172A]">
                Instant UPI Token Checkout
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Generate dynamic booking passes and collect consultation fees or advance token payments seamlessly within chat.
              </p>
            </div>
            <div className="font-mono text-xs text-[#0F172A] font-medium">
              Fast Settlement →
            </div>
          </div>
        </div>
      </section>

      {/* 04. HOW IT WORKS - 3-STEP ARROW CONNECTED WORKFLOW */}
      <section id="how-it-works" className="py-24 sm:py-32 px-6 sm:px-12 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <SectionLabel>
              WORKFLOW
            </SectionLabel>
            <h2 className="font-display text-3xl sm:text-5xl text-[#0F172A]">
              From scroll to sale in 3 steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFA] border border-[#E2E8F0] space-y-4 relative">
              <div className="font-mono text-3xl font-extrabold text-[#0052FF]">01</div>
              <h3 className="font-display text-xl text-[#0F172A]">Connect & Geofence</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Select your business vertical (clinic, tutor, salon, or wholesale) and pin-drop your target customer radius (1km to 15km).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFA] border border-[#E2E8F0] space-y-4 relative">
              <div className="font-mono text-3xl font-extrabold text-[#0052FF]">02</div>
              <h3 className="font-display text-xl text-[#0F172A]">Deploy AI Ads & Reels</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Gemini writes 3 targeted hook variants and 4-scene viral reel scripts optimized for Instagram Explore Nearby.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-[#FAFAFA] border border-[#E2E8F0] space-y-4 relative">
              <div className="font-mono text-3xl font-extrabold text-[#0052FF]">03</div>
              <h3 className="font-display text-xl text-[#0F172A]">15s WhatsApp Closing</h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                The Sentinel detects comments, sends automated DMs, and routes customers to WhatsApp to confirm appointments instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 05. TRANSPARENT PRICING WITH ELEVATED TIER */}
      <section className="py-24 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <SectionLabel>
            INVESTMENT
          </SectionLabel>
          <h2 className="font-display text-3xl sm:text-5xl text-[#0F172A]">
            Transparent, high-margin pricing.
          </h2>
          
          {/* Toggle */}
          <div className="pt-2 inline-flex items-center p-1 rounded-full bg-slate-100 border border-[#E2E8F0] text-xs font-medium">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#64748B]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-[#0F172A] shadow-sm font-semibold'
                  : 'text-[#64748B]'
              }`}
            >
              <span>Yearly</span>
              <span className="font-mono text-[10px] text-[#0052FF] font-bold">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* 2 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
          {/* Starter Plan */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-md">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#64748B]">Starter Plan</span>
                <div className="font-display text-4xl sm:text-5xl text-[#0F172A] mt-2">
                  {billingCycle === 'monthly' ? '₹999' : '₹799'}
                  <span className="font-sans text-xs text-[#64748B] font-normal ml-2">/ month</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#0F172A] pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0052FF]" />
                  <span>1 Business Profile (Clinic, Academy, Salon, or Supplier)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0052FF]" />
                  <span>500 Action Credits included monthly</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0052FF]" />
                  <span>Autonomous WhatsApp Booking Bot</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#0052FF]" />
                  <span>Comment-to-DM Sentinel (up to 250 leads/mo)</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => navigate('/revenue-pricing')}
                variant="secondary"
                size="md"
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Growth Plan (Featured with Gradient Border) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0052FF] via-[#4D7CFF] to-[#0052FF] p-[2px] shadow-accent-lg">
            <div className="h-full w-full rounded-[calc(1rem-2px)] bg-white p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#0052FF] font-semibold">Growth Power</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider bg-[#0052FF]/10 text-[#0052FF] px-2.5 py-0.5 rounded-full font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="font-display text-4xl sm:text-5xl text-[#0F172A]">
                  {billingCycle === 'monthly' ? '₹2,999' : '₹2,399'}
                  <span className="font-sans text-xs text-[#64748B] font-normal ml-2">/ month</span>
                </div>

                <div className="space-y-3 text-xs text-[#0F172A] pt-4 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0052FF]" />
                    <span className="font-medium">Full Meta Ads & Click-to-WhatsApp Manager</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0052FF]" />
                    <span className="font-medium">2,500 Action Credits included monthly</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0052FF]" />
                    <span className="font-medium">Hyperlocal Reels Virality Studio (Nearby Optimization)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0052FF]" />
                    <span className="font-medium">AI Bid & Ad Fatigue Arbitrage Sentinel</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#0052FF]" />
                    <span className="font-medium">Unlimited Comment-to-DM automated replies</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Button
                  onClick={() => navigate('/revenue-pricing')}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Claim Growth Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06. FINAL HIGH-CONTRAST INVERTED CTA BANNER */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-[#0F172A] text-white p-10 sm:p-16 relative overflow-hidden bg-dot-pattern shadow-2xl">
          {/* Radial Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0052FF]/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-2xl space-y-6 relative z-10">
            <SectionLabel className="border-blue-400/30 bg-blue-500/10 text-blue-300">
              IMMEDIATE LAUNCH
            </SectionLabel>
            <h2 className="font-display text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              Ready to automate your local marketing pipeline?
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed">
              Deploy your first autonomous Click-to-WhatsApp ad or test the Comment-to-DM Sentinel in under 3 minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="inverted"
                size="lg"
                className="group"
              >
                <span>Open Control Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate('/social-ads')}
                variant="outline"
                size="lg"
                className="text-white border-slate-700 hover:border-white hover:bg-white/10"
              >
                Explore Reels Virality
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
