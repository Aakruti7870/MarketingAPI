import React, { useEffect, useState } from "react";
import api from "../api";
import { Badge } from "../components/ui";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

const STAGE_COLORS = {
  NEW: "border-t-slate-300", CONTACTED: "border-t-blue-400", RESPONDED: "border-t-cyan-400",
  INTERESTED: "border-t-gold-400", QUALIFIED: "border-t-amber-500", DEMO: "border-t-purple-400",
  QUOTATION: "border-t-indigo-400", NEGOTIATION: "border-t-orange-400", WON: "border-t-emerald-500", LOST: "border-t-red-400",
};

export default function Pipeline() {
  const [data, setData] = useState(null);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);

  const load = () => api.get("/pipeline").then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  const drop = async (stage) => {
    setOver(null);
    if (!drag || drag.stage === stage) { setDrag(null); return; }
    const board = { ...data.board };
    board[drag.stage] = board[drag.stage].filter((l) => l.id !== drag.id);
    board[stage] = [{ ...drag, stage }, ...board[stage]];
    setData({ ...data, board });
    const moved = drag; setDrag(null);
    try {
      await api.patch(`/leads/${moved.id}/stage`, { stage });
      toast.success(`${moved.name} → ${stage}`);
    } catch { toast.error("Failed to move"); load(); }
  };

  if (!data) return <div className="p-8"><div className="h-96 shimmer rounded-2xl" /></div>;

  return (
    <div className="p-6 md:p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900">Sales Pipeline</h1>
        <p className="text-slate-500 text-sm mt-1">Drag leads across stages. Every move is tracked.</p>
      </div>
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {data.stages.map((stage) => {
            const items = data.board[stage] || [];
            const value = items.reduce((s, l) => s + (l.value || 0), 0);
            return (
              <div key={stage}
                onDragOver={(e) => { e.preventDefault(); setOver(stage); }}
                onDragLeave={() => setOver(null)}
                onDrop={() => drop(stage)}
                data-testid={`stage-${stage}`}
                className={`w-72 shrink-0 rounded-2xl bg-slate-100/70 border-t-4 ${STAGE_COLORS[stage]} ${over === stage ? "ring-2 ring-gold-400 bg-gold-50/50" : ""} transition`}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-slate-700">{stage}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-white rounded-full px-2 py-0.5">{items.length}</span>
                  </div>
                  {value > 0 && <span className="text-[11px] font-mono text-gold-700">₹{(value/1000).toFixed(0)}k</span>}
                </div>
                <div className="px-3 pb-3 space-y-2.5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)" }}>
                  {items.map((l) => (
                    <div key={l.id} draggable onDragStart={() => setDrag(l)} onDragEnd={() => setDrag(null)}
                      data-testid={`pipeline-card-${l.id}`}
                      className="bg-white rounded-xl border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-hover hover:border-gold-300 transition group">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">{l.name}</p>
                          <p className="text-xs text-slate-500 truncate">{l.company}</p>
                        </div>
                        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0" />
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <Badge tone={l.temperature}>{l.temperature} {l.score}</Badge>
                        {l.value > 0 && <span className="text-xs font-mono font-semibold text-slate-600">₹{(l.value/1000).toFixed(0)}k</span>}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-center text-xs text-slate-400 py-6">Drop leads here</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
