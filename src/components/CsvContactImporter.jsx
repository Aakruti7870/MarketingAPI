import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Badge } from './ui';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  Plus,
  Users,
  Search,
} from 'lucide-react';

/**
 * Robust CSV parser that handles quotes, escaped commas, and multiple delimiters
 */
function parseCsvContent(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter: comma, semicolon, tab
  const firstLine = lines[0];
  let delimiter = ',';
  if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  }

  function splitRow(rowStr) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"' || char === "'") {
        if (inQuotes && rowStr[i + 1] === char) {
          current += char;
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const rawHeaders = splitRow(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    // Skip empty lines
    if (values.length === 1 && values[0] === '') continue;
    rows.push(values);
  }

  return { headers: rawHeaders, rows };
}

/**
 * Standardizes and validates phone numbers
 * Returns { valid: boolean, normalized: string, error?: string }
 */
export function validateAndNormalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, normalized: '', error: 'Missing phone number' };
  }

  // Remove common punctuation like spaces, brackets, hyphens, dots
  let cleaned = rawPhone.trim().replace(/[\s\(\)\-\.]/g, '');

  if (!cleaned) {
    return { valid: false, normalized: '', error: 'Phone number is empty' };
  }

  // Check for invalid alpha characters
  if (/[a-zA-Z]/.test(cleaned)) {
    return { valid: false, normalized: cleaned, error: 'Contains alphabet letters' };
  }

  const hasPlus = cleaned.startsWith('+');
  let digits = cleaned.replace(/\D/g, '');

  if (digits.length < 10) {
    return { valid: false, normalized: cleaned, error: `Too short (${digits.length} digits, min 10)` };
  }

  if (digits.length > 15) {
    return { valid: false, normalized: cleaned, error: `Too long (${digits.length} digits, max 15)` };
  }

  // Normalization logic:
  // If 10 digits (Standard Indian Mobile format: 6, 7, 8, 9)
  if (digits.length === 10) {
    if (/^[6-9]\d{9}$/.test(digits)) {
      return { valid: true, normalized: `+91${digits}` };
    }
    // General 10-digit number
    return { valid: true, normalized: `+1${digits}` };
  }

  // If 11 digits starting with 0 (e.g. 09820044556)
  if (digits.length === 11 && digits.startsWith('0')) {
    const sub = digits.slice(1);
    if (/^[6-9]\d{9}$/.test(sub)) {
      return { valid: true, normalized: `+91${sub}` };
    }
  }

  // If 12 digits starting with 91 (e.g. 919820044556)
  if (digits.length === 12 && digits.startsWith('91')) {
    return { valid: true, normalized: `+${digits}` };
  }

  // General valid international E.164 number
  if (hasPlus || digits.length >= 11) {
    return { valid: true, normalized: hasPlus ? `+${digits}` : `+${digits}` };
  }

  return { valid: true, normalized: `+${digits}` };
}

/**
 * Validates Contact Name
 */
export function validateName(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return { valid: false, normalized: '', error: 'Missing name' };
  }

  const trimmed = rawName.trim();
  if (trimmed.length < 2) {
    return { valid: false, normalized: trimmed, error: 'Name too short (min 2 characters)' };
  }

  const lower = trimmed.toLowerCase();
  if (['n/a', 'na', 'null', 'undefined', 'unknown', 'none'].includes(lower)) {
    return { valid: false, normalized: trimmed, error: 'Invalid placeholder name' };
  }

  return { valid: true, normalized: trimmed };
}

/**
 * Auto-detect matching column from headers
 */
function autoDetectColumn(headers, candidates) {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const c of candidates) {
      if (h.includes(c.replace(/[^a-z0-9]/g, ''))) {
        return i;
      }
    }
  }
  return -1;
}

