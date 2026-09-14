import React, { useState } from 'react';
import { Card, Button, Badge, StatCard } from '../components/ui';
import {
  Calculator,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Activity,
  GraduationCap,
  Store,
  Truck,
  Building2,
  Sparkles,
} from 'lucide-react';

const VERTICAL_CALCULATORS = {
  healthcare: {
    title: 'Clinical Package & Consultation Sizing',
    badge: 'Healthcare Floor Guard',
    icon: Activity,
    baseRateLabel: 'Base Consultation/Camp Package (₹)',
    baseRate: 2500,
    floorRate: 1750,
    unitLabel: 'Patients / Vouchers',
    defaultQty: 25,
    description: 'Calculate diagnostic camp revenue, minimum margin floor, and issue direct WhatsApp booking payment links.',
  },
  education: {
    title: 'Tuition Fee & Demo Pass Pricing Engine',
    badge: 'EdTech Revenue Guard',
    icon: GraduationCap,
    baseRateLabel: 'Course Term Fee (₹)',
    baseRate: 45000,
    floorRate: 38000,
    unitLabel: 'Enrolled Students',
    defaultQty: 15,
    description: 'Structure tuition installments, sibling discounts, and automated admission token deposit links.',
  },
  retail: {
    title: 'Retail VIP Combo & Loyalty Margin Engine',
    badge: 'Retail Margin Guard',
    icon: Store,
    baseRateLabel: 'VIP Package Price (₹)',
    baseRate: 1999,
    floorRate: 1499,
    unitLabel: 'Vouchers Claimed',
    defaultQty: 30,
    description: 'Calculate stylist combo discounts while protecting minimum salon service margins.',
  },
  suppliers: {
    title: 'B2B Wholesale Tiered Margin Engine',
    badge: 'Wholesale Mill Rate',
    icon: Truck,
    baseRateLabel: 'Price per Metric Ton (₹)',
    baseRate: 54000,
    floorRate: 51500,
    unitLabel: 'Metric Tons (TMT Bars)',
    defaultQty: 20,
    description: 'Real-time mill spot rate calculation with volume rebate tiers and instant PO links.',
  },
  rmc: {
    title: 'IS 456 Concrete Pour & Transit Pump Engine',
    badge: 'IS 456 Spec',
    icon: Building2,
    baseRateLabel: 'Rate per m³ (₹)',
    baseRate: 3800,
    floorRate: 3450,
    unitLabel: 'Cubic Meters (m³)',
    defaultQty: 50,
    description: 'Calculate pour volume, transit mixer requirements (6m³ trucks), and slump pump logistics.',
  },
};

