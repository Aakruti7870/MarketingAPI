import React, { useEffect, useMemo, useState } from "react";
import api, { apiError, BACKEND_URL } from "../api";
import { GlassCard, GradientButton, SecondaryButton } from "../components/UIPrimitives";
import { Sparkles, Wand2, Copy, Image as ImageIcon, Hash, Megaphone, Palette, Download, RotateCw, Layers3, Zap } from "lucide-react";
import { toast } from "sonner";

const RATIOS = [
  { id: "1:1", label: "Square 1:1", cls: "aspect-square" },
  { id: "9:16", label: "Story 9:16", cls: "aspect-[9/16]" },
  { id: "16:9", label: "Banner 16:9", cls: "aspect-video" },
];

const CAMPAIGNS = [
  { id: "brand", label: "Brand awareness", icon: Sparkles, brief: "Introduce GOLD-e AI as an AI-powered digital marketing platform for growing businesses. Highlight AI content creation, lead generation, campaign automation, unified conversations and analytics. Premium, modern, trustworthy positioning." },
  { id: "demo", label: "Book a demo", icon: Zap, brief: "Drive business owners to book a GOLD-e AI demo. Show how one platform can create marketing content, capture leads, automate follow-ups and measure results. Strong benefit-led CTA." },
  { id: "leads", label: "Lead generation", icon: Layers3, brief: "Promote GOLD-e AI Lead Engine for businesses that want more qualified leads. Highlight AI lead scoring, sales pipeline visibility, follow-ups and conversion tracking." },
  { id: "automation", label: "Marketing automation", icon: Wand2, brief: "Promote GOLD-e AI automation for repetitive marketing work. Highlight Flows, Autopilot, campaign execution, audience segmentation and analytics. Position it as practical AI for daily business growth." },
];

