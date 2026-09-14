import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Globe,
  ExternalLink,
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';

const QUICK_KEYWORDS = [
  { label: 'marketing', desc: 'Autonomous Swarms & Local Campaigns', url: '/dashboard' },
  { label: 'WhatsApp', desc: 'Cloud API & Broadcasts with 98% Read Rate', url: '/channels' },
  { label: 'meta', desc: 'Viral Reels & High-ROAS Instagram Ad Generator', url: '/social-ads' },
  { label: 'leads', desc: 'Google Maps 3km Scraper & Phone Finder', url: '/leads' },
  { label: 'AI Studio', desc: 'Multi-Model Playground (Gemini, Bedrock, NIM)', url: '/playground' },
];

export default function GlobalKeywordSearch({ compact = false }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Global shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!query) {
        handleSearch('marketing');
      }
    }
  }, [isOpen]);

  const handleSearch = async (term) => {
    setQuery(term);
    setLoading(true);
    try {
      const res = await fetch('/api/seo/keywords/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActiveResult(data.top_result);
      }
    } catch (err) {
      console.warn('Keyword search err:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Bar (Header or Inline) */}
      {compact ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-500 text-xs font-medium transition cursor-pointer"
          title="Search keywords: marketing, WhatsApp, meta... (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Search keywords: marketing, WhatsApp, meta...</span>
          <span className="sm:hidden">Keywords</span>
          <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className="w-full max-w-xl p-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3 pl-2 text-slate-400 text-sm">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-slate-600 font-medium">
              Type <strong className="text-blue-600">marketing</strong>, <strong className="text-emerald-600">WhatsApp</strong>, or <strong className="text-purple-600">meta</strong>...
            </span>
          </div>
          <div className="flex items-center gap-2 pr-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold hidden sm:inline-block">
              #1 Top Rank Guaranteed
            </span>
            <kbd className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-mono text-slate-500 border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Spotlight Command Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 sm:pt-20 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search any keyword: marketing, WhatsApp, meta, leads, AI studio..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-sm font-semibold focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => handleSearch('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-200 text-[10px] font-mono text-slate-600">
                ESC
              </kbd>
            </div>

            {/* Quick Keyword Suggestion Chips */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 font-mono">Popular:</span>
              {QUICK_KEYWORDS.map((kw) => (
                <button
                  key={kw.label}
                  onClick={() => handleSearch(kw.label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
                    query.toLowerCase() === kw.label.toLowerCase()
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>{kw.label}</span>
                </button>
              ))}
            </div>

            {/* Results Area */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Resolving #1 keyword ranking...</span>
                </div>
              ) : activeResult ? (
                <div className="space-y-4">
                  {/* Google-Style #1 TOP Organic Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 border-2 border-blue-500/40 shadow-sm relative group">
                    {/* Top Rank Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wide uppercase">
                          #1 TOP RESULT
                        </span>
                        <span>• 100% RELEVANCE MATCH</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>4.98</span>
                        <span className="text-slate-400 font-normal text-[10px]">(1,420 Reviews)</span>
                      </div>
                    </div>

                    {/* URL Breadcrumb */}
                    <div className="text-[11px] text-slate-500 font-mono mb-1 flex items-center gap-1">
                      <span>https://lumina360.ai</span>
                      <span>›</span>
                      <span className="text-blue-600 font-semibold">{activeResult.category?.toLowerCase()}</span>
                      <span>›</span>
                      <span className="text-slate-700">{activeResult.keyword}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => {
                        setIsOpen(false);
                        navigate(activeResult.target_url);
                      }}
                      className="text-base sm:text-lg font-black text-blue-600 hover:underline cursor-pointer tracking-tight"
                    >
                      {activeResult.meta_title}
                    </h3>

                    {/* Description Snippet */}
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {activeResult.meta_description}
                    </p>

                    {/* Deep Sitelinks Grid */}
                    {activeResult.sitelinks && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
                        {activeResult.sitelinks.map((link) => (
                          <button
                            key={link.title}
                            onClick={() => {
                              setIsOpen(false);
                              navigate(link.url);
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200/80 text-left transition flex items-center justify-between group/link cursor-pointer"
                          >
                            <div>
                              <div className="text-xs font-bold text-blue-600 group-hover/link:underline">
                                {link.title}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                {link.desc}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-600 group-hover/link:translate-x-0.5 transition shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 1-Click Launch Button */}
                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">
                        Monthly Volume: <strong className="text-slate-800">{activeResult.monthly_volume}</strong> • Status: <strong className="text-emerald-600">{activeResult.status}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(activeResult.target_url);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Open #{activeResult.rank} Champion</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Competitor Displacement Note */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      LUMINA360 displaced traditional marketing platforms with 44.8% organic CTR.
                    </span>
                    <Link
                      to="/seo-keywords"
                      onClick={() => setIsOpen(false)}
                      className="text-blue-600 font-bold hover:underline shrink-0 text-[11px]"
                    >
                      View Keyword Matrix →
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="h-10 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                LUMINA360 Inbuilt Search Engine
              </span>
              <span>Always on top for marketing, WhatsApp & Meta</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
