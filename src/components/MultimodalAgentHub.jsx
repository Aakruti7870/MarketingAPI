import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Bot,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Code2,
  BarChart2,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Radio,
  Sliders,
} from 'lucide-react';

/**
 * Matches Poster 3:
 * "AI AGENT - Your Intelligent Partner"
 * Central glowing holographic avatar profile on pedestal with 7 interactive floating glass HUD nodes:
 * TEXT, IMAGE, VIDEO, AUDIO, CODE, DATA, AUTOMATION
 */
export default function MultimodalAgentHub() {
  const [selectedNode, setSelectedNode] = useState('TEXT');

  const HUD_NODES = [
    {
      id: 'TEXT',
      title: 'Natural Language Processing',
      icon: FileText,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      bgColor: 'bg-cyan-950/40',
      description:
        'Context-aware symptom triaging, parent inquiries, and multilingual business dialogue in 12 Indian languages.',
      telemetry: 'Latency: 280ms • Tokens: 128k context',
      sampleOutput: 'Patient: "I need pediatric slots." → AI: "Dr. Nair available 4 PM. Pass reserved."',
    },
    {
      id: 'IMAGE',
      title: 'Image Generation & Analysis',
      icon: ImageIcon,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      bgColor: 'bg-indigo-950/40',
      description:
        'Autonomous creation of promotional flyers, Diwali festive sale passes, and medical prescription verification.',
      telemetry: 'Resolution: 4K • Processing: 1.4s',
      sampleOutput: 'Generated: "25% Off TMT Steel Festival Banner" with personalized contractor name.',
    },
    {
      id: 'VIDEO',
      title: 'Video Generation & Analysis',
      icon: Video,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/40',
      bgColor: 'bg-purple-950/40',
      description:
        '5-second cinematic micro-video campaign reels, interactive masterclass previews, and product motion teasers.',
      telemetry: 'Codec: AV1/H.265 • 60 FPS Micro-Reels',
      sampleOutput: 'Rendered: 5s 3D animated concrete mixer demo for WhatsApp Status broadcast.',
    },
    {
      id: 'AUDIO',
      title: 'Audio Generation & Synthesis',
      icon: Mic,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      bgColor: 'bg-rose-950/40',
      description:
        'Natural-sounding interactive voice notes and Hindi/Marathi/English spoken phone booking confirmations.',
      telemetry: 'Voice: Natural Expressive • 24kHz Audio',
      sampleOutput: 'Audio Note: "Namaste Mr. Verma, your appointment with Dr. Sharma is confirmed for 5:30 PM."',
    },
    {
      id: 'CODE',
      title: 'Code Generation & Execution',
      icon: Code2,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      bgColor: 'bg-amber-950/40',
      description:
        'Generates instant webhook scripts, UPI payment listener APIs, and vCard parser algorithms.',
      telemetry: 'Security: Sandboxed • E.164 Cleaners',
      sampleOutput: 'Executed: webhook_handler.ts → Auto-issued UPI Payment Link with 0 gateway latency.',
    },
    {
      id: 'DATA',
      title: 'Data Analysis & Visualization',
      icon: BarChart2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      bgColor: 'bg-emerald-950/40',
      description:
        'Real-time lead conversion analytics, campaign open rate tracking, and churn prediction radar.',
      telemetry: 'Accuracy: 99.4% • Real-time Recharts Stream',
      sampleOutput: 'Analytics: 94.8% Clinic Attendance Rate • ₹4.2L revenue settled directly via UPI.',
    },
    {
      id: 'AUTOMATION',
      title: 'Workflow Orchestration',
      icon: Cpu,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/40',
      bgColor: 'bg-teal-950/40',
      description:
        'Multi-agent campaign swarms that auto-negotiate wholesale spot rates while safeguarding profit margins.',
      telemetry: 'Rules: IS 456 Safeguard • 100% Margin Protected',
      sampleOutput: 'Orchestrated: Contractor Counter-Offer ₹58k/ton evaluated against ₹57k floor → Approved.',
    },
  ];

  const active = HUD_NODES.find((n) => n.id === selectedNode) || HUD_NODES[0];
  const ActiveIcon = active.icon;

  return (
    <section id="multimodal-agent-hub" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-[36px] bg-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Radial Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>MULTIMODAL INTELLIGENCE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            AI AGENT
          </h2>
          <p className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Your Intelligent Partner
          </p>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Explore the 7 foundational intelligence layers powering autonomous customer acquisition and deals.
          </p>
        </div>

        {/* 7 Interactive Floating HUD Cards Selector */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mb-10">
          {HUD_NODES.map((node) => {
            const isSelected = node.id === selectedNode;
            const NodeIcon = node.icon;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? `${node.bgColor} ${node.borderColor} ${node.color} shadow-lg shadow-cyan-500/10 scale-105`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <NodeIcon className={`w-3.5 h-3.5 ${isSelected ? node.color : 'text-slate-400'}`} />
                <span>{node.id}</span>
              </button>
            );
          })}
        </div>

        {/* Central Display: Cyber Pedestal Hologram + Node Telemetry Screen */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Visual: Cyber Avatar Profile with Glowing HUD Halo */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl p-6 bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
              {/* Rotating Holographic Orbital Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-8 rounded-full border border-dashed border-cyan-400/30 pointer-events-none"
              ></motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-16 rounded-full border border-indigo-400/30 pointer-events-none"
              ></motion.div>

              {/* Avatar Center Core */}
              <div className="relative z-10 text-center space-y-4">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-indigo-500/40 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Bot className="w-14 h-14 text-cyan-300 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block">
                    NEURAL AGENT ENGINE
                  </span>
                  <h4 className="text-base font-black text-white">LUMINA360 Neural Engine v4.5</h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ACTIVE IN ALL 7 MODALITIES
                  </span>
                </div>
              </div>

              {/* Pedestal Base Light */}
              <div className="absolute bottom-0 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            </div>
          </div>

          {/* Right Visual: Detailed HUD Telemetry Screen for Selected Node */}
          <div className="lg:col-span-6 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className={`p-6 sm:p-8 rounded-3xl ${active.bgColor} border ${active.borderColor} shadow-xl space-y-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shadow-inner">
                      <ActiveIcon className={`w-5 h-5 ${active.color}`} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        MODALITY: {active.id}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {active.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950/80 border border-white/15 text-slate-300">
                    {active.telemetry}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {active.description}
                </p>

                {/* Sample Live Output Box */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-white/10">
                    <span>LIVE EXECUTION TRACE</span>
                    <span className="text-emerald-400 font-bold">STATUS: OK</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed pt-1">
                    {active.sampleOutput}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fully integrated with WhatsApp Cloud API & CRM pipelines</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
