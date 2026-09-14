import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import IndustryBot from '../components/IndustryBot';
import AgentPerformanceDashboard from '../components/AgentPerformanceDashboard';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  Settings,
  Activity,
  Calendar,
  GraduationCap,
  Store,
  Truck,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  HelpCircle,
  Clock,
  Check,
  ChevronRight,
  Ticket,
  FileText,
  Percent,
  BarChart3,
  Workflow,
} from 'lucide-react';
import { ALL_AGENTIC_BOTS, getBotById } from '../data/agenticIndustryBots';
import N8nWorkflowStudio from '../components/N8nWorkflowStudio';

export const BOT_PRESETS = ALL_AGENTIC_BOTS;

const _LEGACY_BOT_PRESETS = [
  {
    id: 'healthcare',
    name: 'MediCare Triage & Appointments AI',
    vertical: 'Hospitals, Clinics & Labs',
    icon: Activity,
    color: 'emerald',
    badgeText: 'NABH / Clinical Triage',
    tagline: 'Autonomous patient symptom triage, doctor scheduling, diagnostic test bookings & WhatsApp camp alerts',
    actions: ['Doctor Calendar Sync', 'Symptom Triage', 'Prescription Follow-ups', 'Review Defense'],
    defaultMessage: 'Hi, what time is Dr. Mehta available and what is the consultation fee?',
    samplePrompts: [
      'What time is Dr. Mehta available and what is the consultation fee?',
      'Do you offer home blood sample collection for lipid profile?',
      'Can I reschedule my appointment from Friday to Monday?',
      'Do you accept HDFC ERGO or Star Health cashless insurance?',
    ],
    config: {
      consultationFee: '₹600',
      clinicHours: '8:30 AM - 9:00 PM (Mon-Sat)',
      doctorOnDuty: 'Dr. R. Mehta (MD, DM Cardiology)',
      homeSampleCollection: 'Free within 5 km radius',
      cashlessTpa: 'Star Health, Care, ICICI Lombard, HDFC ERGO',
    },
    qaDatabase: [
      {
        q: 'What is the doctor consultation fee and timing?',
        a: 'Dr. R. Mehta (Cardiology) is available daily from 9:00 AM - 1:00 PM and 4:30 PM - 8:30 PM. The consultation fee is ₹600. Walk-ins and pre-booked digital appointment passes are accepted.',
      },
      {
        q: 'How can I book a home blood sample collection?',
        a: 'We offer NABL-accredited home sample collection starting 6:30 AM daily with fasting protocols. Blood reports are delivered on WhatsApp within 4 hours. No convenience fee for orders above ₹500.',
      },
      {
        q: 'Are emergency services and ICU beds available?',
        a: 'Yes, our 24/7 emergency triage and trauma desk is staffed by critical care physicians. Call 1800-MEDICARE or WhatsApp for immediate ambulance dispatch with GPS live tracking.',
      },
      {
        q: 'Do you offer Cashless Insurance (TPA) coverage?',
        a: 'Yes! We support cashless pre-authorization across 30+ major TPAs including Star Health, Care Health, HDFC ERGO, and MediBuddy. Our insurance desk processes approvals in under 45 minutes.',
      },
    ],
  },
  {
    id: 'education',
    name: 'EduCounsel Admissions & Demo AI',
    vertical: 'Schools, Tutors & Coaching',
    icon: GraduationCap,
    color: 'indigo',
    badgeText: 'EdTech Admission Bot',
    tagline: 'Instant course counseling, free demo class passes, syllabus delivery & fee follow-up bot',
    actions: ['Demo Class Booking', 'Syllabus PDF Delivery', 'Fee Reminder with UPI', 'Parent Q&A'],
    defaultMessage: 'I want to know about Class 10 Board + NEET prep batches and fees.',
    samplePrompts: [
      'I want to know about Class 10 Board + NEET prep batches and fees.',
      'Can my son attend a free demo lecture this Saturday?',
      'What is your track record in JEE Advanced and NEET 2024?',
      'Do you provide transport and hostel facilities for outside students?',
    ],
    config: {
      annualFee: '₹45,000 (Installments available)',
      demoDays: 'Saturday & Sunday at 4:00 PM',
      facultyBatch: 'Ex-IITian & Medical Faculty Panel',
      batchCapacity: '25 Students Max per batch',
    },
    qaDatabase: [
      {
        q: 'What are the batch timings and annual course fees?',
        a: 'Our integrated 2-Year NEET/JEE Advanced batches run 4 days/week (4:30 PM - 7:30 PM). Annual tuition is ₹45,000, payable in 3 easy no-cost installments. Includes test series and tablet study material.',
      },
      {
        q: 'Can my child attend a free demo lecture before enrolling?',
        a: 'Absolutely! We provide a Free 3-Day Masterclass Pass every weekend (Sat & Sun at 4:00 PM). Parents can also sit in to evaluate faculty pedagogy and doubt-solving speed.',
      },
      {
        q: 'What are your recent 2024 results?',
        a: 'In 2024, 42 of our students scored 650+ in NEET, and 18 students secured ranks within the top 5,000 in JEE Advanced, mentored by our full-time Ex-IITian faculty team.',
      },
      {
        q: 'Are scholarship admission tests (VSAT) conducted?',
        a: 'Yes, students can take our 45-minute online/offline Scholarship Aptitude Test every Sunday to win up to 75% tuition fee waiver based on merit.',
      },
    ],
  },
  {
    id: 'retail',
    name: 'RetailGenie Local Store AI',
    vertical: 'Salons, Retail & Cafes',
    icon: Store,
    color: 'amber',
    badgeText: 'Hyperlocal Store Bot',
    tagline: 'Automates customer offers, VIP loyalty discounts, stylist bookings & WhatsApp orders',
    actions: ['Instant Coupon Issuance', 'Stylist Slot Booking', 'Store Directions', 'Special Event Blasts'],
    defaultMessage: 'What offers do you have for salon spa packages this weekend?',
    samplePrompts: [
      'What offers do you have for salon spa packages this weekend?',
      'Can I book a haircut and beard styling slot today at 5 PM?',
      'What organic skin care products do you carry in stock?',
      'Do you offer bridal makeup packages with home service?',
    ],
    config: {
      activeDiscount: 'Flat 25% Off VIP Combos',
      operatingHours: '10:00 AM - 9:30 PM (All 7 Days)',
      minOrderAmount: '₹500 for Free Delivery',
      loyaltyProgram: '10% Cashback in Points on every visit',
    },
    qaDatabase: [
      {
        q: 'What are the active weekend promotions and packages?',
        a: 'We are running our VIP Luxe Spa & Grooming Combo at flat 25% off (now ₹1,499, regular ₹2,000). Includes haircut, organic beard spa, scalp massage, and de-tan treatment.',
      },
      {
        q: 'How do I book a specific stylist or appointment slot?',
        a: 'You can reserve your preferred stylist directly on WhatsApp! Slots open today at 3:00 PM, 5:30 PM, and 7:00 PM. Tap the booking button below to lock in your appointment.',
      },
      {
        q: 'Do you offer doorstep salon service or bridal styling?',
        a: 'Yes! Our certified senior artists provide doorstep bridal, mehendi, and pre-wedding styling packages across the city. Advance booking requires a ₹1,000 refundable token.',
      },
      {
        q: 'Where is your salon located and is valet parking available?',
        a: 'We are at Sector 17, Main Market, opposite HDFC Bank. Free dedicated customer parking and valet service is available.',
      },
    ],
  },
  {
    id: 'suppliers',
    name: 'SupplyChain B2B Wholesale AI',
    vertical: 'Suppliers & Distributors',
    icon: Truck,
    color: 'blue',
    badgeText: 'Wholesale B2B Engine',
    tagline: 'Handles dynamic tiered pricing, MOQ verification, mill test certificates & PO generation',
    actions: ['Tiered Volume Pricing', 'MOQ Validation', 'Instant Mill Test Specs', 'PO Link Gen'],
    defaultMessage: 'Need rate for 25 Metric Tons of 550D TMT bars with delivery in Panvel.',
    samplePrompts: [
      'Need rate for 25 Metric Tons of 550D TMT bars with delivery in Panvel.',
      'What is your MOQ for PVC electrical conduits and fittings?',
      'Do you offer 30-day credit terms with post-dated cheque?',
      'Can you email the NABL Mill Test Certificate for Fe-550D steel?',
    ],
    config: {
      moqThreshold: '15 Metric Tons for Mill Rate',
      baseUnitPrice: '₹52,800 / Metric Ton (Ex-Stock Kalamboli)',
      deliveryLogistics: 'Same-day trailer dispatch with crane offload',
      paymentTerms: 'RTGS / Bank Guarantee / 30-Day PDC on approval',
    },
    qaDatabase: [
      {
        q: 'What is today’s spot mill rate for Fe-550D TMT bars?',
        a: 'Today’s primary mill rate is locked at ₹52,800 / Metric Ton (Ex-Warehouse Kalamboli). For truckload orders exceeding 20 Tons, we provide direct factory rebate of ₹750/ton.',
      },
      {
        q: 'What is the Minimum Order Quantity (MOQ) for factory pricing?',
        a: 'Factory direct pricing applies to orders of 15 Metric Tons and above. For retail cut-lengths or smaller project orders under 5 Tons, our local yard rate is ₹54,200/ton.',
      },
      {
        q: 'Do your shipments include BIS and NABL Mill Test Certificates?',
        a: 'Yes, every batch dispatch is accompanied by genuine 100% manufacturer Mill Test Reports (MTR) confirming chemical composition (Carbon, Sulphur) and physical bend test yield values.',
      },
      {
        q: 'What are your commercial payment and credit terms?',
        a: 'Initial orders are processed on RTGS/NEFT against proforma invoice. Registered commercial builders with GST compliance can unlock 30-day credit terms upon post-dated cheque verification.',
      },
    ],
  },
  {
    id: 'rmc',
    name: 'BuildMatrix RMC & Concrete AI',
    vertical: 'Ready Mix Concrete & Builders',
    icon: Building2,
    color: 'purple',
    badgeText: 'IS 456 Compliant',
    tagline: 'Calculates pour volume, validates slump & mix grades, schedules transit mixers & protects margins',
    actions: ['Pour Volume Sizing', 'Transit Mixer Logistics', 'Floor Rate Safeguard', 'Cashfree Link'],
    defaultMessage: 'Need 60m³ M25 grade concrete for slab pour tomorrow morning.',
    samplePrompts: [
      'Need 60m³ M25 grade concrete for slab pour tomorrow morning.',
      'What is your rate per cubic meter for M20 including transit pump?',
      'Can you deliver 8 transit mixers starting 6:00 AM tomorrow?',
      'Do you guarantee 28-day cube compressive strength test reports?',
    ],
    config: {
      m20Rate: '₹3,550 / m³ (Pump extra ₹250/m³)',
      m25Rate: '₹3,750 / m³ (Includes transit pump for 40m³+)',
      m30Rate: '₹4,100 / m³',
      transitMixerCapacity: '6 m³ and 8 m³ batch drums',
      batchCapacity: '120 m³ per hour twin-shaft plant',
    },
    qaDatabase: [
      {
        q: 'What is the cubic meter rate for M25 Ready Mix Concrete?',
        a: 'Our standard rate for IS 456 certified M25 design mix is ₹3,750/m³. For continuous pours exceeding 40m³, our automated pricing engine includes the high-reach transit concrete pump at zero extra charge.',
      },
      {
        q: 'How many transit mixers can you dispatch per hour?',
        a: 'Our twin-shaft automated batching plant operates at 120 m³/hour. We can dispatch a dedicated fleet of 6m³ and 8m³ transit mixers at 20-minute intervals starting as early as 5:00 AM.',
      },
      {
        q: 'What is the maximum pumping height and slump retention?',
        a: 'We use high-admixture retarders ensuring 3-hour slump retention (120mm ± 25mm). Our stationary pumps reach up to 35 floors vertically and 250 meters horizontally.',
      },
      {
        q: 'Are concrete cube test reports provided for structural audits?',
        a: 'Yes, 6 concrete test cubes are cast on-site for every 50m³ pour. Official 7-day and 28-day NABL-certified compressive strength test certificates are delivered directly to your project dashboard.',
      },
    ],
  },
];

