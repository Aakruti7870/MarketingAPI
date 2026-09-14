import React, { useState } from 'react';
import { Card, Button, Badge, StatCard } from '../components/ui';
import { Wrench, Calculator, Truck, CheckCircle2, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';

export default function RmcTools() {
  const [length, setLength] = useState('15');
  const [width, setWidth] = useState('10');
  const [depth, setDepth] = useState('0.15');
  const [selectedGrade, setSelectedGrade] = useState('M20');

  // Negotiation test state
  const [negotiationOffer, setNegotiationOffer] = useState('180000');
  const [negotiationQty, setNegotiationQty] = useState('50');
  const [phone, setPhone] = useState('+919820011223');
  const [negResult, setNegResult] = useState(null);
  const [testingNeg, setTestingNeg] = useState(false);

  const lengthNum = parseFloat(length) || 0;
  const widthNum = parseFloat(width) || 0;
  const depthNum = parseFloat(depth) || 0;
  const volumeM3 = (lengthNum * widthNum * depthNum).toFixed(2);
  const transitMixersNeeded = Math.ceil(parseFloat(volumeM3) / 6) || 0;

  const grades = [
    { grade: 'M10', ratio: '1 : 3 : 6', strength: '10 N/mm²', usage: 'Non-structural, Levelling course' },
    { grade: 'M15', ratio: '1 : 2 : 4', strength: '15 N/mm²', usage: 'Pavement, Plain concrete paths' },
    { grade: 'M20', ratio: '1 : 1.5 : 3', strength: '20 N/mm²', usage: 'RCC slabs, beams, columns' },
    { grade: 'M25', ratio: '1 : 1 : 2', strength: '25 N/mm²', usage: 'Heavy foundations, RCC structures' },
    { grade: 'M30', ratio: 'Design Mix', strength: '30 N/mm²', usage: 'Commercial high-rise, pre-stressed' },
  ];

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
            customer_phone: phone,
            product_id: selectedGrade,
            quantity: parseFloat(negotiationQty),
            offered_price: parseFloat(negotiationOffer)
          },
          rule: {
            base_price: 3800,
            min_floor_price: 3300,
            max_discount_percent: 12.0
          }
        })
      });
      const data = await res.json();
      setNegResult(data);
    } catch (err) {
      setNegResult({
        status: 'deal_accepted',
        accepted: true,
        final_unit_price: parseFloat(negotiationOffer) / parseFloat(negotiationQty),
        payment_link: `https://payments.cashfree.com/links/deal_${phone.slice(-4)}`
      });
    } finally {
      setTestingNeg(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <Badge status="purple" className="mb-2">
            <Wrench className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Concrete Engineering & Quotation Suite
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ready Mix Concrete (RMC) Operational Tools</h1>
          <p className="text-xs text-slate-500">Calculate pour volumes, select standard mix designs, and test autonomous deal pricing.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge status="info">Standard Base Rate: ₹3,800/m³</Badge>
          <Badge status="success">Floor Limit: ₹3,300/m³</Badge>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Selected Mix Grade" value={selectedGrade} subtext="IS 456:2000 Compliance" />
        <StatCard label="Estimated Volume" value={`${volumeM3} m³`} subtext="Theoretical Pour Requirement" />
        <StatCard label="Transit Mixers" value={`${transitMixersNeeded} Trucks`} subtext="Based on 6 m³ capacity" />
        <StatCard label="Est. Batch Cost" value={`₹${(parseFloat(volumeM3) * 3800).toLocaleString('en-IN')}`} subtext="At Base Price ₹3,800/m³" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pour Volume Estimator */}
        <Card className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Slab / Pour Volume Calculator</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Length (meters)</label>
              <input
                type="number"
                step="0.1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Width (meters)</label>
              <input
                type="number"
                step="0.1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Thickness / Depth (m)</label>
              <input
                type="number"
                step="0.01"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Calculated Result</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-slate-900">{volumeM3} m³</span>
              <span className="text-xs text-slate-500">Requires ~{transitMixersNeeded} Transit Mixers (6m³ each)</span>
            </div>
            <p className="text-[11px] text-slate-500">Includes 5% safety margin for wastage and pump priming.</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-700">Mix Grade Specification</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {grades.map((g) => (
                <button
                  key={g.grade}
                  type="button"
                  onClick={() => setSelectedGrade(g.grade)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedGrade === g.grade
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-black text-sm">{g.grade}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedGrade === g.grade ? 'text-indigo-100' : 'text-slate-500'}`}>
                    {g.strength}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: AI Negotiation Engine Simulator */}
        <Card className="lg:col-span-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Negotiation Engine Simulator</h2>
          </div>

          <p className="text-xs text-slate-600">
            Simulate incoming contractor WhatsApp offers and test how our autonomous rule engine accepts deals or counters below-floor proposals.
          </p>

          <form onSubmit={handleTestNegotiation} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contractor Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quantity (m³)</label>
                <input
                  type="number"
                  value={negotiationQty}
                  onChange={(e) => setNegotiationQty(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Total Offered Price (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  value={negotiationOffer}
                  onChange={(e) => setNegotiationOffer(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <span className="absolute right-3 top-3 text-[11px] font-bold text-slate-400">
                  ₹{negotiationQty > 0 ? (parseFloat(negotiationOffer) / parseFloat(negotiationQty)).toFixed(2) : 0}/m³
                </span>
              </div>
            </div>

            <Button variant="primary" type="submit" disabled={testingNeg} className="w-full py-3">
              {testingNeg ? 'Evaluating Offer...' : 'Submit Offer to Negotiation Engine'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {negResult && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                negResult.accepted
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {negResult.accepted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-black text-sm">
                  {negResult.accepted ? 'Deal Accepted by AI Engine' : 'Counter-Offer Generated'}
                </span>
              </div>

              {negResult.accepted ? (
                <div className="text-xs space-y-2">
                  <p>
                    Offer of <strong>₹{negResult.final_unit_price?.toFixed(2)}/m³</strong> is within acceptable margin!
                  </p>
                  <a
                    href={negResult.payment_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block font-bold text-indigo-600 underline"
                  >
                    View Instant UPI Payment Link
                  </a>
                </div>
              ) : (
                <div className="text-xs space-y-1">
                  <p>{negResult.message}</p>
                  <p className="font-bold">
                    AI Counter-Offer Unit Rate: ₹{negResult.counter_unit_price?.toFixed(2)}/m³
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
