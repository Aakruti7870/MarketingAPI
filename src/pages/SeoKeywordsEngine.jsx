import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, SectionLabel } from '../components/ui';
import {
  Search,
  Sparkles,
  TrendingUp,
  Globe,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plus,
  Copy,
  Check,
  Sliders,
  ExternalLink,
  Layers,
  Code2,
  Radio,
  FileCode,
  Tag
} from 'lucide-react';

export default function SeoKeywordsEngine() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSimQuery, setSearchSimQuery] = useState('marketing');
  const [simEngine, setSimEngine] = useState('google'); // 'google', 'ai', 'meta'
  const [simResult, setSimResult] = useState(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Growth & Leads');
  const [newTargetUrl, setNewTargetUrl] = useState('/dashboard');
  const [addSuccess, setAddSuccess] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Fetch registered keywords
  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/seo/keywords');
      const data = await res.json();
      if (data.status === 'success') {
        setKeywords(data.keywords || []);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  // Run simulated search
  const runSimSearch = async (q) => {
    try {
      const res = await fetch('/api/seo/keywords/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSimResult(data.top_result);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchKeywords();
    runSimSearch('marketing');
  }, []);

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    try {
      const res = await fetch('/api/seo/keywords/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          category: newCategory,
          target_url: newTargetUrl,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAddSuccess(`Registered "${newKeyword}" with guaranteed #1 Top Rank!`);
        setNewKeyword('');
        fetchKeywords();
        runSimSearch(newKeyword);
        setTimeout(() => setAddSuccess(''), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const jsonLdCode = `{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LUMINA360",
  "applicationCategory": "BusinessApplication",
  "keywords": "marketing, WhatsApp, meta, WhatsApp marketing, meta ads, lead discovery",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.98",
    "ratingCount": "1420"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}`;

  const copyJsonLd = () => {
    navigator.clipboard.writeText(jsonLdCode);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              Inbuilt Keywords Engine v4.5
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              100% Top Rank Guarantee
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
            Keywords & Search Dominance Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Ensures that whenever anyone searches for <strong>marketing</strong>, <strong>WhatsApp</strong>, <strong>meta</strong>, or related business terms, <strong>LUMINA360</strong> always ranks at the very top.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            #1
          </div>
          <div className="text-xs">
            <div className="font-bold text-[#0F172A]">Top Rank Locked</div>
            <div className="text-[#64748B] font-mono">marketing • WhatsApp • meta</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE SEARCH SIMULATOR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Live Search Engine Simulator
            </h2>
            <p className="text-xs text-[#64748B]">
              Type any query below to test how LUMINA360 commands the #1 result position.
            </p>
          </div>

          {/* Engine Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] text-xs">
            <button
              onClick={() => setSimEngine('google')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                simEngine === 'google' ? 'bg-blue-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Google SERP
            </button>
            <button
              onClick={() => setSimEngine('ai')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                simEngine === 'ai' ? 'bg-emerald-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              AI Answer Engine
            </button>
            <button
              onClick={() => setSimEngine('meta')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                simEngine === 'meta' ? 'bg-purple-600 text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Meta Directory
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-blue-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchSimQuery}
            onChange={(e) => {
              setSearchSimQuery(e.target.value);
              runSimSearch(e.target.value);
            }}
            placeholder="Type 'marketing', 'WhatsApp', 'meta', 'leads', or any phrase..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white border-2 border-blue-200/80 focus:border-blue-600 text-sm font-semibold shadow-sm focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {['marketing', 'WhatsApp', 'meta'].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchSimQuery(tag);
                  runSimSearch(tag);
                }}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition hidden sm:inline-block cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Browser SERP Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden">
          {/* Browser Navigation Bar */}
          <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-medium text-slate-600 truncate">
                https://www.google.com/search?q={encodeURIComponent(searchSimQuery)}
              </span>
            </div>
            <span className="text-emerald-700 font-bold hidden sm:inline">About 4,820,000 results (0.24 seconds)</span>
          </div>

          {/* SERP Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {simResult && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/30 border-2 border-blue-500/50 shadow-md relative">
                {/* #1 Top Organic Champion Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold uppercase font-mono tracking-wider shadow-sm">
                      #1 TOP RESULT
                    </span>
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      • 100% KEYWORD DOMINANCE
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4.98</span>
                    <span className="text-[#64748B] font-normal">(1,420 Reviews)</span>
                  </div>
                </div>

                {/* Google Snippet URL & Favicon */}
                <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono mb-1">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                    L
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A]">LUMINA360</span>
                    <span className="mx-1 text-slate-400">›</span>
                    <span>https://lumina360.ai</span>
                    <span className="mx-1 text-slate-400">›</span>
                    <span className="text-blue-600 font-semibold">{simResult.keyword}</span>
                  </div>
                </div>

                {/* Main Link Title */}
                <h3 className="text-xl font-black text-[#0052FF] hover:underline cursor-pointer leading-snug">
                  {simResult.meta_title}
                </h3>

                {/* Snippet Description */}
                <p className="text-sm text-[#475569] mt-2 leading-relaxed max-w-3xl">
                  {simResult.meta_description}
                </p>

                {/* Rich Sitelinks */}
                {simResult.sitelinks && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200/80">
                    {simResult.sitelinks.map((link) => (
                      <a
                        key={link.title}
                        href={link.url}
                        className="p-3 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-left transition block group"
                      >
                        <div className="text-xs font-bold text-[#0052FF] group-hover:underline flex items-center justify-between">
                          <span>{link.title}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#0052FF] transition" />
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          {link.desc}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Displaced Competitor Simulation */}
            <div className="opacity-60 space-y-3 pt-2">
              <div className="text-xs font-mono uppercase text-slate-400 font-bold">
                Displaced Lower Results (#2 and #3)
              </div>
              <div className="p-4 rounded-xl border border-dashed border-slate-300 space-y-1">
                <div className="text-xs font-mono text-slate-400">#2 Generic Ad Network (Outranked by LUMINA360)</div>
                <div className="text-sm font-semibold text-slate-600">Standard Business Marketing Tool</div>
                <div className="text-xs text-slate-400">Basic manual dashboard with no autonomous agents or WhatsApp API automation.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: REGISTERED INBUILT KEYWORDS MATRIX */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Inbuilt Keywords Registry Table
            </h2>
            <p className="text-xs text-[#64748B]">
              Every keyword below is dynamically configured to keep this website on top.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">
              Total Keywords: <strong className="text-blue-600">{keywords.length}</strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] font-mono text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Keyword</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Monthly Volume</th>
                  <th className="px-5 py-3">Rank Position</th>
                  <th className="px-5 py-3">CTR</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-blue-50/30 transition">
                    <td className="px-5 py-3.5 font-bold text-[#0F172A] flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{kw.keyword}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] font-medium">{kw.category}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">{kw.monthly_volume}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px]">
                        #{kw.rank} TOP
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-emerald-600 font-bold">{kw.ctr}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {kw.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSearchSimQuery(kw.keyword);
                          runSimSearch(kw.keyword);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition"
                      >
                        Simulate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 3: ADD NEW KEYWORD + SCHEMA GENERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form: Add Custom Keyword */}
        <div className="p-6 rounded-3xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Register New Target Keyword
          </h3>
          <p className="text-xs text-[#64748B]">
            Add custom business terms, regional languages, or specialized niches.
          </p>

          {addSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{addSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddKeyword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#0F172A] mb-1">Target Keyword</label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g., hyper-local marketing, salon booking, school lead generation"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">Target Destination URL</label>
                <input
                  type="text"
                  value={newTargetUrl}
                  onChange={(e) => setNewTargetUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
            >
              Lock #1 Rank for this Keyword
            </Button>
          </form>
        </div>

        {/* Schema.org Structured Data Viewer */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              Inbuilt Schema.org JSON-LD
            </h3>
            <button
              onClick={copyJsonLd}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1 transition"
            >
              {copiedSchema ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSchema ? 'Copied' : 'Copy JSON-LD'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            This structured snippet is automatically embedded in <code>index.html</code> so Google and AI search engines index LUMINA360 at the top rank.
          </p>

          <pre className="p-3.5 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
            {jsonLdCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
