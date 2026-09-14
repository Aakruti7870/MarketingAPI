import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/ui';
import CsvContactImporter from '../components/CsvContactImporter';
import {
  Users,
  Radio,
  Share2,
  Upload,
  Smartphone,
  FileSpreadsheet,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  Eye,
  Search,
  Filter,
  Layers,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  Tag,
  AlertCircle,
  Download,
} from 'lucide-react';

const BANNER_PRESETS = [
  {
    vertical: 'healthcare',
    title: 'Weekend Doctor Consultation & Camp',
    headline: 'Executive Health Checkup 40% Off',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    defaultText: 'Hello {{name}}! 🏥 Dr. Mehta Clinic is hosting our preventive wellness camp this weekend. 58 vital diagnostic tests for just ₹1,499 (worth ₹2,500). Tap below to lock in your morning slot.',
    cta: 'Reserve Doctor Slot',
  },
  {
    vertical: 'education',
    title: 'Free 3-Day Demo Masterclass',
    headline: 'Crack NEET / JEE 2027 with Ex-IITians',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    defaultText: 'Dear {{name}}, Brilliant Academy invites your child to our Exclusive 3-Day NEET & JEE Foundation Masterclass this Saturday & Sunday. Zero fee trial pass attached!',
    cta: 'Claim Free Demo Pass',
  },
  {
    vertical: 'retail',
    title: 'VIP Weekend Makeover & Spa Combo',
    headline: 'Flat 25% Off VIP Luxury Combos',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
    defaultText: '✨ Special treat for {{name}}! Enjoy flat 25% off on all hair styling and organic facial packages valid till Sunday night. Show this pass at billing.',
    cta: 'Claim 25% Discount Pass',
  },
  {
    vertical: 'suppliers',
    title: 'Spot Mill Rate - Fe-550D TMT Bars',
    headline: 'Factory Direct Wholesale Rate Lock',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    defaultText: 'Hi {{name}}, National Steel wholesale alert: Today’s spot rate for Fe-550D TMT bars is locked at ₹52,800/ton for 15+ Ton orders with same-day dispatch from Kalamboli.',
    cta: 'Lock Rate & Get PO',
  },
  {
    vertical: 'rmc',
    title: 'Concrete Pour Dispatch Spec',
    headline: 'IS 456 M25 Design Mix with Free Transit Pump',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
    defaultText: 'Attention {{name}}: Pour batch slots open for tomorrow! M25 grade Ready Mix Concrete at ₹3,750/m³ including high-reach transit pump service. Guaranteed IS 456 cube strength test.',
    cta: 'Book Transit Mixer',
  },
];

