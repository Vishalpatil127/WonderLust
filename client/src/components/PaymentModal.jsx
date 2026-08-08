import { useState } from "react";
import { openRazorpayCheckout, isRazorpayEnabled } from "../hooks/useRazorpay";
import {
  X, CreditCard, Smartphone, Building2,
  ShieldCheck, Lock, CheckCircle2, ChevronRight,
} from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function formatCardNumber(v) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(v) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

const UPI_APPS = [
  { id: "gpay",    label: "Google Pay",  color: "bg-white",      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" },
  { id: "phonepe", label: "PhonePe",     color: "bg-indigo-50",  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" },
  { id: "paytm",   label: "Paytm",       color: "bg-blue-50",    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" },
  { id: "bhim",    label: "BHIM UPI",    color: "bg-orange-50",  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/BHIM_logo.svg/512px-BHIM_logo.svg.png" },
];

/* ─── sub-components ─────────────────────────────────────────────────────── */
function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
        active
          ? "border-brand bg-brand-50 text-brand shadow-sm"
          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function UpiApp({ app, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(app.id)}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        selected
          ? "border-brand bg-brand-50 shadow-sm"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl ${app.color} border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden`}>
        <img src={app.logo} alt={app.label} className="w-7 h-7 object-contain"
          onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </div>
      <span className={`text-sm font-semibold ${selected ? "text-brand" : "text-gray-700"}`}>
        {app.label}
      </span>
      {selected && <CheckCircle2 className="w-4 h-4 text-brand ml-auto shrink-0" />}
    </button>
  );
}

/* ─── main component ─────────────────────────────────────────────────────── */
export default function PaymentModal({ amount, nights, listing, order, onSuccess, onCancel }) {
  const [tab,       setTab]       = useState("upi");   // upi | card | netbanking
  const [upiApp,    setUpiApp]    = useState("gpay");
  const [upiId,     setUpiId]     = useState("");
  const [card,      setCard]      = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [bank,      setBank]      = useState("");
  const [paying,    setPaying]    = useState(false);
  const [error,     setError]     = useState("");
  const [step,      setStep]      = useState("form");  // form | processing | done

  const setCardField = (e) => setCard((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (tab === "upi") {
      if (!upiId && !upiApp) return "Select a UPI app or enter your UPI ID.";
      if (upiId && !/^[\w.\-_]+@[\w]+$/.test(upiId)) return "Enter a valid UPI ID (e.g. name@upi).";
    }
    if (tab === "card") {
      if (card.number.replace(/\s/g, "").length < 16) return "Enter a valid 16-digit card number.";
      if (card.expiry.length < 5) return "Enter a valid expiry (MM/YY).";
      if (card.cvv.length < 3) return "Enter a valid CVV.";
      if (!card.name.trim()) return "Enter the cardholder name.";
    }
    if (tab === "netbanking" && !bank) return "Select your bank.";
    return "";
  };

  const handlePay = async () => {
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setPaying(true);
    setStep("processing");

    // Simulate a 2-second processing animation, then resolve
    // In production with real Razorpay keys, this modal is replaced by
    // the Razorpay SDK which handles the actual payment processing.
    await new Promise((r) => setTimeout(r, 2000));

    setStep("done");
    await new Promise((r) => setTimeout(r, 800));
    onSuccess({ method: tab, upiApp: tab === "upi" ? upiApp : undefined });
  };

  const handleRazorpay = async () => {
    setError("");
    setPaying(true);
    try {
      const res = await openRazorpayCheckout({ order, amount, name: listing });
      if (res && res.success) {
        onSuccess({ paymentId: res.paymentId, orderId: res.orderId, mock: false, method: "razorpay" });
      } else {
        setError("Razorpay checkout did not complete.");
      }
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setPaying(false);
    }
  };

  /* ── Processing overlay ── */
  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl w-full max-w-sm">
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
            <Lock className="absolute inset-0 m-auto w-6 h-6 text-brand" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">Processing Payment</p>
            <p className="text-sm text-gray-400 mt-1">Please do not close this window…</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            256-bit SSL encrypted
          </div>
        </div>
      </div>
    );
  }

  /* ── Success overlay ── */
  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl w-full max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">Payment Successful!</p>
            <p className="text-sm text-gray-400 mt-1">{fmt(amount)} paid</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main modal ── */
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">Secure Payment</span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/60 text-xs mb-0.5">Total payable</p>
              <p className="text-3xl font-black text-white">{fmt(amount)}</p>
              <p className="text-white/50 text-xs mt-0.5">{nights} night{nights > 1 ? "s" : ""} · {listing}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-white/20" />
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Payment method tabs */}
          <div className="flex gap-2">
            <TabBtn active={tab === "upi"}        onClick={() => setTab("upi")}        icon={Smartphone}  label="UPI" />
            <TabBtn active={tab === "card"}       onClick={() => setTab("card")}       icon={CreditCard}  label="Card" />
            <TabBtn active={tab === "netbanking"} onClick={() => setTab("netbanking")} icon={Building2}   label="Net Banking" />
          </div>

          {error && <p className="alert-error text-xs">{error}</p>}

          {/* ── UPI Tab ── */}
          {tab === "upi" && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Pay with UPI app</p>
              <div className="grid grid-cols-2 gap-2">
                {UPI_APPS.map((app) => (
                  <UpiApp key={app.id} app={app} selected={upiApp === app.id} onSelect={setUpiApp} />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">or enter UPI ID</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div>
                <label className="input-label">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => { setUpiId(e.target.value); if (e.target.value) setUpiApp(""); }}
                  placeholder="yourname@upi"
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">e.g. mobilenumber@paytm, name@okicici</p>
              </div>
            </div>
          )}

          {/* ── Card Tab ── */}
          {tab === "card" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Debit / Credit Card</p>

              <div>
                <label className="input-label">Card number</label>
                <input
                  name="number"
                  value={card.number}
                  onChange={(e) => setCard((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="input font-mono tracking-widest"
                  inputMode="numeric"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Expiry</label>
                  <input
                    name="expiry"
                    value={card.expiry}
                    onChange={(e) => setCard((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="input font-mono"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="input-label">CVV</label>
                  <input
                    name="cvv"
                    value={card.cvv}
                    onChange={(e) => setCard((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="•••"
                    maxLength={4}
                    className="input font-mono"
                    inputMode="numeric"
                    type="password"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Cardholder name</label>
                <input
                  name="name"
                  value={card.name}
                  onChange={setCardField}
                  placeholder="Name on card"
                  className="input"
                  autoComplete="cc-name"
                />
              </div>

              {/* Accepted cards */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-gray-400">Accepted:</span>
                {["VISA", "MC", "RuPay", "Amex"].map((c) => (
                  <span key={c} className="text-[10px] font-bold border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Net Banking Tab ── */}
          {tab === "netbanking" && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Select your bank</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "State Bank of India", "HDFC Bank", "ICICI Bank",
                  "Axis Bank", "Kotak Mahindra", "Punjab National Bank",
                  "Bank of Baroda", "Other Bank",
                ].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBank(b)}
                    className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      bank === b
                        ? "border-brand bg-brand-50 text-brand"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pay button */}
        <div className="px-5 pb-6 pt-2 border-t border-gray-100 space-y-3">
          {isRazorpayEnabled(order) ? (
            <>
              <button
                type="button"
                onClick={handleRazorpay}
                disabled={paying}
                className="btn btn-primary btn-lg w-full gap-2 text-base font-bold"
              >
                {paying ? (<><span className="spinner" /> Processing…</>) : (<><Lock className="w-4 h-4" /> Pay with Razorpay {ChevronRight && <ChevronRight className="w-4 h-4" />}</>)}
              </button>

              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="btn btn-ghost btn-lg w-full"
              >
                Pay with other methods ({fmt(amount)})
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="btn btn-primary btn-lg w-full gap-2 text-base font-bold"
              >
                {paying ? (<><span className="spinner" /> Processing…</>) : (<><Lock className="w-4 h-4" /> Pay {fmt(amount)} <ChevronRight className="w-4 h-4" /></>)}
              </button>
            </>
          )}

          <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Secured by 256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  );
}
