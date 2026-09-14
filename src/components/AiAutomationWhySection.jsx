import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Layers,
  Wrench,
  BarChart3,
  Bot,
  BrainCircuit,
} from 'lucide-react';

/**
 * Matches Poster 1:
 * "Why Businesses Need AI Automation"
 * "Scale Faster. Reduce manual work. Build smarter systems."
 * "A: Automation" (Efficiency, Faster Operations)
 * "I: Intelligence" (Better Decisions, Data Insights)
 */
export default function AiAutomationWhySection() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'automation' | 'intelligence'

  return (
    <section id="why-ai-automation" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>AUTONOMOUS BUSINESS ADVANTAGE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
          Why Businesses Need AI Automation
        </h2>
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Scale Faster. Reduce manual work. Build smarter systems.
        </p>
      </div>

      {/* Main 3D Construction & Architectural Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Miniature Robotic Construction Metaphor Card */}
        <div className="lg:col-span-6">
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 sm:p-10 text-white shadow-2xl border border-slate-800">
            {/* Ambient Background Grid and Lighting */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Central 3D "AI" Construction Visual */}
            <div className="relative z-10 py-6 text-center">
              <div className="inline-flex items-center justify-center p-6 rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700/80 shadow-inner mb-6">
                <span className="text-6xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-lg">
                  AI
                </span>
              </div>

              {/* Floating Construction Crane & Scaffold Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>PRECISION BUILD</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Robotic agents assemble workflows without human fatigue
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold mb-1">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>SELF-OPTIMIZING</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Real-time learning algorithms adjust marketing campaigns
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Category Badges matching Poster */}
            <div className="relative z-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">• AI Architecture</span>
              <span>• Digital Products</span>
              <span>• Workflow Automation</span>
            </div>
          </div>
        </div>

        {/* Right Column: "A" for Automation + "I" for Intelligence Pillars */}
        <div className="lg:col-span-6 space-y-6">
          {/* Pillar 1: A: Automation */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-8 rounded-[28px] bg-emerald-50/70 border border-emerald-200/80 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                A
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Automation
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Efficiency & Speed
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Eliminates repetitive manual outreach, contact filtering, appointment booking, and inventory rate broadcasting.
                </p>
                <div className="pt-3 flex flex-wrap gap-2 text-xs font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Faster Operations
                  </span>
                  <span className="flex items-center gap-1 ml-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero Manual Errors
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pillar 2: I: Intelligence */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-8 rounded-[28px] bg-indigo-50/70 border border-indigo-200/80 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                I
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Intelligence
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                    Better Decisions
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Translates raw customer responses into actionable lead scorings, margin protection calculations, and hyper-targeted follow-ups.
                </p>
                <div className="pt-3 flex flex-wrap gap-2 text-xs font-bold text-indigo-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Data Insights
                  </span>
                  <span className="flex items-center gap-1 ml-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Adaptive Counter-Offers
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="text-slate-500">Average Manual Work Reduction:</span>
            <span className="text-emerald-600 font-black text-sm">82.4% Hours Saved</span>
          </div>
        </div>
      </div>
    </section>
  );
}
