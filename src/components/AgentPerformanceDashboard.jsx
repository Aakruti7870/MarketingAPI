import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, Badge, Button } from './ui';
import {
  BarChart3,
  TrendingUp,
  Activity,
  MousePointerClick,
  Eye,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Bot,
  GraduationCap,
  Store,
  Truck,
  Building2,
  Share2,
  Info,
  Layers,
  ChevronDown,
} from 'lucide-react';

// Comprehensive Industry-specific agent campaign performance data
export const INDUSTRY_AGENT_METRICS = [
  {
    id: 'healthcare',
    industry: 'Healthcare & Hospitals',
    agentName: 'MediCare Triage Assistant',
    icon: Activity,
    color: '#10B981', // Emerald
    badgeText: 'Emergency & Clinic',
    totalBroadcasts: 18450,
    deliveryRate: 99.4,
    openRate: 91.8,
    ctr: 44.2,
    conversionRate: 21.6,
    avgResponseSec: 1.4,
    topActionSlip: 'Doctor Appointment Slip',
    historical: [
      { date: 'Mon', openRate: 88.2, ctr: 41.5, conversions: 18.2, volume: 2400 },
      { date: 'Tue', openRate: 90.4, ctr: 43.1, conversions: 20.1, volume: 2850 },
      { date: 'Wed', openRate: 93.1, ctr: 45.8, conversions: 22.4, volume: 3100 },
      { date: 'Thu', openRate: 91.5, ctr: 44.0, conversions: 21.0, volume: 2700 },
      { date: 'Fri', openRate: 94.2, ctr: 46.5, conversions: 23.8, volume: 3400 },
      { date: 'Sat', openRate: 89.8, ctr: 42.2, conversions: 19.5, volume: 2200 },
      { date: 'Sun', openRate: 95.4, ctr: 46.9, conversions: 25.2, volume: 1800 },
    ],
    funnel: [
      { stage: 'Sent Broadcasts', count: 18450, rate: 100 },
      { stage: 'Delivered', count: 18340, rate: 99.4 },
      { stage: 'Opened (Read)', count: 16937, rate: 91.8 },
      { stage: 'Clicked Prompt', count: 8155, rate: 44.2 },
      { stage: 'Slot Confirmed', count: 3985, rate: 21.6 },
    ],
    keyInsight: 'Saturday preventative camp reminders achieved peak 95.4% open rate with quick doctor slot selection buttons.',
  },
  {
    id: 'education',
    industry: 'Education & Coaching',
    agentName: 'EduCounsel Admissions Bot',
    icon: GraduationCap,
    color: '#6366F1', // Indigo
    badgeText: 'IIT/NEET & Admissions',
    totalBroadcasts: 24200,
    deliveryRate: 99.1,
    openRate: 88.6,
    ctr: 42.5,
    conversionRate: 19.8,
    avgResponseSec: 1.8,
    topActionSlip: 'Free Demo Class Pass',
    historical: [
      { date: 'Mon', openRate: 85.0, ctr: 38.5, conversions: 16.5, volume: 3200 },
      { date: 'Tue', openRate: 87.4, ctr: 40.2, conversions: 18.0, volume: 3600 },
      { date: 'Wed', openRate: 89.2, ctr: 43.0, conversions: 20.4, volume: 3900 },
      { date: 'Thu', openRate: 88.0, ctr: 41.8, conversions: 19.1, volume: 3400 },
      { date: 'Fri', openRate: 91.5, ctr: 45.2, conversions: 22.5, volume: 4100 },
      { date: 'Sat', openRate: 90.2, ctr: 44.0, conversions: 21.2, volume: 3800 },
      { date: 'Sun', openRate: 88.9, ctr: 44.8, conversions: 21.0, volume: 2200 },
    ],
    funnel: [
      { stage: 'Sent Broadcasts', count: 24200, rate: 100 },
      { stage: 'Delivered', count: 23980, rate: 99.1 },
      { stage: 'Opened (Read)', count: 21441, rate: 88.6 },
      { stage: 'Clicked Prompt', count: 10285, rate: 42.5 },
      { stage: 'Pass Claimed', count: 4791, rate: 19.8 },
    ],
    keyInsight: 'Parent scorecards with mock test results delivered a 45.2% click-through rate to student counseling sessions.',
  },
  {
    id: 'retail',
    industry: 'Retail, Salons & Cafes',
    agentName: 'RetailGenie VIP Bot',
    icon: Store,
    color: '#F59E0B', // Amber
    badgeText: 'Hyperlocal & Flash Deals',
    totalBroadcasts: 31500,
    deliveryRate: 98.9,
    openRate: 86.4,
    ctr: 39.8,
    conversionRate: 18.4,
    avgResponseSec: 1.2,
    topActionSlip: 'VIP Discount Voucher',
    historical: [
      { date: 'Mon', openRate: 82.1, ctr: 34.0, conversions: 14.5, volume: 4000 },
      { date: 'Tue', openRate: 84.5, ctr: 36.8, conversions: 16.0, volume: 4200 },
      { date: 'Wed', openRate: 86.0, ctr: 38.5, conversions: 17.8, volume: 4500 },
      { date: 'Thu', openRate: 88.2, ctr: 41.0, conversions: 19.2, volume: 4800 },
      { date: 'Fri', openRate: 92.4, ctr: 45.8, conversions: 23.0, volume: 5500 },
      { date: 'Sat', openRate: 93.0, ctr: 46.5, conversions: 24.2, volume: 5200 },
      { date: 'Sun', openRate: 78.5, ctr: 36.2, conversions: 14.1, volume: 3300 },
    ],
    funnel: [
      { stage: 'Sent Broadcasts', count: 31500, rate: 100 },
      { stage: 'Delivered', count: 31150, rate: 98.9 },
      { stage: 'Opened (Read)', count: 27216, rate: 86.4 },
      { stage: 'Clicked Prompt', count: 12537, rate: 39.8 },
      { stage: 'Voucher Redeemed', count: 5796, rate: 18.4 },
    ],
    keyInsight: 'Weekend 30% Flash Deals broadcasted Friday at 4:30 PM generated instant 92.4% open rates within 25 minutes.',
  },
  {
    id: 'suppliers',
    industry: 'B2B Wholesale Suppliers',
    agentName: 'SupplyChain RFQ Bot',
    icon: Truck,
    color: '#0EA5E9', // Sky Blue
    badgeText: 'Contractor RFQ & Margin',
    totalBroadcasts: 14800,
    deliveryRate: 99.6,
    openRate: 94.2,
    ctr: 47.6,
    conversionRate: 24.5,
    avgResponseSec: 2.1,
    topActionSlip: 'Spot Mill Rate Slip',
    historical: [
      { date: 'Mon', openRate: 96.0, ctr: 51.0, conversions: 27.5, volume: 2600 },
      { date: 'Tue', openRate: 95.2, ctr: 49.2, conversions: 26.0, volume: 2400 },
      { date: 'Wed', openRate: 94.0, ctr: 48.0, conversions: 25.1, volume: 2300 },
      { date: 'Thu', openRate: 93.5, ctr: 46.2, conversions: 23.8, volume: 2200 },
      { date: 'Fri', openRate: 95.0, ctr: 47.8, conversions: 24.5, volume: 2500 },
      { date: 'Sat', openRate: 90.0, ctr: 42.0, conversions: 20.0, volume: 1600 },
      { date: 'Sun', openRate: 85.5, ctr: 39.0, conversions: 14.5, volume: 1200 },
    ],
    funnel: [
      { stage: 'Sent Broadcasts', count: 14800, rate: 100 },
      { stage: 'Delivered', count: 14740, rate: 99.6 },
      { stage: 'Opened (Read)', count: 13941, rate: 94.2 },
      { stage: 'Clicked Prompt', count: 7044, rate: 47.6 },
      { stage: 'RFQ PO Placed', count: 3626, rate: 24.5 },
    ],
    keyInsight: 'Daily 9:00 AM TMT steel mill spot rates achieved 96.0% open rate due to contractor price-sensitive bulk bidding.',
  },
  {
    id: 'rmc',
    industry: 'Ready Mix Concrete (RMC)',
    agentName: 'BuildMatrix Concrete Sizing Bot',
    icon: Building2,
    color: '#8B5CF6', // Purple
    badgeText: 'IS 456 Mix Design & Pour',
    totalBroadcasts: 11200,
    deliveryRate: 99.5,
    openRate: 93.4,
    ctr: 46.1,
    conversionRate: 22.8,
    avgResponseSec: 1.9,
    topActionSlip: 'Concrete Pour Quotation',
    historical: [
      { date: 'Mon', openRate: 94.5, ctr: 48.0, conversions: 24.0, volume: 1800 },
      { date: 'Tue', openRate: 93.8, ctr: 47.2, conversions: 23.5, volume: 1900 },
      { date: 'Wed', openRate: 92.5, ctr: 45.0, conversions: 22.0, volume: 1700 },
      { date: 'Thu', openRate: 94.0, ctr: 46.8, conversions: 23.2, volume: 1850 },
      { date: 'Fri', openRate: 95.2, ctr: 49.1, conversions: 25.4, volume: 2100 },
      { date: 'Sat', openRate: 92.0, ctr: 44.0, conversions: 21.0, volume: 1200 },
      { date: 'Sun', openRate: 81.8, ctr: 32.5, conversions: 10.5, volume: 650 },
    ],
    funnel: [
      { stage: 'Sent Broadcasts', count: 11200, rate: 100 },
      { stage: 'Delivered', count: 11144, rate: 99.5 },
      { stage: 'Opened (Read)', count: 10460, rate: 93.4 },
      { stage: 'Clicked Prompt', count: 5163, rate: 46.1 },
      { stage: 'Pour Scheduled', count: 2553, rate: 22.8 },
    ],
    keyInsight: 'Friday slab pour scheduling alerts saw highest CTR at 49.1% with transit mixer pump availability locks.',
  },
];

