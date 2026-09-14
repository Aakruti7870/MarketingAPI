import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, StatCard } from '../components/ui';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Eye,
  BarChart3,
  Bot,
  Layers,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';

export default function RevenuePricing() {
  const [wallet, setWallet] = useState({
    credits: 3500,
    plan: 'Growth Plan',
    plan_status: 'active',
    total_spent_inr: 2999,
  });

  const [topupLoading, setTopupLoading] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('credits'); // 'credits', 'plans', 'platform_revenue', 'future_roadmap'

  // Platform Owner Revenue Calculator State
  const [activeClients, setActiveClients] = useState(250);
  const [avgPlanPrice, setAvgPlanPrice] = useState(2999);
  const [monthlyCreditsPurchased, setMonthlyCreditsPurchased] = useState(1500);

  useEffect(() => {
    fetch('/api/billing/balance/user_default')
      .then((res) => res.json())
      .then((data) => {
        setWallet({
          credits: data.credit_balance ?? 3500,
          plan: data.plan ?? 'Growth Plan',
          plan_status: data.plan_status ?? 'active',
          total_spent_inr: data.total_spent_inr ?? 2999,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  const handleTopup = async (pack) => {
    setTopupLoading(true);
    setTopupSuccess(null);
    try {
      const res = await fetch('/api/billing/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_default',
          pack_id: pack.id,
          credits: pack.credits,
          price_inr: pack.price,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWallet((prev) => ({
          ...prev,
          credits: data.new_balance,
          total_spent_inr: prev.total_spent_inr + pack.price,
        }));
        setTopupSuccess({
          credits: pack.credits,
          txn: data.transaction_id,
          amount: pack.price,
        });
        setTimeout(() => setTopupSuccess(null), 6000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTopupLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_default',
          plan_name: plan.name,
          monthly_price_inr: plan.price,
          credits_bonus: plan.creditsBonus,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWallet((prev) => ({
          ...prev,
          plan: data.plan,
          credits: data.new_balance,
        }));
        alert(`Successfully upgraded to ${plan.name}! ${plan.creditsBonus} bonus credits added.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculator calculations
  const monthlySubscriptionRevenue = activeClients * avgPlanPrice;
  const monthlyCreditRevenue = activeClients * ((monthlyCreditsPurchased / 1000) * 750);
  const totalMonthlyRevenue = monthlySubscriptionRevenue + monthlyCreditRevenue;
  const annualRevenue = totalMonthlyRevenue * 12;
  const estimatedAiServerCosts = activeClients * 220; // minimal Gemini / server cost
  const monthlyGrossProfit = totalMonthlyRevenue - estimatedAiServerCosts;
  const grossMarginPercent = Math.round((monthlyGrossProfit / totalMonthlyRevenue) * 100);

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge status="purple">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-purple-600" /> Revenue & Monetization Engine
            </Badge>
            <Badge status="success">High-Margin Agentic Business Model</Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Billing, Credit Packs & Revenue Strategy
          </h1>
          <p className="text-xs text-slate-500">
            Manage your Action Credits wallet, upgrade SaaS subscription tiers, and simulate platform revenue projections.
          </p>
        </div>

        {/* Live Wallet Chip */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 flex items-center gap-4 shadow-xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Active Wallet Balance
            </span>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-5 h-5 fill-emerald-400" />
              {wallet.credits.toLocaleString()} Credits
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              Current Plan: <span className="font-bold text-white">{wallet.plan}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'credits', label: '⚡ Buy Action Credits' },
          { id: 'plans', label: '📦 Subscription Plans (SaaS)' },
          { id: 'platform_revenue', label: '📈 Platform Revenue Planner & Projections' },
          { id: 'future_roadmap', label: '🚀 Futuristic Agentic AI Roadmap' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success Notification */}
      {topupSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-3xl text-emerald-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">
                Instant Top-Up Successful! Credited {topupSuccess.credits} Action Credits.
              </p>
              <p className="text-xs text-emerald-700">
                Transaction ID: {topupSuccess.txn} • Amount Paid: ₹{topupSuccess.amount}
              </p>
            </div>
          </div>
          <Badge status="success">Wallet Updated</Badge>
        </div>
      )}

      {/* TAB 1: BUY ACTION CREDITS */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'pack_starter',
                name: 'Starter Boost Pack',
                credits: 500,
                price: 499,
                perCredit: '₹0.99 / credit',
                recommended: false,
                features: ['500 Action Credits', 'Scrape ~2,500 Leads', '150 WhatsApp Broadcasts', 'Valid for 1 Year'],
              },
              {
                id: 'pack_growth',
                name: 'Growth Power Pack',
                credits: 2000,
                price: 1499,
                perCredit: '₹0.74 / credit (25% Savings)',
                recommended: true,
                features: ['2,000 Action Credits', 'Scrape ~10,000 Leads', '800 WhatsApp Broadcasts', 'AI Banner Studio Access', 'Valid for 1 Year'],
              },
              {
                id: 'pack_enterprise',
                name: 'High-Volume Enterprise Pack',
                credits: 10000,
                price: 4999,
                perCredit: '₹0.49 / credit (50% Savings)',
                recommended: false,
                features: ['10,000 Action Credits', 'Unlimited Lead Scraping', '5,000 WhatsApp Deliveries', 'Priority Multi-Agent Swarm', 'Dedicated Account Manager'],
              },
            ].map((pack) => (
              <Card
                key={pack.id}
                className={`flex flex-col justify-between relative overflow-hidden transition-all ${
                  pack.recommended
                    ? 'ring-2 ring-indigo-600 shadow-2xl bg-gradient-to-b from-white to-indigo-50/40'
                    : ''
                }`}
              >
                {pack.recommended && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-2xl">
                    Most Popular
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-lg text-slate-900">{pack.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{pack.perCredit}</p>
                  </div>

                  <div className="py-2">
                    <span className="text-4xl font-black text-slate-900">₹{pack.price}</span>
                    <span className="text-xs text-slate-500 ml-1 font-bold">one-time</span>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Credits Received:</span>
                    <span className="text-emerald-700 font-black text-sm">+{pack.credits.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    {pack.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    variant={pack.recommended ? 'gradient' : 'primary'}
                    size="md"
                    className="w-full text-xs font-black"
                    onClick={() => handleTopup(pack)}
                    disabled={topupLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-1.5" /> Instant Top-Up ₹{pack.price}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Credit Consumption Rates Matrix */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-sm text-slate-900">Transparent Action Credit Consumption Matrix</h3>
                <p className="text-xs text-slate-500">Every autonomous action has a fixed, clear credit price.</p>
              </div>
              <Badge status="info">No Hidden Charges</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Scrape 5 Leads', cost: '1 Credit', sub: '₹0.74' },
                { label: 'WhatsApp Msg', cost: '1 Credit', sub: '₹0.74' },
                { label: 'AI Banner Studio', cost: '3 Credits', sub: '₹2.22' },
                { label: 'AI Swarm Run', cost: '15 Credits', sub: '₹11.10' },
                { label: 'Google Maps Setup', cost: '50 Credits', sub: '₹37.00' },
                { label: 'Deal Negotiation', cost: '2 Credits', sub: '₹1.48' },
              ].map((rate, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">{rate.label}</span>
                  <span className="text-sm font-black text-indigo-700 block">{rate.cost}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">({rate.sub})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter Tier',
              idealFor: 'Solo Tutors, Dentists, Small Boutiques',
              price: 999,
              creditsBonus: 500,
              features: [
                '500 Credits Included / month',
                '1 Active Autonomous AI Bot',
                'Lead Scraper (Up to 500 leads/mo)',
                'Standard WhatsApp Delivery',
                'Email & Chat Support',
              ],
            },
            {
              name: 'Growth Plan',
              idealFor: 'Clinics, Coaching Institutes, Distributors',
              price: 2999,
              creditsBonus: 2500,
              popular: true,
              features: [
                '2,500 Credits Included / month',
                '5 Active Autonomous AI Bots',
                'Unlimited Lead Scraper & Exporter',
                'WhatsApp Cloud API Integration',
                'Google Maps AI Review Sentinel',
                'Autonomous 5-Agent Campaign Swarms',
                'Priority Processing SLA',
              ],
            },
            {
              name: 'Enterprise & Agency',
              idealFor: 'Hospitals, School Chains, High-Volume Wholesalers',
              price: 7999,
              creditsBonus: 10000,
              features: [
                '10,000 Credits Included / month',
                'Unlimited Autonomous AI Bots',
                'Multi-Branch & Role Permissions (RBAC)',
                'Dedicated IP for WhatsApp Cloud',
                'Custom API Webhooks & ERP Sync',
                'White-Label Portal Option',
                'Dedicated Account Strategist',
              ],
            },
          ].map((plan, i) => (
            <Card
              key={i}
              className={`flex flex-col justify-between relative ${
                plan.popular ? 'ring-2 ring-indigo-600 shadow-2xl bg-white' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider py-1 px-4 rounded-bl-2xl">
                  Recommended
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500">{plan.idealFor}</p>
                </div>

                <div className="py-2">
                  <span className="text-4xl font-black text-slate-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 ml-1 font-bold">/ month</span>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button
                  variant={wallet.plan === plan.name ? 'secondary' : plan.popular ? 'gradient' : 'primary'}
                  size="md"
                  className="w-full text-xs"
                  onClick={() => handleSubscribe(plan)}
                  disabled={wallet.plan === plan.name}
                >
                  {wallet.plan === plan.name ? 'Current Active Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: PLATFORM REVENUE & MONETIZATION PLANNER (FOR PLATFORM OWNER) */}
      {activeTab === 'platform_revenue' && (
        <div className="space-y-8">
          {/* Revenue Architecture Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              label="Projected Monthly Revenue"
              value={`₹${(totalMonthlyRevenue / 100000).toFixed(2)} Lakhs`}
              trend={`${grossMarginPercent}% Profit Margin`}
            />
            <StatCard
              label="Annual Run-Rate (ARR)"
              value={`₹${(annualRevenue / 10000000).toFixed(2)} Crores`}
              subtext="SaaS + Micro-credits combined"
            />
            <StatCard
              label="Gross Monthly Margin"
              value={`₹${(monthlyGrossProfit / 100000).toFixed(2)} Lakhs`}
              subtext="After Gemini AI & Server Infra"
            />
            <StatCard
              label="Active Subscribed Businesses"
              value={`${activeClients} Clients`}
              subtext="Hospitals, Tutors, Retail & Wholesalers"
            />
          </div>

          {/* Interactive Simulation Sliders */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-base text-slate-900">
                  Interactive Platform Revenue Simulator
                </h3>
              </div>
              <Badge status="purple">Live Economics Model</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider 1: Active Businesses */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Active Paying Businesses:</span>
                  <span className="text-indigo-600 font-black text-sm">{activeClients} businesses</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="2000"
                  step="25"
                  value={activeClients}
                  onChange={(e) => setActiveClients(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 block">
                  (e.g., 50 clinics, 70 tutors, 80 retail shops, 50 suppliers)
                </span>
              </div>

              {/* Slider 2: Average Monthly Plan */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Average SaaS Plan (₹/mo):</span>
                  <span className="text-indigo-600 font-black text-sm">₹{avgPlanPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="999"
                  max="7999"
                  step="500"
                  value={avgPlanPrice}
                  onChange={(e) => setAvgPlanPrice(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 block">
                  Blended average across Starter, Growth & Enterprise tiers
                </span>
              </div>

              {/* Slider 3: Extra Action Credits */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Additional Credits Purchased / Mo:</span>
                  <span className="text-indigo-600 font-black text-sm">{monthlyCreditsPurchased} credits</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={monthlyCreditsPurchased}
                  onChange={(e) => setMonthlyCreditsPurchased(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 block">
                  High-volume WhatsApp marketing broadcasts & lead scraping
                </span>
              </div>
            </div>
          </Card>

          {/* 4 Pillars of Revenue Generation for LUMINA360 AI OS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3 border-l-4 border-l-blue-600">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Revenue Pillar 1</span>
              <h4 className="font-black text-base text-slate-900">Predictable Monthly Recurring Revenue (MRR)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Small businesses, coaching tutors, and clinics pay a flat monthly subscription (₹999 to ₹7,999/mo) for their 24/7 autonomous bot, Google Maps listing automation, and lead generation dashboard. Very low churn because their lead pipeline is tied to the platform.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-l-4 border-l-emerald-600">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Revenue Pillar 2</span>
              <h4 className="font-black text-base text-slate-900">92%+ Gross Profit Margin on Action Credits</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We charge users ₹0.74 to ₹1.00 per Action Credit. An AI banner, review response, or agentic prompt on Google Gemini 3.8 Flash costs our backend less than $0.0005 (~₹0.04). This creates an immense 90-95% gross margin on credit usage.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-l-4 border-l-purple-600">
              <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Revenue Pillar 3</span>
              <h4 className="font-black text-base text-slate-900">Payment Gateway Transaction Commissions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When deals and appointments are closed through our autonomous bots, the customer pays via an integrated instant UPI or card payment link. The platform collects a 1% - 1.5% facilitation fee on every closed deal.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-l-4 border-l-amber-500">
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Revenue Pillar 4</span>
              <h4 className="font-black text-base text-slate-900">White-Label Digital Marketing Agency Licenses</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sell multi-tenant agency licenses at ₹25,000 - ₹50,000 / year to local advertising agencies who want to manage WhatsApp marketing and Google Maps for 50+ local shops under their own branding.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: FUTURISTIC AGENTIC AI ROADMAP */}
      {activeTab === 'future_roadmap' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white space-y-3">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Futuristic & Cutting-Edge Agentic Technologies to Maximize Revenue
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Here are advanced AI technologies we recommend rolling out next to create an impenetrable competitive moat and 10x our platform revenue:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: PhoneCall,
                title: 'Autonomous Multimodal Voice Calling Agent',
                tag: 'High Revenue: ₹5 / call',
                desc: 'A speech-to-speech AI agent that autonomously calls patients for appointment confirmation, calls parents to remind them of tuition demo classes, or calls contractors to confirm concrete batch delivery times in regional languages (Hindi, Marathi, English).',
                monetization: 'Charge ₹5 - ₹10 per automated phone call; users pay happily because it replaces an entire telecalling desk.',
              },
              {
                icon: Eye,
                title: 'Multimodal Prescription & Handwritten RFQ Scanner',
                tag: 'High Revenue: ₹10 / scan',
                desc: 'Patients or contractors upload a photo of a doctor’s handwritten prescription or a contractor’s site ledger note. Gemini Vision extracts medicines/materials, verifies stock, and sends a WhatsApp cart checkout link.',
                monetization: 'Charge ₹10 per document scan or bundle into the Enterprise subscription.',
              },
              {
                icon: BarChart3,
                title: 'Autonomous Local Google Ads & Meta Budget Bidding Agent',
                tag: 'Commission: 10% of Ad Spend',
                desc: 'An agent that automatically writes local Google Ads, monitors search volume for "clinic near me" or "Class 10 tuition", bids dynamically, and turns ads off when the business runs out of booking slots.',
                monetization: 'Take a 10% management fee on monthly ad spend (e.g. ₹2,000 fee on ₹20,000 ad budget).',
              },
              {
                icon: Layers,
                title: 'WhatsApp Native In-Chat Catalog & 1-Click UPI Payment',
                tag: 'Fintech: 1.5% GMV',
                desc: 'Using Meta Graph API 2026 interactive messages, customers can browse menus, course packages, or wholesale catalogs with full photo carousels and complete UPI payment right inside WhatsApp without leaving the chat.',
                monetization: 'Capture a 1.5% processing fee on gross merchandise volume (GMV).',
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 space-y-3 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <Badge status="purple">{item.tag}</Badge>
                  </div>
                  <h4 className="font-black text-base text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs text-indigo-900 font-bold bg-indigo-50/50 p-2.5 rounded-xl">
                  💰 Monetization: {item.monetization}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
