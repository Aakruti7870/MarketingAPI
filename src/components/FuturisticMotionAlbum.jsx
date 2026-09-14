import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CinematicVideoPlayer from './CinematicVideoPlayer';
import {
  Activity,
  GraduationCap,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  Shield,
  DollarSign,
  Layers,
  Globe,
  Star,
  MessageSquare,
  Users,
  Smartphone,
  Check,
  QrCode,
  Calendar,
  ExternalLink,
  Film,
  CreditCard,
} from 'lucide-react';

/**
 * 5 Futuristic, Easy-To-Understand Feature Banners
 * Built with realistic interactive card previews, live telemetry, and clear value props.
 */
const ALBUM_SLIDES = [
  {
    id: 'healthcare',
    badge: 'Healthcare OS',
    category: '24/7 Autonomous Patient Triage & Booking',
    title: 'Instant WhatsApp Doctor Consultation Passes',
    tagline: 'Eliminates waiting room queues with smart symptom triaging and confirmed booking passes',
    description:
      'Patients message your clinic on WhatsApp, receive automated clinical symptom intake, and are issued an official consultation pass with token number and clinic location in under 60 seconds.',
    metrics: [
      { label: 'Response Time', value: '< 1.2s Roundtrip', icon: Clock, color: 'text-emerald-700' },
      { label: 'Show-Up Rate', value: '94.8% Attendance', icon: CheckCircle2, color: 'text-teal-700' },
      { label: 'Privacy Shield', value: '100% Patient Encrypted', icon: ShieldCheck, color: 'text-indigo-700' },
    ],
    themeColor: 'emerald',
    gradientBg: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10',
    borderColor: 'border-emerald-200/80',
    pillColor: 'bg-emerald-100/80 text-emerald-800 border-emerald-300',
    icon: Activity,
    visualTag: 'LIVE CLINIC SENTINEL',
    cardPreview: {
      headerTitle: 'Metro Multi-Specialty Clinic',
      headerSub: 'Vashi Sector 17 • Meta Verified Clinic',
      badgeText: 'CONFIRMED PASS #A-104',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      patientName: 'Kavita Sundaram',
      doctorName: 'Dr. Rajesh Sharma (Cardiologist)',
      slotTime: 'Today, 5:30 PM • Slot #04',
      feeStatus: '₹600 Fee Paid via UPI',
      actionBtnText: 'View Clinic Directions & Token',
      actionBtnIcon: ExternalLink,
      secondaryBtnText: 'Reschedule in WhatsApp',
    },
  },
  {
    id: 'education',
    badge: 'Education OS',
    category: 'Parent Engagement & Demo Admissions',
    title: '3-Day Masterclass Admission Passes',
    tagline: 'Guides parents through syllabus details, sends trial passes, and collects enrollment fees',
    description:
      'Coaching institutes and schools automate student onboarding. The AI bot answers syllabus queries, presents teacher credentials, and delivers personalized 3-day demo class passes to parents on WhatsApp.',
    metrics: [
      { label: 'New Enrollments', value: '+340% Masterclass Growth', icon: TrendingUp, color: 'text-indigo-700' },
      { label: 'Parent Delivery', value: '99.1% WhatsApp Opens', icon: Users, color: 'text-blue-700' },
      { label: 'Fee Collection', value: 'Instant UPI Payouts', icon: Zap, color: 'text-purple-700' },
    ],
    themeColor: 'indigo',
    gradientBg: 'from-indigo-500/10 via-purple-500/5 to-blue-500/10',
    borderColor: 'border-indigo-200/80',
    pillColor: 'bg-indigo-100/80 text-indigo-800 border-indigo-300',
    icon: GraduationCap,
    visualTag: 'ADMISSION COPILOT',
    cardPreview: {
      headerTitle: 'BrightFuture Academic Academy',
      headerSub: 'NEET & CBSE Class 10-12 Center',
      badgeText: '3-DAY DEMO PASS #BF-882',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      patientName: 'Aarav Deshmukh (Class 10 CBSE)',
      doctorName: 'Physics & Chemistry Masterclass',
      slotTime: 'Starts Mon, 4:00 PM • Room 302',
      feeStatus: '100% Scholarship Demo Voucher',
      actionBtnText: 'Download Study Material PDF',
      actionBtnIcon: GraduationCap,
      secondaryBtnText: 'Chat With Lead Tutor',
    },
  },
  {
    id: 'broadcaster',
    badge: 'Channel OS',
    category: '1-to-1 Privacy Shield Broadcaster',
    title: 'Mass Visual Broadcasts with Zero Leaks',
    tagline: 'Disseminate high-converting marketing banners to thousands without revealing phone numbers',
    description:
      'Import phone contacts (.vcf) or customer spreadsheets. Broadcast rich visual promotion banners where every customer gets a private 1-to-1 WhatsApp message with zero group spam and complete number masking.',
    metrics: [
      { label: 'Privacy Shield', value: '100% Masked Numbers', icon: Shield, color: 'text-cyan-700' },
      { label: 'Broadcast Speed', value: '5,000 Msg / Minute', icon: Zap, color: 'text-emerald-700' },
      { label: 'Verified Opens', value: '98.4% Direct Read Rate', icon: Eye, color: 'text-blue-700' },
    ],
    themeColor: 'cyan',
    gradientBg: 'from-cyan-500/10 via-sky-500/5 to-indigo-500/10',
    borderColor: 'border-cyan-200/80',
    pillColor: 'bg-cyan-100/80 text-cyan-800 border-cyan-300',
    icon: ShieldCheck,
    visualTag: 'E.164 SHIELD BROADCASTER',
    cardPreview: {
      headerTitle: 'LUMINA360 Shielded Broadcast',
      headerSub: 'Queue: 1,420 Active Customers',
      badgeText: '1-TO-1 PRIVATE DELIVERY',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      patientName: 'Recipient: +91 98*** 44556',
      doctorName: 'Campaign: Diwali Special 25% Off Banner',
      slotTime: 'Dispatched: 0.8s ago • Status: Delivered',
      feeStatus: 'Zero Group Spam • 0 Leaks',
      actionBtnText: 'Inspect Live Dispatch Telemetry',
      actionBtnIcon: ShieldCheck,
      secondaryBtnText: 'View Channel Analytics',
    },
  },
  {
    id: 'wholesale',
    badge: 'Wholesale & B2B',
    category: 'Dynamic Spot Rates & Margin Guard',
    title: 'Autonomous Material Quotes & Mix Engine',
    tagline: 'IS 456 Mix Design calculations, spot steel rates, and profit-protecting auto counter-offers',
    description:
      'Steel, cement, and concrete suppliers broadcast real-time wholesale rates. When contractors negotiate for bulk volume discounts, the AI bot calculates cubic meters and protects your minimum margin floor.',
    metrics: [
      { label: 'Margin Floor', value: '100% Floor Safeguarded', icon: DollarSign, color: 'text-amber-700' },
      { label: 'IS 456 Mix Engine', value: 'Instant m³ Concrete Specs', icon: Layers, color: 'text-indigo-700' },
      { label: 'Deal Settlement', value: 'Direct Fast UPI Links', icon: CheckCircle2, color: 'text-emerald-700' },
    ],
    themeColor: 'amber',
    gradientBg: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
    borderColor: 'border-amber-200/80',
    pillColor: 'bg-amber-100/80 text-amber-800 border-amber-300',
    icon: Truck,
    visualTag: 'MARGIN GUARD ENGINE',
    cardPreview: {
      headerTitle: 'Shree Balaji Steel & Ready-Mix',
      headerSub: 'Navi Mumbai Hub • Grade Fe 550D',
      badgeText: 'INSTANT QUOTE #Q-5520',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      patientName: 'Contractor: Larsen Infrastructure',
      doctorName: 'Item: TMT Steel Bar (12mm) - 25 Metric Tons',
      slotTime: 'Spot Rate: ₹58,200/Ton (Floor Safe)',
      feeStatus: '₹14,55,000 Deal • UPI Token Ready',
      actionBtnText: 'Generate Official PO Invoice',
      actionBtnIcon: Truck,
      secondaryBtnText: 'Counter-Offer Breakdown',
    },
  },
  {
    id: 'googlemaps',
    badge: 'Local SEO OS',
    category: 'Google Maps 3-Pack Sentinel',
    title: 'Dominate Local Search & AI Review Defense',
    tagline: 'Autonomous profile synchronization, geo-tagged image uploads, and sub-minute review responses',
    description:
      'Locks your local business into the coveted Google Maps 3-Pack. The autonomous agent responds to customer reviews in 30 seconds, neutralizes negative feedback, and turns searches into WhatsApp calls.',
    metrics: [
      { label: 'Local Search Rank', value: '#1 in Local 3-Pack', icon: Globe, color: 'text-blue-700' },
      { label: 'Average Rating', value: '4.9★ from 1,280+ Reviews', icon: Star, color: 'text-amber-600' },
      { label: 'AI Review Defense', value: '< 30s Rapid Response', icon: MessageSquare, color: 'text-emerald-700' },
    ],
    themeColor: 'blue',
    gradientBg: 'from-blue-500/10 via-indigo-500/5 to-cyan-500/10',
    borderColor: 'border-blue-200/80',
    pillColor: 'bg-blue-100/80 text-blue-800 border-blue-300',
    icon: MapPin,
    visualTag: 'MAPS 3-PACK SENTINEL',
    cardPreview: {
      headerTitle: 'Google Business Profile Engine',
      headerSub: 'Google Maps Live Synchronization',
      badgeText: 'RANK #1 LOCAL 3-PACK',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      patientName: 'Business: Metro Diagnostics & Healthcare',
      doctorName: 'Area: Vashi, Navi Mumbai (3.2 km radius)',
      slotTime: 'Last Sync: 14 mins ago • Photos: 48 Geo-Tagged',
      feeStatus: 'Automated 5-Star Review Defense Active',
      actionBtnText: 'Simulate Local Maps Query',
      actionBtnIcon: Globe,
      secondaryBtnText: 'Review Sentiment Audit',
    },
  },
];

