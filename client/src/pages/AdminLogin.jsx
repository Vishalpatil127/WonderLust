import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, ArrowRight, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ── OTP digit input ─────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.padEnd(6, "").split("");

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.slice();
      next[i] = "";
      onChange(next.join("").trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = digits.slice();
    next[i] = e.key;
    onChange(next.join("").trimEnd());
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          aria-label={`OTP digit ${i + 1}`}
          className={`w-11 h-14 text-center text-xl font-black rounded-xl border-2 bg-gray-800 text-white outline-none transition-all
            ${d ? "border-brand" : "border-gray-700"}
            focus:border-brand focus:ring-2 focus:ring-brand/30`}
        />
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function AdminLogin() {
  const { adminLogin, verifyAdminOtp } = useAuth();
  const navigate = useNavigate();

  // step: "credentials" | "otp"
  const [step,     setStep]    = useState("credentials");
  const [form,     setForm]    = useState({ email: "", password: "" });
  const [otp,      setOtp]     = useState("");
  const [showPw,   setShowPw]  = useState(false);
  const [error,    setError]   = useState("");
  const [loading,  setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  /* Step 1 — submit credentials, trigger OTP */
  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      setStep("otp");
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — submit OTP */
  const handleOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyAdminOtp(form.email, otp);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    setResending(true);
    setError("");
    setOtp("");
    try {
      await adminLogin(form.email, form.password);
      startCountdown();
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-brand" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-modal">

          {/* ── Step indicator ── */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {["Credentials", "Verify OTP"].map((label, i) => {
              const active = (i === 0 && step === "credentials") || (i === 1 && step === "otp");
              const done   = i === 0 && step === "otp";
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                    ${done   ? "bg-brand border-brand text-white" :
                      active ? "bg-brand/20 border-brand text-brand" :
                               "bg-gray-800 border-gray-700 text-gray-500"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-white" : "text-gray-500"}`}>{label}</span>
                  {i === 0 && <div className="w-8 h-px bg-gray-700 mx-1" />}
                </div>
              );
            })}
          </div>

          {/* ── Header ── */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-xs font-semibold text-brand mb-3">
              <Lock className="w-3 h-3" /> Admin Access
            </span>
            {step === "credentials" ? (
              <>
                <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back, Admin</h1>
                <p className="text-gray-400 text-sm">Enter your credentials to receive a sign-in OTP.</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-white mb-1">Check your email</h1>
                <p className="text-gray-400 text-sm">
                  We sent a 6-digit OTP to{" "}
                  <span className="text-white font-semibold">{form.email}</span>
                </p>
              </>
            )}
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="flex items-start gap-2 bg-red-950 border border-red-800 text-red-400 rounded-xl p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          {/* ── Step 1: Credentials form ── */}
          {step === "credentials" && (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Email address
                </label>
                <input
                  id="admin-email" type="email" name="email"
                  value={form.email} onChange={set}
                  required autoComplete="email"
                  placeholder="admin@wonderlust.com"
                  className="w-full px-4 py-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white
                             placeholder:text-gray-600 outline-none focus:border-brand/60 focus:ring-2
                             focus:ring-brand/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password" type={showPw ? "text" : "password"} name="password"
                    value={form.password} onChange={set}
                    required autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 text-sm bg-gray-800 border border-gray-700 rounded-xl text-white
                               placeholder:text-gray-600 outline-none focus:border-brand/60 focus:ring-2
                               focus:ring-brand/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2 gap-2">
                {loading
                  ? <><span className="spinner" /> Sending OTP…</>
                  : <><Mail className="w-4 h-4" /> Send OTP to email <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP form ── */}
          {step === "otp" && (
            <form onSubmit={handleOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-4 text-center">
                  Enter the 6-digit code
                </label>
                <OtpInput value={otp} onChange={setOtp} />
              </div>

              <button type="submit" disabled={loading || otp.length < 6}
                className="btn btn-primary btn-lg w-full gap-2">
                {loading
                  ? <><span className="spinner" /> Verifying…</>
                  : <><ShieldCheck className="w-4 h-4" /> Verify &amp; Sign in</>}
              </button>

              {/* Resend */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-500">
                    Resend OTP in <span className="text-gray-300 font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resending}
                    className="flex items-center gap-1.5 text-xs text-brand hover:text-brand/80 font-semibold transition-colors">
                    {resending
                      ? <><span className="spinner w-3 h-3" /> Resending…</>
                      : <><RefreshCw className="w-3 h-3" /> Resend OTP</>}
                  </button>
                )}
              </div>

              {/* Back to step 1 */}
              <button type="button" onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors text-center">
                ← Use a different email
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-600">
            Not an admin?{" "}
            <Link to="/login" className="text-gray-400 font-semibold hover:text-white transition-colors">
              User login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
