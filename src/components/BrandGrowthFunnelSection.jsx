import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Bot,
  Zap,
  Target,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Eye,
} from 'lucide-react';

/**
 * Matches Poster 4:
 * "Revolutionizing the Way We Grow Brand"
 * "Artificial Intelligence is no longer the future — it's now.
 *  From hyper-personalized ads to predictive analytics and chatbots,
 *  AI is transforming every part of the marketing funnel."
 * Sleek robotic hand / touch initiating glowing AI portal.
 */
export default function BrandGrowthFunnelSection() {
  const [activeStep, setActiveStep] = useState(0);

  const FUNNEL_STEPS = [
    {
      step: '01',
      title: 'Hyper-Personalized Ads',
      tagline: 'Custom Creative per Contact',
      description:
        'AI dynamically generates customized visual banners and product offers tailored to each client segment without manual design overhead.',
      stat: '+310% CTR',
      color: 'from-blue-500 to-cyan-400',
      textColor: 'text-cyan-400',
    },
    {
      step: '02',
      title: 'Predictive Analytics',
      tagline: 'Anticipate Buying Intent',
      description:
        'Scans customer response timing and message tone to forecast purchase probability and trigger targeted counter-offers at the right moment.',
      stat: '92% Intent Accuracy',
      color: 'from-indigo-500 to-purple-400',
      textColor: 'text-indigo-400',
    },
    {
      step: '03',
      title: 'Autonomous Chatbots',
      tagline: 'Sub-Second Conversational Triage',
      description:
        'WhatsApp AI agents handle clinical intakes, school demo bookings, and wholesale negotiations with zero delay, 24 hours a day.',
      stat: '&lt; 1.2s Response',
      color: 'from-emerald-500 to-teal-400',
      textColor: 'text-emerald-400',
    },
    {
      step: '04',
      title: 'Direct Settlement',
      tagline: 'Zero Friction Payment Closures',
      description:
        'Issues UPI QR passes and instant payment links directly within WhatsApp chats to confirm appointments and orders on the spot.',
      stat: '94.8% Show-Up Rate',
      color: 'from-amber-500 to-orange-400',
      textColor: 'text-amber-400',
    },
  ];

  return (
    <section id="brand-growth" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Words Matching Poster 4 Exactly */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>THE MODERN MARKETING PARADIGM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950 leading-[1.1]">
            Revolutionizing the Way We Grow Brand
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            <strong className="text-slate-900">Artificial Intelligence is no longer the future — it's now.</strong>{' '}
            From hyper-personalized ads to predictive analytics and chatbots, AI is transforming every part of the marketing funnel.
          </p>

          {/* Interactive 4-Phase Funnel Accordion */}
          <div className="space-y-3 pt-2">
            {FUNNEL_STEPS.map((item, idx) => {
              const isActive = idx === activeStep;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-950 text-white border-slate-800 shadow-xl'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                          isActive ? 'bg-white/15 text-cyan-300' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {item.step}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base">{item.title}</h4>
                    </div>
                    <span className={`text-xs font-black font-mono ${isActive ? item.textColor : 'text-slate-500'}`}>
                      {item.stat}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.2 }}
                      className="pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed pl-9"
                    >
                      <p className="font-semibold text-cyan-300 pb-0.5">{item.tagline}</p>
                      <p className="text-slate-400">{item.description}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Robotic Hand Touching Glowing AI Portal Visual */}
        <div className="lg:col-span-6 relative flex justify-center">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 text-white">
            {/* Ambient Backing Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Glowing Biometric Circular AI Portal */}
            <div className="relative z-10 text-center space-y-6 py-6">
              <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                {/* Circular Pulsing Waves */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.28, 1], opacity: [0.15, 0.4, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5, ease: 'easeInOut' }}
                  className="absolute -inset-4 rounded-full border border-indigo-400/30"
                ></motion.div>

                {/* Central AI Touch Biometric Core */}
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1 shadow-2xl shadow-cyan-500/50 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-cyan-300 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Portal Status Header */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase block font-bold">
                  AUTONOMOUS CONVERSION PORTAL
                </span>
                <h3 className="text-xl font-black text-white">One-Touch Autonomous Growth</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click below to activate and simulate the automated funnel across customer channels.
                </p>
              </div>

              {/* Interactive Activation Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % FUNNEL_STEPS.length)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-cyan-200" />
                  <span>Cycle Next Funnel Stage ({FUNNEL_STEPS[activeStep].title})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
