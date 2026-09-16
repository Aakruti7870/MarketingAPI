import React, { useEffect, useState } from "react";
import api from "../api";
import { Badge } from "../components/ui";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

const STAGE_ACCENTS = {
  NEW: "from-violet-500 to-indigo-600", CONTACTED: "from-blue-500 to-cyan-500", RESPONDED: "from-cyan-400 to-teal-500",
  INTERESTED: "from-fuchsia-500 to-rose-500", QUALIFIED: "from-emerald-400 to-teal-600", DEMO: "from-violet-400 to-purple-600",
  QUOTATION: "from-indigo-400 to-violet-600", NEGOTIATION: "from-amber-400 to-orange-500", WON: "from-emerald-400 to-green-600", LOST: "from-slate-400 to-slate-600",
};

export default function Pipeline() {
  const [data, setData] = useState(null);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);

  const load = () => api.get("/pipeline").then((r) => setData(r.data)).catch(() => toast.error("Could not load pipeline"));
  useEffect(() => { load(); }, []);

  const drop = async (stage) => {
    setOver(null);
    if (!drag || drag.stage === stage) { setDrag(null); return; }
    const board = { ...data.board };
    board[drag.stage] = (board[drag.stage] || []).filter((l) => l.id !== drag.id);
    board[stage] = [{ ...drag, stage }, ...(board[stage] || [])];
    setData({ ...data, board });
    const moved = drag;
    setDrag(null);
    try {
      await api.patch(`/leads/${moved.id}/stage`, { stage });
      toast.success(`${moved.name} → ${stage}`);
    } catch {
      toast.error("Failed to move lead");
      load();
    }
  };

  if (!data) return <div className="p-5 sm:p-6 lg:p-8"><div className="shimmer h-96 rounded-[22px]" /></div>;

  return (
    <div className="flex h-full flex-col space-y-6 p-5 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Sales Pipeline</h1>
        <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Move leads between stages. Changes are persisted to the workspace.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full min-w-max gap-4">
          {data.stages.map((stage) => {
            const items = data.board[stage] || [];
            const value = items.reduce((sum, lead) => sum + (lead.value || 0), 0);
            const accent = STAGE_ACCENTS[stage] || "from-violet-500 to-fuchsia-500";
            return (
              <section key={stage} onDragOver={(e) => { e.preventDefault(); setOver(stage); }} onDragLeave={() => setOver(null)} onDrop={() => drop(stage)} data-testid={`stage-${stage}`} className={`ge-glass-panel flex w-72 shrink-0 flex-col p-3.5 ${over === stage ? "ring-2 ring-violet-400" : ""}`}>
                <div className="mb-3 flex items-center justify-between border-b border-slate-100/80 pb-3">
                  <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full bg-gradient-to-r ${accent}`} /><span className="text-xs font-black tracking-wider text-slate-800">{stage}</span></div>
                  <div className="flex items-center gap-2"><span className="rounded-full border border-slate-200/80 bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-600">{items.length}</span>{value > 0 && <span className="font-mono text-[10px] font-semibold text-violet-700">₹{(value / 1000).toFixed(0)}k</span>}</div>
                </div>
                <div className="flex-1 space-y-2.5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
                  {items.map((lead) => (
                    <article key={lead.id} draggable onDragStart={() => setDrag(lead)} onDragEnd={() => { setDrag(null); setOver(null); }} data-testid={`pipeline-card-${lead.id}`} className="group cursor-grab rounded-2xl border border-white bg-white/90 p-3.5 shadow-[inset_0_1px_1px_#FFFFFF,0_4px_12px_rgba(124,58,237,.06)] transition hover:border-violet-200 hover:shadow-[0_8px_20px_rgba(124,58,237,.12)] active:cursor-grabbing">
                      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-xs font-bold text-slate-900">{lead.name || "Unnamed Contact"}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{lead.company || lead.phone || "No company information"}</p></div><GripVertical className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-violet-400" /></div>
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2"><Badge tone={lead.temperature}>{lead.temperature} {lead.score != null ? lead.score : ""}</Badge>{lead.value > 0 && <span className="font-mono text-[10px] font-semibold text-slate-600">₹{(lead.value / 1000).toFixed(0)}k</span>}</div>
                    </article>
                  ))}
                  {items.length === 0 && <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-violet-200/70 bg-white/20 text-[11px] font-medium text-slate-400">Drop leads here</div>}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