export default function ChannelHub() {
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [channelContacts, setChannelContacts] = useState([]);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('share'); // 'share', 'contacts', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: 'info' });

  // Share Template State
  const [selectedPreset, setSelectedPreset] = useState(BANNER_PRESETS[0]);
  const [bannerUrl, setBannerUrl] = useState(BANNER_PRESETS[0].image);
  const [headline, setHeadline] = useState(BANNER_PRESETS[0].headline);
  const [templateBody, setTemplateBody] = useState(BANNER_PRESETS[0].defaultText);
  const [ctaButton, setCtaButton] = useState(BANNER_PRESETS[0].cta);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // New Channel Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelVertical, setNewChannelVertical] = useState('healthcare');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  // Contact Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCsvImporterModal, setShowCsvImporterModal] = useState(false);
  const [importMethod, setImportMethod] = useState('phone'); // 'phone', 'csv', 'paste'
  const [rawContactText, setRawContactText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importTargetChannel, setImportTargetChannel] = useState('');

  // Add Single Contact Inline Form
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', city: '', tags: '' });

  // Fetch Channels
  const loadChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      const data = await res.json();
      if (Array.isArray(data)) {
        setChannels(data);
        if (!selectedChannelId && data.length > 0) {
          setSelectedChannelId(data[0].channel_id);
          setImportTargetChannel(data[0].channel_id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Contacts for selected channel
  const loadContacts = async (chanId) => {
    if (!chanId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${chanId}/contacts`);
      const data = await res.json();
      if (data.contacts) {
        setChannelContacts(data.contacts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch History for selected channel
  const loadHistory = async (chanId) => {
    if (!chanId) return;
    try {
      const res = await fetch(`/api/channels/${chanId}/history`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBroadcastHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (selectedChannelId) {
      loadContacts(selectedChannelId);
      loadHistory(selectedChannelId);
      const ch = channels.find((c) => c.channel_id === selectedChannelId);
      if (ch) {
        const matchingPreset = BANNER_PRESETS.find((p) => p.vertical === ch.vertical) || BANNER_PRESETS[0];
        setSelectedPreset(matchingPreset);
        setBannerUrl(matchingPreset.image);
        setHeadline(matchingPreset.headline);
        setTemplateBody(matchingPreset.defaultText);
        setCtaButton(matchingPreset.cta);
      }
    }
  }, [selectedChannelId, channels]);

  const activeChannel = channels.find((c) => c.channel_id === selectedChannelId) || channels[0];

  // Handle Create Channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_name: newChannelName,
          vertical: newChannelVertical,
          description: newChannelDesc,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowCreateModal(false);
        setNewChannelName('');
        setNewChannelDesc('');
        setActionMessage({ text: `Channel "${data.channel.channel_name}" created successfully!`, type: 'success' });
        await loadChannels();
        setSelectedChannelId(data.channel.channel_id);
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Failed to create channel.', type: 'error' });
    }
  };

  // Handle File or Phone Contacts Import
  const handleImportContacts = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('channel_id', importTargetChannel || selectedChannelId);
    if (selectedFile) {
      formData.append('file', selectedFile);
    } else if (rawContactText.trim()) {
      formData.append('raw_text', rawContactText);
    } else {
      setActionMessage({ text: 'Please choose a file or paste contact text.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/channels/import-contacts', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowImportModal(false);
        setSelectedFile(null);
        setRawContactText('');
        setActionMessage({ text: data.message || `Successfully imported contacts!`, type: 'success' });
        await loadChannels();
        await loadContacts(data.channel_id);
        setSelectedChannelId(data.channel_id);
        setActiveTab('contacts');
      } else {
        setActionMessage({ text: data.detail || 'Import failed.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error importing contacts file.', type: 'error' });
    }
  };

  // Handle CSV Import Component Complete Callback
  const handleCsvImportComplete = (importedContacts, targetChannelId) => {
    const destChanId = targetChannelId || selectedChannelId;

    // 1. Update local state for customer lists immediately
    if (!destChanId || destChanId === selectedChannelId) {
      setChannelContacts((prev) => [...importedContacts, ...prev]);
    }

    // 2. Update local state channel counters
    setChannels((prev) =>
      prev.map((ch) =>
        ch.channel_id === destChanId
          ? { ...ch, contacts_count: (ch.contacts_count || 0) + importedContacts.length }
          : ch
      )
    );

    setActionMessage({
      text: `Successfully validated and imported ${importedContacts.length} contacts into customer list!`,
      type: 'success',
    });

    setShowCsvImporterModal(false);
    setShowImportModal(false);

    // Refresh server data to maintain synchronization
    loadChannels();
    if (destChanId) {
      setSelectedChannelId(destChanId);
      loadContacts(destChanId);
    }
  };

  // Handle Add Single Contact
  const handleAddSingleContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    try {
      const res = await fetch(`/api/channels/${selectedChannelId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone,
          email: contactForm.email,
          city: contactForm.city,
          tags: contactForm.tags ? contactForm.tags.split(',').map((t) => t.trim()) : ['Manual'],
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setShowAddContact(false);
        setContactForm({ name: '', phone: '', email: '', city: '', tags: '' });
        setActionMessage({ text: `Added contact ${data.contact.name} to channel.`, type: 'success' });
        loadContacts(selectedChannelId);
        loadChannels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Share Template to Channel
  const handleShareToChannel = async () => {
    if (!selectedChannelId) return;
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/channels/share-marketing-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: selectedChannelId,
          banner_url: bannerUrl,
          headline: headline,
          template_body: templateBody,
          button_cta: ctaButton,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMessage({
          text: `🚀 Broadcast Successful! Delivered marketing banner to ${data.delivered_count} contacts via 1-to-1 Privacy Shield.`,
          type: 'success',
        });
        loadHistory(selectedChannelId);
        loadChannels();
      } else {
        setActionMessage({ text: data.detail || 'Could not complete broadcast.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ text: 'Error dispatching banner to channel.', type: 'error' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const filteredContacts = channelContacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -bottom-10 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Custom Channels & 1-to-1 Broadcasts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                1-to-1 Privacy Shield Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Channel Manager & Marketing Banner Sharing
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Import your customer contact lists from your <strong>Phone Contacts (.vcf)</strong> or <strong>CSV Files</strong>, organize into custom channels, and broadcast high-converting marketing banner templates directly to your clients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="gradient"
              size="md"
              onClick={() => setShowCsvImporterModal(true)}
              className="text-xs font-extrabold shadow-lg shadow-cyan-500/20"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-cyan-300" /> CSV Importer & Phone Validator
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowImportModal(true)}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Upload className="w-4 h-4 mr-1.5" /> Phone vCard / Quick Upload
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create New Channel
            </Button>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage({ text: '', type: 'info' })}
            className="text-slate-400 hover:text-slate-700 ml-4 font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Channel Selector Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            Select Broadcast Channel ({channels.length})
          </span>
          <button
            onClick={loadChannels}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {channels.map((chan) => {
            const isSelected = chan.channel_id === selectedChannelId;
            return (
              <button
                key={chan.channel_id}
                onClick={() => setSelectedChannelId(chan.channel_id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-lg shadow-indigo-950/10 ring-2 ring-indigo-500/60'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {chan.vertical}
                  </span>
                  <span className={`text-xs font-black flex items-center gap-1 ${isSelected ? 'text-cyan-400' : 'text-indigo-600'}`}>
                    <Users className="w-3.5 h-3.5" />
                    {chan.contacts_count} contacts
                  </span>
                </div>
                <h4 className="font-extrabold text-sm line-clamp-1 mb-1">{chan.channel_name}</h4>
                <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  {chan.description || 'Custom customer audience list.'}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-200/30 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>
                    Last: {chan.last_broadcast || 'Never'}
                  </span>
                  <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Shielded 1-to-1
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-black">
        <button
          onClick={() => setActiveTab('share')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'share'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" /> Share Marketing Banners & Templates
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'contacts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Channel Contacts ({channelContacts.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" /> Broadcast History ({broadcastHistory.length})
        </button>
      </div>

      {/* Tab 1: Share Marketing Banners & Templates to Channel */}
      {activeTab === 'share' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Banner Template Configurator */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="space-y-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 block mb-1">
                  1. Choose Industry Banner Concept
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BANNER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset);
                        setBannerUrl(preset.image);
                        setHeadline(preset.headline);
                        setTemplateBody(preset.defaultText);
                        setCtaButton(preset.cta);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        selectedPreset.headline === preset.headline
                          ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-extrabold text-[11px] line-clamp-1">{preset.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{preset.headline}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Banner Image URL or Web Asset
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setBannerUrl(
                          'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'
                        )
                      }
                      className="text-xs"
                    >
                      Use Sample
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Promotional Headline / Title
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      Marketing WhatsApp Template Copy
                    </label>
                    <div className="flex gap-1">
                      {['{{name}}', '{{discount}}', '{{clinic}}', '{{rate}}'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTemplateBody((prev) => `${prev} ${tag}`)}
                          className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono hover:bg-indigo-100 font-bold"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={templateBody}
                    onChange={(e) => setTemplateBody(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Interactive CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaButton}
                    onChange={(e) => setCtaButton(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Broadcast Action Box */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-slate-800">
                    Broadcasting to: {activeChannel?.channel_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Reaches {channelContacts.length || activeChannel?.contacts_count || 0} clients via 1-to-1 individual messages.
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleShareToChannel}
                  disabled={isBroadcasting || (channelContacts.length === 0 && !activeChannel?.contacts_count)}
                  className="w-full sm:w-auto text-xs font-black shadow-lg shadow-indigo-600/25"
                >
                  {isBroadcasting ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-1.5 animate-spin" /> Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" /> Broadcast Template Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right: Simulated WhatsApp Phone Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Phone Speaker & Camera Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-950"></div>
              </div>

              {/* Phone Screen Area */}
              <div className="bg-[#EFEAE2] rounded-[30px] overflow-hidden min-h-[520px] flex flex-col text-slate-900">
                {/* Chat Top Bar */}
                <div className="bg-[#075E54] text-white p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    {activeChannel?.channel_name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate">Your Verified Business</div>
                    <div className="text-[9px] text-emerald-200">WhatsApp Official Business Account</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>

                {/* Message Bubble Area */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  <div className="text-center">
                    <span className="bg-amber-100/90 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                      1-to-1 Privacy Shield: Number Hidden
                    </span>
                  </div>

                  {/* The Marketing Card Preview */}
                  <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 space-y-2">
                    {/* Banner Image */}
                    {bannerUrl ? (
                      <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 relative">
                        <img
                          src={bannerUrl}
                          alt="Marketing Banner"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                          {activeChannel?.vertical?.toUpperCase() || 'PROMOTION'}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                        <ImageIcon className="w-6 h-6 mr-1" /> Banner Preview
                      </div>
                    )}

                    {/* Headline */}
                    <div className="font-black text-xs text-slate-900 px-1">{headline}</div>

                    {/* Formatted Copy with resolved sample name */}
                    <div className="text-[11px] text-slate-700 leading-relaxed px-1 whitespace-pre-line">
                      {templateBody.replace(/\{\{name\}\}/g, 'Rohit Sharma')}
                    </div>

                    {/* WhatsApp Interactive Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        {ctaButton || 'Claim Now'}
                      </button>
                    </div>

                    <div className="text-[9px] text-slate-400 text-right pr-1">11:42 AM ✓✓</div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-2 bg-white/80 border-t border-slate-200 text-center text-[10px] text-slate-400">
                  Preview on Customer Device
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Channel Contacts Management */}
      {activeTab === 'contacts' && (
        <Card className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-lg text-slate-900">
                Contacts in "{activeChannel?.channel_name}"
              </h3>
              <p className="text-xs text-slate-500">
                All contacts receive broadcasts individually via 1-to-1 Privacy Shield.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddContact(!showAddContact)}
                className="text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Contact
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setImportTargetChannel(selectedChannelId);
                  setShowCsvImporterModal(true);
                }}
                className="text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-cyan-300" /> CSV Parser & Validator
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setImportTargetChannel(selectedChannelId);
                  setShowImportModal(true);
                }}
                className="text-xs font-bold"
              >
                <Upload className="w-3.5 h-3.5 mr-1" /> Phone vCard
              </Button>
            </div>
          </div>

          {/* Inline Add Contact Form */}
          {showAddContact && (
            <form
              onSubmit={handleAddSingleContact}
              className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="rajesh@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Area / City</label>
                <input
                  type="text"
                  placeholder="Navi Mumbai"
                  value={contactForm.city}
                  onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" size="md" className="w-full text-xs font-bold">
                  Save Contact
                </Button>
              </div>
            </form>
          )}

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, phone, area, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap">
              Showing {filteredContacts.length} of {channelContacts.length} contacts
            </span>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black">
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Category / City</th>
                  <th className="py-3 px-4">Import Source</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Privacy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm text-slate-600">No contacts found</p>
                      <p className="text-xs text-slate-400">
                        Import contacts from your phone or upload a CSV file to begin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.name}
                        {c.email && (
                          <span className="block text-[10px] text-slate-400 font-normal">{c.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {c.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold">{c.category || 'Customer'}</span>
                        {c.city && <span className="block text-[10px] text-slate-400">{c.city}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.imported_via === 'phone_vcard'
                              ? 'bg-purple-100 text-purple-800'
                              : c.imported_via === 'csv'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.imported_via === 'phone_vcard' ? (
                            <>
                              <Smartphone className="w-3 h-3" /> Phone vCard
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet className="w-3 h-3" /> CSV File
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || ['Customer']).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Protected
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Broadcast History */}
      {activeTab === 'history' && (
        <Card className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-black text-lg text-slate-900">
              Broadcast Dispatch Receipts
            </h3>
            <p className="text-xs text-slate-500">
              Audit logs of all banners, headlines, and templates delivered to this channel.
            </p>
          </div>

          {broadcastHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">No broadcasts recorded yet</p>
              <p className="text-xs text-slate-400">
                Switch to the "Share Marketing Banners" tab to launch your first broadcast!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {broadcastHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {rec.banner_url && (
                      <img
                        src={rec.banner_url}
                        alt="Dispatched banner"
                        className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs text-slate-900">{rec.headline}</h4>
                        <Badge status="success" className="text-[10px] py-0">
                          {rec.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{rec.message_body}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span>Dispatched: {new Date(rec.dispatched_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">
                          {rec.delivered_count} recipients
                        </span>
                        {rec.button_cta && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 font-bold">CTA: "{rec.button_cta}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/80 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 1-to-1 Delivered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal: Create New Channel */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Create Custom Channel
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Channel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navi Mumbai Cardiologists & Labs"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Industry / Vertical</label>
                <select
                  value={newChannelVertical}
                  onChange={(e) => setNewChannelVertical(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="healthcare">Hospitals, Clinics & Labs</option>
                  <option value="education">Schools, Tutors & Coaching</option>
                  <option value="retail">Salons, Spas & Local Retail</option>
                  <option value="suppliers">B2B Wholesale Suppliers</option>
                  <option value="rmc">Ready Mix Concrete & Builders</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">Description / Target Goal</label>
                <textarea
                  rows={2}
                  placeholder="Target audience details or promotional goals..."
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" className="font-bold">
                  Create Channel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Contacts from Phone (.vcf) or CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  Import Contacts from Phone or File
                </h3>
                <p className="text-[11px] text-slate-500">
                  Save your contacts into a privacy-shielded marketing channel.
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Import Method Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImportMethod('phone')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 ${
                  importMethod === 'phone'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Phone vCard (.vcf)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setShowCsvImporterModal(true);
                }}
                className="py-2 px-3 rounded-xl border border-cyan-500/40 bg-cyan-50 text-cyan-800 flex flex-col items-center gap-1 hover:bg-cyan-100/70 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-600" />
                <span className="font-extrabold text-[11px]">CSV Validator</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMethod('paste')}
                className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 ${
                  importMethod === 'paste'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Tag className="w-4 h-4" />
                Paste Numbers
              </button>
            </div>

            {/* CSV Launcher Alert Callout */}
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-indigo-50 border border-cyan-200 rounded-2xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  Visual CSV Parser & Phone Normalizer (+91)
                </div>
                <div className="text-[10px] text-slate-500">
                  Preview columns, fix invalid numbers inline, deduplicate, and verify before importing.
                </div>
              </div>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={() => {
                  setShowImportModal(false);
                  setShowCsvImporterModal(true);
                }}
                className="text-xs font-black shadow-md shadow-cyan-500/20 shrink-0"
              >
                Open Validator →
              </Button>
            </div>

            <form onSubmit={handleImportContacts} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">Target Channel</label>
                <select
                  value={importTargetChannel}
                  onChange={(e) => setImportTargetChannel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="new">+ Create Brand New Channel for this Import</option>
                  {channels.map((ch) => (
                    <option key={ch.channel_id} value={ch.channel_id}>
                      Add to: {ch.channel_name} ({ch.contacts_count} contacts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone vCard or CSV Upload */}
              {importMethod !== 'paste' ? (
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Select File ({importMethod === 'phone' ? '.vcf Phone Export' : '.csv / .xlsx'})
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 cursor-pointer">
                    <input
                      type="file"
                      accept={importMethod === 'phone' ? '.vcf,text/vcard' : '.csv,.txt'}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="channel-file-input"
                    />
                    <label htmlFor="channel-file-input" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                      <div className="font-bold text-xs text-slate-700">
                        {selectedFile ? selectedFile.name : 'Click to browse or drag & drop file'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {importMethod === 'phone'
                          ? 'Export contacts from your iPhone or Android phone as .vcf and upload here.'
                          : 'Headers: Name, Phone, Email, Area/City'}
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Paste Phone Contacts Text
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`Paste name & phone lines, e.g.:
Dr. Sharma, +919820011223
Rahul Verma, +919819933445
Priya Patel, +919870123984`}
                    value={rawContactText}
                    onChange={(e) => setRawContactText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900"
                  ></textarea>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold">
                  All imported phone numbers are encrypted with 1-to-1 Privacy Shielding. Contacts never see each other's numbers.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" size="sm" className="font-bold">
                  Import & Save Contacts
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Parser & Phone Validator Modal */}
      {showCsvImporterModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="max-w-4xl w-full my-auto max-h-[95vh] overflow-y-auto rounded-3xl">
            <CsvContactImporter
              existingContacts={channelContacts}
              channels={channels}
              activeChannelId={selectedChannelId}
              onImportComplete={handleCsvImportComplete}
              onClose={() => setShowCsvImporterModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
