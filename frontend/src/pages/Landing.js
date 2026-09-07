import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, Bot, BrainCircuit, Check, ChevronDown, ChevronUp,
  CircleUserRound, Clock3, Coins, FileText, Globe2, Layers3, Mail, Menu,
  MessageCircleMore, Mic2, Paperclip, Play, Rocket, Send, ShieldCheck,
  Sparkles, Star, TrendingUp, UsersRound, WandSparkles, X, Zap,
} from "lucide-react";

const NAV = [
  ["Features", "#features"], ["Use Cases", "#use-cases"], ["Pricing", "#pricing"],
  ["Reviews", "#reviews"], ["FAQ", "#faq"], ["Blog", "#blog"],
];

const FAQS = [
  ["What is GOLD-e AI?", "GOLD-e AI is an AI revenue workspace that brings lead management, campaigns, automation, analytics, content assistance and team workflows into one professional interface."],
  ["How do coins work?", "New workspaces start with 100 one-time coins. Premium AI actions use coins based on the task, so you only spend usage when AI is doing real work."],
  ["Can I start for free?", "Yes. The Free plan gives you 100 one-time coins, one workspace owner, core CRM tools and room for up to 1,000 leads."],
  ["Is my data safe?", "The application is designed with tenant isolation, encrypted provider credentials, private contact handling and server-side access controls."],
  ["Can I upgrade later?", "Yes. Start free and move to a paid plan when you need more AI capacity, team seats, lead volume and automation scale."],
];