const imgUrl = (u) => {
  if (!u) return null;
  if (/^https?:\\/\\//i.test(u)) return u;
  return `${BACKEND_URL}${u}`;
};

export default function AIStudio() {
  const [brief, setBrief] = useState(CAMPAIGNS[0].brief);
  const [tone, setTone] = useState("Professional");
  const [ratio, setRatio] = useState("1:1");
  const [busy, setBusy] = useState(false);
  const [packBusy, setPackBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [assets, setAssets] = useState([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [brand, setBrand] = useState({ business_name: "GOLD-e AI", tagline: "AI-powered marketing for growing businesses", industry: "Digital Marketing & AI", primary_color: "#7c4dff" });

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
      if (active && data) setBrand((current) => ({ ...current, ...data }));
    }).catch(() => {});
    loadAssets();
    return () => { active = false; };
  }, []);

  const generate = async () => {
    if (!brief.trim()) return toast.error("Describe your campaign brief");
    setBusy(true);
    setResult(null);
    try {
      const { data } = await api.post("/ai/poster", { brief: brief.trim(), tone, aspect: ratio });
      setResult(data);
      await loadAssets();
      toast.success(data?.image_url ? "Marketing creative generated" : "Copy generated (image unavailable)");
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const generatePack = async () => {
    if (packBusy || busy) return;
    setPackBusy(true);
    try {
      const pack = [
        { aspect: "1:1", brief: `${brief.trim()} Create a social feed creative for GOLD-e AI.` },
        { aspect: "9:16", brief: `${brief.trim()} Create a vertical story/reel creative for GOLD-e AI.` },
        { aspect: "16:9", brief: `${brief.trim()} Create a website/LinkedIn banner creative for GOLD-e AI.` },
      ];
      let latest = null;
      for (const item of pack) {
        const { data } = await api.post("/ai/poster", { brief: item.brief, tone, aspect: item.aspect });
        latest = data;
      }
      setResult(latest);
      await loadAssets();
      toast.success("3-format marketing pack generated");
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail));
    } finally {
      setPackBusy(false);
    }
  };

  const saveBrand = async () => {
    try {
      await api.put("/brand", brand);
      toast.success("GOLD-e AI brand profile saved");
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

  const selectedRatio = useMemo(() => RATIOS.find((r) => r.id === ratio) || RATIOS[0], [ratio]);

  return (
    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-violet-600 to-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">GOLD-e AI</span>
            <span className="rounded-full border border-violet-200 bg-white/60 px-2.5 py-1 text-[10px] font-bold text-violet-700">Own Marketing Mode</span>
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">AI Marketing Studio</h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-slate-500 sm:text-sm">Create GOLD-e AI campaigns, social creatives and ready-to-publish copy from one workspace.</p>
        </div>
        <div className="flex gap-2"><SecondaryButton onClick={() => setBrandOpen(true)} icon={Palette}>Brand Kit</SecondaryButton><GradientButton onClick={generatePack} disabled={busy || packBusy} icon={packBusy ? RotateCw : Layers3}>{packBusy ? "Building pack…" : "3-Format Pack"}</GradientButton></div>
      </div>

      <GlassCard className="!p-4">
        <div className="mb-3 flex items-center gap-2"><Megaphone className="h-4 w-4 text-violet-600" /><p className="text-xs font-black uppercase tracking-wider text-slate-700">Start with a GOLD-e AI campaign</p></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{CAMPAIGNS.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setBrief(item.brief)} className="flex items-center gap-3 rounded-xl border border-violet-100 bg-white/60 p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 text-violet-600"><Icon className="h-4 w-4" /></span><span className="text-xs font-bold text-slate-700">{item.label}</span></button>; })}</div>
      </GlassCard>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <GlassCard className="space-y-5 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-violet-100/70 pb-3"><Wand2 className="h-4 w-4 text-violet-600" /><h2 className="text-sm font-bold text-slate-950">Campaign Creator</h2></div>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Campaign brief</span><textarea rows={7} value={brief} onChange={(e) => setBrief(e.target.value)} disabled={busy || packBusy} className="ge-input-gloss resize-none leading-relaxed" placeholder="Describe your offer, product value and target audience..." /></label>
          <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Tone</span><select value={tone} onChange={(e) => setTone(e.target.value)} disabled={busy || packBusy} className="ge-input-gloss">{["Professional", "Luxury", "Persuasive", "Urgency", "Casual", "Playful"].map((t) => <option key={t}>{t}</option>)}</select></label>
          <div><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600">Primary format</span><div className="grid grid-cols-3 gap-2">{RATIOS.map((r) => <button key={r.id} type="button" onClick={() => setRatio(r.id)} disabled={busy || packBusy} className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${ratio === r.id ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm" : "border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white"}`}>{r.label}</button>)}</div></div>
          <GradientButton onClick={generate} disabled={busy || packBusy} className="w-full py-3" icon={busy ? RotateCw : Sparkles}>{busy ? "Creating…" : "Generate Marketing Creative"}</GradientButton>
          <p className="text-center text-[10px] text-slate-400">Uses your authenticated GOLD-e AI marketing workspace and existing AI creative API.</p>
        </GlassCard>

        <GlassCard className="min-h-[500px] lg:col-span-3">
          <div className="mb-4 flex items-center justify-between border-b border-violet-100/70 pb-3"><div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-violet-600" /><h2 className="text-sm font-bold text-slate-950">Creative Preview</h2></div>{result && <SecondaryButton onClick={() => copy([result.headline, result.caption, result.cta, result.hashtags?.join(" ")].filter(Boolean).join("\n\n"))} icon={Copy} className="px-3 py-1.5 text-xs">Copy marketing copy</SecondaryButton>}</div>
          {!result && !busy && !packBusy && <div className="flex flex-col items-center justify-center py-24 text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200/60 bg-gradient-to-tr from-violet-500/10 to-pink-500/10 text-violet-600"><Megaphone className="h-6 w-6" /></div><p className="text-sm font-semibold text-slate-600">Your GOLD-e AI creative will appear here</p><p className="mt-1 max-w-md text-xs text-slate-400">Use a campaign preset or write your own brief, then generate a single creative or a 3-format marketing pack.</p></div>}
          {(busy || packBusy) && <div className="flex flex-col items-center justify-center py-24 text-center"><div className="mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-violet-200 bg-gradient-to-tr from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 text-violet-600"><Sparkles className="h-7 w-7 animate-spin" /></div><p className="text-sm font-bold text-slate-800">GOLD-e is creating your marketing assets…</p><p className="mt-1 max-w-md text-xs text-slate-400">The 3-format pack creates square, vertical and banner creatives using the existing authenticated image-generation service.</p></div>}
          {result && !busy && !packBusy && <div className="grid gap-5 md:grid-cols-2"><div className={`relative overflow-hidden rounded-2xl border border-white bg-slate-100 shadow-md ${selectedRatio.cls}`}>{result.image_url ? <img src={imgUrl(result.image_url)} alt="GOLD-e AI generated marketing creative" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-6 text-center text-xs text-slate-500">Image unavailable. Your generated marketing copy is still available.</div>}{result.image_url && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />}{result.image_url && result.headline && <div className="absolute inset-x-0 bottom-0 p-4"><p className="font-heading text-xl font-extrabold leading-tight text-white">{result.headline}</p></div>}</div><div className="space-y-3"><Field label="Headline" value={result.headline} onCopy={copy} /><Field label="Caption" value={result.caption} onCopy={copy} /><Field label="CTA" value={result.cta} onCopy={copy} /><div><p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-500"><Hash className="h-3 w-3" /> Hashtags</p><div className="flex flex-wrap gap-1.5">{result.hashtags?.map((h, i) => <span key={i} className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">{h}</span>)}</div></div>{result.image_url && <a href={imgUrl(result.image_url)} target="_blank" rel="noreferrer"><SecondaryButton className="w-full" icon={Download}>Open full image</SecondaryButton></a>}</div></div>}
        </GlassCard>
      </div>

      {assets.length > 0 && <GlassCard><div className="mb-4 flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-wider text-slate-700">GOLD-e AI Creative Library</h3><span className="text-[10px] font-semibold text-slate-400">Your latest generated assets</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{assets.filter((a) => a.image_url).slice(0, 12).map((a) => <div key={a.id} className="group relative aspect-square overflow-hidden rounded-xl border border-white bg-white shadow-sm"><img src={imgUrl(a.image_url)} alt={a.headline || "Generated GOLD-e AI creative"} className="h-full w-full object-cover" /><div className="absolute inset-0 flex items-end bg-slate-950/65 p-2 opacity-0 transition group-hover:opacity-100"><p className="line-clamp-2 text-[10px] font-medium text-white">{a.headline}</p></div></div>)}</div></GlassCard>}

      {brandOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="Close Brand Kit" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => setBrandOpen(false)} /><div className="relative w-full max-w-lg overflow-y-auto rounded-[26px] border border-white bg-white/95 p-6 shadow-2xl backdrop-blur-2xl"><div className="mb-5 flex items-center justify-between"><div><h3 className="font-heading text-lg font-extrabold text-slate-950">GOLD-e AI Brand Kit</h3><p className="mt-1 text-xs text-slate-500">These values are used as the default identity for your marketing workspace.</p></div><button onClick={() => setBrandOpen(false)} className="soft-round" aria-label="Close Brand Kit">×</button></div><div className="space-y-4"><BrandInput label="Business name" value={brand.business_name} onChange={(v) => setBrand({ ...brand, business_name: v })} /><BrandInput label="Tagline" value={brand.tagline} onChange={(v) => setBrand({ ...brand, tagline: v })} /><BrandInput label="Industry" value={brand.industry} onChange={(v) => setBrand({ ...brand, industry: v })} /><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Brand color</span><input type="color" value={brand.primary_color || "#7c4dff"} onChange={(e) => setBrand({ ...brand, primary_color: e.target.value })} className="h-10 w-16 rounded-lg border border-slate-300" /></label><GradientButton className="w-full" onClick={saveBrand}>Save Brand Kit</GradientButton></div></div></div>}
    </div>
  );
}

function BrandInput({ label, value, onChange }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span><input value={value || ""} onChange={(e) => onChange(e.target.value)} className="ge-input-gloss" /></label>; }
function Field({ label, value, onCopy }) { if (!value) return null; return <div className="rounded-xl border border-violet-100 bg-white/70 p-3"><div className="mb-1 flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><button type="button" onClick={() => onCopy(value)} className="text-slate-400 transition hover:text-violet-600" aria-label={`Copy ${label}`}><Copy className="h-3.5 w-3.5" /></button></div><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{value}</p></div>; }