export default function AgentPerformanceDashboard({ defaultIndustry = 'all' }) {
  const [selectedIndustry, setSelectedIndustry] = useState(defaultIndustry); // 'all', 'healthcare', etc.
  const [activeMetricView, setActiveMetricView] = useState('both'); // 'both', 'open', 'ctr', 'conversions'
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '14d', '30d'

  // Comparative data across all industry agents for the bar chart
  const comparisonData = useMemo(() => {
    return INDUSTRY_AGENT_METRICS.map((agent) => ({
      name: agent.industry.split('&')[0].trim(),
      agent: agent.agentName,
      openRate: agent.openRate,
      ctr: agent.ctr,
      conversionRate: agent.conversionRate,
      totalBroadcasts: agent.totalBroadcasts,
      color: agent.color,
    }));
  }, []);

  // Aggregated or single-agent historical timeline
  const timelineData = useMemo(() => {
    if (selectedIndustry !== 'all') {
      const target = INDUSTRY_AGENT_METRICS.find((a) => a.id === selectedIndustry);
      return target ? target.historical : INDUSTRY_AGENT_METRICS[0].historical;
    }

    // Average across all 5 agents for 'all'
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => {
      let sumOpen = 0;
      let sumCtr = 0;
      let sumConv = 0;
      let sumVol = 0;

      INDUSTRY_AGENT_METRICS.forEach((agent) => {
        const item = agent.historical.find((h) => h.date === day);
        if (item) {
          sumOpen += item.openRate;
          sumCtr += item.ctr;
          sumConv += item.conversions;
          sumVol += item.volume;
        }
      });

      const count = INDUSTRY_AGENT_METRICS.length;
      return {
        date: day,
        openRate: Number((sumOpen / count).toFixed(1)),
        ctr: Number((sumCtr / count).toFixed(1)),
        conversions: Number((sumConv / count).toFixed(1)),
        volume: sumVol,
      };
    });
  }, [selectedIndustry]);

  // Overall KPI statistics
  const currentMetrics = useMemo(() => {
    if (selectedIndustry !== 'all') {
      return INDUSTRY_AGENT_METRICS.find((a) => a.id === selectedIndustry);
    }

    // Aggregates
    const totalSent = INDUSTRY_AGENT_METRICS.reduce((acc, a) => acc + a.totalBroadcasts, 0);
    const avgOpen = (
      INDUSTRY_AGENT_METRICS.reduce((acc, a) => acc + a.openRate, 0) /
      INDUSTRY_AGENT_METRICS.length
    ).toFixed(1);
    const avgCtr = (
      INDUSTRY_AGENT_METRICS.reduce((acc, a) => acc + a.ctr, 0) /
      INDUSTRY_AGENT_METRICS.length
    ).toFixed(1);
    const avgConv = (
      INDUSTRY_AGENT_METRICS.reduce((acc, a) => acc + a.conversionRate, 0) /
      INDUSTRY_AGENT_METRICS.length
    ).toFixed(1);

    return {
      agentName: 'All 5 Industry-Specific Agents Fleet',
      industry: 'Cross-Industry Fleet Benchmarks',
      totalBroadcasts: totalSent,
      openRate: Number(avgOpen),
      ctr: Number(avgCtr),
      conversionRate: Number(avgConv),
      avgResponseSec: 1.6,
      keyInsight: 'WhatsApp interactive buttons drive an overall 44.0% average CTR—nearly 12x higher than standard email blasts.',
    };
  }, [selectedIndustry]);

  // Distribution data for pie chart
  const distributionData = useMemo(() => {
    return INDUSTRY_AGENT_METRICS.map((agent) => ({
      name: agent.industry.split(' ')[0],
      value: agent.totalBroadcasts,
      color: agent.color,
    }));
  }, []);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 z-50">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value}
                {entry.unit || '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Component Top Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Marketing Performance Analytics</span>
              </Badge>
              <Badge variant="success" className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recharts Engine Active</span>
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Industry AI Agents Performance Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-time measurement of campaign engagement, open rates, click-through rates (CTR), and conversion to confirmed appointment passes & RFQs across all 5 specialized business bots.
            </p>
          </div>

          {/* Controls Bar: Timeframe & Metric Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric View Switcher */}
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold flex items-center">
              <button
                onClick={() => setActiveMetricView('both')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeMetricView === 'both'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Open & CTR
              </button>
              <button
                onClick={() => setActiveMetricView('open')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeMetricView === 'open'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Open Rates
              </button>
              <button
                onClick={() => setActiveMetricView('ctr')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  activeMetricView === 'ctr'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CTR
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              {['7d', '14d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1.5 rounded-xl uppercase transition ${
                    timeRange === range
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Industry Filter Selector Tabs */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Agent:
          </span>
          <button
            onClick={() => setSelectedIndustry('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedIndustry === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Industry Agents</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">5</span>
          </button>

          {INDUSTRY_AGENT_METRICS.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedIndustry === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedIndustry(agent.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{agent.industry.split('&')[0].trim()}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.color }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* KEY KPI CARDS - High-contrast light design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Average / Current Open Rate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              Open Rate (Read)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +4.8% vs avg
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {currentMetrics.openRate}
              <span className="text-xl font-bold text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              WhatsApp verified blue tick open rate across target cohorts
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentMetrics.openRate}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Click-Through Rate (CTR) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-indigo-600" />
              Click-Through Rate (CTR)
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> 11.4x email
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {currentMetrics.ctr}
              <span className="text-xl font-bold text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interactive WhatsApp action buttons clicked (Doctor, Demo, RFQ)
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentMetrics.ctr}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Action Slip / Confirmed Conversion */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              Conversion Rate
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> Confirmed Deals
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {currentMetrics.conversionRate}
              <span className="text-xl font-bold text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Appointments booked, passes issued, and purchase orders placed
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentMetrics.conversionRate * 3}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Total Broadcast Volume */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-cyan-600" />
              Total Broadcasts
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
              99.2% Delivery
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {currentMetrics.totalBroadcasts.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              End-to-end shielded personalized WhatsApp messages
            </p>
          </div>
          <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between pt-1">
            <span>Avg AI Response:</span>
            <span className="font-mono text-slate-800">{currentMetrics.avgResponseSec}s</span>
          </div>
        </div>
      </div>

      {/* CHART SECTION 1: Dual-Metric Industry Benchmark Comparison (Bar Chart) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Comparative Open Rates & Click-Through Rates by Industry Agent</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Benchmark comparison evaluating how each vertical agent performs on customer WhatsApp engagement.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Open Rate (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600"></span>
              <span>Click-Through Rate (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500"></span>
              <span>Conversion (%)</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="w-full h-[360px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              {(activeMetricView === 'both' || activeMetricView === 'open') && (
                <Bar
                  dataKey="openRate"
                  name="Open Rate"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              )}
              {(activeMetricView === 'both' || activeMetricView === 'ctr') && (
                <Bar
                  dataKey="ctr"
                  name="Click-Through Rate (CTR)"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              )}
              {activeMetricView === 'both' && (
                <Bar
                  dataKey="conversionRate"
                  name="Conversion Rate"
                  fill="#A855F7"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contextual Metric Insight Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800">Top Performing Vertical:</span>{' '}
              <span className="text-slate-600">
                <strong>Wholesale Suppliers (94.2% Open, 47.6% CTR)</strong> due to urgent daily commodity price alerts for contractors.
              </span>
            </div>
          </div>
          <Badge variant="info" className="shrink-0">
            WhatsApp Verified
          </Badge>
        </div>
      </div>

      {/* CHART SECTION 2: Trajectory Timeline Area & Funnel Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Trajectory Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>7-Day Engagement Velocity</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedIndustry === 'all'
                  ? 'Aggregate engagement curve for all business verticals'
                  : `Daily performance curve for ${currentMetrics.agentName}`}
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
              Peak: Fri & Sat
            </span>
          </div>

          <div className="w-full h-[300px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCtr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  domain={[20, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="openRate"
                  name="Open Rate"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOpen)"
                />
                <Area
                  type="monotone"
                  dataKey="ctr"
                  name="Click-Through Rate"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCtr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Consistent 85%+ open rates across weekdays and weekends</span>
            <span className="font-bold text-slate-700">Updated: Real-time</span>
          </div>
        </div>

        {/* Right 5 Cols: Broadcast Volume Share & Funnel Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              <span>Broadcast Volume Share</span>
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of customer messages handled per industry bot
            </p>
          </div>

          {/* Donut Chart */}
          <div className="w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val.toLocaleString()} broadcasts`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {INDUSTRY_AGENT_METRICS.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedIndustry(agent.id)}
                className="p-2 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="font-bold text-slate-700 truncate">{agent.industry.split('&')[0].trim()}</span>
                </div>
                <span className="font-mono text-[11px] font-extrabold text-slate-900">
                  {((agent.totalBroadcasts / 100150) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DETAILED INDUSTRY DRILL-DOWN MATRIX */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Agent Performance Breakdown by Business Vertical
            </h3>
            <p className="text-xs text-slate-500">
              Compare delivery rates, opening speeds, and resulting transaction slips for each autonomous bot.
            </p>
          </div>
          <Badge variant="default">5 Active Industry Bots</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <th className="py-3 px-4">Industry & Agent</th>
                <th className="py-3 px-4">Delivery Rate</th>
                <th className="py-3 px-4">Open Rate</th>
                <th className="py-3 px-4">Click-Through (CTR)</th>
                <th className="py-3 px-4">Confirmed Conversions</th>
                <th className="py-3 px-4">Top Autonomous Action</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INDUSTRY_AGENT_METRICS.map((agent) => {
                const Icon = agent.icon;
                const isSelected = selectedIndustry === agent.id;
                return (
                  <tr
                    key={agent.id}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-indigo-50/50' : ''
                    }`}
                    onClick={() => setSelectedIndustry(agent.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: agent.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                            {agent.agentName}
                            {isSelected && (
                              <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{agent.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {agent.deliveryRate}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-600">
                          {agent.openRate}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${agent.openRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-600">
                          {agent.ctr}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${agent.ctr}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-purple-600">
                        {agent.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg text-[11px]">
                        {agent.topActionSlip}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndustry(agent.id);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Filter & Drill →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
