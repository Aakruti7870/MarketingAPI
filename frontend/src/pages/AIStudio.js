import React, { useEffect, useState } from "react";
import api, { apiError, BACKEND_URL } from "../api";
import { GlassCard, GradientButton, SecondaryButton } from "../components/UIPrimitives";
import { Sparkles, Wand2, Copy, Image as ImageIcon, Hash, Megaphone, Palette, Download, Check, AlertCircle, RotateCw } from "lucide-react";
import { toast } from "sonner";

const RATIOS = [
  { id: "1:1", label: "Square 1:1", cls: "aspect-square" },
  { id: "9:16", label: "Story 9:16", cls: "aspect-[9/16]" },
  { id: "16:9", label: "Banner 16:9", cls: "aspect-video" },
];

const imgUrl = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${BACKEND_URL}${u}`;
};

export default function AIStudio() {
  const [brief, setBrief] = useState("Diwali 15% off on premium ready-mix concrete");
  const [tone, setTone] = useState("Luxury");
  const [ratio, setRatio] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [assets, setAssets] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brand, setBrand] = useState({ business_name: "", tagline: "", industry: "", primary_color: "#D4AF37" });

  const loadAssets = async () => {
    try {
      const { data } = await api.get("/assets");
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("AI Studio assets load failed:", err);
    }
  };

  useEffect(() => {
    let active = true;
    api.get("/brand").then(({ data }) => {
      if (active) setBrand((current) => ({ ...current, ...(data || {}) }));
    }).catch(() => {});
    loadAssets();
    return () => { active = false; };
  }, []);

  const generate = async () => {
    if (!brief.trim()) return toast.error("Describe your campaign brief");
    setBusy(true);
    setResult(null);
    try {
      // Production contract: /api/ai/poster accepts brief, tone and aspect.
      const { data } = await api.post("/ai/poster", { brief: brief.trim(), tone, aspect: ratio });
      setResult(data);
      await loadAssets();
      toast.success(data?.image_url ? "Poster generated" : "Copy generated (image unavailable)");
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const saveBrand = async () => {
    try {
      await api.put("/brand", brand);
      toast.success("Brand profile saved");
      setBrandOpen(false);
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    }
  };

  const copy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const selectedRatio = RATIOS.find((r) => r.id === ratio) || RATIOS[0];

  return (
    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">AI Marketing Studio</h1>
            <span className="rounded-full bg-gradient-to-r from-violet-600 to-rose-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">AI</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Generate original AI poster images, ad copy, captions and CTAs from a campaign brief.</p>
        </div>
        <SecondaryButton onClick={() => setBrandOpen(true)} icon={Palette}>Brand Kit</SecondaryButton>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <GlassCard className="space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-violet-100/70 pb-3">
            <Wand2 className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-bold text-slate-950">Creator</h2>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Campaign brief</span>
            <textarea rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} disabled={busy} className="ge-input-gloss resize-none leading-relaxed" placeholder="Describe your offer, product value and target audience..." />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Tone</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)} disabled={busy} className="ge-input-gloss">
              {["Luxury", "Persuasive", "Urgency", "Casual", "Playful", "Professional"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Aspect ratio</span>
            <div className="grid grid-cols-3 gap-2">
              {RATIOS.map((r) => (
                <button key={r.id} type="button" onClick={() => setRatio(r.id)} disabled={busy} className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${ratio === r.id ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm" : "border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <GradientButton onClick={generate} disabled={busy} className="w-full py-3" icon={busy ? RotateCw : Sparkles}>
            {busy ? "Designing…" : "Generate Poster"}
          </GradientButton>
        </GlassCard>

        <GlassCard className="min-h-[500px] lg:col-span-3">
          <div className="mb-4 flex items-center justify-between border-b border-violet-100/70 pb-3">
            <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-violet-600" /><h2 className="text-sm font-bold text-slate-950">Preview</h2></div>
            {result?.copy && <SecondaryButton onClick={() => copy(result.copy)} icon={Copy} className="px-3 py-1.5 text-xs">Copy</SecondaryButton>}
          </div>

          {!result && !busy && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200/60 bg-gradient-to-tr from-violet-500/10 to-pink-500/10 text-violet-600"><Megaphone className="h-6 w-6" /></div>
              <p className="text-sm font-semibold text-slate-600">Your AI poster and copy will appear here</p>
              <p className="mt-1 text-xs text-slate-400">Submit a campaign brief to generate high-intent creative assets.</p>
            </div>
          )}
          {busy && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-violet-200 bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 text-violet-600"><Sparkles className="h-7 w-7 animate-spin" /></div>
              <p className="text-sm font-bold text-slate-800">GOLD-e is generating an original creative…</p>
              <p className="mt-1 max-w-md text-xs text-slate-400">Copy and image generation may take up to the provider timeout.</p>
            </div>
          )}
          {result && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className={`relative overflow-hidden rounded-2xl border border-white bg-slate-100 shadow-md ${selectedRatio.cls}`}>
                {result.image_url ? <img src={imgUrl(result.image_url)} alt="AI generated poster" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-6 text-center text-xs text-slate-500">Image unavailable. Your generated copy is still available.</div>}
                {result.image_url && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />}
                {result.image_url && result.headline && <div className="absolute inset-x-0 bottom-0 p-4"><p className="font-heading text-xl font-extrabold leading-tight text-white">{result.headline}</p></div>}
              </div>
              <div className="space-y-3">
                <Field label="Headline" value={result.headline} onCopy={copy} />
                <Field label="Caption" value={result.caption} onCopy={copy} />
                <Field label="CTA" value={result.cta} onCopy={copy} />
                <div>
                  <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-500"><Hash className="h-3 w-3" /> Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">{result.hashtags?.map((h, i) => <span key={i} className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">{h}</span>)}</div>
                </div>
                {result.image_url && <a href={imgUrl(result.image_url)} target="_blank" rel="noreferrer"><SecondaryButton className="w-full" icon={Download}>Open full image</SecondaryButton></a>}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {assets.length > 0 && (
        <GlassCard>
          <h3 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-700">Recent Creatives</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {assets.filter((a) => a.image_url).slice(0, 12).map((a) => (
              <div key={a.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                <img src={imgUrl(a.image_url)} alt={a.headline || "Generated creative"} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-end bg-slate-950/65 p-2 opacity-0 transition group-hover:opacity-100"><p className="line-clamp-2 text-[10px] font-medium text-white">{a.headline}</p></div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {brandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close Brand Kit" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => setBrandOpen(false)} />
          <div className="relative w-full max-w-lg overflow-y-auto rounded-[26px] border border-white bg-white/95 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="mb-5 flex items-center justify-between"><h3 className="font-heading text-lg font-extrabold text-slate-950">Brand Kit</h3><button onClick={() => setBrandOpen(false)} className="soft-round">×</button></div>
            <div className="space-y-4">
              <BrandInput label="Business name" value={brand.business_name} onChange={(v) => setBrand({ ...brand, business_name: v })} />
              <BrandInput label="Tagline" value={brand.tagline} onChange={(v) => setBrand({ ...brand, tagline: v })} />
              <BrandInput label="Industry" value={brand.industry} onChange={(v) => setBrand({ ...brand, industry: v })} />
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Brand color</span><input type="color" value={brand.primary_color || "#D4AF37"} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="h-10 w-16 rounded-lg border border-slate-300" /></label>
              <GradientButton className="w-full" onClick={saveBrand}>Save Brand Kit</GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandInput({ label, value, onChange }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><input value={value || ""} onChange={(e) => onChange(e.target.value)} className="ge-input-gloss" /></label>;
}

function Field({ label, value, onCopy }) {
  if (!value) return null;
  return <div className="rounded-xl border border-violet-100 bg-white/70 p-3"><div className="mb-1 flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><button type="button" onClick={() => onCopy(value)} className="text-slate-400 transition hover:text-violet-600" aria-label={`Copy ${label}`}><Copy className="h-3.5 w-3.5" /></button></div><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{value}</p></div>;
}
