import React from "react";
import { Users, Search, Plus, Upload, Sparkles } from "lucide-react";
import { Card, Button, Input } from "../components/ui";

export default function Leads(){
  return <div className="page-shell">
    <div className="page-hero"><div><div className="eyebrow"><Sparkles size={13}/> LEAD ENGINE</div><h1>Turn conversations into pipeline.</h1><p>Capture, qualify and act on leads from one focused workspace.</p></div><Button><Plus size={16}/> Add lead</Button></div>
    <div className="grid gap-4 md:grid-cols-3"><Card><div className="stat-label">TOTAL LEADS</div><div className="stat-value"><Users size={20}/> —</div></Card><Card><div className="stat-label">HOT LEADS</div><div className="stat-value">—</div></Card><Card><div className="stat-label">AI SCORE</div><div className="stat-value">Ready</div></Card></div>
    <Card className="mt-5"><div className="flex flex-wrap items-center gap-3"><div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/><Input className="pl-9" placeholder="Search leads…" /></div><Button variant="outline"><Upload size={16}/> Import</Button><div className="flex gap-2"><Button variant="ghost">All</Button><Button variant="ghost">Hot</Button><Button variant="ghost">Warm</Button><Button variant="ghost">Cold</Button></div></div><div className="mt-5 rounded-2xl border border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">Your lead records will appear here.</div></Card>
  </div>
}