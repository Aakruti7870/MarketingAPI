import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import {
  Sparkles,
  Wand2,
  Download,
  Layers,
  Copy,
  CheckCircle2,
  Send,
  MessageSquare,
  Globe,
  RefreshCw,
} from 'lucide-react';

const VERTICAL_PRESETS = [
  {
    id: 'healthcare',
    name: '🏥 Healthcare & Clinic',
    defaultPrompt: 'Modern medical clinic with welcoming doctor, clean diagnostic background and healthcare checkup badge',
    defaultHeadline: 'Preventive Full Body Checkup - Flat 40% Off This Weekend',
    defaultOffer: '40% discount on comprehensive blood & ECG tests',
    sampleImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'education',
    name: '🎓 School & Tuition',
    defaultPrompt: 'Students studying enthusiastically with top books, IIT-JEE and NEET guidance banner, bright graduation caps',
    defaultHeadline: 'Score 95%+ in Boards - Free 3-Day Demo Masterclass',
    defaultOffer: 'Free 3-Day Demo Masterclass with Ex-IITian Faculty',
    sampleImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'retail',
    name: '🏪 Salon, Spa & Retail',
    defaultPrompt: 'Luxury beauty salon and spa aesthetic with facial grooming, glowing ambient light, gift voucher ribbons',
    defaultHeadline: 'Weekend VIP Glow Makeover - Flat 30% Off Combos',
    defaultOffer: '30% Off complete hair spa and facial packages',
    sampleImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'suppliers',
    name: '📦 B2B Wholesale Suppliers',
    defaultPrompt: 'Industrial warehouse with certified TMT steel bars, hardware fittings, wholesale bulk loading trucks',
    defaultHeadline: 'Direct Mill Wholesale Steel - Best Contractor Spot Rate',
    defaultOffer: 'Factory spot prices with same-day dispatch and test certificates',
    sampleImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'rmc',
    name: '🏗️ Ready Mix Concrete',
    defaultPrompt: 'High strength Ready Mix Concrete pour at construction site with transit mixers and promotional banner',
    defaultHeadline: 'Special Monsoon Concrete Deal - ₹3,600 / m³',
    defaultOffer: 'M25 grade concrete with complimentary transit pump service',
    sampleImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
  },
];

