import React, { useEffect, useState } from "react";
import api, { apiError, BACKEND_URL } from "../api";
import { Button, Card, Badge, Select, Textarea, Input, Modal } from "../components/ui";
import { Sparkles, Wand2, Copy, Image as ImageIcon, Hash, Megaphone, Palette, Download } from "lucide-react";
import { toast } from "sonner";

const RATIOS = [{ id: "1:1", label: "Square 1:1", cls: "aspect-square" }, { id: "9:16", label: "Story 9:16", cls: "aspect-[9/16]" }, { id: "16:9", label: "Banner 16:9", cls: "aspect-video" }];
const imgUrl = (u) => (u ? `${BACKEND_URL}${u}` : null);

export default function AIStudio() {
  const [brief, setBrief] = useState("Diwali 15% off on premium ready-mix concrete");
  const [tone, setTone] = useState("Luxury");
  const [ratio, setRatio] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [assets, setAssets] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brand, setBrand] = useState({ business_name: "", tagline: "", industry: "", primary_color: "#D4AF37" });

  const loadAssets = () => api.get("/assets").then((r) => setAssets(r.data));
  useEffect(() => { loadAssets(); api.get("/brand").then((r) => setBrand({ ...brand, ...r.data })); }, []);

  const generate = async () => {
    if (!brief.trim()) return toast.error("Describe your campaign brief");
    setBusy(true); setResult(null);
    try {
      const { data } = await api.post("/ai/poster", { brief, tone, aspect: ratio });
      setResult(data);
      loadAssets();
      toast.success(data.image_url ? "Poster generated" : "Copy generated (image unavailable)");
    } catch (err) { toast.error(apiError(err.response?.data?.detail)); }
    setBusy(false);
  };

  const saveBrand = async () => {
    await api.put("/brand", brand);
    toast.success("Brand profile saved");
    setBrandOpen(false);
  };
  const copy = (t) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">AI Marketing Studio <Badge tone="gold">HOT</Badge></h1>
          <p className="text-slate-500 text-sm mt-1">Generate original AI poster images, ad copy, captions & CTAs from a campaign brief.</p>
        </div>
        <Button variant="outline" onClick={() => setBrandOpen(true)} data-testid="brand-btn"><Palette className="w-4 h-4" /> Brand Kit</Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 p-6 h-fit">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><Wand2 className="w-4 h-4 text-gold-500" /> Creator</h3>
          <div className="space-y-4">
            <Textarea label="Campaign brief" rows={3} value={brief} onChange={(e) => setBrief(e.target.value)} data-testid="studio-prompt" />
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
            <Button className="w-full" onClick={generate} disabled={busy} data-testid="generate-creative-btn"><Sparkles className="w-4 h-4" /> {busy ? "Designing (up to 60s)…" : "Generate Poster"}</Button>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-gold-500" /> Preview</h3>
          {!result && !busy && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Megaphone className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm">Your AI poster & copy will appear here</p>
            </div>
          )}
          {busy && <div className="py-20 text-center text-slate-500 text-sm"><div className="w-10 h-10 mx-auto rounded-xl gold-gradient animate-pulse mb-3" />GOLD-e is generating an original image…</div>}
          {result && (
            <div className="grid md:grid-cols-2 gap-5 animate-fade-up" data-testid="creative-result">
              <div className={`relative rounded-2xl overflow-hidden ${RATIOS.find((r) => r.id === ratio).cls} bg-ink`}>
                {result.image_url ? <img src={imgUrl(result.image_url)} alt="poster" className="w-full h-full object-cover" data-testid="poster-image" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">Image unavailable</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="gold-text font-heading font-extrabold text-xl leading-tight">{result.headline}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Field label="Headline" value={result.headline} onCopy={copy} />
                <Field label="Caption" value={result.caption} onCopy={copy} />
                <Field label="CTA" value={result.cta} onCopy={copy} />
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">{result.hashtags?.map((h, i) => <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gold-50 text-gold-700 font-medium">{h}</span>)}</div>
                </div>
                {result.image_url && <a href={imgUrl(result.image_url)} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><Download className="w-4 h-4" /> Open full image</Button></a>}
              </div>
            </div>
          )}
        </Card>
      </div>

      {assets.length > 0 && (
        <Card className="p-6">
          <h3 className="font-heading font-bold text-slate-900 mb-4">Recent Creatives</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {assets.filter((a) => a.image_url).slice(0, 12).map((a) => (
              <div key={a.id} className="rounded-xl overflow-hidden border border-slate-200 group relative aspect-square">
                <img src={imgUrl(a.image_url)} alt={a.headline} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                  <p className="text-[10px] text-gold-200 font-medium line-clamp-2">{a.headline}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={brandOpen} onClose={() => setBrandOpen(false)} title="Brand Kit">
        <div className="space-y-4">
          <Input label="Business name" value={brand.business_name || ""} onChange={(e) => setBrand({ ...brand, business_name: e.target.value })} data-testid="brand-name" />
          <Input label="Tagline" value={brand.tagline || ""} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
          <Input label="Industry" value={brand.industry || ""} onChange={(e) => setBrand({ ...brand, industry: e.target.value })} />
          <label className="block">
            <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Brand color</span>
            <input type="color" value={brand.primary_color || "#D4AF37"} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="w-16 h-10 rounded-lg border border-slate-300" />
          </label>
          <Button className="w-full" onClick={saveBrand} data-testid="save-brand-btn">Save Brand Kit</Button>
        </div>
      </Modal>
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
