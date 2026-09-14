import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Radio,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bot,
  MapPin,
  Sparkles,
  Smartphone,
  TrendingUp,
  Users,
  Activity,
  GraduationCap,
  Store,
  Truck,
  Building2,
  DollarSign,
  Plus,
  Instagram,
  Facebook,
  Flame,
} from 'lucide-react';
import { Card, Button, Badge, StatCard } from '../components/ui';
import AgentPerformanceDashboard from '../components/AgentPerformanceDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(3500);
  const [plan, setPlan] = useState('Growth Plan');
  const [selectedVertical, setSelectedVertical] = useState('healthcare');

  useEffect(() => {
    fetch('/api/billing/balance/user_default')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.credit_balance === 'number') {
          setBalance(data.credit_balance);
        }
        if (data.plan) {
          setPlan(data.plan);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const verticalDetails = {
    healthcare: {
      name: 'Hospitals & Healthcare Clinics',
      icon: Activity,
      headline: 'Autonomous Patient Triage & Appointment OS',
      leadsFound: '420+ Local Patients & Health Inquiries',
      topBot: 'MediCare AI Assistant (98.4% CSAT)',
      recentAction: 'Dr. Mehta Saturday Preventive Camp filled 32 of 35 slots',
      popularAction: 'Launch Weekend Health Checkup Campaign',
      color: 'emerald',
    },
    education: {
      name: 'Schools, Coaching Institutes & Tutors',
      icon: GraduationCap,
      headline: 'Student Admissions & Parent Engagement OS',
      leadsFound: '680+ Class 9-12 Parents & NEET Aspirants',
      topBot: 'EduCounsel Admissions Bot (48 Demo Passes Issued)',
      recentAction: 'IIT-JEE Demo Masterclass batch 85% booked via WhatsApp',
      popularAction: 'Broadcast Free 3-Day Demo Pass to Parents',
      color: 'indigo',
    },
    retail: {
      name: 'Local Retail, Salons, Cafes & Auto Repair',
      icon: Store,
      headline: 'Hyperlocal Offers & Repeat Customer OS',
      leadsFound: '510+ Nearby Residents in 5km Radius',
      topBot: 'RetailGenie VIP Discount Bot',
      recentAction: 'Weekend Spa 30% discount claimed by 44 customers',
      popularAction: 'Send 25% Flash Coupon to Regulars',
      color: 'amber',
    },
    suppliers: {
      name: 'All Types of B2B Wholesale Suppliers',
      icon: Truck,
      headline: 'Wholesale RFQ & Dynamic Margin Pricing OS',
      leadsFound: '340+ Active Contractors & Purchasing Managers',
      topBot: 'SupplyChain B2B Wholesale Bot',
      recentAction: 'Closed 25 Tons Fe-550D TMT Bar deal at ₹52,800/ton',
      popularAction: 'Broadcast Spot Mill Rate to Builders',
      color: 'blue',
    },
    rmc: {
      name: 'Ready Mix Concrete Plants & Contractors',
      icon: Building2,
      headline: 'IS 456 Mix Design & Concrete Dispatch OS',
      leadsFound: '210+ Registered Civil Contractors',
      topBot: 'BuildMatrix Concrete Sizing Bot',
      recentAction: '120m³ M25 pour scheduled for Sanpada commercial slab',
      popularAction: 'Quote Concrete Pour with Transit Pump',
      color: 'purple',
    },
  };

  const curr = verticalDetails[selectedVertical] || verticalDetails.healthcare;
  const CurrIcon = curr.icon;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Banner with Industry Switcher & Live Wallet */}
      <div className="relative bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 text-[#0F172A] shadow-md overflow-hidden">
        {/* Ambient Subtle Accent Glow */}
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-[#0052FF]/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 bottom-0 w-80 h-80 bg-[#4D7CFF]/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#0052FF] font-semibold bg-[#0052FF]/10 px-2.5 py-0.5 rounded-full border border-[#0052FF]/20">
                LUMINA360 AI OS v4.5
              </span>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold hover:bg-emerald-100 transition"
                title="View Launch Health & RBAC Settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Production Ready • All Systems Operational</span>
              </Link>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#0F172A] tracking-tight">
              Agentic Marketing Control Room
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl leading-relaxed font-normal">
              Unified growth engine for Hospitals, Tutors, Schools, Local Retail & Wholesale Suppliers. Drive leads, deploy autonomous bots, and close revenue with zero lead leakage.
            </p>
          </div>

          {/* Action Credits Balance & Top-Up Pill */}
          <div className="bg-slate-50 border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 flex items-center justify-between sm:justify-start gap-4 shrink-0 shadow-sm">
            <div>
              <span className="text-[10px] font-mono font-semibold text-[#64748B] uppercase tracking-wider block">
                Action Credits
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-600 flex items-center gap-1.5">
                <Zap className="w-5 h-5 fill-emerald-500 text-emerald-500" />
                {balance.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#64748B] font-medium">
                Active: <span className="font-bold text-[#0F172A]">{plan}</span>
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-semibold shrink-0"
              onClick={() => navigate('/revenue-pricing')}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Top-Up
            </Button>
          </div>
        </div>

        {/* Industry Vertical Selector Strip */}
        <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
          <span className="text-[11px] font-mono font-semibold text-[#64748B] uppercase tracking-wider block mb-3">
            Select Your Business Industry:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Object.entries(verticalDetails).map(([key, item]) => {
              const Icon = item.icon;
              const isSelected = selectedVertical === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedVertical(key)}
                  className={`p-3 rounded-xl text-left transition-all duration-200 border flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0052FF] to-[#4D7CFF] text-white border-transparent shadow-accent ring-2 ring-[#0052FF]/30'
                      : 'bg-white hover:bg-slate-50 text-[#0F172A] border-[#E2E8F0]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#0F172A]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold truncate">{item.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Verified Local Leads"
          value="1,480+"
          trend="+18% this week"
          subtext={curr.leadsFound}
        />
        <StatCard
          label="Closed Deal Revenue"
          value="₹4.85L"
          subtext="Via automated instant UPI payment links"
        />
        <StatCard
          label="Privacy Shielded Channels"
          value="8 Groups"
          subtext="1-to-1 WhatsApp delivery (0 leaks)"
        />
        <StatCard
          label="Google Maps Local Pack"
          value="#1 Rank"
          subtext="96/100 Local SEO health score"
        />
      </div>

      {/* Quick 1-Click Launchpad for Current Industry */}
      <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <CurrIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{curr.name} • {curr.headline}</h2>
              <p className="text-xs text-slate-500">Autonomous workflows customized for your business category.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="gradient"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/social-ads')}
            >
              <Instagram className="w-3.5 h-3.5 mr-1" /> Meta & Reels AI (Viral)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/campaign-swarm')}
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Launch 5-Agent Swarm
            </Button>
            <Button
              variant="glass"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/bots')}
            >
              <Bot className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Test Bot
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deployed Autonomous Bot</span>
            <p className="font-extrabold text-slate-900">{curr.topBot}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Latest Automated Win</span>
            <p className="font-bold text-slate-800">{curr.recentAction}</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Suggested High-ROI Action</span>
            <p className="font-bold text-indigo-700">{curr.popularAction}</p>
          </div>
        </div>
      </Card>

      {/* Recharts Marketing Campaign Performance Metrics Dashboard */}
      <AgentPerformanceDashboard defaultIndustry={selectedVertical} />

      {/* Core Feature Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Module 0: Meta Ads & Reels Virality */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-pink-300 transition bg-gradient-to-br from-white via-pink-50/20 to-purple-50/30">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-pink-500/25">
              <Instagram className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-slate-900">Meta Ads & Reels Virality Engine</h3>
              <Badge status="purple" className="text-[10px]">New Feature</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Autonomous Instagram & Facebook Ads with Click-to-WhatsApp (CTWA). Geofence local radius (1-15km), generate viral Reels hooks, and harvest leads with 15-second Comment-to-DM auto-responders.
            </p>
          </div>
          <Button
            variant="gradient"
            size="sm"
            className="w-full text-xs font-bold"
            onClick={() => navigate('/social-ads')}
          >
            Launch Meta & Reels Studio →
          </Button>
        </Card>
        {/* Module 1: Industry Bots Fleet */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-slate-900">Adaptive IndustryBot Engine</h3>
              <Badge variant="info" className="text-[10px]">Adaptive AI</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamically tunes personality archetypes, tone sliders, and FAQ matrices for Hospitals, Schools, Retail, Wholesale & RMC with live Gemini 3.8 reasoning.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-bold"
            onClick={() => navigate('/bots')}
          >
            Launch IndustryBot & Simulator →
          </Button>
        </Card>

        {/* Module 2: Campaign Swarm */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-purple-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">5-Agent Campaign Swarm</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input a single campaign goal. Five autonomous AI sub-agents scout leads, draft copy in Gemini 3.8 Flash, design banners, and schedule WhatsApp broadcasts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/campaign-swarm')}
          >
            Launch Autonomous Swarm →
          </Button>
        </Card>

        {/* Module 3: Local Leads Discovery */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-blue-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">Lead Scraper & Broadcaster</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find verified high-intent local prospects with WhatsApp status. Broadcast personalized offers with 1-to-1 privacy shielding and zero phone number leaks.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/leads')}
          >
            Scrape Leads & Broadcast →
          </Button>
        </Card>

        {/* Module 4: Google Maps AI & Review Sentinel */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">Google Maps AI & Sentinel</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Optimize your Google Business Profile (GMB) for top local search ranking. Auto-respond to customer reviews with localized SEO keywords.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/google-maps')}
          >
            Manage GMB & Review Sentinel →
          </Button>
        </Card>

        {/* Module 5: AI Creative Studio */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-amber-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">AI Creative & Copy Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesize promotional marketing banners and multi-lingual WhatsApp copy tailored to your industry in English, Hindi, and Hinglish.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/ai-studio')}
          >
            Open Creative Studio →
          </Button>
        </Card>

        {/* Module 6: Customer Channels & Banner Sharing */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-cyan-400 transition bg-gradient-to-br from-white to-cyan-50/20">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Radio className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-slate-900">Channels & Contact Importer</h3>
              <Badge status="purple">New</Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Import phone address books (.vcf) or CSV spreadsheets. Share marketing banner templates directly to your custom customer channels with 1-to-1 privacy shielding.
            </p>
          </div>
          <Button
            variant="gradient"
            size="sm"
            className="w-full text-xs font-black shadow-md shadow-cyan-600/20"
            onClick={() => navigate('/channels')}
          >
            Open Channel Hub & Share Banners →
          </Button>
        </Card>

        {/* Module 7: Dynamic Pricing & Deal Engine */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">Dynamic Pricing & Margin Safeguard</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configure minimum profit floor limits, compute volume rebates for orders, calculate concrete pours (IS 456), and generate instant UPI deal links.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate('/pricing-engine')}
          >
            Launch Pricing & Margin Engine →
          </Button>
        </Card>

        {/* Module 8: Revenue, Pricing & Billing */}
        <Card className="p-6 space-y-4 flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-900">Revenue Engine & Monetization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buy Action Credit packs, upgrade SaaS subscription tiers, and simulate platform revenue projections with our interactive ARR/MRR planner.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs font-black"
            onClick={() => navigate('/revenue-pricing')}
          >
            View Pricing & Monetization →
          </Button>
        </Card>
      </div>
    </div>
  );
}
