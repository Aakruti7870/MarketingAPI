import React from 'react';
import { Search, Radio, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { Card, Button, Badge, StatCard } from '../components/ui';

export default function Dashboard() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto py-4">
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-extrabold">Autonomous B2B Prospecting & AI Sales Automation</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Discovered Leads" value="1,284+" trend="+12% this week" />
        <StatCard label="Closed Revenue" value="₹4.85L" subtext="Via Cashfree links" />
        <StatCard label="Shielded Channels" value="8 Groups" subtext="100% Privacy Protection" />
        <StatCard label="Action Credits" value="2,850" subtext="Remaining Balance" />
      </div>
    </div>
  );
}
