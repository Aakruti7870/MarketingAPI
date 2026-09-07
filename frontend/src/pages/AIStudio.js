import React, { useState } from "react";
import api from "../api";
import { Button, Card, Badge, Select, Textarea } from "../components/ui";
import { Sparkles, Wand2, Copy, Image as ImageIcon, Hash, Megaphone } from "lucide-react";
import { toast } from "sonner";

const RATIOS = [{ id: "1:1", label: "Square 1:1", cls: "aspect-square" }, { id: "9:16", label: "Story 9:16", cls: "aspect-[9/16]" }, { id: "16:9", label: "Banner 16:9", cls: "aspect-video" }];

export default function AIStudio() {
  const [prompt, setPrompt] = useState("Premium ready-mix concrete for modern construction");
  const [tone, setTone] = useState("Luxury");
  const [ratio, setRatio] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return toast.error("Describe your product or offer");
    setBusy(true); setResult(null);
    try {
      const { data } = await api.post("/ai/marketing", { prompt, tone });
      setResult(data);
      toast.success("Creative generated");
    } catch { toast.error("AI unavailable"); }
    setBusy(false);
  };

  const copy = (t) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">AI Marketing Studio <Badge tone="gold">HOT</Badge></h1>
        <p className="text-slate-500 text-sm mt-1">Generate posters, ad copy, captions & CTAs in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><Wand2 className="w-4 h-4 text-gold-500" /> Creator</h3>
          <div className="space-y-4">
            <Textarea label="Product / Offer" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} data-testid="studio-prompt" />
            <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value)}>{["Luxury", "Persuasive", "Urgency", "Casual", "Playful", "Professional"].map((t) => <option key={t}>{t}</option>)}</Select>
            <div>
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Aspect ratio</span>
              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map((r) => (
                  <button key={r.id} onClick={() => setRatio(r.id)} data-testid={`ratio-${r.id}`}
                    className={`px-2 py-2 rounded-xl border text-xs font-medium transition ${ratio === r.id ? "gold-gradient text-ink border-transparent" : "bg-white border-slate-200 text-slate-600 hover:border-gold-300"}`}>{r.label}</button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={generate} disabled={busy} data-testid="generate-creative-btn"><Sparkles className="w-4 h-4" /> {busy ? "Generating…" : "Generate Creative"}</Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gold-500" /> Preview</h3>
          {!result && !busy && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Megaphone className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm">Your generated poster & copy will appear here</p>
            </div>
          )}
          {busy && <div className="py-20 text-center text-slate-500 text-sm">GOLD-e is designing your creative…</div>}
          {result && (
            <div className="grid md:grid-cols-2 gap-5 animate-fade-up" data-testid="creative-result">
              <div className={`relative rounded-2xl overflow-hidden ${RATIOS.find((r) => r.id === ratio).cls} bg-ink`}>
                <img src={result.image} alt="creative" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <p className="gold-text font-heading font-extrabold text-2xl leading-tight">{result.headline}</p>
                  <button className="mt-3 self-start gold-gradient text-ink text-xs font-bold px-4 py-2 rounded-lg">{result.cta}</button>
                </div>
              </div>
              <div className="space-y-3">
                <Field label="Headline" value={result.headline} onCopy={copy} />
                <Field label="Caption" value={result.caption} onCopy={copy} />
                <Field label="CTA" value={result.cta} onCopy={copy} />
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags?.map((h, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gold-50 text-gold-700 font-medium">{h}</span>)}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => toast.success("Sent to campaign builder")} data-testid="send-to-campaign"><Megaphone className="w-4 h-4" /> Send to Campaign</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value, onCopy }) {
  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <button onClick={() => onCopy(value)} className="text-slate-400 hover:text-gold-600"><Copy className="w-3.5 h-3.5" /></button>
      </div>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}
