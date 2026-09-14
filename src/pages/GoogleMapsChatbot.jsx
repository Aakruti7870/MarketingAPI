import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import {
  MapPin,
  CheckCircle2,
  Send,
  Star,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Search,
  ShieldCheck,
  Building2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export default function GoogleMapsChatbot() {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'reviews' | 'seo'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: 'Metro Multispeciality Clinic & Diagnostics',
    category: 'Hospitals & Healthcare',
    address: 'Plot 24, Palm Beach Rd, Sanpada, Navi Mumbai',
    pincode: '400705',
    phone: '+919820044556',
  });
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Welcome! I am your Google Maps AI Assistant. Let's list and optimize your business on Google Maps & Local Search so nearby patients, parents, and buyers find you instantly.",
    },
    { sender: 'bot', text: 'Step 1: What is your official Business or Clinic name?' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [replyingReviewId, setReplyingReviewId] = useState(null);

  useEffect(() => {
    fetch('/api/google-maps/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: formData.business_name },
        { sender: 'bot', text: 'Great! Step 2: What is your business vertical or category?' },
      ]);
      setStep(2);
    } else if (step === 2) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: formData.category },
        { sender: 'bot', text: 'Step 3: Enter your full physical address and Pincode for local GPS pin drop.' },
      ]);
      setStep(3);
    } else if (step === 3) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: `${formData.address}, Pincode: ${formData.pincode}` },
        { sender: 'bot', text: 'Step 4: Confirm your official WhatsApp / contact phone number.' },
      ]);
      setStep(4);
    } else if (step === 4) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: formData.phone },
        { sender: 'bot', text: 'Everything is set! Indexing your business profile and generating local SEO keywords...' },
      ]);
      fetch('/api/google-maps/submit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: 'user_default' }),
      }).catch((err) => console.error(err));
      setSubmitted(true);
    }
  };

  const handleGenerateReply = async (rev) => {
    setReplyingReviewId(rev.id);
    try {
      const res = await fetch('/api/google-maps/generate-review-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: rev.id,
          review_comment: rev.comment,
          rating: rev.rating,
          business_name: formData.business_name,
          category: formData.category,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? { ...r, reply: data.reply } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyingReviewId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge status="purple">
              <MapPin className="w-3.5 h-3.5 mr-1 text-red-500" /> Google Maps Local OS
            </Badge>
            <Badge status="success">Verified Profile Active</Badge>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Google Business Profile (GMB) & AI Review Sentinel
          </h1>
          <p className="text-xs text-slate-500">
            Automate your Google Maps local SEO ranking, register verified business locations, and auto-respond to customer reviews with keywords.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge status="info">Local Pack Rank: #1 in 5km</Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'wizard' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700'
          }`}
        >
          📍 AI Maps Setup Wizard
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'reviews' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700'
          }`}
        >
          ⭐ AI Review Sentinel ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-full transition-all ${
            activeTab === 'seo' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700'
          }`}
        >
          📈 Local SEO & Keyword Booster
        </button>
      </div>

      {/* TAB 1: SETUP WIZARD */}
      {activeTab === 'wizard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900">Conversational Listing Wizard</h2>
              <Badge status="info">Step {step} of 4</Badge>
            </div>

            <div className="h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                      m.sender === 'user'
                        ? 'bg-[#1E3A8A] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {!submitted ? (
              <form onSubmit={handleNext} className="space-y-3 pt-2">
                {step === 1 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Business Name</label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-bold"
                    >
                      <option value="Hospitals & Healthcare">🏥 Hospitals & Healthcare Clinic</option>
                      <option value="Education & Coaching">🎓 School, Education Tutor & Coaching</option>
                      <option value="Salon & Beauty Services">🏪 Salon, Spa & Wellness</option>
                      <option value="B2B Wholesale Suppliers">📦 B2B Wholesale Materials & Hardware</option>
                      <option value="Civil & Ready Mix Concrete">🏗️ Civil Contractor & Ready Mix Concrete</option>
                    </select>
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Full Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                  </div>
                )}

                <Button variant="primary" size="md" type="submit" className="w-full">
                  {step === 4 ? 'Publish to Google Maps (50 Credits)' : 'Continue to Next Step'}
                </Button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-extrabold text-sm text-emerald-900">Submission Successful!</h3>
                <p className="text-xs text-emerald-700">
                  Your business has been dispatched to Google Maps & Local Pack index. Verification SMS OTP will arrive at {formData.phone}.
                </p>
              </div>
            )}
          </Card>

          {/* Live GMB Card Preview */}
          <div className="space-y-6">
            <Card className="space-y-4 border-2 border-slate-200 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Live Google Maps Card Preview
                </span>
                <Badge status="success">Verified Listing</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{formData.business_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{formData.category}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-slate-800">4.9</span>
                    <span className="text-[10px] text-slate-500">(142)</span>
                  </div>
                </div>

                <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {formData.address}, {formData.pincode}
                  </p>
                  <p className="flex items-center gap-2 font-mono">
                    <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-slate-400">📞</span>
                    {formData.phone}
                  </p>
                  <p className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Open Now • 9:00 AM – 8:30 PM
                  </p>
                </div>

                <div className="pt-3 flex gap-2">
                  <span className="bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                    Directions
                  </span>
                  <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    Call
                  </span>
                  <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full">
                    WhatsApp Chat
                  </span>
                </div>
              </div>
            </Card>

            <div className="p-4 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                Local SEO Impact
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Businesses with verified Google Maps profiles and active review responses get <strong>4.7x more phone calls</strong> and high-intent walk-ins than unoptimized competitors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI REVIEW SENTINEL */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-black text-slate-900">Customer Google Reviews & Auto-Reply</h2>
              <p className="text-xs text-slate-500">
                AI analyzes customer sentiment and generates SEO-rich owner replies to build trust and rank higher.
              </p>
            </div>
            <Badge status="purple">Gemini 3.8 Flash Sentinel</Badge>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">{rev.author}</h4>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-2">{rev.date}</span>
                      </div>
                    </div>
                  </div>

                  <Badge status={rev.sentiment === 'positive' ? 'success' : 'warning'}>
                    {rev.sentiment === 'positive' ? 'Positive (5★)' : 'Requires Attention (2★)'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{rev.comment}"
                </p>

                {rev.reply ? (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Owner Response (Published to Google Maps):
                    </span>
                    <p className="text-slate-800 leading-relaxed">{rev.reply}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">No owner reply published yet.</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateReply(rev)}
                      disabled={replyingReviewId === rev.id}
                      className="text-xs font-bold"
                    >
                      {replyingReviewId === rev.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> Generating SEO Reply...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Generate SEO Reply (1 Credit)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL SEO BOOSTER */}
      {activeTab === 'seo' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">Keyword Health</span>
            <h3 className="font-black text-base text-slate-900">Ranked Search Terms</h3>
            <div className="space-y-2 text-xs">
              {[
                { term: 'Best clinic near Vashi', rank: '#1', volume: '1,400 / mo' },
                { term: 'Doctor appointment WhatsApp', rank: '#2', volume: '850 / mo' },
                { term: 'Full body checkup discount', rank: '#1', volume: '2,100 / mo' },
                { term: 'Cardiologist Palm Beach Rd', rank: '#3', volume: '620 / mo' },
              ].map((kw, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">{kw.term}</span>
                  <div className="text-right">
                    <span className="text-emerald-700 font-black mr-2">{kw.rank}</span>
                    <span className="text-[10px] text-slate-400">{kw.volume}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">GMB Optimization</span>
            <h3 className="font-black text-base text-slate-900">Profile Health Score</h3>
            <div className="text-center py-4">
              <span className="text-5xl font-black text-indigo-600">96</span>
              <span className="text-slate-400 font-bold text-sm">/100</span>
              <span className="text-xs text-emerald-700 font-bold block mt-1">Excellent Local Visibility</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <p>✓ High-resolution photos uploaded</p>
              <p>✓ Exact GPS geocoordinates pinned</p>
              <p>✓ 100% review reply rate maintained</p>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider block">Competitor Benchmark</span>
            <h3 className="font-black text-base text-slate-900">Local Pack Share</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your business currently captures <strong>64% of all local impressions</strong> in your pin code area, leading over nearby competitors.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '64%' }}></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
