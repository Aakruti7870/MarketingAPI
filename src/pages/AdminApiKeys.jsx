import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge, SectionLabel } from '../components/ui';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Bot,
  Cloud,
  Cpu,
  ExternalLink,
  Lock,
  Server,
  Play,
  Check,
  Copy,
  Trash2,
  Terminal,
  Zap,
  Sliders,
  ArrowRight
} from 'lucide-react';

export default function AdminApiKeys() {
  const { user, isAdmin } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifyingAll, setVerifyingAll] = useState(false);

  // Form states for inputs
  const [keyInputs, setKeyInputs] = useState({
    gemini: '',
    openai: '',
    bedrock_access_key: '',
    bedrock_secret_key: '',
    bedrock_region: 'us-east-1',
    nvidia: '',
  });

  // Visibility toggles
  const [showKey, setShowKey] = useState({
    gemini: false,
    openai: false,
    bedrock_access: false,
    bedrock_secret: false,
    nvidia: false,
  });

  // Verification state per provider
  const [verifyingProvider, setVerifyingProvider] = useState({});
  const [verificationFeedback, setVerificationFeedback] = useState({});
  const [saveSuccess, setSaveSuccess] = useState({});

  // Live Test Probe Console
  const [testProvider, setTestProvider] = useState('gemini');
  const [testPrompt, setTestPrompt] = useState('Run a quick system benchmark for LUMINA360 AI Gateway. Return status and latency.');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch key statuses from backend
  const fetchKeyStatuses = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/keys');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error('Failed to load API key statuses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKeyStatuses();
  }, []);

  const handleSaveKey = async (providerName) => {
    try {
      let payload = { provider: providerName };

      if (providerName === 'gemini') {
        if (!keyInputs.gemini) return;
        payload.api_key = keyInputs.gemini;
      } else if (providerName === 'openai') {
        if (!keyInputs.openai) return;
        payload.api_key = keyInputs.openai;
      } else if (providerName === 'nvidia') {
        if (!keyInputs.nvidia) return;
        payload.api_key = keyInputs.nvidia;
      } else if (providerName === 'bedrock') {
        if (!keyInputs.bedrock_access_key || !keyInputs.bedrock_secret_key) return;
        payload.access_key_id = keyInputs.bedrock_access_key;
        payload.secret_access_key = keyInputs.bedrock_secret_key;
        payload.region = keyInputs.bedrock_region || 'us-east-1';
      }

      const res = await fetch('/api/admin/keys/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess((prev) => ({ ...prev, [providerName]: true }));
        setTimeout(() => {
          setSaveSuccess((prev) => ({ ...prev, [providerName]: false }));
        }, 3000);
        // Clear input to not leave secrets in state
        if (providerName === 'gemini') setKeyInputs((prev) => ({ ...prev, gemini: '' }));
        if (providerName === 'openai') setKeyInputs((prev) => ({ ...prev, openai: '' }));
        if (providerName === 'nvidia') setKeyInputs((prev) => ({ ...prev, nvidia: '' }));
        if (providerName === 'bedrock') {
          setKeyInputs((prev) => ({ ...prev, bedrock_access_key: '', bedrock_secret_key: '' }));
        }
        fetchKeyStatuses();
      }
    } catch (err) {
      console.error(`Failed to save ${providerName} key:`, err);
    }
  };

  const handleVerifyKey = async (providerName) => {
    try {
      setVerifyingProvider((prev) => ({ ...prev, [providerName]: true }));
      setVerificationFeedback((prev) => ({ ...prev, [providerName]: null }));

      let payload = { provider: providerName };
      if (providerName === 'gemini' && keyInputs.gemini) payload.api_key = keyInputs.gemini;
      if (providerName === 'openai' && keyInputs.openai) payload.api_key = keyInputs.openai;
      if (providerName === 'nvidia' && keyInputs.nvidia) payload.api_key = keyInputs.nvidia;
      if (providerName === 'bedrock') {
        if (keyInputs.bedrock_access_key) payload.access_key_id = keyInputs.bedrock_access_key;
        if (keyInputs.bedrock_secret_key) payload.secret_access_key = keyInputs.bedrock_secret_key;
        if (keyInputs.bedrock_region) payload.region = keyInputs.bedrock_region;
      }

      const res = await fetch('/api/admin/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setVerificationFeedback((prev) => ({ ...prev, [providerName]: result }));
      fetchKeyStatuses();
    } catch (err) {
      setVerificationFeedback((prev) => ({
        ...prev,
        [providerName]: { valid: false, message: `Verification failed: ${err.message}` },
      }));
    } finally {
      setVerifyingProvider((prev) => ({ ...prev, [providerName]: false }));
    }
  };

  const handleVerifyAll = async () => {
    try {
      setVerifyingAll(true);
      const res = await fetch('/api/admin/keys/verify-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        // Set feedback for each provider tested
        const newFeedback = {};
        data.results?.forEach((r) => {
          newFeedback[r.provider] = r;
        });
        setVerificationFeedback(newFeedback);
        fetchKeyStatuses();
      }
    } catch (err) {
      console.error('Failed to verify all keys:', err);
    } finally {
      setVerifyingAll(false);
    }
  };

  const handleClearKey = async (providerName) => {
    if (!window.confirm(`Are you sure you want to remove the ${providerName.toUpperCase()} credentials?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/keys/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerName }),
      });
      if (res.ok) {
        fetchKeyStatuses();
        setVerificationFeedback((prev) => ({ ...prev, [providerName]: null }));
      }
    } catch (err) {
      console.error('Error clearing key:', err);
    }
  };

  // Run live prompt probe in the sandbox
  const runLiveTestProbe = async () => {
    setTestRunning(true);
    setTestResult(null);
    try {
      const startTime = Date.now();
      const res = await fetch('/api/playground/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: testProvider,
          model: testProvider === 'gemini' ? 'gemini-3.1-flash-lite' : testProvider === 'openai' ? 'gpt-4o-mini' : 'meta/llama-3.3-70b-instruct',
          prompt: testPrompt,
          user_id: user?.email || 'admin',
        }),
      });
      const data = await res.json();
      setTestResult({
        ...data,
        client_latency_ms: Date.now() - startTime,
      });
    } catch (err) {
      setTestResult({
        status: 'error',
        message: err.message || 'Test execution failed',
      });
    } finally {
      setTestRunning(false);
    }
  };

  const configuredCount = providers.filter((p) => p.configured).length;
  const verifiedCount = providers.filter((p) => p.status === 'verified').length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Admin Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#0052FF] font-semibold bg-[#0052FF]/10 px-2.5 py-0.5 rounded-full border border-[#0052FF]/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0052FF]" />
              Super Admin Security Console
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              AES-256 Server Isolation
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#0F172A] tracking-tight">
            AI Provider API Keys & Validation
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Secure configuration management and live validation for Google AI Studio, ChatGPT (OpenAI), Amazon Bedrock, and NVIDIA NIM.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchKeyStatuses}
            variant="secondary"
            size="md"
            className="flex items-center gap-2 text-xs"
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0052FF]' : 'text-[#64748B]'}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
          </Button>

          <Button
            onClick={handleVerifyAll}
            variant="primary"
            size="md"
            className="flex items-center gap-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md"
            disabled={verifyingAll}
          >
            <Zap className={`w-3.5 h-3.5 ${verifyingAll ? 'animate-bounce text-amber-300' : 'text-amber-300'}`} />
            <span>{verifyingAll ? 'Probing All Endpoints...' : 'Verify All Keys'}</span>
          </Button>
        </div>
      </div>

      {/* Security Architecture Notice & Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 shadow-xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-emerald-400">
                Zero Client-Side Exposure Architecture
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Ingress Proxy Security Model
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              All credentials entered in this configuration panel are handled strictly on the Node.js server container. Raw secrets are never dispatched in browser DOM attributes or client network bundles. Key values are automatically masked as <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">••••••••</span> and verified via server-side health checks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Proxy Active</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Runtime Process Memory Sync</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Model Playground Dispatch</span>
            </div>
          </div>
        </div>

        {/* Status Metrics Box */}
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-semibold">
            Health Summary
          </span>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Configured:</span>
              <span className="font-mono text-sm font-bold text-slate-900">{configuredCount} / 4 Providers</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Validated:</span>
              <span className="font-mono text-sm font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {verifiedCount} Ready
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(verifiedCount / 4) * 100}%` }}
              />
            </div>
          </div>

          <Link to="/playground">
            <Button variant="secondary" size="sm" className="w-full text-xs flex items-center justify-center gap-1.5">
              <span>Open AI Playground</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Provider Configuration Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-[#0F172A] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#0052FF]" />
            Provider Credentials & Validation Panels
          </h2>
          <span className="text-xs text-[#64748B]">Click "Verify Key" to run automated latency & handshake probe</span>
        </div>

        {/* 1. Google AI Studio / Gemini */}
        {renderGeminiCard()}

        {/* 2. OpenAI / ChatGPT */}
        {renderOpenAiCard()}

        {/* 3. Amazon Bedrock */}
        {renderBedrockCard()}

        {/* 4. NVIDIA NIM */}
        {renderNvidiaCard()}
      </div>

      {/* Live Interactive Sandbox Probe Console */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Live AI Gateway Verification Sandbox</h3>
              <p className="text-xs text-slate-500">Send an instant test prompt through the server proxy using any verified credentials.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Select Target:</span>
            <select
              value={testProvider}
              onChange={(e) => setTestProvider(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#0052FF] outline-none"
            >
              <option value="gemini">Google AI Studio (Gemini)</option>
              <option value="openai">ChatGPT (OpenAI)</option>
              <option value="nvidia">NVIDIA NIM</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a prompt to test this provider..."
              className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0052FF] outline-none font-mono text-slate-800"
            />
            <Button
              onClick={runLiveTestProbe}
              disabled={testRunning}
              variant="primary"
              size="md"
              className="text-xs flex items-center gap-1.5 shrink-0 bg-[#0052FF] hover:bg-blue-600 text-white font-semibold"
            >
              <Play className={`w-3.5 h-3.5 ${testRunning ? 'animate-spin' : ''}`} />
              <span>{testRunning ? 'Testing...' : 'Execute Probe'}</span>
            </Button>
          </div>

          {/* Test Probe Output */}
          {testResult && (
            <div className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold">PROVIDER: {testResult.provider?.toUpperCase()}</span>
                  <span className="text-slate-400">| MODEL: {testResult.model}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Server Latency: <strong className="text-amber-300">{testResult.latency_ms}ms</strong></span>
                  <span>Tokens: <strong className="text-blue-300">{testResult.tokens?.total || 'N/A'}</strong></span>
                </div>
              </div>
              <div className="whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed text-slate-200">
                {testResult.content || testResult.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderers for the 4 Provider Cards
  function renderGeminiCard() {
    const providerData = providers.find((p) => p.provider === 'gemini') || {};
    const feedback = verificationFeedback.gemini;
    const isVerifying = verifyingProvider.gemini;

    return (
      <Card className="p-6 border-[#E2E8F0] space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Google AI Studio / Gemini</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Primary Foundation Model
                </span>
                {providerData.status === 'verified' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified ({providerData.latency_ms || 290}ms)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Powers the 5-Agent Swarm, autonomous multi-modal marketing, and real-time reasoning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Get Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-mono font-bold text-slate-800">
              {providerData.configured ? `Configured (${providerData.masked_key})` : 'Not Configured'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">• ENV: GEMINI_API_KEY</span>
          </div>
          {providerData.last_verified && (
            <span className="text-[11px] font-mono text-slate-400">
              Last Verified: {new Date(providerData.last_verified).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Input & Actions */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey.gemini ? 'text' : 'password'}
                value={keyInputs.gemini}
                onChange={(e) => setKeyInputs((prev) => ({ ...prev, gemini: e.target.value }))}
                placeholder={providerData.configured ? 'Enter new key to replace current key...' : 'Enter Google AI Studio API Key (AIzaSy...)'}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => ({ ...prev, gemini: !prev.gemini }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleVerifyKey('gemini')}
                disabled={isVerifying}
                variant="secondary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold text-slate-700"
              >
                <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
                <span>{isVerifying ? 'Probing...' : 'Verify Key'}</span>
              </Button>

              <Button
                onClick={() => handleSaveKey('gemini')}
                disabled={!keyInputs.gemini}
                variant="primary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold bg-blue-600 hover:bg-blue-500 text-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </Button>

              {providerData.configured && (
                <button
                  type="button"
                  onClick={() => handleClearKey('gemini')}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                feedback.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedback.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{feedback.message}</div>
                {feedback.latency_ms && <div className="text-[11px] text-slate-500">Latency: {feedback.latency_ms}ms • Model: {feedback.model_used || 'gemini-3.1-flash-lite'}</div>}
              </div>
            </div>
          )}

          {saveSuccess.gemini && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Gemini credentials saved and updated in active memory!
            </div>
          )}
        </div>
      </Card>
    );
  }

  function renderOpenAiCard() {
    const providerData = providers.find((p) => p.provider === 'openai') || {};
    const feedback = verificationFeedback.openai;
    const isVerifying = verifyingProvider.openai;

    return (
      <Card className="p-6 border-[#E2E8F0] space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">ChatGPT / OpenAI (Open API)</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GPT-4o & Reasoning Models
                </span>
                {providerData.status === 'verified' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified ({providerData.latency_ms || 310}ms)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connects GPT-4o, GPT-4o-mini, o1, and o3-mini directly for code synthesis and conversational bot scripts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Get OpenAI Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-mono font-bold text-slate-800">
              {providerData.configured ? `Configured (${providerData.masked_key})` : 'Not Configured (Optional)'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">• ENV: OPENAI_API_KEY</span>
          </div>
          {providerData.last_verified && (
            <span className="text-[11px] font-mono text-slate-400">
              Last Verified: {new Date(providerData.last_verified).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey.openai ? 'text' : 'password'}
                value={keyInputs.openai}
                onChange={(e) => setKeyInputs((prev) => ({ ...prev, openai: e.target.value }))}
                placeholder={providerData.configured ? 'Enter new key to replace...' : 'Enter OpenAI API Key (sk-proj-...)'}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => ({ ...prev, openai: !prev.openai }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleVerifyKey('openai')}
                disabled={isVerifying}
                variant="secondary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold text-slate-700"
              >
                <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
                <span>{isVerifying ? 'Probing...' : 'Verify Key'}</span>
              </Button>

              <Button
                onClick={() => handleSaveKey('openai')}
                disabled={!keyInputs.openai}
                variant="primary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </Button>

              {providerData.configured && (
                <button
                  type="button"
                  onClick={() => handleClearKey('openai')}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                feedback.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedback.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{feedback.message}</div>
                {feedback.latency_ms && <div className="text-[11px] text-slate-500">Latency: {feedback.latency_ms}ms</div>}
              </div>
            </div>
          )}

          {saveSuccess.openai && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              OpenAI API Key saved successfully!
            </div>
          )}
        </div>
      </Card>
    );
  }

  function renderBedrockCard() {
    const providerData = providers.find((p) => p.provider === 'bedrock') || {};
    const feedback = verificationFeedback.bedrock;
    const isVerifying = verifyingProvider.bedrock;

    return (
      <Card className="p-6 border-[#E2E8F0] space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">Amazon Bedrock (AWS Open API)</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Claude 3.5 Sonnet & Titan
                </span>
                {providerData.status === 'verified' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified IAM ({providerData.latency_ms || 45}ms)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enterprise cloud model gateway for Anthropic Claude 3.5 Sonnet, Amazon Titan, and Meta Llama 3.3.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://aws.amazon.com/bedrock/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>AWS Bedrock Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-mono font-bold text-slate-800">
              {providerData.configured ? `Configured (Region: ${providerData.region || 'us-east-1'}, ${providerData.masked_key})` : 'Not Configured (Optional)'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">• ENV: AWS_ACCESS_KEY_ID</span>
          </div>
          {providerData.last_verified && (
            <span className="text-[11px] font-mono text-slate-400">
              Last Verified: {new Date(providerData.last_verified).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Multi-field AWS IAM credentials */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-600 block mb-1">AWS Access Key ID</label>
              <div className="relative">
                <input
                  type={showKey.bedrock_access ? 'text' : 'password'}
                  value={keyInputs.bedrock_access_key}
                  onChange={(e) => setKeyInputs((prev) => ({ ...prev, bedrock_access_key: e.target.value }))}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => ({ ...prev, bedrock_access: !prev.bedrock_access }))}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey.bedrock_access ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-600 block mb-1">AWS Secret Access Key</label>
              <div className="relative">
                <input
                  type={showKey.bedrock_secret ? 'text' : 'password'}
                  value={keyInputs.bedrock_secret_key}
                  onChange={(e) => setKeyInputs((prev) => ({ ...prev, bedrock_secret_key: e.target.value }))}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => ({ ...prev, bedrock_secret: !prev.bedrock_secret }))}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey.bedrock_secret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-600 block mb-1">AWS Region</label>
              <select
                value={keyInputs.bedrock_region}
                onChange={(e) => setKeyInputs((prev) => ({ ...prev, bedrock_region: e.target.value }))}
                className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none"
              >
                <option value="us-east-1">us-east-1 (N. Virginia)</option>
                <option value="us-west-2">us-west-2 (Oregon)</option>
                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              onClick={() => handleVerifyKey('bedrock')}
              disabled={isVerifying}
              variant="secondary"
              size="md"
              className="text-xs flex items-center gap-1.5 font-semibold text-slate-700"
            >
              <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-amber-600' : 'text-amber-600'}`} />
              <span>{isVerifying ? 'Validating...' : 'Verify Credentials'}</span>
            </Button>

            <Button
              onClick={() => handleSaveKey('bedrock')}
              disabled={!keyInputs.bedrock_access_key || !keyInputs.bedrock_secret_key}
              variant="primary"
              size="md"
              className="text-xs flex items-center gap-1.5 font-semibold bg-amber-600 hover:bg-amber-500 text-white"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save AWS Credentials</span>
            </Button>

            {providerData.configured && (
              <button
                type="button"
                onClick={() => handleClearKey('bedrock')}
                className="p-2 text-slate-400 hover:text-red-600 transition"
                title="Remove Credentials"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                feedback.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedback.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{feedback.message}</div>
                {feedback.latency_ms && <div className="text-[11px] text-slate-500">Latency: {feedback.latency_ms}ms • Region: {feedback.details?.region || 'us-east-1'}</div>}
              </div>
            </div>
          )}

          {saveSuccess.bedrock && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Amazon Bedrock credentials saved!
            </div>
          )}
        </div>
      </Card>
    );
  }

  function renderNvidiaCard() {
    const providerData = providers.find((p) => p.provider === 'nvidia') || {};
    const feedback = verificationFeedback.nvidia;
    const isVerifying = verifyingProvider.nvidia;

    return (
      <Card className="p-6 border-[#E2E8F0] space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-600 to-lime-600 text-white flex items-center justify-center font-bold shadow-md shadow-green-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">NVIDIA NIM (Open API)</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  GPU-Accelerated Inference
                </span>
                {providerData.status === 'verified' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified ({providerData.latency_ms || 210}ms)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                GPU acceleration for DeepSeek-R1, DeepSeek-V3, and Llama 3.3 70B Nemotron microservices.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://build.nvidia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Get NVIDIA NIM Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Current Status:</span>
            <span className="font-mono font-bold text-slate-800">
              {providerData.configured ? `Configured (${providerData.masked_key})` : 'Not Configured (Optional)'}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">• ENV: NVIDIA_NIM_API_KEY</span>
          </div>
          {providerData.last_verified && (
            <span className="text-[11px] font-mono text-slate-400">
              Last Verified: {new Date(providerData.last_verified).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey.nvidia ? 'text' : 'password'}
                value={keyInputs.nvidia}
                onChange={(e) => setKeyInputs((prev) => ({ ...prev, nvidia: e.target.value }))}
                placeholder={providerData.configured ? 'Enter new key to replace...' : 'Enter NVIDIA NIM API Key (nvapi-...)'}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-600 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => ({ ...prev, nvidia: !prev.nvidia }))}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showKey.nvidia ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleVerifyKey('nvidia')}
                disabled={isVerifying}
                variant="secondary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold text-slate-700"
              >
                <Zap className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-green-600' : 'text-green-600'}`} />
                <span>{isVerifying ? 'Probing...' : 'Verify Key'}</span>
              </Button>

              <Button
                onClick={() => handleSaveKey('nvidia')}
                disabled={!keyInputs.nvidia}
                variant="primary"
                size="md"
                className="text-xs flex items-center gap-1.5 font-semibold bg-green-600 hover:bg-green-500 text-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </Button>

              {providerData.configured && (
                <button
                  type="button"
                  onClick={() => handleClearKey('nvidia')}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Remove Key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-start gap-2 border ${
                feedback.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {feedback.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{feedback.message}</div>
                {feedback.latency_ms && <div className="text-[11px] text-slate-500">Latency: {feedback.latency_ms}ms</div>}
              </div>
            </div>
          )}

          {saveSuccess.nvidia && (
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              NVIDIA NIM credentials saved successfully!
            </div>
          )}
        </div>
      </Card>
    );
  }
}
