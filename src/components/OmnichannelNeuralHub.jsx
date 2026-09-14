import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  MessageSquare,
  Globe,
  Mail,
  Smartphone,
  Share2,
  Radio,
  Zap,
  CheckCircle2,
  Send,
  Eye,
} from 'lucide-react';

/**
 * Matches Poster 5:
 * "Startup Hero Section - Revolutionize Your Digital Presence"
 * Central luminous energy orb with fiber-optic light conduits branching to:
 * WhatsApp, Instagram, Telegram, Email, Website, Mobile App
 * Featuring exact Active Users & Engagement metrics from poster!
 */
export default function OmnichannelNeuralHub() {
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');

  const CHANNELS = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'Direct 1-to-1 Broadcast',
      activeUsers: '1.2M',
      engagement: '+45%',
      color: 'emerald',
      bgColor: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      icon: MessageSquare,
      description: 'Official Meta Cloud API direct messaging with 98.4% open rate and masked phone privacy.',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'Direct Message & Stories',
      activeUsers: '1.2M',
      engagement: '+42%',
      color: 'pink',
      bgColor: 'bg-pink-500/15',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/40',
      icon: Share2,
      description: 'Automated comment-to-DM triggers and coupon distribution for local retail and clinics.',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'Instant Channel Feeds',
      activeUsers: '1.2M',
      engagement: '+38%',
      color: 'sky',
      bgColor: 'bg-sky-500/15',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/40',
      icon: Send,
      description: 'Real-time spot rate feeds and wholesale contractor announcement group blasts.',
    },
    {
      id: 'email',
      name: 'Email',
      category: 'Smart Automated Sequences',
      activeUsers: '1.2M',
      engagement: '+45%',
      color: 'indigo',
      bgColor: 'bg-indigo-500/15',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/40',
      icon: Mail,
      description: 'Personalized appointment PDF vouchers and IS 456 mix concrete calculation receipts.',
    },
    {
      id: 'website',
      name: 'Website',
      category: 'Live Floating Widget',
      activeUsers: '2.2%',
      engagement: '+35%',
      color: 'amber',
      bgColor: 'bg-amber-500/15',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/40',
      icon: Globe,
      description: 'Zero-latency web livechat widget that transfers directly into a WhatsApp session.',
    },
    {
      id: 'mobileapp',
      name: 'Mobile App',
      category: 'Push & Deep Links',
      activeUsers: '1.2M',
      engagement: '+45%',
      color: 'cyan',
      bgColor: 'bg-cyan-500/15',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40',
      icon: Smartphone,
      description: 'Mobile native wallet passes with offline QR codes and biometric settlement verification.',
    },
  ];

  const current = CHANNELS.find((c) => c.id === selectedChannel) || CHANNELS[0];
  const CurrentIcon = current.icon;

  return (
    <section id="omnichannel-hub" className="py-16 sm:py-24 px-6 sm:px-12 max-w-7xl mx-auto w-full">
      <div className="rounded-[36px] bg-slate-950 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background Radial Lights */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Header Matching Poster 5 */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>UNIFIED CHANNEL DISPATCH MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Revolutionize Your Digital Presence
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-medium">
            Connect your audience wherever they are through a single autonomous intelligence core.
          </p>
        </div>

        {/* 6 Connected Channel Cards with exact Active Users & Engagement Metrics */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHANNELS.map((channel) => {
            const isSelected = channel.id === selectedChannel;
            const ChannelIcon = channel.icon;
            return (
              <motion.div
                key={channel.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedChannel(channel.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? `${channel.bgColor} ${channel.borderColor} shadow-xl shadow-cyan-500/10 ring-1 ring-white/20`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {/* Header with Channel Icon & Name */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-md">
                      <ChannelIcon className={`w-5 h-5 ${channel.textColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{channel.name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{channel.category}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  )}
                </div>

                {/* Exact Poster 5 Metric Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Active Users
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-mono">
                      {channel.activeUsers}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Engagement
                    </span>
                    <span className={`text-base sm:text-lg font-black font-mono ${channel.textColor}`}>
                      {channel.engagement}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 pt-3 line-clamp-2">
                  {channel.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Channel Live Dispatch Telemetry Bar */}
        <div className="relative z-10 mt-10 p-5 rounded-2xl bg-slate-900/90 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <CurrentIcon className={`w-5 h-5 ${current.textColor}`} />
            <div>
              <span className="text-slate-400 block text-[11px]">Selected Conduits Status</span>
              <span className="text-white font-bold text-sm">
                {current.name} • 1-to-1 E.164 Shielded Broadcast Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" /> 0 Leaks Guaranteed
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
              Speed: 5,000 Msg/Min
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
