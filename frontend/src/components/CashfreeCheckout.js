import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api, { apiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Modal } from "./ui";

let cashfreeScriptPromise;

function loadCashfreeSdk() {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (cashfreeScriptPromise) return cashfreeScriptPromise;
  cashfreeScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-golde-cashfree="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Cashfree), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.goldeCashfree = "true";
    script.onload = () => resolve(window.Cashfree);
    script.onerror = () => reject(new Error("Cashfree SDK could not be loaded"));
    document.head.appendChild(script);
  });
  return cashfreeScriptPromise;
}

export default function CashfreeCheckout({ interval, className = "", children, onStarted }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const begin = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const checkout = async (event) => {
    event.preventDefault();
    const cleaned = phone.replace(/[^0-9+]/g, "");
    if (cleaned.replace(/\D/g, "").length < 8) {
      toast.error("Enter a valid billing mobile number");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/billing/cashfree/checkout", {
        interval,
        customer_phone: cleaned,
      });
      if (!data.checkout_ready || !data.payment_session_id) throw new Error("Payment session was not created");
      const Cashfree = await loadCashfreeSdk();
      if (!Cashfree) throw new Error("Cashfree SDK is unavailable");
      const cashfree = Cashfree({ mode: data.mode === "production" ? "production" : "sandbox" });
      onStarted?.(data);
      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (err) {
      toast.error(apiError(err.response?.data?.detail) || err.message || "Checkout could not be started");
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={begin} className={className}>{children || "Upgrade with Cashfree"}</button>
      <Modal open={open} onClose={() => !loading && setOpen(false)} title={`GOLD-e Pro · ${interval === "year" ? "Annual" : "Monthly"}`} className="max-w-md">
        <form onSubmit={checkout} className="space-y-4">
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800"><CreditCard className="h-4 w-4 text-violet-600" /> Secure Cashfree checkout</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">Your billing mobile is sent to Cashfree to create the payment order. GOLD-e never exposes the merchant secret to the browser.</p>
          </div>
          <Input label="Billing mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98XXXXXXXX" required autoComplete="tel" />
          <div className="flex items-center gap-2 text-xs text-emerald-700"><ShieldCheck className="h-4 w-4" /> Pro activates only after server-side payment verification.</div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Opening Cashfree…" : "Continue to Payment"}</Button>
        </form>
      </Modal>
    </>
  );
}
