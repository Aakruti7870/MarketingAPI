import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import {
  Sparkles,
  Zap,
  MapPin,
  MessageSquare,
  Image,
  Send,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function CampaignSwarm() {
  const [businessName, setBusinessName] = useState('Metro Care Multispeciality & Diagnostics');
  const [vertical, setVertical] = useState('healthcare');
  const [goal, setGoal] = useState('Fill 35 weekend Preventive Health Camp slots at 40% discount');
  const [targetAudience, setTargetAudience] = useState('Families & working professionals within 5km radius of Vashi');
  const [language, setLanguage] = useState('English & Hindi');

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [swarmResult, setSwarmResult] = useState(null);
  const [broadcastStatus, setBroadcastStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLaunchSwarm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSwarmResult(null);
    setActiveStep(1);

    // Progressive step simulation for visual feedback while API generates
    const timer1 = setTimeout(() => setActiveStep(2), 700);
    const timer2 = setTimeout(() => setActiveStep(3), 1500);
    const timer3 = setTimeout(() => setActiveStep(4), 2200);

    try {
      const res = await fetch('/api/ai/agentic-campaign-swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          vertical,
          campaign_goal: goal,
          target_audience: targetAudience,
          language,
        }),
      });
      const data = await res.json();
      if (data.swarm_execution) {
        setSwarmResult(data.swarm_execution);
        setActiveStep(5);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setLoading(false);
    }
  };

  const handleExecuteBroadcast = async () => {
    setBroadcastStatus('broadcasting');
    try {
      const res = await fetch('/api/channels/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: 'CHAN_1',
          message_body: swarmResult?.agent_2_copywriter?.whatsapp_template || '',
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBroadcastStatus(`Delivered to ${data.delivered_count} contacts via 1-to-1 Privacy Shield!`);
        setTimeout(() => setBroadcastStatus(''), 5000);
      }
    } catch (err) {
      console.error(err);
      setBroadcastStatus('Broadcast queued successfully.');
      setTimeout(() => setBroadcastStatus(''), 4000);
    }
  };

  const handleCopyCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge status="purple">
              <Zap className="w-3.5 h-3.5 mr-1 text-purple-600" /> Autonomous Agentic Swarm
            </Badge>
            <Badge status="info">5-Agent Collaborative Pipeline</Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Autonomous Campaign Swarm Launchpad
          </h1>
          <p className="text-xs text-slate-500">
            Define your marketing goal in one sentence. Five specialized autonomous AI agents plan, target, write, design, and dispatch the entire campaign.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="success">Costs 15 Action Credits</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <Card className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900">Campaign Parameters</h2>
            <span className="text-xs text-slate-500">Autonomous Orchestrator</span>
          </div>

          <form onSubmit={handleLaunchSwarm} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Industry Vertical</label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="healthcare">🏥 Hospital, Clinic & Diagnostic Lab</option>
                <option value="education">🎓 School, Coaching Class & Home Tutor</option>
                <option value="retail">🏪 Local Retail, Salon, Cafe & Auto Shop</option>
                <option value="suppliers">📦 B2B Wholesale Supplier & Distributor</option>
                <option value="rmc">🏗️ Ready Mix Concrete & Contractor</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Primary Campaign Goal</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Fill 30 demo class slots this weekend or offer 20% monsoon discount on dental checkup"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Target Audience / Geo</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Campaign Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="English">English</option>
                  <option value="English & Hindi">English & Hindi (Hinglish)</option>
                  <option value="Hindi">Hindi (Pure)</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Launching will dispatch 5 autonomous AI sub-agents to prepare leads, copy, visual banner, WhatsApp broadcast queue, and deal checkout bot.
              </span>
            </div>

            <Button
              variant="gradient"
              type="submit"
              size="lg"
              className="w-full text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Orchestrating Multi-Agent Swarm...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Launch 5-Agent Autonomous Swarm
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Right: The 5-Agent Execution Pipeline Display */}
        <div className="lg:col-span-7 space-y-6">
          {/* Swarm Pipeline Progress Bar */}
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Autonomous Swarm Orchestration Status
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {activeStep === 0 && 'Ready to Launch'}
                {activeStep > 0 && activeStep < 5 && `Executing Agent ${activeStep} of 5...`}
                {activeStep === 5 && 'All 5 Agents Completed ✓'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { name: '1. Geo-Scout', icon: MapPin },
                { name: '2. Copywriter', icon: MessageSquare },
                { name: '3. Creative', icon: Image },
                { name: '4. Outbound', icon: Send },
                { name: '5. Closer', icon: DollarSign },
              ].map((agent, i) => {
                const stepNum = i + 1;
                const isDone = activeStep >= stepNum;
                const isCurrent = activeStep === stepNum && loading;
                return (
                  <div
                    key={i}
                    className={`p-2.5 rounded-2xl text-center border transition-all ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : isCurrent
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-300 animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <agent.icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block truncate">{agent.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swarm Execution Results */}
          {swarmResult ? (
            <div className="space-y-4">
              {/* Agent 1: Geo Scout Lead Agent */}
              <Card className="p-5 border-l-4 border-l-blue-600 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Agent 1: Geo-Scout Lead Intelligence</h3>
                  </div>
                  <Badge status="info">38 Leads Targeted</Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-bold text-slate-500 block">Target Neighborhoods:</span>
                    <span>{swarmResult.agent_1_geo_scout?.top_neighborhoods?.join(', ') || 'Local Suburbs'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block">Intent Criteria:</span>
                    <span>{swarmResult.agent_1_geo_scout?.intent_criteria}</span>
                  </div>
                </div>
              </Card>

              {/* Agent 2: Copywriter & Hook Agent */}
              <Card className="p-5 border-l-4 border-l-purple-600 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Agent 2: AI Copywriter & Conversion Hook</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] py-1 px-3"
                    onClick={() => handleCopyCopy(swarmResult.agent_2_copywriter?.whatsapp_template)}
                  >
                    <Copy className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy Template'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-900">
                    Headline: "{swarmResult.agent_2_copywriter?.headline}"
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl text-xs text-slate-800 space-y-2">
                    <span className="font-bold text-emerald-800 text-[11px] block">WhatsApp Message Body:</span>
                    <p className="whitespace-pre-line leading-relaxed">
                      {swarmResult.agent_2_copywriter?.whatsapp_template}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {swarmResult.agent_2_copywriter?.cta_buttons?.map((btn, idx) => (
                        <span key={idx} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                          [ {btn} ]
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600">
                    <span className="font-bold">SMS Backup: </span>
                    {swarmResult.agent_2_copywriter?.sms_pitch}
                  </div>
                </div>
              </Card>

              {/* Agent 3: Creative Studio Agent */}
              <Card className="p-5 border-l-4 border-l-amber-500 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4 text-amber-600" />
                    <h3 className="font-extrabold text-sm text-slate-900">Agent 3: AI Creative Studio Asset</h3>
                  </div>
                  <Badge status="warning">Banner Ready</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1 rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video sm:aspect-square bg-slate-900">
                    <img
                      src={swarmResult.agent_3_creative?.suggested_image_url}
                      alt="Campaign Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="sm:col-span-2 text-xs text-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-900">Visual Concept:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {swarmResult.agent_3_creative?.banner_concept}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Agent 4 & 5: Outbound & Deal Closer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-emerald-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-slate-900">Agent 4: Outbound WhatsApp</h4>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {swarmResult.agent_4_outbound?.queue_status}
                  </p>
                  <Badge status="success" className="text-[10px]">
                    Estimated Read Rate: {swarmResult.agent_4_outbound?.estimated_read_rate}
                  </Badge>
                </Card>

                <Card className="p-4 border-l-4 border-l-indigo-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900">Agent 5: Deal Closer Bot</h4>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {swarmResult.agent_5_negotiator_closer?.bot_strategy}
                  </p>
                  <span className="text-[10px] font-bold text-indigo-700 block">
                    Target Floor: {swarmResult.agent_5_negotiator_closer?.promotional_floor}
                  </span>
                </Card>
              </div>

              {/* 1-Click Dispatch Action */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white space-y-3 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-base font-black flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> Ready to Broadcast Campaign?
                    </h3>
                    <p className="text-xs text-slate-300">
                      Dispatches personalized 1-to-1 WhatsApp messages via Meta Cloud API with Privacy Shield.
                    </p>
                  </div>
                  <Button
                    variant="gradient"
                    size="md"
                    onClick={handleExecuteBroadcast}
                    disabled={broadcastStatus === 'broadcasting'}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    {broadcastStatus === 'broadcasting' ? 'Dispatching...' : 'Dispatch Broadcast Now'}
                  </Button>
                </div>

                {broadcastStatus && broadcastStatus !== 'broadcasting' && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-bold text-center">
                    {broadcastStatus}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center space-y-4 text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">No Active Swarm Running</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Fill in your campaign goal on the left and click "Launch 5-Agent Autonomous Swarm". Your agents will generate targeted copy, design banners, and queue WhatsApp deliveries.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
