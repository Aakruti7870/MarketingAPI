import React, { useState, useMemo } from 'react';
import {
  Workflow,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  Bot,
  Zap,
  ShieldCheck,
  Settings,
  Database,
  Send,
  Code2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Cpu,
  FileCode,
} from 'lucide-react';
import { ALL_AGENTIC_BOTS, getBotById } from '../data/agenticIndustryBots';
import { generateN8nWorkflow, downloadWorkflowJson } from '../data/n8nWorkflowGenerator';
import { Badge, Button, Card } from './ui';

export default function N8nWorkflowStudio({ selectedIndustryId = 'hospital' }) {
  const [industryId, setIndustryId] = useState(selectedIndustryId);
  const [businessName, setBusinessName] = useState('Metro Multispeciality Healthcare');
  const [webhookPath, setWebhookPath] = useState('whatsapp-agent-inbound');
  const [llmModel, setLlmModel] = useState('gemini-3.8-flash');
  const [channel, setChannel] = useState('whatsapp_cloud_api');
  const [crmTarget, setCrmTarget] = useState('google_sheets');
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'json' | 'instructions'
  const [copied, setCopied] = useState(false);

  const activeBot = useMemo(() => getBotById(industryId), [industryId]);

  // Generate real N8N JSON workflow
  const workflowJson = useMemo(() => {
    return generateN8nWorkflow({
      industryId,
      businessName,
      webhookPath,
      llmModel,
      channel,
      crmTarget,
    });
  }, [industryId, businessName, webhookPath, llmModel, channel, crmTarget]);

  const jsonString = useMemo(() => {
    return JSON.stringify(workflowJson, null, 2);
  }, [workflowJson]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    downloadWorkflowJson(workflowJson, `n8n-${industryId}-agentic-workflow.json`);
  };

  const pipelineNodes = [
    {
      id: 'webhook',
      title: '1. Inbound Trigger',
      badge: 'Webhook / POST',
      type: 'Trigger Node',
      desc: `Receives real-time customer WhatsApp messages on /webhook/${webhookPath}`,
      color: 'border-cyan-500 bg-cyan-950/20 text-cyan-400',
      icon: Send,
    },
    {
      id: 'normalizer',
      title: '2. Normalizer & Auth',
      badge: 'Code Node',
      type: 'Payload Parser',
      desc: 'Extracts sender phone, customer name, message body & initializes session memory',
      color: 'border-blue-500 bg-blue-950/20 text-blue-400',
      icon: Code2,
    },
    {
      id: 'ai-agent',
      title: '3. Agentic LLM Core',
      badge: 'AI Agent Node',
      type: 'LangChain / Gemini',
      desc: `Autonomous reasoning loop with ${activeBot.badgeText} directives & safety guardrails`,
      color: 'border-purple-500 bg-purple-950/20 text-purple-400',
      icon: Bot,
    },
    {
      id: 'tool-spec',
      title: '4. Dynamic Tool Router',
      badge: 'Custom Tool',
      type: 'Tool Engine',
      desc: `Verifies ${activeBot.vertical} pricing matrix, MOQ, and slot availability`,
      color: 'border-amber-500 bg-amber-950/20 text-amber-400',
      icon: Cpu,
    },
    {
      id: 'action-tokenizer',
      title: '5. Action & Tokenizer',
      badge: 'Pass Generator',
      type: 'Action Slip',
      desc: `Formats reference code (${industryId.toUpperCase().slice(0, 3)}-XXXX) and strips agent reasoning`,
      color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400',
      icon: Sparkles,
    },
    {
      id: 'crm',
      title: '6. Lead Sync & CRM',
      badge: 'Google Sheets / DB',
      type: 'Data Persistence',
      desc: `Appends customer phone, inquiry, quote, and token status to ${crmTarget}`,
      color: 'border-indigo-500 bg-indigo-950/20 text-indigo-400',
      icon: Database,
    },
    {
      id: 'whatsapp-outbound',
      title: '7. Outbound Response',
      badge: 'HTTP Request',
      type: 'Graph API',
      desc: 'Dispatches instant interactive WhatsApp confirmation message back to customer',
      color: 'border-emerald-600 bg-emerald-950/20 text-emerald-300',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-cyan-400" />
                N8N Low-Code Automation Generator
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                100% Valid n8n v1.x Schema
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Export Production N8N Workflows for Any Industry
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate self-contained, enterprise-grade N8N automation templates with incoming WhatsApp webhooks, Gemini LLM agent reasoning, custom domain tools, and Google Sheets CRM sync.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={handleCopy}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-black flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy n8n Workflow JSON'}</span>
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Download .json File</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Industry Selector */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
            Target Industry Bot ({ALL_AGENTIC_BOTS.length})
          </label>
          <select
            value={industryId}
            onChange={(e) => setIndustryId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ALL_AGENTIC_BOTS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.vertical})
              </option>
            ))}
          </select>
        </div>

        {/* Business Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
            Business / Organization Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Metro Care Clinic"
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* LLM Model Provider */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
            AI Agent Model
          </label>
          <select
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="gemini-3.8-flash">Google Gemini 3.8 / 2.0 Flash (Recommended)</option>
            <option value="gpt-4o">OpenAI GPT-4o (Chat Model)</option>
            <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
          </select>
        </div>

        {/* CRM / Database Target */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
            CRM / Lead Storage Target
          </label>
          <select
            value={crmTarget}
            onChange={(e) => setCrmTarget(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="google_sheets">Google Sheets (Auto-append rows)</option>
            <option value="postgresql">PostgreSQL / Cloud SQL Table</option>
            <option value="supabase">Supabase Database</option>
            <option value="webhook_crm">Direct Webhook to Custom CRM</option>
          </select>
        </div>
      </div>

      {/* Studio View Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Pipeline Architecture ({pipelineNodes.length} Nodes)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'json'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Raw n8n Workflow JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'instructions'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>How to Import into n8n (30 Seconds)</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
          Target: {activeBot.badgeText}
        </span>
      </div>

      {/* Tab 1: Visual Pipeline Architecture */}
      {activeTab === 'visual' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Zero-Code Orchestration:</strong> This workflow executes an autonomous loop tailored for{' '}
                <span className="underline font-bold">{activeBot.vertical}</span>. It receives the incoming chat, runs real-time Gemini reasoning against your verified knowledge base, invokes domain tools, stores records in your CRM, and replies in &lt;1.5 seconds.
              </span>
            </div>
            <span className="hidden md:inline-block text-[11px] font-mono font-bold bg-white px-2 py-1 rounded-lg border border-indigo-200">
              n8n v1.x Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelineNodes.map((node, i) => {
              const NodeIcon = node.icon;
              return (
                <div
                  key={node.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-extrabold text-slate-900">{node.title}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${node.color}`}>
                        {node.badge}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 my-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                        <NodeIcon className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{node.desc}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Type: {node.type}</span>
                    <span className="text-indigo-600 font-bold">Step {i + 1} of 7 →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Bot Domain Grounding Preview Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <activeBot.icon className="w-5 h-5 text-indigo-600" />
                <h4 className="font-extrabold text-xs text-slate-900">
                  Pre-Configured System Knowledge Base Injected Into n8n
                </h4>
              </div>
              <Badge variant="primary" className="text-[10px]">
                {activeBot.vertical}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Hardwired Business Parameters:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                  {Object.entries(activeBot.config).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-bold text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Available Agentic Tools:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-2">
                  {activeBot.tools.map((t) => (
                    <div key={t.name} className="flex items-start gap-2">
                      <span className="font-mono text-indigo-700 font-bold shrink-0">{t.name}()</span>
                      <span className="text-slate-600">{t.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw n8n Workflow JSON */}
      {activeTab === 'json' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 font-mono">
              n8n-agentic-{industryId}-workflow.json ({jsonString.length} bytes)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleCopy}
                className="text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </Button>
              <Button
                onClick={handleDownload}
                className="text-xs font-bold py-1.5 px-3 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span>N8N JSON Schema v1</span>
              <span>Ready for Import</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-400 max-h-[480px] overflow-auto leading-relaxed">
              <code>{jsonString}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Step-by-Step Import Guide */}
      {activeTab === 'instructions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">
                01
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Copy or Download JSON</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click the <strong>Copy n8n Workflow JSON</strong> button above, or download the <code>.json</code> file to your computer.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">
                02
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Open n8n & Import</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inside your N8N canvas, click on the top-right <strong>... Menu</strong> &rarr; <strong>Import from File</strong> or simply paste with <kbd className="px-1 py-0.5 bg-slate-100 rounded border">Ctrl + V</kbd>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black flex items-center justify-center text-xs">
                03
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Connect Credentials & Activate</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your Gemini API Key in the LLM node and WhatsApp Token in the HTTP Request node. Click <strong>Active (ON)</strong> to launch your 24/7 AI agent.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2">
            <span className="font-mono text-cyan-400 font-bold block flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Optional: Run Self-Hosted N8N with Docker in 1 Line
            </span>
            <code className="block p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
              docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
            </code>
            <p className="text-slate-400 text-[11px]">
              Once running, open <code>http://localhost:5678</code> in your browser and paste the workflow JSON.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