const TESTIMONIALS = [
  ["GOLD-e AI changed the way we run outreach. We go from idea to campaign in minutes instead of hours.", "Priya Sharma", "Founder, Blush & Co."],
  ["From lead generation to campaign ideas, GOLD-e AI saves our team hours every week without making the workflow complicated.", "Rahul Mehta", "Marketing Head, GrowthBox"],
  ["The interface feels simple, but the automation underneath is powerful. Our team gets more done with fewer handoffs.", "Sneha Kapoor", "CEO, SellMore"],
];

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="landing-shell min-h-screen overflow-hidden text-slate-950">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <BrandMark />
            <div>
              <div className="font-heading text-base font-extrabold tracking-tight">GOLD-e AI</div>
              <div className="text-[10px] font-medium text-slate-500">AI Revenue Engine</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#home" className="text-sm font-semibold text-violet-600">Home</a>
            {NAV.map(([label, href]) => (
              <a key={label} href={href} className="text-sm font-medium text-slate-600 transition hover:text-violet-600">{label}</a>
            ))}
          </nav>

          <div className="hidden lg:flex">
            <button onClick={() => navigate("/login")} className="brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-brand transition hover:-translate-y-0.5">
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <button className="rounded-xl p-2 lg:hidden" onClick={() => setMobileOpen((v) => !v)}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
            <div className="grid gap-3">
              {[["Home", "#home"], ...NAV].map(([label, href]) => <a key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-violet-50">{label}</a>)}
              <button onClick={() => navigate("/login")} className="brand-gradient rounded-xl px-4 py-3 text-sm font-bold text-white">Get Started</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="relative px-5 pb-16 pt-16 sm:pt-20 lg:px-8 lg:pb-24">
          <div className="hero-orb pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full sm:h-[650px] sm:w-[650px]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" /> Your AI assistant, built to grow your business
            </div>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Ask Anything.<br /><span className="brand-text">Get Answers Instantly.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              AI-powered productivity, marketing and business assistance in one place. Work smarter, move faster, and turn every conversation into opportunity.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate("/login")} className="brand-gradient inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-brand transition hover:-translate-y-0.5">
                Try GOLD-e Free <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#product" className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white/85 px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-violet-200 hover:bg-white">
                <Play className="h-4 w-4 text-violet-600" /> Watch How It Works
              </a>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-500" /> No credit card required</span>
              <span className="flex items-center gap-2"><Zap className="h-4 w-4 text-fuchsia-500" /> Set up in minutes</span>
              <span className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-cyan-500" /> Built for modern teams</span>
            </div>
          </div>

          <div id="product" className="relative mx-auto mt-14 max-w-6xl">
            <ProductPreview />
          </div>
        </section>

        <section id="features" className="relative px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
              <div>
                <Eyebrow>Powerful features</Eyebrow>
                <h2 className="section-title mt-3">Smarter Conversations.<br />Real-Time Results.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-slate-600">Unlock the full power of AI with tools designed to help you save time, generate opportunities, automate repetitive work, and grow your business with less friction.</p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <FeatureCard icon={MessageCircleMore} title="Get Answers That Feel Human" text="Natural, useful responses grounded in your business context, campaigns and day-to-day questions.">
                <MiniChat />
              </FeatureCard>
              <FeatureCard icon={Zap} title="Automate Daily Tasks Effortlessly" text="Move from content creation to lead outreach and recurring workflows without constant manual handoffs.">
                <TaskList />
              </FeatureCard>
              <FeatureCard icon={BarChart3} title="Smarter Every Conversation" text="Turn activity into usable insights so your next action gets more relevant, timely and measurable.">
                <ProgressCard />
              </FeatureCard>
            </div>
          </div>
        </section>

        <section id="use-cases" className="px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <Eyebrow>One AI revenue workspace</Eyebrow>
              <h2 className="section-title mx-auto mt-3 max-w-3xl">From first lead to follow-up, keep the whole revenue flow connected.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <UseCase icon={TrendingUp} title="Lead Engine" text="Capture, score and organize opportunities in one workspace." />
              <UseCase icon={Mail} title="Campaign Studio" text="Create and coordinate outreach across marketing channels." />
              <UseCase icon={BrainCircuit} title="AI Studio" text="Generate copy, concepts, summaries and visual creative workflows." />
              <UseCase icon={Rocket} title="Autopilot" text="Run scheduled follow-ups and repeatable sales tasks automatically." />
            </div>
          </div>
        </section>

        <section id="reviews" className="relative px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <Eyebrow>Real people. Real results.</Eyebrow>
            <h2 className="section-title mt-3">Trusted by professionals.<br />Loved by everyday users.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">Designed for founders, marketers, operators and teams who need faster execution without adding more complexity.</p>
            <div className="mt-8 flex justify-center -space-x-2">
              {["PS","RM","SK","AM","DN","VK","RG"].map((v, i) => <div key={v} className="avatar-ring flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-slate-700" style={{zIndex: 10-i}}>{v}</div>)}
              <div className="avatar-ring flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold text-violet-700">+10K</div>
            </div>
            <div className="mt-9 grid gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map(([quote, name, role], i) => (
                <div key={name} className={`glass-card p-6 text-left ${i === 1 ? "ring-1 ring-violet-200" : ""}`}>
                  <div className="flex gap-0.5 text-amber-400">{Array.from({length:5}).map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}</div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">“{quote}”</p>
                  <div className="mt-5 flex items-center gap-3"><div className="avatar-ring flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">{name.split(" ").map(n=>n[0]).join("")}</div><div><div className="text-sm font-bold text-slate-900">{name}</div><div className="text-xs text-slate-500">{role}</div></div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <Eyebrow>Simple pricing</Eyebrow>
              <h2 className="section-title mt-3">Flexible plans tailored to fit every need.</h2>
              <p className="mt-4 text-slate-600">Start free. Move to Pro when your team is ready for more scale.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              <PriceCard title="Free" price="₹0" suffix="forever" description="Get started and explore the core workflow." features={["100 one-time coins", "1 workspace owner", "Up to 1,000 leads", "CRM, pipeline and inbox", "Campaign drafts and basic analytics"]} action="Get Started Free" onClick={() => navigate("/login")} />
              <PriceCard featured badge="Most Popular" title="Pro Monthly" price="₹1,999" suffix="/ month" description="For growing businesses and power users." features={["2,000 coins / month", "Up to 10 team members", "Up to 10,000 leads", "25,000 platform messages / month", "AI Studio, Automations, WhatsApp and Advanced Analytics"]} action="View Pro Monthly" onClick={() => navigate("/pricing")} />
              <PriceCard badge="Save 16.7%" title="Pro Annual" price="₹19,990" suffix="/ year" description="Best value for long-term growth." features={["2,000 coins refreshed monthly", "Everything in Pro Monthly", "Save 16.7%", "Priority support"]} action="View Pro Annual" onClick={() => navigate("/pricing")} />
            </div>
          </div>
        </section>

        <section id="faq" className="relative px-5 py-20 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-center">
            <div>
              <Eyebrow>You have questions</Eyebrow>
              <h2 className="section-title mt-3">Frequently Asked Questions.</h2>
              <p className="mt-3 text-slate-600">Clear answers about GOLD-e AI, coins, security and upgrades.</p>
              <div className="mt-7 divide-y divide-slate-200/80 rounded-3xl border border-white/80 bg-white/70 px-5 shadow-soft backdrop-blur-xl">
                {FAQS.map(([q, a], i) => <button key={q} onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="block w-full py-4 text-left"><div className="flex items-center justify-between gap-4"><span className="text-sm font-bold text-slate-900">{q}</span>{openFaq === i ? <ChevronUp className="h-4 w-4 text-violet-500"/>:<ChevronDown className="h-4 w-4 text-slate-400"/>}</div>{openFaq === i && <p className="pr-8 pt-3 text-sm leading-6 text-slate-600">{a}</p>}</button>)}
              </div>
            </div>
            <PhoneShowcase />
          </div>
        </section>

        <section id="blog" className="px-5 pb-20 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-white/80 bg-white/65 p-8 text-center shadow-soft backdrop-blur-xl md:p-12">
            <Sparkles className="mx-auto h-8 w-8 text-violet-600" />
            <h2 className="section-title mt-4">Turn ideas into revenue with one connected AI workspace.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">Bring leads, campaigns, automation and AI assistance into a cleaner operating rhythm for your team.</p>
            <button onClick={() => navigate("/login")} className="brand-gradient mt-7 inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-brand">Start with 100 free coins <ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/80 bg-white/65 px-5 py-8 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5"><BrandMark/><div><div className="font-heading text-sm font-extrabold">GOLD-e AI</div><div className="text-[10px] text-slate-500">AI Revenue Engine</div></div></div>
          <div className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-slate-500">{NAV.slice(0,5).map(([l,h])=><a key={l} href={h} className="hover:text-violet-600">{l}</a>)}</div>
          <button onClick={() => navigate("/login")} className="brand-gradient inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white">Get Started <ArrowRight className="h-3.5 w-3.5"/></button>
        </div>
        <div className="mx-auto mt-6 max-w-7xl border-t border-slate-200/70 pt-5 text-center text-[11px] text-slate-400">© 2026 GOLD-e AI · gold-etechapp.com · Built for modern revenue teams.</div>
      </footer>
    </div>
  );
}

