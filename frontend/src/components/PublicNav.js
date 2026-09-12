import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from './ui';
import { ShieldCheck } from 'lucide-react';

export function PublicNavbar() {
  const navigate = useNavigate();
  return (
    <header className="h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-10 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-600/30">M</div>
        <div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">MarketingAPI</span>
          <Badge status="info" className="ml-2 text-[10px] py-0 px-1.5">v2.0 Revenue Engine</Badge>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Log In</Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started Free</Button>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-6 sm:px-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-500">
        <p>© 2026 MarketingAPI Technologies. All rights reserved.</p>
      </div>
    </footer>
  );
}
