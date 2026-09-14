import React, { useState, useEffect } from 'react';
import {
  Activity,
  GraduationCap,
  Store,
  Truck,
  Building2,
  Bot,
  Sparkles,
  Send,
  Sliders,
  Database,
  Share2,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Search,
  MessageSquare,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Award,
  DollarSign,
  Smartphone,
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { ALL_AGENTIC_BOTS, getIndustryPresetsDict } from '../data/agenticIndustryBots';

export const INDUSTRY_PRESETS = getIndustryPresetsDict();

const _LEGACY_UNUSED_PRESETS = {
  healthcare: {
    id: 'healthcare',
    name: 'MediCare Clinical Sentinel',
    vertical: 'Hospitals, Clinics & Diagnostic Labs',
    category: 'Healthcare OS',
    icon: Activity,
    themeColor: 'emerald',
    badge: 'NABH / Clinical Protocol',
    avatar: '🏥',
    personality: {
      archetype: 'Compassionate Clinical Triage Specialist',
      tone: 'Empathetic, reassuring, medically disciplined, and objective',
      formality: 85, // 0-100
      salesDrive: 60, // 0-100
      brevity: 45, // 0-100
      directives:
        'Triage patient symptoms calmly without alarming the patient. Offer immediate doctor consultation passes (e.g., Dr. R. Mehta, Cardiology at 5:00 PM today). Quote consultation fee of ₹600 transparently with free 7-day follow-up. Highlight free home blood collection for lipid & sugar tests. Strictly avoid prescribing Schedule-H antibiotics without physical clinic examination.',
      guardrails: [
        'Never prescribe controlled pharmaceuticals without a doctor visit',
        'Always provide clear ₹600 consultation fee transparency',
        'Flag severe chest pain/stroke symptoms as immediate emergency',
        'Offer free home sample collection within 5 km radius',
      ],
    },
    defaultGreeting:
      'Hello! I am your MediCare Clinical Assistant. How can I assist you with doctor consultation slots, symptom queries, or lab tests today?',
    samplePrompts: [
      'What time is Dr. Mehta available and what is the consultation fee?',
      'Do you offer home blood sample collection for full body checkup?',
      'Can I reschedule my appointment from Friday to Monday?',
      'Do you accept Star Health or HDFC ERGO cashless insurance?',
    ],
    faqs: [
      {
        id: 'faq_h1',
        category: 'Appointments & Fees',
        question: 'What is the doctor consultation fee and clinic schedule?',
        answer:
          'Dr. R. Mehta (Cardiology) is available daily from 9:00 AM - 1:00 PM and 4:30 PM - 8:30 PM. The consultation fee is ₹600. Includes complimentary follow-up within 7 days.',
      },
      {
        id: 'faq_h2',
        category: 'Diagnostics & Labs',
        question: 'How do I book a home blood sample collection?',
        answer:
          'We offer NABL-accredited home blood sample collection starting at 6:30 AM daily with fasting protocols. Verified PDF reports delivered to WhatsApp within 4 hours. No convenience fee on orders above ₹500.',
      },
      {
        id: 'faq_h3',
        category: 'Insurance & Cashless',
        question: 'Do you offer Cashless Insurance (TPA) coverage?',
        answer:
          'Yes, we support cashless pre-authorization across 30+ major TPAs including Star Health, Care Health, HDFC ERGO, and MediBuddy. Pre-approval turnaround is under 45 minutes.',
      },
      {
        id: 'faq_h4',
        category: 'Emergency & Triage',
        question: 'Are emergency services and ICU beds available?',
        answer:
          'Yes, our 24/7 emergency triage desk is equipped with ACLS ambulances and ICU beds. Call 1800-MEDICARE or reply EMERGENCY for instant ambulance dispatch with live GPS tracking.',
      },
    ],
  },
  education: {
    id: 'education',
    name: 'EduCounsel Admission Master',
    vertical: 'Schools, Tutors & Coaching Institutes',
    category: 'Education OS',
    icon: GraduationCap,
    themeColor: 'indigo',
    badge: 'EdTech Admission Copilot',
    avatar: '🎓',
    personality: {
      archetype: 'Inspirational Academic Counselor',
      tone: 'Supportive, encouraging, pedagogical, and result-oriented',
      formality: 70,
      salesDrive: 80,
      brevity: 50,
      directives:
        'Acknowledge the student’s academic goals enthusiastically. Outline our Class 10 & 12 Board + NEET/JEE Advanced curriculum taught by Ex-IITians. Proactively pitch the Free 3-Day Demo Masterclass Pass for this weekend. Provide transparent annual fee details (₹45,000 payable in 3 no-cost installments). Emphasize our 25-student maximum batch cap for personalized doubt solving.',
      guardrails: [
        'Always offer a 100% Free 3-Day Demo Pass before asking for commitment',
        'State maximum batch capacity of 25 students for personalized attention',
        'Highlight Ex-IITian faculty and verified 2024 student ranks',
        'Mention weekly VSAT scholarship test for up to 75% tuition waivers',
      ],
    },
    defaultGreeting:
      'Welcome to BrightFuture Academy! I am your EduCounsel Copilot. Are you inquiring about NEET, JEE Advanced, or Class 10 Foundation batches?',
    samplePrompts: [
      'I want to know about Class 10 Board + NEET prep batches and fees.',
      'Can my child attend a free demo lecture this Saturday?',
      'What was your success rate in JEE Advanced and NEET 2024?',
      'Do you offer scholarship tests for fee reduction?',
    ],
    faqs: [
      {
        id: 'faq_e1',
        category: 'Admissions & Batches',
        question: 'What are the batch timings and annual course fees?',
        answer:
          'Our integrated 2-Year NEET/JEE batches run 4 days a week (4:30 PM - 7:30 PM). Annual tuition is ₹45,000, payable in 3 no-cost EMI installments. Includes test series and tablet study material.',
      },
      {
        id: 'faq_e2',
        category: 'Demo & Pedagogy',
        question: 'Can my child attend a free demo masterclass before enrolling?',
        answer:
          'Absolutely! We provide a Free 3-Day Masterclass Pass every weekend (Sat & Sun at 4:00 PM). Parents are encouraged to sit in to evaluate faculty teaching and doubt-solving speed.',
      },
      {
        id: 'faq_e3',
        category: 'Results & Track Record',
        question: 'What are your recent 2024 competitive exam results?',
        answer:
          'In 2024, 42 of our students scored 650+ in NEET, and 18 students secured ranks within the top 5,000 in JEE Advanced, mentored by our full-time Ex-IITian faculty team.',
      },
      {
        id: 'faq_e4',
        category: 'Scholarships (VSAT)',
        question: 'Are scholarship tests conducted for fee waivers?',
        answer:
          'Yes, students can take our 45-minute online/offline Scholarship Aptitude Test (VSAT) every Sunday to win up to 75% tuition fee waiver based on merit.',
      },
    ],
  },
  retail: {
    id: 'retail',
    name: 'RetailGenie VIP Store Host',
    vertical: 'Salons, Spas, Retail Stores & Cafes',
    category: 'Commerce OS',
    icon: Store,
    themeColor: 'amber',
    badge: 'Hyperlocal Retail Concierge',
    avatar: '🛍️',
    personality: {
      archetype: 'Chic, Hospitable & Upbeat VIP Stylist',
      tone: 'Friendly, stylish, enthusiastic, and prompt',
      formality: 55,
      salesDrive: 85,
      brevity: 65,
      directives:
        'Warmly welcome customers and immediately highlight today’s VIP 25% discount voucher. Proactively check stylist availability and offer specific slots (e.g., 3:00 PM or 5:30 PM today). Emphasize 100% sanitized organic products. Provide easy driving directions and mention complimentary customer valet parking.',
      guardrails: [
        'Always pitch the active 25% discount voucher on combos',
        'Offer 2 specific time slots for booking (e.g. 3 PM or 5:30 PM)',
        'Mention free customer parking and valet service',
        'Provide instant booking confirmation with WhatsApp pass',
      ],
    },
    defaultGreeting:
      'Hi there! ✨ Welcome to Luxe Salon & Spa. We have a special 25% VIP discount on styling combos this week! How can I pamper you today?',
    samplePrompts: [
      'What offers do you have for salon spa packages this weekend?',
      'Can I book a haircut and beard styling slot today at 5 PM?',
      'What organic skin care products do you carry in stock?',
      'Do you offer bridal makeup packages with home service?',
    ],
    faqs: [
      {
        id: 'faq_r1',
        category: 'Offers & Combos',
        question: 'What are the active weekend promotions and packages?',
        answer:
          'We are running our VIP Luxe Spa & Grooming Combo at flat 25% off (now ₹1,499, regular ₹2,000). Includes haircut, organic beard spa, scalp massage, and de-tan treatment.',
      },
      {
        id: 'faq_r2',
        category: 'Stylist Bookings',
        question: 'How do I book a specific stylist or appointment slot?',
        answer:
          'You can reserve your preferred stylist directly on WhatsApp! Slots are open today at 3:00 PM, 5:30 PM, and 7:00 PM. Tap the booking button below to lock in your appointment.',
      },
      {
        id: 'faq_r3',
        category: 'Bridal & Doorstep',
        question: 'Do you offer doorstep salon service or bridal styling?',
        answer:
          'Yes! Our certified senior artists provide doorstep bridal, mehendi, and pre-wedding styling packages across the city. Advance booking requires a ₹1,000 refundable token.',
      },
      {
        id: 'faq_r4',
        category: 'Location & Parking',
        question: 'Where is your salon located and is valet parking available?',
        answer:
          'We are at Sector 17, Main Market, opposite HDFC Bank. Free dedicated customer parking and valet service is available.',
      },
    ],
  },
  suppliers: {
    id: 'suppliers',
    name: 'SupplyChain B2B Wholesale Broker',
    vertical: 'Wholesale Suppliers, Steel & Hardware',
    category: 'Wholesale OS',
    icon: Truck,
    themeColor: 'blue',
    badge: 'Industrial B2B Broker',
    avatar: '🚚',
    personality: {
      archetype: 'Astute Industrial Procurement Specialist',
      tone: 'Pragmatic, commercial, sharp, and margin-conscious',
      formality: 90,
      salesDrive: 90,
      brevity: 70,
      directives:
        'Inquire about exact order tonnage (minimum order quantity is 15 Metric Tons for factory mill rate). Quote today’s base mill price of ₹52,800/ton for Fe-550D TMT rebars. Strictly safeguard our hard margin floor of ₹52,000/ton; counter-offer volume rebates only for 30T+ orders. Confirm same-day trailer dispatch with crane offloading and NABL Mill Test Certificates.',
      guardrails: [
        'Protect hard margin floor of ₹52,000/ton against all counter-offers',
        'Verify Minimum Order Quantity (MOQ) of 15 Metric Tons',
        'Highlight genuine BIS and NABL Mill Test Certificates with every load',
        'Issue instant Proforma Invoice with RTGS payment link',
      ],
    },
    defaultGreeting:
      'Good day. This is SupplyChain B2B Wholesale. I can quote live spot mill rates on Fe-550D TMT steel and industrial hardware. What volume does your project need?',
    samplePrompts: [
      'Need rate for 25 Metric Tons of 550D TMT bars with delivery in Panvel.',
      'What is your MOQ for PVC electrical conduits and fittings?',
      'Do you offer 30-day credit terms with post-dated cheque?',
      'Can you email the NABL Mill Test Certificate for Fe-550D steel?',
    ],
    faqs: [
      {
        id: 'faq_s1',
        category: 'Spot Mill Rates',
        question: 'What is today’s spot mill rate for Fe-550D TMT bars?',
        answer:
          'Today’s primary mill rate is locked at ₹52,800 / Metric Ton (Ex-Warehouse Kalamboli). For truckload orders exceeding 20 Tons, we provide a direct factory rebate of ₹750/ton.',
      },
      {
        id: 'faq_s2',
        category: 'MOQ & Tonnage',
        question: 'What is the Minimum Order Quantity (MOQ) for factory pricing?',
        answer:
          'Factory direct pricing applies to orders of 15 Metric Tons and above. For retail cut-lengths or smaller project orders under 5 Tons, our local yard rate is ₹54,200/ton.',
      },
      {
        id: 'faq_s3',
        category: 'Test Certificates',
        question: 'Do your shipments include BIS and NABL Mill Test Certificates?',
        answer:
          'Yes, every batch dispatch is accompanied by genuine 100% manufacturer Mill Test Reports (MTR) confirming chemical composition (Carbon, Sulphur) and physical bend test yield values.',
      },
      {
        id: 'faq_s4',
        category: 'Credit & Payment',
        question: 'What are your commercial payment and credit terms?',
        answer:
          'Initial orders are processed on RTGS/NEFT against proforma invoice. Registered commercial builders with GST compliance can unlock 30-day credit terms upon post-dated cheque verification.',
      },
    ],
  },
  rmc: {
    id: 'rmc',
    name: 'BuildMatrix Civil Concrete Engineer',
    vertical: 'Ready Mix Concrete & Civil Builders',
    category: 'Civil Infra OS',
    icon: Building2,
    themeColor: 'purple',
    badge: 'IS 456 Structural Materials Engineer',
    avatar: '🏗️',
    personality: {
      archetype: 'IS 456 Structural Materials Engineer',
      tone: 'Authoritative, technically rigorous, safety-focused, and prompt',
      formality: 85,
      salesDrive: 75,
      brevity: 55,
      directives:
        'Calculate cubic meter pour volume per IS 456 mix design specifications. Quote M25 concrete at ₹3,750/m³ including complimentary transit pump for orders above 40 m³. Confirm 3-hour slump retention (120mm ± 25mm) and high-reach boom pump capability up to 35 floors. Schedule transit mixer fleets at 20-minute batch intervals and commit 7-day and 28-day cube strength certificates.',
      guardrails: [
        'Maintain minimum design mix standards per IS 456',
        'Include free boom pump only for continuous pours of 40m³ and above',
        'Specify 3-hour slump retention with special retarder admixtures',
        'Deliver official 7-day and 28-day NABL compressive strength test cubes',
      ],
    },
    defaultGreeting:
      'Namaste! BuildMatrix RMC AI ready. I handle IS 456 mix design calculations, slump specifications, and transit mixer dispatch. What is your pour volume?',
    samplePrompts: [
      'Need 60m³ M25 grade concrete for slab pour tomorrow morning.',
      'What is your rate per cubic meter for M20 including transit pump?',
      'Can you deliver 8 transit mixers starting 6:00 AM tomorrow?',
      'Do you guarantee 28-day cube compressive strength test reports?',
    ],
    faqs: [
      {
        id: 'faq_c1',
        category: 'Design Mix Rates',
        question: 'What is the cubic meter rate for M25 Ready Mix Concrete?',
        answer:
          'Our standard rate for IS 456 certified M25 design mix is ₹3,750/m³. For continuous pours exceeding 40m³, our automated pricing engine includes the high-reach transit concrete pump at zero extra charge.',
      },
      {
        id: 'faq_c2',
        category: 'Transit Mixer Logistics',
        question: 'How many transit mixers can you dispatch per hour?',
        answer:
          'Our twin-shaft automated batching plant operates at 120 m³/hour. We can dispatch a dedicated fleet of 6m³ and 8m³ transit mixers at 20-minute intervals starting as early as 5:00 AM.',
      },
      {
        id: 'faq_c3',
        category: 'Slump & Pumping',
        question: 'What is the maximum pumping height and slump retention?',
        answer:
          'We use high-admixture retarders ensuring 3-hour slump retention (120mm ± 25mm). Our stationary pumps reach up to 35 floors vertically and 250 meters horizontally.',
      },
      {
        id: 'faq_c4',
        category: 'Cube Strength Tests',
        question: 'Are concrete cube test reports provided for structural audits?',
        answer:
          'Yes, 6 concrete test cubes are cast on-site for every 50m³ pour. Official 7-day and 28-day NABL-certified compressive strength test certificates are delivered directly to your project dashboard.',
      },
    ],
  },
};

export default function IndustryBot({
  initialIndustry = 'healthcare',
  onIndustryChange,
  compact = false,
}) {
  // Selected industry state
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
  const [industryData, setIndustryData] = useState(INDUSTRY_PRESETS);

  // Active view tab within component: 'simulator' | 'personality' | 'faqs' | 'whatsapp'
  const [activeTab, setActiveTab] = useState('simulator');

  // Active industry config
  const currentBot = industryData[selectedIndustry] || industryData.healthcare;

  // Personality customization states
  const [personaName, setPersonaName] = useState(currentBot.name);
  const [personaArchetype, setPersonaArchetype] = useState(currentBot.personality.archetype);
  const [personaTone, setPersonaTone] = useState(currentBot.personality.tone);
  const [formality, setFormality] = useState(currentBot.personality.formality);
  const [salesDrive, setSalesDrive] = useState(currentBot.personality.salesDrive);
  const [brevity, setBrevity] = useState(currentBot.personality.brevity);
  const [directives, setDirectives] = useState(currentBot.personality.directives);
  const [isSavedPersonality, setIsSavedPersonality] = useState(false);

  // FAQ Manager states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState('All');
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('General');

  // Chat simulator state
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: currentBot.defaultGreeting,
      timestamp: 'Just now',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reasoningTrace, setReasoningTrace] = useState(
    `Agent initialized with ${currentBot.personality.archetype} persona. Loaded ${currentBot.faqs.length} industry FAQs into active memory.`
  );
  const [showReasoning, setShowReasoning] = useState(true);
  const [actionPayload, setActionPayload] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // When industry changes, dynamically adjust bot personality & FAQs
  useEffect(() => {
    const b = industryData[selectedIndustry] || industryData.healthcare;
    setPersonaName(b.name);
    setPersonaArchetype(b.personality.archetype);
    setPersonaTone(b.personality.tone);
    setFormality(b.personality.formality);
    setSalesDrive(b.personality.salesDrive);
    setBrevity(b.personality.brevity);
    setDirectives(b.personality.directives);
    setSelectedFaqCategory('All');
    setMessages([
      {
        sender: 'bot',
        text: b.defaultGreeting,
        timestamp: 'Just now',
      },
    ]);
    setActionPayload(null);
    setReasoningTrace(
      `Switched to ${b.vertical}. Adopted '${b.personality.archetype}' personality with ${b.faqs.length} verified knowledge base items.`
    );
    if (onIndustryChange) {
      onIndustryChange(selectedIndustry);
    }
  }, [selectedIndustry]);

  // Handle saving customized personality
  const handleSavePersonality = () => {
    setIndustryData((prev) => ({
      ...prev,
      [selectedIndustry]: {
        ...prev[selectedIndustry],
        name: personaName,
        personality: {
          ...prev[selectedIndustry].personality,
          archetype: personaArchetype,
          tone: personaTone,
          formality,
          salesDrive,
          brevity,
          directives,
        },
      },
    }));
    setIsSavedPersonality(true);
    setTimeout(() => setIsSavedPersonality(false), 2500);
  };

  // Handle adding a new FAQ to current industry
  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    const newFaq = {
      id: `faq_custom_${Date.now()}`,
      category: newFaqCategory.trim() || 'General',
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
    };

    setIndustryData((prev) => ({
      ...prev,
      [selectedIndustry]: {
        ...prev[selectedIndustry],
        faqs: [newFaq, ...prev[selectedIndustry].faqs],
      },
    }));

    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setShowAddFaqModal(false);
  };

  // Handle deleting an FAQ
  const handleDeleteFaq = (faqId) => {
    setIndustryData((prev) => ({
      ...prev,
      [selectedIndustry]: {
        ...prev[selectedIndustry],
        faqs: prev[selectedIndustry].faqs.filter((f) => f.id !== faqId),
      },
    }));
  };

  // Handle sending message in simulator
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setIsTyping(true);

    // Build context of FAQs for the AI
    const faqContext = currentBot.faqs
      .map((f, i) => `[Q${i + 1} (${f.category})]: ${f.question}\n[A${i + 1}]: ${f.answer}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/ai/bot-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical: selectedIndustry,
          bot_name: personaName,
          user_message: text,
          personality: directives,
          tone: personaTone,
          faq_context: faqContext,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([
          ...updatedMessages,
          {
            sender: 'bot',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (data.reasoningTrace) {
          setReasoningTrace(data.reasoningTrace);
        }
        if (data.action_payload) {
          setActionPayload(data.action_payload);
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback matching
      setMessages([
        ...updatedMessages,
        {
          sender: 'bot',
          text: `Thank you for reaching out! As ${personaName}, I'm configured to provide immediate appointment passes, pricing, or product availability. How can I assist you further?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 1-Click "Ask Bot This FAQ"
  const handleTestFaqWithBot = (faq) => {
    setActiveTab('simulator');
    handleSendMessage(faq.question);
  };

  // Categories in current FAQ database
  const categories = ['All', ...new Set(currentBot.faqs.map((f) => f.category))];

  // Filtered FAQs
  const filteredFaqs = currentBot.faqs.filter((faq) => {
    const matchesCategory = selectedFaqCategory === 'All' || faq.category === selectedFaqCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const CurrentIcon = currentBot.icon;

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-sans text-slate-900">
      {/* Top Banner & Industry Selector */}
      <div className="p-6 sm:p-8 bg-slate-950 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                IndustryBot Architecture Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Dynamic Industry AI Agent</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Dynamically switches conversational persona, tone, ethical guardrails, and industry FAQ knowledge bases when you select different business verticals.
            </p>
          </div>

          {/* Active Bot Status Pill */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 self-start lg:self-auto">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              <CurrentIcon className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Current Persona
              </div>
              <div className="text-sm font-black text-white">{currentBot.name}</div>
              <div className="text-xs text-indigo-400 font-bold">{currentBot.category}</div>
            </div>
          </div>
        </div>

        {/* 5 Industry Tabs Selector */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
            Select Business Industry:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {ALL_AGENTIC_BOTS.map((bot) => {
              const ind = industryData[bot.id] || bot;
              const IndIcon = ind.icon;
              const isSelected = ind.id === selectedIndustry;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white shadow-lg ring-2 ring-cyan-400'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-slate-900 text-cyan-300' : 'bg-white/10 text-white'
                    }`}
                  >
                    <IndIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-xs block truncate">{ind.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{ind.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="px-6 sm:px-8 pt-4 pb-0 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Bot Simulator</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'personality'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Persona & Tone Directives</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dynamic FAQ Database ({currentBot.faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Cloud API Bridge</span>
          </button>
        </div>

        <div className="pb-3 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Vertical:</span>
            <span className="font-extrabold text-slate-900">{currentBot.category}</span>
          </span>
        </div>
      </div>

      {/* Main Content Area based on activeTab */}
      <div className="p-6 sm:p-8">
        {/* TAB 1: INTERACTIVE BOT SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Chat Window (WhatsApp Style) */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col h-[600px]">
              {/* WhatsApp Header */}
              <div className="p-4 bg-[#075E54] text-white flex items-center justify-between shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                    {currentBot.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs text-white tracking-wide">{personaName}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                    <p className="text-[10px] text-emerald-100 font-medium">
                      Online • {personaArchetype}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono bg-black/20 px-2.5 py-1 rounded-full text-emerald-200">
                  <Zap className="w-3 h-3" />
                  <span>Gemini 3.8</span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 cyber-dot-matrix bg-[#ECE5DD]/40">
                {messages.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${
                        isUser ? 'ml-auto' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                        <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                          {msg.timestamp || 'Just now'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 w-24 text-slate-400 text-xs shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
              </div>

              {/* Sample Prompts Carousel */}
              <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pl-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" /> Prompts:
                </span>
                {currentBot.samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition cursor-pointer border border-slate-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={`Ask ${personaName} anything about ${currentBot.category}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="p-2.5 rounded-2xl bg-[#075E54] hover:bg-[#128C7E] disabled:opacity-50 text-white transition shadow-md cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Panel: Cognitive Reasoning Trace & Dynamic Action Slip */}
            <div className="lg:col-span-5 space-y-6">
              {/* Cognitive Reasoning Trace HUD */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    COGNITIVE_REASONING_TRACE
                  </span>
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {showReasoning && (
                  <div className="space-y-2.5 font-mono text-xs">
                    <p className="text-slate-300 leading-relaxed text-[11px] bg-black/40 p-3 rounded-xl border border-white/10">
                      {reasoningTrace}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="block text-slate-500 uppercase">Tone Mode</span>
                        <span className="font-bold text-white">{personaTone.split(',')[0]}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="block text-slate-500 uppercase">FAQ Vector Match</span>
                        <span className="font-bold text-emerald-400">100% Vectorized</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Action Pass / Slip Generated */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-300 flex items-center justify-center font-bold">
                      <CurrentIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900">Autonomous Action Slip</h4>
                      <p className="text-[10px] text-slate-500">Auto-Generated Deal / Booking Token</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    READY
                  </span>
                </div>

                {/* Specific Action Card Preview */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-bold">
                    <span className="text-slate-500 text-[11px]">Token Reference</span>
                    <span className="font-mono text-slate-900">
                      {selectedIndustry === 'healthcare'
                        ? 'PASS #MED-7821'
                        : selectedIndustry === 'education'
                        ? 'PASS #EDU-4490'
                        : selectedIndustry === 'retail'
                        ? 'VOUCHER #VIP-25'
                        : selectedIndustry === 'suppliers'
                        ? 'RFQ #B2B-8820'
                        : 'MIX #RMC-9941'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">Industry Target</span>
                    <span className="font-extrabold text-indigo-600">{currentBot.category}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">Primary Offer</span>
                    <span className="font-bold text-slate-800">
                      {selectedIndustry === 'healthcare'
                        ? '₹600 Consultation + 7-Day Followup'
                        : selectedIndustry === 'education'
                        ? 'Free 3-Day Demo Masterclass Pass'
                        : selectedIndustry === 'retail'
                        ? 'Flat 25% Off VIP Spa Combo'
                        : selectedIndustry === 'suppliers'
                        ? '₹52,800/Ton Fe-550D TMT Rebar'
                        : '₹3,750/m³ M25 + Free Transit Pump'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">Settlement Gateway</span>
                    <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Direct Instant UPI Link
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied WhatsApp Action Link!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Copy WhatsApp One-Click Action Link</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center">
                    Simulates instant WhatsApp pass issuance upon customer agreement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERSONA & TONE DIRECTIVES */}
        {activeTab === 'personality' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Tuning Persona for {currentBot.category}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure the demeanor, conversational tone, and behavioral guardrails of your AI agent.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {currentBot.badge}
                </span>
              </div>

              {/* Bot Identity Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Bot Display Name
                  </label>
                  <input
                    type="text"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Persona Archetype
                  </label>
                  <input
                    type="text"
                    value={personaArchetype}
                    onChange={(e) => setPersonaArchetype(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Conversational Tone */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Tone & Demeanor Directives
                </label>
                <input
                  type="text"
                  value={personaTone}
                  onChange={(e) => setPersonaTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Personality Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                {/* Formality Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Formality</span>
                    <span className="font-mono text-indigo-600">{formality}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formality}
                    onChange={(e) => setFormality(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Casual / Warm</span>
                    <span>Corporate / Formal</span>
                  </div>
                </div>

                {/* Sales & Closing Drive */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Closing Urgency</span>
                    <span className="font-mono text-indigo-600">{salesDrive}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={salesDrive}
                    onChange={(e) => setSalesDrive(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Passive Info</span>
                    <span>High Conversion</span>
                  </div>
                </div>

                {/* Response Brevity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Response Brevity</span>
                    <span className="font-mono text-indigo-600">{brevity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brevity}
                    onChange={(e) => setBrevity(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>In-Depth</span>
                    <span>Concise WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* System Instructions / Directives Editor */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Master System Directives (Injected into Gemini Context)
                </label>
                <textarea
                  rows={4}
                  value={directives}
                  onChange={(e) => setDirectives(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Guardrails Checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Active Ethical & Business Guardrails:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentBot.personality.guardrails.map((g, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Changes take effect immediately across all simulated chats and WhatsApp API triggers.
                </span>
                <button
                  onClick={handleSavePersonality}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {isSavedPersonality ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Saved & Synchronized!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-cyan-300" />
                      <span>Save & Apply Persona</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC FAQ DATABASE */}
        {activeTab === 'faqs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Knowledge Base & FAQs for {currentBot.category}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Grounds your AI bot's responses in verified facts, pricing, and operating procedures.
                </p>
              </div>

              <button
                onClick={() => setShowAddFaqModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-300" />
                <span>Add Custom Q&A</span>
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentBot.category} FAQs...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      selectedFaqCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {faq.category}
                      </span>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% Vector Indexed
                    </span>
                    <button
                      onClick={() => handleTestFaqWithBot(faq)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Test with Bot →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-bold">No FAQs found matching your query.</p>
                <button
                  onClick={() => setShowAddFaqModal(true)}
                  className="text-xs text-indigo-600 font-bold underline"
                >
                  Add a new FAQ now
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WHATSAPP CLOUD API BRIDGE */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Deploy {personaName} to WhatsApp Cloud API
                  </h3>
                  <p className="text-xs text-slate-500">
                    Link your Meta Business WhatsApp number to respond 24/7 using this exact persona and FAQ database.
                  </p>
                </div>
              </div>

              {/* Webhook Configuration Box */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Live Webhook Callback URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://api.omniagent.ai/v1/webhook/whatsapp/${selectedIndustry}`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://api.omniagent.ai/v1/webhook/whatsapp/${selectedIndustry}`
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Test Phone Simulation */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Simulated Test Recipient:</span>
                  <span className="font-mono text-emerald-600">+91 98200 44556 (Verified)</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Privacy Shield Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> E.164 Shielded (0 Leaks)
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setActiveTab('simulator')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Test In Simulator Now</span>
                </button>
                <button
                  onClick={() => alert(`Webhook bridge active for ${personaName}. Incoming customer WhatsApp messages will invoke this bot automatically.`)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Verify Webhook Handshake</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD CUSTOM FAQ */}
      {showAddFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">
                  Add Custom FAQ for {currentBot.category}
                </h3>
              </div>
              <button
                onClick={() => setShowAddFaqModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category / Tag</label>
                <input
                  type="text"
                  required
                  value={newFaqCategory}
                  onChange={(e) => setNewFaqCategory(e.target.value)}
                  placeholder="e.g. Pricing, Timings, Service Specs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Question</label>
                <input
                  type="text"
                  required
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="e.g. Do you provide evening slots or emergency dispatch?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Answer / Policy (Bot Response Truth)
                </label>
                <textarea
                  required
                  rows={3}
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="e.g. Yes, our evening desk operates till 9:00 PM. Consultation fee is ₹600."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFaqModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md transition"
                >
                  Add to FAQ Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
