import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ShieldCheck, Trash2 } from "lucide-react";
import api, { apiError } from "../api";
import { toast } from "sonner";

export default function PrivacyRequestCard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/privacy/deletion-request")
      .then(({ data }) => active && setStatus(data))
      .catch(() => active && setStatus({ requested: false }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const requestDeletion = async () => {
    const ok = window.confirm(
      "Request deletion of your GOLD-e AI data? Workspace owners request deletion of the workspace and their account; other members request deletion of their own account. This request will be reviewed before data is removed."
    );
    if (!ok) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/privacy/deletion-request", {});
      setStatus(data);
      toast.success("Data deletion request submitted");
    } catch (error) {
      toast.error(apiError(error.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const pending = status?.requested && ["pending", "reviewing"].includes(status?.status);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <section className="rounded-[26px] border border-rose-100 bg-white/85 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-3xl items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900">Account & data privacy</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Review how GOLD-e AI handles information or submit an authenticated deletion request tied to this account.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                <Link to="/privacy" className="text-violet-700 hover:underline">Privacy Policy</Link>
                <Link to="/terms" className="text-violet-700 hover:underline">Terms</Link>
                <Link to="/data-deletion" className="text-violet-700 hover:underline">Deletion details</Link>
              </div>
            </div>
          </div>

          <div className="min-w-[240px]">
            {loading ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-400">Checking request status…</div>
            ) : pending ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700"><AlertTriangle className="h-4 w-4" /> Deletion request {status.status}</div>
                <div className="mt-1 text-[11px] text-amber-600">Scope: {status.scope === "workspace_and_account" ? "workspace + account" : "account"}</div>
              </div>
            ) : status?.requested && status?.status === "completed" ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-extrabold text-emerald-700"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Deletion completed</div>
            ) : (
              <button
                onClick={requestDeletion}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> {submitting ? "Submitting…" : "Request data deletion"}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
