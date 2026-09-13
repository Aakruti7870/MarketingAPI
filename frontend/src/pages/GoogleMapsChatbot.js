import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { MapPin, CheckCircle2, Send } from 'lucide-react';

export default function GoogleMapsChatbot() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: 'GOLD-e AI Digital Suite',
    category: 'Infrastructure & Construction',
    address: 'Plot 42, MIDC Industrial Area',
    pincode: '410206',
    phone: '+919820011223'
  });
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome! I am your Google Maps AI Assistant. Let\'s list your business on Google Maps & Search so local customers can find you automatically.' },
    { sender: 'bot', text: 'Step 1: What is your official Business or Clinic name?' }
  ]);
  const [submitted, setSubmitted] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      setMessages(prev => [...prev, { sender: 'user', text: formData.business_name }, { sender: 'bot', text: 'Great! Step 2: What is your business category?' }]);
      setStep(2);
    } else if (step === 2) {
      setMessages(prev => [...prev, { sender: 'user', text: formData.category }, { sender: 'bot', text: 'Step 3: Enter your full physical address and Pincode.' }]);
      setStep(3);
    } else if (step === 3) {
      setMessages(prev => [...prev, { sender: 'user', text: `${formData.address}, Pincode: ${formData.pincode}` }, { sender: 'bot', text: 'Step 4: Confirm your business contact phone number.' }]);
      setStep(4);
    } else if (step === 4) {
      setMessages(prev => [...prev, { sender: 'user', text: formData.phone }, { sender: 'bot', text: 'Everything is set! Click "Publish to Google Maps" below to index your business.' }]);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
        <div>
          <Badge status="purple" className="mb-2"><MapPin className="w-3.5 h-3.5 mr-1 text-red-500" /> Google Maps & Search AI Agent</Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">1-Click Google Maps Business Listing</h1>
          <p className="text-xs text-slate-500">Guided chatbot to publish local business profiles without technical hassle.</p>
        </div>
        <Badge status="info">50 Action Credits / Setup</Badge>
      </div>

      <Card className="space-y-4">
        <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl h-80 overflow-y-auto space-y-3 text-xs font-sans">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3.5 rounded-2xl ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <form onSubmit={handleNext} className="space-y-4 pt-2">
            {step === 1 && (
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Business Name</label>
                <input type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800" required />
              </div>
            )}
            {step === 2 && (
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800">
                  <option>Infrastructure & Construction</option>
                  <option>Real Estate & Property Dealer</option>
                  <option>Hospital & Clinic</option>
                  <option>Retail & Local Store</option>
                </select>
              </div>
            )}
            {step === 3 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Full Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800" required />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">Pincode</label>
                  <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800" required />
                </div>
              </div>
            )}
            {step === 4 && (
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Customer Support Contact Number</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800" required />
              </div>
            )}

            <Button variant="gradient" type="submit" className="w-full py-3">
              Continue Guidance Step <Send className="w-4 h-4 ml-1" />
            </Button>
          </form>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-sm">Business Successfully Submitted to Google Maps!</h3>
            <p className="text-xs text-slate-600">Verification OTP sent to {formData.phone}. Your profile will appear on local search within 24 hours.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