function BrandMark(){return <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-brand"><Sparkles className="h-5 w-5"/></div>}
function Eyebrow({children}){return <div className="inline-flex rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet-700">{children}</div>}
function FeatureCard({icon:Icon,title,text,children}){return <div className="glass-card flex min-h-[420px] flex-col p-6"><div className="soft-icon"><Icon className="h-5 w-5"/></div><h3 className="mt-4 font-heading text-xl font-extrabold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><div className="mt-6 flex-1">{children}</div></div>}
function UseCase({icon:Icon,title,text}){return <div className="glass-card p-5"><div className="soft-icon"><Icon className="h-5 w-5"/></div><h3 className="mt-4 font-heading text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>}
function PriceCard({title,price,suffix,description,features,action,onClick,featured,badge}){return <div className={`relative rounded-3xl border bg-white/80 p-6 backdrop-blur-xl ${featured?"border-violet-300 shadow-brand ring-1 ring-fuchsia-200":"border-white shadow-soft"}`}>{badge&&<div className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${featured?"brand-gradient text-white":"bg-emerald-50 text-emerald-700"}`}>{badge}</div>}<h3 className="font-heading text-lg font-extrabold">{title}</h3><p className="mt-2 min-h-10 text-sm text-slate-500">{description}</p><div className="mt-5 flex items-end gap-1"><span className="font-heading text-4xl font-extrabold tracking-tight">{price}</span><span className="mb-1 text-xs text-slate-500">{suffix}</span></div><div className="mt-6 space-y-3">{features.map(f=><div key={f} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-3 w-3"/></span>{f}</div>)}</div><button onClick={onClick} className={`mt-7 w-full rounded-2xl px-4 py-3 text-sm font-bold ${featured?"brand-gradient text-white shadow-brand":"border border-violet-100 bg-white text-slate-800"}`}>{action}</button></div>}

function ProductPreview(){
 const items=[[Globe2,"Explore"],[Layers3,"Use Cases"],[FileText,"My Files"],[UsersRound,"Leads & CRM"],[Mail,"Campaigns"],[Zap,"Automations"],[Clock3,"History"]];
 return <div className="browser-shell overflow-hidden rounded-[28px] border border-white/80 bg-white/80 shadow-browser backdrop-blur-xl"><div className="flex h-11 items-center gap-2 border-b border-slate-200/70 bg-white/80 px-4"><span className="h-3 w-3 rounded-full bg-rose-400"/><span className="h-3 w-3 rounded-full bg-amber-300"/><span className="h-3 w-3 rounded-full bg-emerald-400"/><div className="mx-auto hidden w-1/2 rounded-lg bg-slate-100 px-3 py-1.5 text-center text-[10px] text-slate-400 sm:block">https://gold-etechapp.com</div></div><div className="grid min-h-[520px] md:grid-cols-[220px_1fr]"><aside className="hidden border-r border-slate-200/70 bg-white/65 p-4 md:block"><div className="flex items-center gap-2"><BrandMark/><div><div className="text-sm font-extrabold">GOLD-e AI</div><div className="text-[9px] text-slate-400">AI Revenue Engine</div></div></div><button className="brand-gradient mt-5 w-full rounded-xl py-2.5 text-xs font-bold text-white">+ New Chat</button><div className="mt-4 space-y-1">{items.map(([I,l])=><div key={l} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-violet-50"><I className="h-4 w-4 text-slate-400"/>{l}</div>)}</div><div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-3"><div className="text-xs font-bold">👑 Upgrade to PRO</div><p className="mt-1 text-[10px] leading-4 text-slate-500">Unlock more power, higher limits and advanced AI tools.</p><button className="mt-3 w-full rounded-lg bg-slate-950 py-2 text-[10px] font-bold text-white">Learn more</button></div></aside><div className="relative bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/60 p-5 sm:p-8"><div className="flex items-center justify-between"><div className="font-heading text-base font-extrabold">AI Assistant</div><div className="flex items-center gap-2"><div className="soft-round"><Sparkles className="h-4 w-4"/></div><div className="soft-round"><CircleUserRound className="h-4 w-4"/></div></div></div><div className="mx-auto flex min-h-[400px] max-w-3xl flex-col justify-center text-center"><h3 className="font-heading text-2xl font-extrabold sm:text-3xl">Good morning, Alex! 👋</h3><p className="mt-2 text-sm text-slate-500">What would you like to work on today?</p><div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">{[[TrendingUp,"Generate leads"],[Mail,"Write a campaign"],[BarChart3,"Analyze data"],[WandSparkles,"Plan content"],[FileText,"Summarize a document"],[Bot,"Create an image"]].map(([I,t])=><button key={t} className="flex items-center gap-2 rounded-xl border border-white bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"><I className="h-4 w-4 text-violet-500"/>{t}</button>)}</div><div className="mx-auto mt-10 w-full rounded-3xl border border-white bg-white/90 p-4 text-left shadow-soft"><div className="flex min-h-16 items-start justify-between text-sm text-slate-400"><span>Ask me anything...</span><Send className="h-5 w-5 text-slate-600"/></div><div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500"><span className="prompt-chip"><Paperclip className="h-3 w-3"/>Attach</span><span className="prompt-chip"><Sparkles className="h-3 w-3"/>Browse Prompts</span><span className="prompt-chip"><Mic2 className="h-3 w-3"/>Voice Message</span><span className="ml-auto">0/3000</span></div></div><p className="mt-3 text-[9px] text-slate-400">GOLD-e AI may provide responses that aren't always accurate. Please verify critical information.</p></div></div></div></div>
}
function MiniChat(){return <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50 p-4 shadow-soft"><div className="mb-4 flex items-center gap-2 text-xs font-bold"><BrandMark/><span>GOLD-e AI</span></div><div className="rounded-2xl bg-white p-3 text-xs text-slate-600 shadow-sm">How can I help you today?</div><div className="mt-3 ml-6 rounded-2xl bg-violet-100 p-3 text-xs text-violet-900">Give me 5 marketing ideas for my e-commerce business.</div></div>}
function TaskList(){return <div className="space-y-2 rounded-3xl border border-violet-100 bg-white p-3 shadow-soft">{[[TrendingUp,"Generate leads"],[Mail,"Write email campaign"],[MessageCircleMore,"Create social media posts"],[Globe2,"Analyze competitors"],[FileText,"Summarize reports"]].map(([I,t])=><div key={t} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700"><div className="soft-mini"><I className="h-3.5 w-3.5"/></div>{t}<ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-300"/></div>)}</div>}
function ProgressCard(){return <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-soft"><div className="text-xs font-bold text-slate-800">Your Progress</div><div className="mt-4 flex items-end justify-between"><div><div className="text-xs text-slate-400">Conversations</div><div className="font-heading text-3xl font-extrabold">2,847</div><div className="text-xs font-bold text-emerald-600">↑ +62%</div></div><div className="flex h-24 items-end gap-2">{[35,55,42,72,84].map((h,i)=><div key={i} className="w-3 rounded-t-lg bg-gradient-to-t from-violet-400 to-fuchsia-300" style={{height:`${h}%`}}/>)}</div></div><div className="mt-4 grid gap-2 text-xs text-slate-600"><span>✦ More insights</span><span>✦ Better suggestions</span><span>✦ Higher conversions</span></div></div>}
function PhoneShowcase(){return <div className="relative mx-auto w-full max-w-md py-10"><div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-200/50 via-fuchsia-100/50 to-cyan-100/60 blur-3xl"/><div className="relative mx-auto w-64 rotate-[-4deg] rounded-[38px] border-[8px] border-slate-900 bg-white p-4 shadow-browser"><div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-slate-900"/><div className="flex items-center gap-2"><BrandMark/><div><div className="text-xs font-extrabold">GOLD-e AI</div><div className="text-[8px] text-slate-400">AI Revenue Engine</div></div></div><h3 className="mt-7 font-heading text-xl font-extrabold">Turn conversations into opportunities.</h3><div className="mt-5 space-y-2">{[[TrendingUp,"Generate leads"],[Mail,"Create campaigns"],[BarChart3,"Analyze data"],[Zap,"Automate workflows"]].map(([I,t])=><div key={t} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold"><I className="h-3.5 w-3.5 text-violet-500"/>{t}</div>)}</div></div><div className="absolute left-0 top-1/3 rounded-2xl border border-white bg-white/90 p-3 text-xs font-bold text-slate-700 shadow-soft backdrop-blur">📈 More Leads<br/>More Sales</div><div className="absolute right-0 bottom-24 rounded-2xl border border-white bg-white/90 p-3 text-xs font-bold text-slate-700 shadow-soft backdrop-blur">⭐ Your AI<br/>Revenue Partner</div></div>}