export default function PricingEngine() {
  const [selectedVertical, setSelectedVertical] = useState('healthcare');
  const [unitRate, setUnitRate] = useState('2500');
  const [quantity, setQuantity] = useState('25');
  const [customerOffer, setCustomerOffer] = useState('50000');
  const [customerPhone, setCustomerPhone] = useState('+91 98200 11223');
  const [customerName, setCustomerName] = useState('Dr. Singhania / Client');

  // Concrete Dimensions for RMC
  const [length, setLength] = useState('15');
  const [width, setWidth] = useState('10');
  const [depth, setDepth] = useState('0.15');

  const [testingNeg, setTestingNeg] = useState(false);
  const [negResult, setNegResult] = useState(null);

  const activeCalc = VERTICAL_CALCULATORS[selectedVertical] || VERTICAL_CALCULATORS.healthcare;
  const Icon = activeCalc.icon;

  const handleVerticalChange = (vKey) => {
    setSelectedVertical(vKey);
    const calc = VERTICAL_CALCULATORS[vKey];
    setUnitRate(calc.baseRate.toString());
    setQuantity(calc.defaultQty.toString());
    setCustomerOffer((calc.floorRate * calc.defaultQty).toString());
    setNegResult(null);
  };

  const volumeM3 = (parseFloat(length || 0) * parseFloat(width || 0) * parseFloat(depth || 0)).toFixed(2);
  const transitMixersNeeded = Math.ceil(parseFloat(volumeM3) / 6) || 0;

  const totalStandardValue = (parseFloat(unitRate || 0) * parseFloat(quantity || 0)).toFixed(0);
  const offerNum = parseFloat(customerOffer || 0);
  const effectiveUnitPrice = (offerNum / (parseFloat(quantity) || 1)).toFixed(0);
  const isFloorProtected = effectiveUnitPrice >= activeCalc.floorRate;

  const handleTestNegotiation = async (e) => {
    e.preventDefault();
    setTestingNeg(true);
    setNegResult(null);

    try {
      const res = await fetch('/api/negotiation/process-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: {
            customer_phone: customerPhone,
            product_id: `${selectedVertical.toUpperCase()}_STANDARD`,
            quantity: parseFloat(quantity),
            offered_price: offerNum,
          },
          rule: {
            base_price: parseFloat(unitRate),
            min_floor_price: activeCalc.floorRate,
            max_discount_percent: 18.0,
          },
        }),
      });
      const data = await res.json();
      setNegResult(data);
    } catch (err) {
      console.error(err);
      setNegResult({
        status: isFloorProtected ? 'deal_accepted' : 'counter_offer',
        accepted: isFloorProtected,
        final_unit_price: isFloorProtected ? effectiveUnitPrice : activeCalc.floorRate,
        payment_link: `https://payments.cashfree.com/links/deal_${customerPhone.slice(-4)}`,
        reasoning: isFloorProtected
          ? `Offer of ₹${effectiveUnitPrice}/unit is above floor of ₹${activeCalc.floorRate}/unit. Deal approved!`
          : `Offer is below protected floor of ₹${activeCalc.floorRate}/unit. Counter-offered at floor rate.`,
      });
    } finally {
      setTestingNeg(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                Dynamic Pricing & Deal Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Margin Floor Safeguard Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dynamic Pricing, Margin Safeguards & Deal Closure
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Equip your business with autonomous pricing logic. Safeguard your profit floors, calculate volume rebates, and issue instant UPI payment links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/10 text-emerald-300 border border-emerald-500/30 font-bold">
              Floor Protection: 100% Guaranteed
            </span>
          </div>
        </div>
      </div>

      {/* Industry Vertical Selector Strip */}
      <div className="space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-600" />
          Select Business Vertical Pricing Engine:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(VERTICAL_CALCULATORS).map(([key, item]) => {
            const VIcon = item.icon;
            const isSelected = selectedVertical === key;
            return (
              <button
                key={key}
                onClick={() => handleVerticalChange(key)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white border-indigo-500 shadow-xl shadow-indigo-950/20 ring-2 ring-indigo-500'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <VIcon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs mb-1 line-clamp-1">{item.title}</h4>
                <p className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  Floor: ₹{item.floorRate.toLocaleString()}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Base Catalog Rate"
          value={`₹${parseFloat(unitRate || 0).toLocaleString()}`}
          subtext="Standard Listed Rate"
        />
        <StatCard
          label="Margin Floor Limit"
          value={`₹${activeCalc.floorRate.toLocaleString()}`}
          subtext="Lowest Authorized Price"
        />
        <StatCard
          label="Total Order Value"
          value={`₹${parseInt(totalStandardValue || 0).toLocaleString()}`}
          subtext={`For ${quantity} ${activeCalc.unitLabel}`}
        />
        <StatCard
          label="Payment Gateway"
          value="Instant UPI"
          subtext="Instant Payout Settlement"
        />
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calculator & RMC Pour Sizer */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Icon className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-black text-sm text-slate-900">{activeCalc.title}</h3>
                <p className="text-xs text-slate-500">{activeCalc.description}</p>
              </div>
            </div>

            {/* Special Concrete Dimensions Calculator if RMC selected */}
            {selectedVertical === 'rmc' && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <span className="text-xs font-black text-indigo-900 block">
                  Pour Volume Sizing (Length × Width × Depth)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Length (m)</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => {
                        setLength(e.target.value);
                        const v = (parseFloat(e.target.value || 0) * parseFloat(width || 0) * parseFloat(depth || 0)).toFixed(2);
                        setQuantity(v);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Width (m)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => {
                        setWidth(e.target.value);
                        const v = (parseFloat(length || 0) * parseFloat(e.target.value || 0) * parseFloat(depth || 0)).toFixed(2);
                        setQuantity(v);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Depth (m)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={depth}
                      onChange={(e) => {
                        setDepth(e.target.value);
                        const v = (parseFloat(length || 0) * parseFloat(width || 0) * parseFloat(e.target.value || 0)).toFixed(2);
                        setQuantity(v);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-indigo-900 font-bold">Calculated Volume: {volumeM3} m³</span>
                  <span className="text-indigo-700 font-extrabold">{transitMixersNeeded} Transit Mixers (6m³)</span>
                </div>
              </div>
            )}

            {/* Standard Pricing Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {activeCalc.baseRateLabel}
                </label>
                <input
                  type="number"
                  value={unitRate}
                  onChange={(e) => setUnitRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Quantity ({activeCalc.unitLabel})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black block">Standard Total</span>
                <span className="text-lg font-black text-slate-900">
                  ₹{parseInt(totalStandardValue || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Protected Minimum Floor</span>
                <span className="text-lg font-black text-indigo-700">
                  ₹{(activeCalc.floorRate * parseFloat(quantity || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Autonomous Negotiation Bot Test */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-sm text-slate-900">
                  Simulate Deal Negotiation & Close Link
                </h3>
              </div>
              <Badge status="purple">Live Pricing API</Badge>
            </div>

            <form onSubmit={handleTestNegotiation} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Customer / Prospect Phone Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Customer’s Aggressive Counter-Offer (Total ₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customerOffer}
                    onChange={(e) => setCustomerOffer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 pr-24"
                  />
                  <div className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">
                    = ₹{effectiveUnitPrice}/unit
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Offered Unit Price:</span>
                  <span className={`font-black ${isFloorProtected ? 'text-emerald-700' : 'text-red-600'}`}>
                    ₹{effectiveUnitPrice} / unit
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Minimum Floor Limit:</span>
                  <span className="font-bold text-slate-900">₹{activeCalc.floorRate} / unit</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="md"
                disabled={testingNeg}
                className="w-full text-xs font-black shadow-lg shadow-indigo-600/25"
              >
                {testingNeg ? 'Evaluating Margin Guardrails...' : 'Test AI Negotiation & Generate Link'}
              </Button>
            </form>

            {/* Negotiation Output Result */}
            {negResult && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  negResult.accepted
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                    : 'bg-amber-50 text-amber-950 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {negResult.accepted ? 'Deal Accepted by Agent!' : 'Counter-Offer Calibrated'}
                  </span>
                  <Badge status={negResult.accepted ? 'success' : 'warning'}>
                    Final: ₹{negResult.final_unit_price}/unit
                  </Badge>
                </div>

                <p className="text-xs leading-relaxed">
                  {negResult.reasoning ||
                    (negResult.accepted
                      ? `The customer offer of ₹${effectiveUnitPrice}/unit satisfies margin requirements. Deal locked!`
                      : `The offer is below protected threshold. The bot counter-offered at ₹${activeCalc.floorRate}/unit.`)}
                </p>

                {negResult.payment_link && (
                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 font-mono truncate max-w-[220px]">
                      {negResult.payment_link}
                    </span>
                    <a
                      href={negResult.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-black text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      Open Payment Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