export default function AgenticBots() {
  const [activeBotId, setActiveBotId] = useState('hospital');
  const [viewMode, setViewMode] = useState('simulator'); // 'simulator' | 'n8n_workflows' | 'analytics'
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator', 'qa_matrix', 'settings'
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am MediCare Triage Assistant. How can I assist you with doctor appointments or health packages today?',
      action: {
        type: 'appointment_slip',
        title: 'Confirmed Clinic Consultation Slot',
        doctor: 'Dr. R. Mehta (Cardiology)',
        fee: '₹600',
        time: 'Today, 5:00 PM - 5:30 PM',
        clinic: 'Metro Clinic, Sanpada',
        code: 'MED-7821',
      },
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastReasoning, setLastReasoning] = useState(
    'Initial state active. Waiting for patient inquiry to triage urgency, match doctor specialty, and propose appointment slots.'
  );

  const activeBot = BOT_PRESETS.find((b) => b.id === activeBotId) || BOT_PRESETS[0];

  const handleSelectBot = (bot) => {
    setActiveBotId(bot.id);
    setMessages([
      {
        sender: 'bot',
        text: `Hello! I am ${bot.name} configured for ${bot.vertical}. How can I assist you today?`,
      },
    ]);
    setLastReasoning(`Agent loaded for ${bot.vertical}. Active parameters: ${JSON.stringify(bot.config)}`);
  };

  const handleSendMessage = async (userText) => {
    const text = userText || inputVal;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputVal('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/bot-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical: activeBot.id,
          bot_name: activeBot.name,
          user_message: text,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: data.reply,
            action: data.action_payload,
          },
        ]);
        if (data.reasoningTrace) {
          setLastReasoning(data.reasoningTrace);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: `Thank you for your inquiry! As ${activeBot.name}, I have logged your request and can provide instant scheduling or customized pricing right away.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Industry Agentic AI Bot Fleet
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" />
                Gemini 3.8 Flash Reasoning Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Vertical-Trained Conversational & Closing Bots
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Equipped with deep industry-specific Q&A knowledge bases, autonomous symptom triage, appointment issuance, and automated margin floor negotiations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API Ready
            </span>
          </div>
        </div>
      </div>

      {/* Select Industry Bot Carousel */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-600" />
          Select Business Industry Bot ({BOT_PRESETS.length})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BOT_PRESETS.map((bot) => {
            const Icon = bot.icon;
            const isSelected = bot.id === activeBotId;
            return (
              <button
                key={bot.id}
                onClick={() => handleSelectBot(bot)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-xl shadow-indigo-950/20 ring-2 ring-indigo-500'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {bot.badgeText}
                    </span>
                  </div>
                  <h3 className="font-black text-xs tracking-tight mb-1">{bot.name}</h3>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {bot.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/30 flex items-center justify-between text-[10px] font-bold">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>{bot.vertical}</span>
                  <span className={isSelected ? 'text-cyan-400' : 'text-indigo-600'}>Active</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mode Navigation Bar: Bot Engine vs Campaign Analytics vs n8n Workflows */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode('simulator')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'simulator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Interactive Bot Engine & Persona Tuner</span>
          </button>
          <button
            onClick={() => setViewMode('n8n_workflows')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'n8n_workflows'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Workflow className="w-4 h-4 text-cyan-300" />
            <span>n8n Automation Workflows</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-700 font-extrabold uppercase">
              v1.x JSON
            </span>
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              viewMode === 'analytics'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Recharts Campaign Analytics (Open & CTR)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-700 font-extrabold uppercase">
              Live
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
          {viewMode === 'simulator'
            ? 'Simulator Active'
            : viewMode === 'n8n_workflows'
            ? 'n8n Studio Active'
            : 'Metrics Matrix Active'}
        </span>
      </div>

      {/* Conditional Rendering: Bot Simulator vs n8n Workflows vs Recharts Performance Matrix */}
      {viewMode === 'simulator' && (
        <IndustryBot
          initialIndustry={activeBotId}
          onIndustryChange={(newInd) => setActiveBotId(newInd)}
        />
      )}
      {viewMode === 'n8n_workflows' && (
        <N8nWorkflowStudio selectedIndustryId={activeBotId} />
      )}
      {viewMode === 'analytics' && (
        <AgentPerformanceDashboard defaultIndustry={activeBotId} />
      )}

      {/* Multi-Vertical Deployed Bots Fleet Overview */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Active Deployed Multi-Vertical Bots Across Your Business</span>
            </h3>
            <p className="text-xs text-slate-500">
              Overview of all 10 autonomous conversational agents standing by for multi-channel WhatsApp and web dispatch.
            </p>
          </div>
          <Badge variant="success" className="text-xs">10/10 Bots Online</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BOT_PRESETS.map((bot) => {
            const Icon = bot.icon;
            const isSelected = bot.id === activeBotId;
            return (
              <div
                key={bot.id}
                onClick={() => setActiveBotId(bot.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-xl ring-2 ring-indigo-500'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {bot.badgeText}
                    </span>
                  </div>
                  <h4 className="font-black text-xs tracking-tight mb-1">{bot.name}</h4>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {bot.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/30 flex items-center justify-between text-[10px] font-bold">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>{bot.vertical}</span>
                  <span className={isSelected ? 'text-cyan-400 font-extrabold' : 'text-indigo-600 font-extrabold'}>
                    {isSelected ? 'Currently Selected' : 'Switch Bot →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
