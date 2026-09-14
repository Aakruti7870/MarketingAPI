import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui';
import { Bot, Zap, Star, BarChart3, ArrowRight, Tag } from 'lucide-react';
import LuminaLogo from './LuminaLogo';
import GlobalKeywordSearch from './GlobalKeywordSearch';

export function PublicNavbar() {
  const navigate = useNavigate();
  return (
    <header className="h-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-12 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <LuminaLogo size="md" />
        </Link>
        <div className="hidden md:block">
          <GlobalKeywordSearch compact={true} />
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#64748B]">
        <Link to="/#features" className="hover:text-[#0052FF] transition-colors">Features</Link>
        <Link to="/seo-keywords" className="text-emerald-700 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition">
          <Tag className="w-3.5 h-3.5" />
          <span>Keywords #1</span>
        </Link>
        <Link to="/playground" className="text-[#0052FF] font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition">
          <Zap className="w-3.5 h-3.5 fill-[#0052FF]" />
          <span>AI Studio</span>
        </Link>
        <Link to="/social-ads" className="hover:text-[#0052FF] transition-colors flex items-center gap-1.5">
          <span>Meta & Reels AI</span>
          <span className="font-mono text-[9px] uppercase tracking-wider bg-[#0052FF]/10 text-[#0052FF] px-1.5 py-0.5 rounded border border-[#0052FF]/20 font-semibold">Live</span>
        </Link>
        <Link to="/channels" className="hover:text-[#0052FF] transition-colors">Channels</Link>
        <Link to="/analytics" className="hover:text-[#0052FF] transition-colors flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-[#0052FF]" />
          <span>Analytics</span>
        </Link>
        <Link to="/revenue-pricing" className="hover:text-[#0052FF] transition-colors">Pricing</Link>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="md:hidden">
          <GlobalKeywordSearch compact={true} />
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-xs sm:text-sm font-semibold text-[#0F172A] hover:text-[#0052FF] px-2.5 py-2 cursor-pointer transition-colors"
        >
          Admin Login
        </button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="primary"
          size="md"
          className="group"
        >
          <span>Launch Platform</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-white text-[#64748B] text-xs py-16 px-6 sm:px-12 border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#E2E8F0]">
        <div className="md:col-span-2 space-y-4">
          <LuminaLogo size="md" />
          <p className="text-xs text-[#64748B] leading-relaxed max-w-sm">
            LUMINA360: Autonomous marketing intelligence and conversational hyper-local infrastructure for clinics, academies, salons, and B2B suppliers.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#0F172A]">4.9 / 5.0 Rating from 1,200+ Businesses</span>
          </div>
        </div>

        <div>
          <h4 className="font-mono font-semibold text-[#0F172A] text-xs mb-4 uppercase tracking-wider">Product</h4>
          <ul className="space-y-2.5 text-xs font-normal">
            <li><Link to="/#features" className="hover:text-[#0052FF] transition-colors">Platform Capabilities</Link></li>
            <li><Link to="/social-ads" className="hover:text-[#0052FF] transition-colors">Meta Ads & Reels Virality</Link></li>
            <li><Link to="/channels" className="hover:text-[#0052FF] transition-colors">WhatsApp & Channels</Link></li>
            <li><Link to="/revenue-pricing" className="hover:text-[#0052FF] transition-colors">Pricing & ROI Calculator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-semibold text-[#0F172A] text-xs mb-4 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2.5 text-xs font-normal">
            <li><Link to="/" className="hover:text-[#0052FF] transition-colors">About LUMINA360</Link></li>
            <li><Link to="/login" className="hover:text-[#0052FF] transition-colors">Client Portal</Link></li>
            <li><Link to="/revenue-pricing" className="hover:text-[#0052FF] transition-colors">Plans & Credits</Link></li>
            <li><Link to="/terms" className="hover:text-[#0052FF] transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-semibold text-[#0F172A] text-xs mb-4 uppercase tracking-wider">Infrastructure</h4>
          <ul className="space-y-2.5 text-xs font-normal">
            <li><Link to="/privacy" className="hover:text-[#0052FF] transition-colors">Data Privacy</Link></li>
            <li><Link to="/whatsapp-setup" className="hover:text-[#0052FF] transition-colors">Meta Cloud API</Link></li>
            <li><span className="text-[#64748B]">Zero-Data Leakage Sandboxing</span></li>
            <li>
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
                All Systems Operational
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[#64748B] gap-4 text-[11px]">
        <p className="font-mono">© 2026 LUMINA360 AUTONOMOUS AI OS. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6 font-mono text-[10px] uppercase tracking-wider">
          <Link to="/terms" className="hover:text-[#0F172A] transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-[#0F172A] transition-colors">Privacy</Link>
          <Link to="/whatsapp-setup" className="hover:text-[#0F172A] transition-colors">Compliance</Link>
        </div>
      </div>
    </footer>
  );
}
