import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, StatCard } from '../components/ui';
import {
  Instagram,
  Facebook,
  Bot,
  Sparkles,
  Zap,
  Target,
  MapPin,
  TrendingUp,
  Share2,
  Video,
  Eye,
  MessageSquare,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Play,
  Sliders,
  DollarSign,
  Radio,
  Copy,
  ChevronRight,
  Send,
  Smartphone,
  Compass,
  Layers,
  BarChart3,
  ExternalLink,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

export default function SocialMetaAdsManager() {
  const [activeTab, setActiveTab] = useState('ads'); // 'ads' | 'reels_virality' | 'social_sentinel' | 'analytics'
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ads state
  const [campaigns, setCampaigns] = useState([]);
  const [adForm, setAdForm] = useState({
    business_name: '',
    vertical: 'healthcare',
    target_location: 'Sanpada & Vashi, Navi Mumbai',
    target_radius_km: 5,
    campaign_goal: 'Get 40+ appointments via Click-to-WhatsApp',
    daily_budget_inr: 600,
    offer_highlight: 'Flat 20% Off + Instant WhatsApp Token',
  });
  const [generatedAd, setGeneratedAd] = useState(null);
  const [generatingAd, setGeneratingAd] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Hyperlocal Reels state
  const [reelForm, setReelForm] = useState({
    landmark_or_city: 'Vashi Sector 17, Navi Mumbai',
    radius_km: 5,
    topic: '3 Health & Clinic Red Flags Local Families Ignore',
    promotional_cta: 'Drop CLINIC in comments or tap WhatsApp for instant token',
  });
  const [generatedReel, setGeneratedReel] = useState(null);
  const [generatingReel, setGeneratingReel] = useState(false);
  const [copiedSection, setCopiedSection] = useState(null);

  // Social Sentinel & Posts state
  const [posts, setPosts] = useState([]);
  const [rules, setRules] = useState([]);
  const [commentSimInput, setCommentSimInput] = useState('What is the doctor consultation fee and Sunday timing?');
  const [commentSimResult, setCommentSimResult] = useState(null);
  const [simulatingComment, setSimulatingComment] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);

  // Fetch initial accounts and data
  useEffect(() => {
    fetchAccounts();
    fetchCampaigns();
    fetchPosts();
    fetchRules();
    fetchAnalytics();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/meta/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setActiveAccount(data.active_account);
      if (data.active_account) {
        setAdForm((prev) => ({
          ...prev,
          business_name: data.active_account.business_name,
          vertical: data.active_account.vertical,
        }));
      }
    } catch (e) {
      console.error('Failed to load Meta accounts', e);
    }
  };

  const handleSwitchAccount = async (accountId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/meta/accounts/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActiveAccount(data.active_account);
        setAdForm((prev) => ({
          ...prev,
          business_name: data.active_account.business_name,
          vertical: data.active_account.vertical,
        }));
        fetchCampaigns();
        fetchPosts();
        fetchAnalytics();
      }
    } catch (e) {
      console.error('Switch failed', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/meta/ads/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error('Campaigns fetch error', e);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/meta/posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Posts fetch error', e);
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/meta/sentinel/rules');
      const data = await res.json();
      setRules(data.rules || []);
    } catch (e) {
      console.error('Rules fetch error', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/meta/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error('Analytics fetch error', e);
    }
  };

  // Generate Agentic Meta Ad Swarm
  const handleGenerateAdSwarm = async (e) => {
    if (e) e.preventDefault();
    setGeneratingAd(true);
    try {
      const res = await fetch('/api/meta/ads/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adForm,
          business_name: activeAccount?.business_name || adForm.business_name,
        }),
      });
      const result = await res.json();
      if (result.status === 'success') {
        setGeneratedAd(result.data);
        setSelectedVariantIdx(0);
      }
    } catch (err) {
      console.error('Ad generation failed', err);
    } finally {
      setGeneratingAd(false);
    }
  };

  // Deploy Generated Ad to Meta
  const handleDeployCampaign = async () => {
    if (!generatedAd) return;
    const variant = generatedAd.creative_variants?.[selectedVariantIdx] || generatedAd.creative_variants?.[0];
    try {
      const res = await fetch('/api/meta/ads/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: generatedAd.campaign_name,
          daily_budget_inr: adForm.daily_budget_inr,
          target_location: adForm.target_location,
          radius_km: adForm.target_radius_km,
          headline: variant?.headline,
          primary_text: variant?.primary_text,
          hook: variant?.hook_3_seconds,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchCampaigns();
        alert('Campaign successfully published to Meta Instagram & Facebook with Click-to-WhatsApp enabled!');
      }
    } catch (err) {
      console.error('Launch failed', err);
    }
  };

  // Run AI Bid Arbitrage & Ad Optimizer
  const handleRunAdOptimizer = async (campaignId) => {
    setOptimizing(true);
    try {
      const res = await fetch('/api/meta/ads/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOptimizationResult(data);
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Optimization error', err);
    } finally {
      setOptimizing(false);
    }
  };

  // Generate Hyperlocal Viral Reel Formula
  const handleGenerateViralReel = async (e) => {
    if (e) e.preventDefault();
    setGeneratingReel(true);
    try {
      const res = await fetch('/api/meta/boost/hyperlocal-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reelForm,
          business_name: activeAccount?.business_name,
          vertical: activeAccount?.vertical,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGeneratedReel(data.data);
      }
    } catch (err) {
      console.error('Reel generation error', err);
    } finally {
      setGeneratingReel(false);
    }
  };

  // Simulate Instagram/FB Comment -> Instant AI DM -> WhatsApp handoff
  const handleSimulateComment = async (e) => {
    if (e) e.preventDefault();
    setSimulatingComment(true);
    try {
      const res = await fetch('/api/meta/sentinel/simulate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'anita_sanpada',
          comment_text: commentSimInput,
          post_title: activeAccount?.business_name + ' Sunday OPD Reel',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCommentSimResult(data.simulation);
        fetchRules();
      }
    } catch (err) {
      console.error('Sim error', err);
    } finally {
      setSimulatingComment(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4 sm:px-6 font-sans">
      
      {/* Top Banner: Connected Meta Business Portfolio & Account Switcher */}
      <div className="relative bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-100/50 via-purple-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200/80 text-xs font-black">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Meta Marketing Graph v20.0 API</span>
              </span>
              <Badge status="success">Ad Account Verified • 0 Leaks</Badge>
              <Badge status="info">Click-to-WhatsApp Linked</Badge>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3">
              <span>Agentic Meta Ads & Local Reels Virality</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium leading-relaxed">
              Autonomously create Instagram & Facebook ads, dominate nearby neighborhoods with viral Reels formula, and harvest leads with 15-second Comment-to-DM auto-responders.
            </p>
          </div>

          {/* Connected Account Card & Switcher */}
          {activeAccount && (
            <div className="bg-white/90 backdrop-blur-xl border border-white/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 min-w-[280px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Connected Account</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-purple-500/25">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>{activeAccount.instagram_handle}</span>
                    {activeAccount.instagram_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                    {activeAccount.facebook_page_name}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>{activeAccount.instagram_followers.toLocaleString()} Followers</span>
                <span className="font-mono text-indigo-600">ID: {activeAccount.ad_account_id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Multi-Account Switcher Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100/80">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
            Switch Business Account & Vertical:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {accounts.map((acc) => {
              const isSelected = activeAccount?.account_id === acc.account_id;
              return (
                <button
                  key={acc.account_id}
                  onClick={() => handleSwitchAccount(acc.account_id)}
                  disabled={loading}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 border flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/25 ring-2 ring-indigo-300'
                      : 'bg-slate-50/90 hover:bg-slate-100/90 text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 border border-slate-200'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-black truncate">{acc.business_name}</div>
                    <div className={`text-[10px] font-medium truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {acc.instagram_handle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        {[
          { id: 'ads', label: 'Agentic Meta Ads Manager', icon: Target, badge: 'CTWA Ready' },
          { id: 'reels_virality', label: 'Hyperlocal Reels Virality Booster', icon: Flame, badge: 'Nearby Formula' },
          { id: 'social_sentinel', label: 'Comment-to-DM Lead Sentinel', icon: MessageSquare, badge: 'Auto-Convert' },
          { id: 'analytics', label: 'Hyperlocal Growth Telemetry', icon: BarChart3, badge: '84% Local Proximity' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AGENTIC META ADS MANAGER (INSTAGRAM & FACEBOOK ADVERTISE) */}
      {/* ========================================================================= */}
      {activeTab === 'ads' && (
        <div className="space-y-8">
          
          {/* Active Campaigns Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Monthly Ad Spend"
              value={`₹${(activeAccount?.monthly_ad_spend_inr || 14500).toLocaleString()}`}
              subtext="Budget paced over 30 days"
              trend="Controlled"
              icon={DollarSign}
            />
            <StatCard
              label="Local Ad Impressions"
              value="111,320"
              subtext="84.2% within 5km radius"
              trend="+38.4% WoW"
              icon={Eye}
            />
            <StatCard
              label="WhatsApp Inbound Chats"
              value="162"
              subtext="Direct bot conversions"
              trend="4.9x ROAS"
              icon={MessageCircle}
            />
            <StatCard
              label="Average Cost Per Lead (CPL)"
              value="₹64.20"
              subtext="Industry benchmark ₹140+"
              trend="54% Lower"
              icon={Zap}
            />
          </div>

          {/* Autonomous Ad Campaign Creator Swarm */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Agentic Meta Ad Creator Swarm</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                  Launch Hyperlocal Click-to-WhatsApp (CTWA) Ads
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  AI crafts 3 high-converting local hooks, geofences target pincodes, and links clicks directly to our 10-vertical WhatsApp bots.
                </p>
              </div>

              <Button
                variant="gradient"
                size="md"
                onClick={handleGenerateAdSwarm}
                disabled={generatingAd}
              >
                {generatingAd ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                    Generating Ad Swarm...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Synthesize Meta Ad Swarm
                  </>
                )}
              </Button>
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleGenerateAdSwarm} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1.5">Business Name & Brand</label>
                <input
                  type="text"
                  value={adForm.business_name}
                  onChange={(e) => setAdForm({ ...adForm, business_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Pin-Drop Landmark / Neighborhood</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adForm.target_location}
                    onChange={(e) => setAdForm({ ...adForm, target_location: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    placeholder="e.g. Sanpada & Vashi, Navi Mumbai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">
                  Target Radius: <span className="text-indigo-600 font-black">{adForm.target_radius_km} km</span>
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={adForm.target_radius_km}
                    onChange={(e) => setAdForm({ ...adForm, target_radius_km: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-500 whitespace-nowrap">{adForm.target_radius_km} km</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Campaign Goal</label>
                <select
                  value={adForm.campaign_goal}
                  onChange={(e) => setAdForm({ ...adForm, campaign_goal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                >
                  <option value="Get 40+ appointments via Click-to-WhatsApp">Click-to-WhatsApp Appointments (Highest ROAS)</option>
                  <option value="Drive walk-ins and direct store footfall">Nearby Store Footfall & Walk-Ins</option>
                  <option value="Capture high-intent phone lead forms">Instant Meta Lead Forms with E.164 verification</option>
                  <option value="Promote seasonal weekend discount camp">Weekend Special Camp / Flash Discount</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Daily Meta Ad Budget</label>
                <select
                  value={adForm.daily_budget_inr}
                  onChange={(e) => setAdForm({ ...adForm, daily_budget_inr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                >
                  <option value={400}>₹400 / day (Micro Test ~ 3,500 local reach)</option>
                  <option value={600}>₹600 / day (Recommended ~ 5,800 local reach)</option>
                  <option value={1200}>₹1,200 / day (Growth Blitz ~ 12,500 local reach)</option>
                  <option value={2500}>₹2,500 / day (Dominance ~ 28,000 local reach)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Offer / Hook Highlight</label>
                <input
                  type="text"
                  value={adForm.offer_highlight}
                  onChange={(e) => setAdForm({ ...adForm, offer_highlight: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  placeholder="e.g. Flat 20% Off + Instant WhatsApp Token"
                />
              </div>
            </form>

            {/* Generated Campaign Swarm Results */}
            {generatedAd && (
              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                      AI Generated Specification
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{generatedAd.campaign_name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={handleDeployCampaign}>
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Deploy to Meta Graph API
                    </Button>
                  </div>
                </div>

                {/* Target Strategy & Forecast Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-xs">
                  <div>
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Daily Local Reach</span>
                    <span className="text-base font-black text-slate-900">
                      {generatedAd.estimated_performance_daily?.reach_people?.toLocaleString()} people
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Inbound WhatsApp Chats</span>
                    <span className="text-base font-black text-emerald-600">
                      ~{generatedAd.estimated_performance_daily?.whatsapp_inbound_chats} / day
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Est. Cost Per Chat</span>
                    <span className="text-base font-black text-indigo-600">
                      ₹{generatedAd.estimated_performance_daily?.estimated_cpl_inr}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-bold text-[10px] uppercase">Target Radius</span>
                    <span className="text-base font-black text-slate-900">
                      {generatedAd.geo_strategy?.radius_km} km Geofence
                    </span>
                  </div>
                </div>

                {/* 3 Multi-Variant Creative Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Select AI Creative Variant to Preview:
                    </span>
                    <span className="text-xs text-slate-500 font-medium">3 AI-engineered hooks</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedAd.creative_variants?.map((variant, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                          selectedVariantIdx === idx
                            ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200'
                            : 'bg-slate-50/80 hover:bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-black text-indigo-600">{variant.variant_name}</span>
                          {selectedVariantIdx === idx && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-2">{variant.headline}</p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Variant Live Preview Card */}
                  {generatedAd.creative_variants?.[selectedVariantIdx] && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-3">
                      {/* Left: Copy & Specifications */}
                      <div className="lg:col-span-7 space-y-3.5 p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 text-xs">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                            Opening 3-Second Hook
                          </span>
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold">
                            "{generatedAd.creative_variants[selectedVariantIdx].hook_3_seconds}"
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                            Primary Ad Text (Instagram & Facebook Body)
                          </span>
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {generatedAd.creative_variants[selectedVariantIdx].primary_text}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                              Headline
                            </span>
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 truncate">
                              {generatedAd.creative_variants[selectedVariantIdx].headline}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                              CTA Action
                            </span>
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold text-emerald-800 flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              {generatedAd.creative_variants[selectedVariantIdx].cta_button}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                            WhatsApp Handoff Auto-Message (Bot Trigger)
                          </span>
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 font-mono text-[11px]">
                            {generatedAd.whatsapp_bot_handoff_message}
                          </div>
                        </div>
                      </div>

                      {/* Right: Realistic Mobile Ad Mockup */}
                      <div className="lg:col-span-5 flex justify-center">
                        <div className="w-[320px] rounded-[36px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 text-white font-sans">
                          {/* Top Speaker notch */}
                          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                          {/* Instagram Post Simulation */}
                          <div className="bg-white text-slate-900 rounded-[28px] overflow-hidden p-3.5 space-y-2.5">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 p-0.5">
                                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                                    M
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] font-black leading-tight flex items-center gap-1">
                                    <span>{activeAccount?.instagram_handle || '@metrohealth.clinic'}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-400 font-bold">Sponsored • {adForm.target_location}</div>
                                </div>
                              </div>
                              <span className="text-slate-400 text-xs">•••</span>
                            </div>

                            {/* Simulated Reel/Video Container */}
                            <div className="relative h-44 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white p-3 flex flex-col justify-between overflow-hidden shadow-inner">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-full bg-pink-600/80 backdrop-blur-md text-[9px] font-black">
                                  REELS AD
                                </span>
                                <span className="text-[10px] font-mono text-slate-300">0:28</span>
                              </div>
                              
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] inline-block">
                                  LOCAL VERIFIED
                                </span>
                                <p className="text-[11px] font-black leading-snug drop-shadow-md">
                                  "{generatedAd.creative_variants[selectedVariantIdx].hook_3_seconds}"
                                </p>
                              </div>
                            </div>

                            {/* CTWA Action Bar */}
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] font-black text-slate-900">
                                  {generatedAd.creative_variants[selectedVariantIdx].headline}
                                </div>
                                <div className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Direct Doctor Triage Pass
                                </div>
                              </div>
                              <div className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                                <MessageCircle className="w-3 h-3 fill-white" />
                                <span>Send</span>
                              </div>
                            </div>

                            {/* Caption preview */}
                            <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-medium">
                              <span className="font-bold text-slate-900 mr-1">{activeAccount?.instagram_handle}:</span>
                              {generatedAd.creative_variants[selectedVariantIdx].primary_text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Campaigns Management Table & Sentinel Arbitrage */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">Active Meta Ad Campaigns</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Live pacing, CTR monitoring, and autonomous bid reallocation across Instagram & Facebook.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleRunAdOptimizer(campaigns[0]?.id)}
                disabled={optimizing || campaigns.length === 0}
              >
                {optimizing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                    Running Arbitrage...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-500 mr-1" />
                    Run AI Bid & Fatigue Arbitrage
                  </>
                )}
              </Button>
            </div>

            {/* Optimization Result Alert */}
            {optimizationResult && (
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Autonomous Ad Sentinel Optimized {optimizationResult.campaign_id}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    {optimizationResult.projected_efficiency_gain}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-emerald-900">
                  {optimizationResult.actions_taken?.map((act, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 shrink-0">• [{act.action}]:</span>
                      <span>{act.description} <span className="font-bold">({act.impact})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaigns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="pb-3">Campaign Name & Target</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Daily Budget</th>
                    <th className="pb-3">Local Impressions</th>
                    <th className="pb-3">CTR %</th>
                    <th className="pb-3">WhatsApp Leads</th>
                    <th className="pb-3">Cost / Chat</th>
                    <th className="pb-3">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <div className="font-black text-slate-900">{camp.campaign_name}</div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-600" />
                          {camp.target_location} ({camp.radius_km}km)
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">₹{camp.daily_budget_inr}/day</td>
                      <td className="py-3.5 font-bold text-slate-900">{camp.impressions.toLocaleString()}</td>
                      <td className="py-3.5 font-bold text-indigo-600">{camp.ctr_percent}%</td>
                      <td className="py-3.5 font-black text-emerald-600">
                        {camp.whatsapp_inbound_chats} chats
                      </td>
                      <td className="py-3.5 font-mono text-slate-700">₹{camp.cost_per_chat_inr}</td>
                      <td className="py-3.5 font-black text-indigo-700">{camp.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HYPERLOCAL REELS VIRALITY BOOSTER (NEARBY AREA REACH ENGINE) */}
      {/* ========================================================================= */}
      {activeTab === 'reels_virality' && (
        <div className="space-y-8">
          
          {/* Scientific Explanation of Instagram Nearby Algorithm */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border border-purple-100/90 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/25">
                <Flame className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-slate-900 text-base">
                  How The Instagram Nearby Algorithm Pushes Your Reels Virally
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-4xl">
                  Instagram's 2026 explore engine prioritizes 4 proximity signals for Reels: <span className="font-bold text-slate-900">1) High Watch-Time Local Hook (First 3 seconds naming the city/neighborhood)</span>, <span className="font-bold text-slate-900">2) High Density Geotags (Transit & Market Hubs)</span>, <span className="font-bold text-slate-900">3) High WhatsApp Share Ratio (Local utility & recommendations)</span>, and <span className="font-bold text-slate-900">4) Regional Audio Pairing</span>. Our engine crafts scripts mathematically engineered for these signals.
                </p>
              </div>
            </div>
          </div>

          {/* Reels Generator Card */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-black border border-pink-200">
                  <Flame className="w-3.5 h-3.5 text-pink-600" />
                  <span>Nearby Virality Formula Generator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                  Synthesize Viral Reels Script & Local Geotags
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Create high-retention 30s Reels scripts with local hooks, trending audio, and geotags tailored for your area.
                </p>
              </div>

              <Button
                variant="gradient"
                size="md"
                onClick={handleGenerateViralReel}
                disabled={generatingReel}
              >
                {generatingReel ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                    Analyzing Local Trends...
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 mr-1.5" />
                    Generate Viral Reel Formula
                  </>
                )}
              </Button>
            </div>

            {/* Inputs */}
            <form onSubmit={handleGenerateViralReel} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1.5">Target Neighborhood / Landmark</label>
                <input
                  type="text"
                  value={reelForm.landmark_or_city}
                  onChange={(e) => setReelForm({ ...reelForm, landmark_or_city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  placeholder="e.g. Vashi Sector 17, Navi Mumbai"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Focus Radius: {reelForm.radius_km} km</label>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={reelForm.radius_km}
                    onChange={(e) => setReelForm({ ...reelForm, radius_km: Number(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-500">{reelForm.radius_km} km</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Reel Topic / Concept</label>
                <input
                  type="text"
                  value={reelForm.topic}
                  onChange={(e) => setReelForm({ ...reelForm, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 font-medium"
                />
              </div>
            </form>

            {/* Generated Viral Blueprint */}
            {generatedReel && (
              <div className="pt-6 border-t border-slate-100 space-y-6">
                
                {/* Header score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-200/80">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                      Local Virality Prediction
                    </span>
                    <h3 className="text-xl font-black text-slate-950">{generatedReel.viral_title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-center px-4 py-2 rounded-xl bg-white border border-purple-200 shadow-sm">
                      <div className="text-2xl font-black text-purple-700">{generatedReel.virality_score_prediction}/100</div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Algorithm Fit</span>
                    </div>
                  </div>
                </div>

                {/* 3 Opening Hooks */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      3-Second High-Retention Opening Hooks (Pick One):
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generatedReel.opening_hooks_3sec?.map((hook, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative group hover:border-purple-300 transition"
                      >
                        <span className="text-[10px] font-bold text-purple-600 block mb-1">
                          Hook #{i + 1}
                        </span>
                        <p className="text-xs font-bold text-slate-800 leading-snug">{hook}</p>
                        <button
                          onClick={() => copyToClipboard(hook, `hook_${i}`)}
                          className="mt-3 text-[10px] font-bold text-slate-500 hover:text-purple-600 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedSection === `hook_${i}` ? 'Copied!' : 'Copy Hook'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full 4-Scene Reel Script */}
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    Complete 30-40s Scene Breakdown:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black text-indigo-600">
                        <span>SCENE 1: HOOK</span>
                        <span>0 - 3s</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{generatedReel.reel_script?.scene_1_hook}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black text-purple-600">
                        <span>SCENE 2: PROBLEM</span>
                        <span>3 - 12s</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{generatedReel.reel_script?.scene_2_problem}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-600">
                        <span>SCENE 3: SOLUTION</span>
                        <span>12 - 25s</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{generatedReel.reel_script?.scene_3_solution}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black text-pink-600">
                        <span>SCENE 4: CTA</span>
                        <span>25 - 35s</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{generatedReel.reel_script?.scene_4_cta}</p>
                    </div>
                  </div>
                </div>

                {/* Geotags, Hashtags & Micro-Boost Plan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Recommended Geotags */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" /> High-Density Geotags
                    </span>
                    <div className="space-y-1.5">
                      {generatedReel.recommended_geotags?.map((tag, i) => (
                        <div key={i} className="px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-800 font-medium flex items-center justify-between">
                          <span>{tag}</span>
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">Top Explore Rank</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hyperlocal Hashtags */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-pink-600" /> Hyperlocal Hashtags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedReel.hyperlocal_hashtags?.map((ht, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-100">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Micro-Boost Plan */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 space-y-2">
                    <span className="font-black text-indigo-950 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> ₹350 Micro-Boost Simulator
                    </span>
                    <div className="space-y-1 text-slate-700 text-[11px]">
                      <div className="flex justify-between">
                        <span>Target Local Reach:</span>
                        <span className="font-bold text-slate-900">{generatedReel.micro_boost_estimate?.targeted_local_reach}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Saves & Shares:</span>
                        <span className="font-bold text-emerald-600">{generatedReel.micro_boost_estimate?.expected_saves_and_shares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal Post Window:</span>
                        <span className="font-bold text-indigo-600">{generatedReel.optimal_post_times?.weekday}</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => alert(`Micro-boost scheduled for ${reelForm.landmark_or_city}! Estimated 16,000+ local views.`)}
                    >
                      Apply ₹350 Local Boost
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMENT-TO-DM SENTINEL & SOCIAL ACCOUNT MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'social_sentinel' && (
        <div className="space-y-8">
          
          {/* Active Auto-DM Rules */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                  <span>15-Second Lead Capture Sentinel</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                  Autonomous Instagram & Facebook Comment-to-DM Rules
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  When a viewer comments "Price?", "Cost?", "Slot?", or "Details?", the AI instantly drops a public reply and sends a private DM with an appointment pass.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                2 Active Sentinel Automations
              </span>
            </div>

            {/* Rules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div key={rule.id} className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{rule.id}</span>
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">
                      Triggered {rule.total_triggered_count} times
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Trigger Keywords
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rule.trigger_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold">
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Public Comment Reply (Latency ~1.4s)
                    </span>
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                      {rule.reply_template}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                      Private Instagram/FB DM Delivered
                    </span>
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                      {rule.dm_message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Comment Simulation Sandbox */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-purple-50/80 border border-indigo-100/90 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="font-black text-slate-900 text-sm">Interactive Comment Sentinel Simulator</h4>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Test how the AI responds in under 2 seconds when a local patient or customer comments on your Instagram Reel:
              </p>

              <form onSubmit={handleSimulateComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentSimInput}
                  onChange={(e) => setCommentSimInput(e.target.value)}
                  placeholder="Type a viewer comment like 'Price for consultation?'"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500/30"
                />
                <Button variant="primary" size="sm" type="submit" disabled={simulatingComment}>
                  {simulatingComment ? 'Simulating...' : 'Test Trigger'}
                </Button>
              </form>

              {/* Simulation Result Output */}
              {commentSimResult && (
                <div className="pt-3 space-y-3">
                  <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
                    Instant Execution Sequence (Real-Time Output):
                  </div>
                  <div className="space-y-2">
                    {commentSimResult.sentinel_actions?.map((act, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 text-xs shadow-xs">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-black flex items-center justify-center shrink-0">
                          {act.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900">{act.action}</span>
                            {act.latency && (
                              <span className="text-[10px] font-mono text-emerald-600 font-bold">{act.latency}</span>
                            )}
                          </div>
                          {act.text && <p className="text-slate-600 mt-1 font-medium">{act.text}</p>}
                          {act.cta_label && (
                            <a
                              href={act.target_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {act.cta_label}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Content Calendar (Published & Scheduled Posts) */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-950">Social Feed & Reels Calendar</h3>
                <p className="text-xs text-slate-500 font-medium">Cross-posting to Instagram & Facebook simultaneously.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert('New post scheduler opened. Choose Reel or Carousel format.')}
              >
                Schedule New Post
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.map((p) => (
                <div key={p.id} className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200 uppercase">
                      {p.post_type} • {p.platform}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-bold leading-snug">"{p.hook}"</p>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">{p.caption}</p>

                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-indigo-600" /> {p.views.toLocaleString()} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> {p.comments} comments
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <MessageCircle className="w-3.5 h-3.5" /> {p.whatsapp_leads_generated} leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HYPERLOCAL GROWTH TELEMETRY & LOCAL PROXIMITY HEATMAP */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="30-Day Total Reach"
              value={analytics.metrics_30_days?.total_reach?.toLocaleString()}
              subtext="Instagram & Facebook Combined"
              trend="+41.2%"
              icon={Eye}
            />
            <StatCard
              label="Local Proximity Share"
              value={analytics.metrics_30_days?.nearby_local_reach_percentage}
              subtext="Within 5km radius of business"
              trend="Optimal"
              icon={MapPin}
            />
            <StatCard
              label="Local Profile Visits"
              value={analytics.metrics_30_days?.profile_visits?.toLocaleString()}
              subtext="Navigated from viral Reels"
              trend="+28.4%"
              icon={TrendingUp}
            />
            <StatCard
              label="Tap-to-Directions / WhatsApp"
              value={analytics.metrics_30_days?.website_or_whatsapp_taps?.toLocaleString()}
              subtext="High-intent booking taps"
              trend="9.2% CTR"
              icon={Zap}
            />
          </div>

          {/* Top Performing Localities Grid */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)] space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-950">Neighborhood Reach & Leads Heatmap</h3>
              <p className="text-xs text-slate-500 font-medium">
                Audience concentration and customer acquisitions broken down by locality.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.top_performing_localities?.map((loc, i) => (
                <div key={i} className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-black text-emerald-600">{loc.leads} WhatsApp Leads</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{loc.locality}</h4>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: loc.reach_share }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold block">{loc.reach_share} of total ad & reel impressions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
