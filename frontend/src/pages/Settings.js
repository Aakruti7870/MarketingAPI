import React, { useEffect, useState } from "react";
import { Bot, Check, Monitor, Moon, Settings2, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const PREFS_KEY = "golde-ui-preferences";
const DEFAULT_PREFS = { notifications: true, suggestions: true, autoSave: true, productTips: false };

function readPrefs() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "{}");
    return { ...DEFAULT_PREFS, ...stored };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState(readPrefs);

  useEffect(() => {
    try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(settings)); } catch { /* storage may be disabled */ }
  }, [settings]);

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.18em] text-violet-500"><Sparkles className="h-4 w-4" />Settings</div>
        <h1 className="font-heading text-3xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-4xl">Personalize your GOLD-e AI workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Theme and interface preferences are remembered on this device and applied across public and signed-in screens.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="app-panel p-6">
            <SectionTitle icon={Bot} title="Assistant preferences" sub="Tune the everyday AI experience." />
            <div className="mt-5 space-y-3">
              <SettingRow label="Smart prompt suggestions" text="Show contextual starter prompts in the assistant." enabled={settings.suggestions} onClick={() => toggle("suggestions")} />
              <SettingRow label="Auto-save conversations" text="Keep chat history available in your workspace." enabled={settings.autoSave} onClick={() => toggle("autoSave")} />
              <SettingRow label="Product tips" text="Show occasional workflow tips and feature guidance." enabled={settings.productTips} onClick={() => toggle("productTips")} />
            </div>
          </section>

          <section className="app-panel p-6">
            <SectionTitle icon={ShieldCheck} title="Security & privacy" sub="Workspace controls remain server-enforced." />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard label="Tenant isolation" value="Enabled" />
              <InfoCard label="Credential vault" value="Encrypted" />
              <InfoCard label="Session" value="Secure token" />
              <InfoCard label="Contact privacy" value="Protected" />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="app-panel p-6">
            <SectionTitle icon={Settings2} title="Workspace experience" sub="Choose how GOLD-e AI looks and behaves." />
            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-500">Interface theme</label>
                  <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-600">Active: {resolvedTheme}</span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Interface theme">
                  <ThemeChoice theme="light" current={theme} icon={Sun} label="Light" onClick={setTheme} />
                  <ThemeChoice theme="system" current={theme} icon={Monitor} label="System" onClick={setTheme} />
                  <ThemeChoice theme="dark" current={theme} icon={Moon} label="Dark" onClick={setTheme} />
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">System follows your device automatically. Light and Dark override the device preference.</p>
              </div>
              <SettingRow label="Notifications" text="Workspace activity and important updates." enabled={settings.notifications} onClick={() => toggle("notifications")} />
            </div>
          </section>

          <section className="app-panel brand-soft-panel p-6">
            <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-brand"><Sparkles className="h-5 w-5" /></div>
            <h3 className="mt-4 font-heading text-lg font-extrabold text-slate-900">GOLD-e AI</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">One professional workspace for AI assistance, lead operations, campaigns, flows and automation.</p>
            <div className="mt-4 text-xs font-bold text-violet-600">gold-etechapp.com</div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ThemeChoice({ theme, current, icon: Icon, label, onClick }) {
  const selected = current === theme;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onClick(theme)}
      className={`theme-choice relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-extrabold transition ${selected ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm ring-2 ring-violet-100" : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-700"}`}
      data-testid={`theme-${theme}`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {selected && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white"><Check className="h-3 w-3" /></span>}
    </button>
  );
}

function SectionTitle({ icon: Icon, title, sub }) {
  return <div className="flex items-start gap-3"><div className="soft-icon"><Icon className="h-5 w-5" /></div><div><h3 className="font-heading text-lg font-extrabold text-slate-900">{title}</h3><p className="mt-0.5 text-xs text-slate-400">{sub}</p></div></div>;
}

function SettingRow({ label, text, enabled, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white/70 px-4 py-3 text-left transition hover:border-violet-200">
      <div><div className="text-sm font-bold text-slate-700">{label}</div><div className="mt-0.5 text-xs leading-5 text-slate-400">{text}</div></div>
      <span aria-hidden="true" className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-violet-600" : "bg-slate-200"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${enabled ? "left-6" : "left-1"}`} /></span>
      <span className="sr-only">{enabled ? "Enabled" : "Disabled"}</span>
    </button>
  );
}

function InfoCard({ label, value }) {
  return <div className="rounded-2xl border border-violet-100 bg-white/70 p-4"><div className="text-[10px] font-extrabold uppercase tracking-[.14em] text-slate-400">{label}</div><div className="mt-1 text-sm font-extrabold text-slate-800">{value}</div></div>;
}