export default function AiStudio() {
  const [activeVertical, setActiveVertical] = useState('healthcare');
  const [prompt, setPrompt] = useState(VERTICAL_PRESETS[0].defaultPrompt);
  const [headline, setHeadline] = useState(VERTICAL_PRESETS[0].defaultHeadline);
  const [offer, setOffer] = useState(VERTICAL_PRESETS[0].defaultOffer);
  const [language, setLanguage] = useState('English & Hindi');
  const [loading, setLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(VERTICAL_PRESETS[0].sampleImage);
  const [generatedCopy, setGeneratedCopy] = useState({
    whatsapp_direct: 'Hello {{name}}! 🏥 Metro Care Clinic is hosting a Preventive Health Camp this weekend. Get 48 vital tests including ECG, CBC & Lipid Profile for only ₹999. Reply YES to reserve your slot!',
    whatsapp_urgency: '⚡ Only 12 slots remaining for this Saturday! Book your family health checkup before slots fill up. Tap reply to confirm!',
    sms_short: 'Metro Clinic: 48 Vital Tests @ ₹999 only this Saturday! Book your slot via WhatsApp: wa.me/919820044556',
  });
  const [actionStatus, setActionStatus] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleSelectVertical = (item) => {
    setActiveVertical(item.id);
    setPrompt(item.defaultPrompt);
    setHeadline(item.defaultHeadline);
    setOffer(item.defaultOffer);
    setGeneratedImage(item.sampleImage);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai-studio/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_default',
          prompt,
          headline_text: headline,
          vertical: activeVertical,
        }),
      });
      const data = await res.json();
      if (data.image_url) {
        setGeneratedImage(data.image_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async () => {
    setCopyLoading(true);
    try {
      const res = await fetch('/api/ai-studio/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: 'Local Business',
          vertical: activeVertical,
          offer,
          language,
        }),
      });
      const data = await res.json();
      if (data.copy) {
        setGeneratedCopy(data.copy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCopyLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge status="purple">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> Generative AI Creative Suite
            </Badge>
            <Badge status="success">Multi-Vertical Copy & Banner Studio</Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            AI Marketing Creative & Multi-Lingual Copy Studio
          </h1>
          <p className="text-xs text-slate-500">
            Generate promotional visual banners and high-converting localized WhatsApp copy for Hospitals, Tutors, Salons, Suppliers & Contractors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="info">3 Credits / Banner</Badge>
        </div>
      </div>

      {/* Industry Vertical Quick Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        <span className="text-slate-500 shrink-0">Select Vertical:</span>
        {VERTICAL_PRESETS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectVertical(item)}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap border transition-all ${
              activeVertical === item.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Visual Banner Generator */}
        <Card className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-600" />
              Banner Synthesis Parameters
            </h2>
            <span className="text-xs text-slate-400">Gemini Image Engine</span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Visual Scene Prompt Description
              </label>
              <textarea
                rows="3"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Overlay Headline & Offer Text
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button
              variant="gradient"
              type="submit"
              size="md"
              className="w-full text-xs font-black"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> Synthesizing AI Artwork...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-1.5" /> Generate Banner (3 Credits)
                </>
              )}
            </Button>
          </form>

          {/* Localized Copywriting Generator */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" /> AI Localized Copywriting
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] p-1 text-slate-800 font-bold"
              >
                <option value="English">English</option>
                <option value="English & Hindi">Hinglish</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleGenerateCopy}
              disabled={copyLoading}
            >
              {copyLoading ? 'Drafting Variations...' : '✨ Generate High-Converting Copy'}
            </Button>
          </div>
        </Card>

        {/* Right Output: Creative Banner Preview & Multilingual Copy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Banner Graphic Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Live Ad Creative Preview
              </span>
              <Badge status="success">High Resolution 1:1</Badge>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-900">
              <img
                src={generatedImage}
                alt="AI Banner"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                <span className="bg-indigo-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full self-start shadow-md">
                  Exclusive Offer
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {headline}
                </h3>
                <p className="text-xs text-slate-300">
                  Tap link to chat on WhatsApp & claim instant voucher.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {actionStatus && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  {actionStatus}
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setActionStatus('Banner downloaded to high-res JPG.');
                    setTimeout(() => setActionStatus(''), 3000);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" /> Download Banner
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setActionStatus('Banner attached to WhatsApp Campaign Queue.');
                    setTimeout(() => setActionStatus(''), 3000);
                  }}
                >
                  <Send className="w-4 h-4 mr-1" /> Attach to WhatsApp Broadcast
                </Button>
              </div>
            </div>
          </Card>

          {/* Localized Copy Cards */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              AI Copy Variations ({language})
            </h3>

            {/* Variation 1 */}
            <Card className="p-4 space-y-2 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800">
                  Variation 1: Conversational Direct
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCopy.whatsapp_direct, 'v1')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedKey === 'v1' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {generatedCopy.whatsapp_direct}
              </p>
            </Card>

            {/* Variation 2 */}
            <Card className="p-4 space-y-2 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-800">
                  Variation 2: Urgency & Scarcity Hook
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCopy.whatsapp_urgency, 'v2')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedKey === 'v2' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {generatedCopy.whatsapp_urgency}
              </p>
            </Card>

            {/* Variation 3 */}
            <Card className="p-4 space-y-2 border-l-4 border-l-indigo-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-800">
                  Variation 3: Short SMS Pitch (&lt;160 Chars)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedCopy.sms_short, 'v3')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> {copiedKey === 'v3' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                {generatedCopy.sms_short}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
