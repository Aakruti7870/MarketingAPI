import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { CheckCircle2, ShieldCheck, Save } from 'lucide-react';

export default function WhatsAppSetup() {
  const [businessName, setBusinessName] = useState('GOLD-e AI Digital Suite');
  const [phoneID, setPhoneID] = useState('109823908123908');
  const [wabaID, setWabaID] = useState('982390812390812');
  const [token, setToken] = useState('EAAG...............');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">WhatsApp Cloud API Credentials</h1>
          <p className="text-xs text-slate-500">Connect your Meta WhatsApp Business API account to trigger automated broadcasts and AI negotiations.</p>
        </div>
        <Badge status="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> API Connected</Badge>
      </div>

      <Card className="space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Business / Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Phone Number ID (Meta App)</label>
              <input
                type="text"
                value={phoneID}
                onChange={(e) => setPhoneID(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">WhatsApp Business Account ID (WABA ID)</label>
            <input
              type="text"
              value={wabaID}
              onChange={(e) => setWabaID(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Meta System User Permanent Access Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1-to-1 Broadcast Privacy Shield Active
            </span>
            <Button variant="primary" type="submit" size="md">
              <Save className="w-4 h-4" /> {saved ? 'Saved Successfully!' : 'Save Connection Credentials'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