export default function FuturisticMotionAlbum() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ALBUM_SLIDES.length);
  };

  const currentSlide = ALBUM_SLIDES[currentIndex];
  const Icon = currentSlide.icon;

  return (
    <div className="relative w-full max-w-6xl mx-auto rounded-[32px] p-2 bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-200/80 shadow-2xl shadow-slate-200/70 border border-slate-200">
      {/* Outer Container with Soft Gradients */}
      <div className="relative rounded-[28px] overflow-hidden bg-white border border-slate-100 p-6 sm:p-8 lg:p-10 text-slate-900 shadow-inner">
        {/* Subtle Futuristic Holographic Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-400 via-indigo-500 to-pink-400 opacity-90"></div>

        {/* Ambient Light Bleeds */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-100/70 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-100/70 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block">
                Automated Solution Architecture
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Enterprise Multi-Agent Workflows & Real-Time Performance
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Holographic Slide Body */}
        <div className="relative z-10 pt-6 min-h-[460px] lg:min-h-[440px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
            >
              {/* Left Column: Clear, High-Impact Feature Highlights */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span>{currentSlide.category}</span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                    {currentSlide.title}
                  </h2>
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-600">
                    {currentSlide.tagline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {currentSlide.description}
                  </p>
                </div>

                {/* 3 Metric Pills with Latest Icons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {currentSlide.metrics.map((m, i) => {
                    const MetricIcon = m.icon;
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <MetricIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {m.label}
                          </span>
                        </div>
                        <span className={`text-xs sm:text-sm font-black ${m.color} block`}>
                          {m.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Automatically changing cinematic video & images */}
              <div className="lg:col-span-6 flex justify-center w-full">
                <CinematicVideoPlayer slide={currentSlide} onCompleteNext={handleNext} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