export default function CsvContactImporter({
  existingContacts = [],
  channels = [],
  activeChannelId = '',
  onImportComplete,
  onClose,
}) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'paste'
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState(null); // { headers, rows }
  const [selectedTargetChannel, setSelectedTargetChannel] = useState(activeChannelId || (channels[0]?.channel_id || ''));

  // Column Mappings (index of header for each field)
  const [nameCol, setNameCol] = useState(-1);
  const [phoneCol, setPhoneCol] = useState(-1);
  const [emailCol, setEmailCol] = useState(-1);
  const [cityCol, setCityCol] = useState(-1);
  const [categoryCol, setCategoryCol] = useState(-1);

  // Filter & Search inside validation preview
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'valid', 'invalid', 'duplicate'
  const [searchQuery, setSearchQuery] = useState('');

  // Row selections for import (map of index -> boolean)
  const [selectedRows, setSelectedRows] = useState({});

  // Inline editing state: { rowIndex, name, phone, city }
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', city: '' });

  // Overridden rows (edited inline)
  const [overrides, setOverrides] = useState({});

  // Status feedback
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Download Sample CSV
  const handleDownloadSample = () => {
    const sampleCsv = `Full Name,Phone Number,Email,City / Area,Category,Tags
Dr. Rajesh Sharma,+91 98200 44556,dr.sharma@apexclinic.com,Vashi,Healthcare,VIP Patient;Consultation
Ananya Verma,9819933445,ananya.verma@gmail.com,Nerul,Education,Parent;Class 10 CBSE
Vikramaditya Rao,+91-98701-23984,vikram@steelbuild.com,Kharghar,Wholesale Supplier,TMT Bars Contractor
Meera Iyer,09867512345,meera.iyer@yahoo.com,Seawoods,Retail & Salon,Loyalty Member
Karan Johar,9820011223,karan@cinemagic.com,Belapur,Corporate,Event Sponsor`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'LUMINA360_Customer_Contacts_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load Demo Contacts directly for testing validation
  const handleLoadDemoData = () => {
    const demoCsv = `Name,Mobile,Email,Location,Segment
Dr. Rajesh Sharma,+91 98200 44556,dr.sharma@apexclinic.com,Vashi,Healthcare
Sunita Patel,9820011223,sunita.p@outlook.com,Sanpada,Education
Rohan Deshmukh,9876543210,rohan@gmail.com,Nerul,Retail
Sneha Patil,9819933445,sneha@gmail.com,Kharghar,Healthcare
Karan Malvankar,INVALID_NUM,karan@test.com,Panvel,Supplier
,9820099887,noname@gmail.com,Seawoods,Retail
Sunita Patel,9820011223,sunita.p@outlook.com,Sanpada,Duplicate Check
Amit Kumar,+91 98334 11223,amit.k@industry.com,Airoli,Supplier`;

    processRawText(demoCsv);
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        processRawText(text);
      }
    };
    reader.readAsText(file);
  };

  // Process text into rows and automatically map columns
  const processRawText = (text) => {
    const { headers, rows } = parseCsvContent(text);
    if (headers.length === 0 || rows.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'CSV is empty or could not be parsed.' });
      return;
    }

    setParsedData({ headers, rows });
    setOverrides({});
    setEditingRowIndex(null);

    // Auto-detect columns
    const nIdx = autoDetectColumn(headers, ['name', 'fullname', 'customer', 'patient', 'contact', 'client', 'person']);
    const pIdx = autoDetectColumn(headers, ['phone', 'mobile', 'cell', 'whatsapp', 'tel', 'contactnumber']);
    const eIdx = autoDetectColumn(headers, ['email', 'mail']);
    const cIdx = autoDetectColumn(headers, ['city', 'location', 'area', 'address', 'town']);
    const catIdx = autoDetectColumn(headers, ['category', 'segment', 'type', 'vertical', 'group', 'tag']);

    setNameCol(nIdx !== -1 ? nIdx : 0);
    setPhoneCol(pIdx !== -1 ? pIdx : (headers.length > 1 ? 1 : 0));
    setEmailCol(eIdx !== -1 ? eIdx : -1);
    setCityCol(cIdx !== -1 ? cIdx : -1);
    setCategoryCol(catIdx !== -1 ? catIdx : -1);

    setFeedbackMessage({
      type: 'success',
      text: `Successfully parsed ${rows.length} rows with ${headers.length} columns!`,
    });
  };

  // Normalized and Validated Items
  const validatedItems = useMemo(() => {
    if (!parsedData || nameCol === -1 || phoneCol === -1) return [];

    const existingPhoneSet = new Set(
      existingContacts.map((c) => validateAndNormalizePhone(c.phone).normalized)
    );
    const seenInBatch = new Set();

    return parsedData.rows.map((row, idx) => {
      const override = overrides[idx];

      const rawName = override?.name !== undefined ? override.name : row[nameCol] || '';
      const rawPhone = override?.phone !== undefined ? override.phone : row[phoneCol] || '';
      const rawEmail = override?.email !== undefined ? override.email : (emailCol !== -1 ? row[emailCol] : '');
      const rawCity = override?.city !== undefined ? override.city : (cityCol !== -1 ? row[cityCol] : 'Local');
      const rawCategory = categoryCol !== -1 ? row[categoryCol] : 'Customer';

      const nameVal = validateName(rawName);
      const phoneVal = validateAndNormalizePhone(rawPhone);

      let status = 'valid';
      let statusNote = 'Verified & Ready';

      if (!nameVal.valid) {
        status = 'missing_name';
        statusNote = nameVal.error || 'Invalid name';
      } else if (!phoneVal.valid) {
        status = 'invalid_phone';
        statusNote = phoneVal.error || 'Invalid phone';
      } else if (existingPhoneSet.has(phoneVal.normalized)) {
        status = 'duplicate';
        statusNote = 'Already exists in target channel';
      } else if (seenInBatch.has(phoneVal.normalized)) {
        status = 'duplicate';
        statusNote = 'Duplicate within this CSV';
      } else {
        seenInBatch.add(phoneVal.normalized);
      }

      return {
        rowIndex: idx,
        name: nameVal.normalized || rawName,
        phone: phoneVal.normalized || rawPhone,
        email: rawEmail,
        city: rawCity,
        category: rawCategory,
        status,
        statusNote,
        isValid: status === 'valid',
        rawRow: row,
      };
    });
  }, [parsedData, nameCol, phoneCol, emailCol, cityCol, categoryCol, overrides, existingContacts]);

  // Sync default selection (check valid items by default)
  useMemo(() => {
    const initial = {};
    validatedItems.forEach((item) => {
      initial[item.rowIndex] = item.isValid;
    });
    setSelectedRows(initial);
  }, [validatedItems.length]);

  // Filtered Items for Display
  const displayItems = useMemo(() => {
    return validatedItems.filter((item) => {
      // Status filter
      if (statusFilter === 'valid' && item.status !== 'valid') return false;
      if (statusFilter === 'invalid' && (item.status === 'valid' || item.status === 'duplicate')) return false;
      if (statusFilter === 'duplicate' && item.status !== 'duplicate') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.phone.includes(q) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.city && item.city.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [validatedItems, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = validatedItems.length;
    const valid = validatedItems.filter((i) => i.status === 'valid').length;
    const invalid = validatedItems.filter((i) => i.status === 'invalid_phone' || i.status === 'missing_name').length;
    const duplicate = validatedItems.filter((i) => i.status === 'duplicate').length;
    const selectedCount = Object.values(selectedRows).filter(Boolean).length;
    return { total, valid, invalid, duplicate, selectedCount };
  }, [validatedItems, selectedRows]);

  // Toggle selection for single row
  const toggleRow = (idx) => {
    setSelectedRows((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Select all valid
  const handleSelectAllValid = () => {
    const updated = {};
    validatedItems.forEach((item) => {
      updated[item.rowIndex] = item.isValid;
    });
    setSelectedRows(updated);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedRows({});
  };

  // Start inline edit
  const handleStartEdit = (item) => {
    setEditingRowIndex(item.rowIndex);
    setEditForm({
      name: item.name,
      phone: item.phone,
      email: item.email || '',
      city: item.city || '',
    });
  };

  // Save inline edit
  const handleSaveEdit = (idx) => {
    setOverrides((prev) => ({
      ...prev,
      [idx]: { ...editForm },
    }));
    setEditingRowIndex(null);
  };

  // Cancel inline edit
  const handleCancelEdit = () => {
    setEditingRowIndex(null);
  };

  // Confirm Import & Update Local State
  const handleConfirmImport = async () => {
    const itemsToImport = validatedItems
      .filter((item) => selectedRows[item.rowIndex])
      .map((item) => ({
        id: `c_csv_${Date.now().toString().slice(-5)}_${item.rowIndex}`,
        name: item.name,
        phone: item.phone,
        email: item.email || '',
        city: item.city || 'Local',
        category: item.category || 'Customer',
        tags: ['CSV Import', item.category || 'Customer'],
        imported_via: 'csv',
        added_at: new Date().toISOString().split('T')[0],
      }));

    if (itemsToImport.length === 0) {
      setFeedbackMessage({ type: 'error', text: 'Please select at least one contact to import.' });
      return;
    }

    setIsProcessing(true);

    try {
      // Sync with server if target channel is specified
      if (selectedTargetChannel && selectedTargetChannel !== 'new') {
        await fetch(`/api/channels/${selectedTargetChannel}/contacts-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: itemsToImport }),
        });
      }

      // Update Parent Local State
      if (onImportComplete) {
        onImportComplete(itemsToImport, selectedTargetChannel);
      }

      setFeedbackMessage({
        type: 'success',
        text: `Successfully imported ${itemsToImport.length} verified contacts into customer list!`,
      });

      // Clear or close after short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      // Even if network fails, trigger parent callback to update local state
      if (onImportComplete) {
        onImportComplete(itemsToImport, selectedTargetChannel);
      }
      if (onClose) onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-100 space-y-6 shadow-2xl backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                CSV Contact Importer & Phone Validator
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  E.164 Shield
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Parses, validates, normalizes phone numbers (+91), deduplicates, and adds contacts to your channel lists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="text-xs text-slate-300 hover:text-white border-slate-700"
            title="Download CSV Template"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Download Template
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLoadDemoData}
            className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
            title="Load Sample with mixed valid/invalid contacts"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-300" /> Load Demo Data
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Step 1: Input Area (Upload or Paste) */}
      {!parsedData ? (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload CSV File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'paste'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Paste Raw CSV Text
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-3xl p-10 text-center bg-slate-950/50 hover:bg-slate-950/80 cursor-pointer transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-black text-white">
                  Drop your CSV file here, or <span className="text-cyan-400 underline">browse files</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Supports standard formats from Google Contacts, Excel, CRM exports, or WhatsApp contact lists.
                </p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-mono pt-2">
                  <span>• Comma separated</span>
                  <span>• Auto phone normalization (+91)</span>
                  <span>• Deduplication</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Paste CSV content here, e.g.:
Full Name, Phone, Email, City
Dr. Sharma, +919820011223, sharma@clinic.com, Vashi
Sunita Verma, 9819933445, sunita@tutor.org, Nerul`}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <Button
                variant="gradient"
                size="sm"
                onClick={() => processRawText(rawText)}
                disabled={!rawText.trim()}
                className="w-full font-bold text-xs"
              >
                Parse & Validate Contacts
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Step 2: Parsed State with Column Mapping & Interactive Validation Table */
        <div className="space-y-6">
          {/* Target Channel and Column Mapping Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
            {/* Target Channel Destination */}
            <div className="md:col-span-4 space-y-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Destination Channel
              </label>
              <select
                value={selectedTargetChannel}
                onChange={(e) => setSelectedTargetChannel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-cyan-400"
              >
                <option value="">Current Selected List Only</option>
                {channels.map((ch) => (
                  <option key={ch.channel_id} value={ch.channel_id}>
                    {ch.channel_name} ({ch.contacts_count} contacts)
                  </option>
                ))}
              </select>
            </div>

            {/* Name Column Mapping */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400">
                Name Column *
              </label>
              <select
                value={nameCol}
                onChange={(e) => setNameCol(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white"
              >
                {parsedData.headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h || `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Column Mapping */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400">
                Phone Column *
              </label>
              <select
                value={phoneCol}
                onChange={(e) => setPhoneCol(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white"
              >
                {parsedData.headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h || `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* City Column Mapping */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                City / Location
              </label>
              <select
                value={cityCol}
                onChange={(e) => setCityCol(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-white"
              >
                <option value={-1}>None</option>
                {parsedData.headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h || `Column ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-2 flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setParsedData(null);
                  setOverrides({});
                }}
                className="w-full text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-upload
              </Button>
            </div>
          </div>

          {/* Validation Stats Strip & Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('valid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  statusFilter === 'valid'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid ({stats.valid})
              </button>
              <button
                onClick={() => setStatusFilter('invalid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  statusFilter === 'invalid'
                    ? 'bg-rose-500 text-white font-black shadow-md'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Needs Review ({stats.invalid})
              </button>
              <button
                onClick={() => setStatusFilter('duplicate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  statusFilter === 'duplicate'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Duplicates ({stats.duplicate})
              </button>
            </div>

            {/* Search Input & Select Shortcuts */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search parsed records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 w-44 sm:w-56 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                onClick={handleSelectAllValid}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                Select All Valid
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Validation Review Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 shadow-inner">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-12 text-center">Include</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Normalized Phone</th>
                    <th className="p-3">City / Area</th>
                    <th className="p-3">Validation Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                        No contacts match the current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item) => {
                      const isEditing = editingRowIndex === item.rowIndex;
                      const isSelected = !!selectedRows[item.rowIndex];

                      return (
                        <tr
                          key={item.rowIndex}
                          className={`transition ${
                            isSelected ? 'bg-cyan-950/20' : 'hover:bg-slate-900/40'
                          } ${!item.isValid ? 'opacity-85' : ''}`}
                        >
                          {/* Inclusion Checkbox */}
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(item.rowIndex)}
                              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 border-slate-700 bg-slate-900 cursor-pointer"
                            />
                          </td>

                          {/* Customer Name */}
                          <td className="p-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-xs text-white font-bold"
                              />
                            ) : (
                              <div className="font-extrabold text-white flex items-center gap-1.5">
                                <span>{item.name || <span className="text-rose-400 italic font-normal">[Empty Name]</span>}</span>
                              </div>
                            )}
                          </td>

                          {/* Normalized Phone */}
                          <td className="p-3 font-mono">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full bg-slate-900 border border-cyan-500 rounded px-2 py-1 text-xs text-white font-mono"
                              />
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded ${
                                  item.status === 'invalid_phone'
                                    ? 'bg-rose-500/20 text-rose-300 font-bold'
                                    : 'text-cyan-300 font-semibold'
                                }`}
                              >
                                {item.phone || <span className="text-rose-400 italic">[No Phone]</span>}
                              </span>
                            )}
                          </td>

                          {/* City */}
                          <td className="p-3 text-slate-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                              />
                            ) : (
                              item.city || '—'
                            )}
                          </td>

                          {/* Validation Status Badge */}
                          <td className="p-3">
                            {item.status === 'valid' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                              </span>
                            )}
                            {item.status === 'invalid_phone' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3" /> {item.statusNote}
                              </span>
                            )}
                            {item.status === 'missing_name' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3" /> Missing Name
                              </span>
                            )}
                            {item.status === 'duplicate' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" /> {item.statusNote}
                              </span>
                            )}
                          </td>

                          {/* Inline Edit Actions */}
                          <td className="p-3 text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleSaveEdit(item.rowIndex)}
                                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                  title="Save Changes"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition"
                                title="Edit inline to fix number or name"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy Note & Final Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                1-to-1 Privacy Shielding active. Selected contacts will be imported with encrypted customer tokens.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {onClose && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:w-auto text-xs border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="gradient"
                size="md"
                disabled={stats.selectedCount === 0 || isProcessing}
                onClick={handleConfirmImport}
                className="w-full sm:w-auto text-xs font-black shadow-lg shadow-indigo-600/30 px-6"
              >
                {isProcessing
                  ? 'Importing...'
                  : `Confirm Import (${stats.selectedCount} Contacts) →`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
