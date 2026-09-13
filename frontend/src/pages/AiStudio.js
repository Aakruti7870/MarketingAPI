import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { Sparkles, Wand2, Download, Layers } from 'lucide-react';

export default function AiStudio() {
  const [prompt, setPrompt] = useState('High strength Ready Mix Concrete pour at construction site with promotional banner');
  const [headline, setHeadline] = useState('Special Monsoon RMC Deal - 15% OFF');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setGeneratedImage('https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-200/60 pb-5">
        <div>
          <Badge status="purple" className="mb-2"><Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> Generative AI Marketing Tool</Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Image & Marketing Banner Studio</h1>
          <p className="text-xs text-slate-500">Generate promotional banners and social media graphics using automated AI prompts.</p>
        </div>
        <Badge status="info">3 Action Credits / Generation</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-2">Campaign Prompt Description</label>
              <textarea
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-2">Overlay Headline Text</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${aspectRatio === ratio ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'}`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="gradient" type="submit" disabled={loading} className="w-full py-3.5">
              {loading ? <Wand2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Synthesizing AI Media...' : 'Generate Marketing Banner'}
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Live Canvas Preview ({aspectRatio})
            </h2>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square max-h-[420px] flex items-center justify-center shadow-inner">
              <img src={generatedImage} alt="AI Banner Preview" className="w-full h-full object-cover opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-white/20 text-white">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Promotional Overlay</span>
                <p className="text-base font-black leading-tight mt-0.5">{headline}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="primary" size="sm" className="w-full" onClick={() => alert('Banner downloaded successfully.')}>
              <Download className="w-4 h-4" /> Download Banner
            </Button>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => alert('Attached to WhatsApp Campaign.')}>
              Attach to WhatsApp Broadcast
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
