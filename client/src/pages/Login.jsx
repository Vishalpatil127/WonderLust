import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Eye, EyeOff, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  admin:    { label: "Admin",    color: "text-red-500",   bg: "bg-red-50 border-red-200" },
  host:     { label: "Host",     color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  customer: { label: "Explorer", color: "text-brand",     bg: "bg-brand-50 border-brand/20" },
};

/* ── OTP digit input (reused from AdminLogin) ─────────────────────────────── */
import { useRef } from "react";
function OtpInput({ value, onChange }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const digits = value.padEnd(6, "").split("");
  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const n = digits.slice(); n[i] = "";
      onChange(n.join("").trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const n = digits.slice(); n[i] = e.key;
    onChange(n.join("").trimEnd());
    if (i < 5) refs[i + 1].current?.focus();
  };
  const handlePaste = (e) => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs[Math.min(p.length, 5)].current?.focus();
  };
  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={d} onChange={() => {}} onKeyDown={(e) => handleKey(i, e)}
          aria-label={`OTP digit ${i + 1}`}
          className={`w-11 h-14 text-center text-xl font-black rounded-xl border-2 bg-white outline-none transition-all
            ${d ? "border-amber-400" : "border-gray-200"} focus:border-amber-400 focus:ring-2 focus:ring-amber-100`}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const { login, hostLogin, verifyHostOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  // Host OTP state
  const [step,      setStep]      = useState("credentials"); // credentials | otp
  const [otp,       setOtp]       = useState("");
  const [otpHint,   setOtpHint]   = useState(""); // shown when email not configured
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => setCountdown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Try host login first (OTP flow), fall back to regular login
      // We detect by the error — if user is a host, hostLogin succeeds with OTP step
      // For non-hosts, we use regular login
      let data;
      try {
        data = await hostLogin(form.email, form.password);
        // hostLogin succeeded → user is a host → show OTP step
        if (data.otp) {
          setOtpHint(data.otp);
          setOtp(data.otp); // auto-fill the OTP input
        }
        setStep("otp");
        startCountdown();
        setLoading(false);
        return;
      } catch (hostErr) {
        // Not a host (401 with "Invalid credentials" for non-hosts) — try regular login
        if (hostErr.response?.status !== 401) throw hostErr;
        data = await login(form.email, form.password);
      }

      const role = data.user?.role;
      if (from) { navigate(from, { replace: true }); return; }
      if (role === "admin")    navigate("/admin",          { replace: true });
      else if (role === "host") navigate("/host/dashboard", { replace: true });
      else                      navigate("/",               { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Enter all 6 digits."); return; }
    setError("");
    setLoading(true);
    try {
      await verifyHostOtp(form.email, otp);
      navigate(from || "/host/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError(""); setOtp("");
    try { await hostLogin(form.email, form.password); startCountdown(); }
    catch (err) { setError(err.response?.data?.message || "Could not resend OTP."); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 to-brand/25" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">Wonderlust</span>
        </div>
        <div className="relative z-10">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Welcome back</p>
          <blockquote className="text-white text-2xl font-bold leading-snug mb-4">
            "Every great journey starts with finding the right place to rest."
          </blockquote>
          <div className="flex items-center gap-4 mt-6">
            {Object.entries(ROLE_LABELS).map(([role, meta]) => (
              <div key={role} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white/10 border-white/20`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                <span className="text-white/80 text-xs font-medium">{meta.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900">Wonderlust</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            New to Wonderlust?{" "}
            <Link to="/register" className="text-brand font-semibold hover:underline">Create a free account</Link>
          </p>

          {error && <div className="alert-error mb-5">{error}</div>}

          {step === "otp" ? (
            /* ── Host OTP step ── */
            <form onSubmit={handleOtp} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🏠</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">Host Verification</p>
                <p className="text-xs text-gray-400 mt-1">
                  OTP sent to <span className="font-semibold text-gray-700">{form.email}</span>
                </p>
                {otpHint && (
                  <div className="mt-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 font-medium">Email delivery failed.</p>
                    <p className="text-lg font-black text-amber-600 tracking-widest mt-0.5">{otpHint}</p>
                    <p className="text-xs text-amber-600 mt-0.5">Use this OTP to sign in</p>
                  </div>
                )}
              </div>
              <OtpInput value={otp} onChange={setOtp} />
              <button type="submit" disabled={loading || otp.length < 6}
                className="btn btn-primary btn-lg w-full gap-2" style={{ background: "#d97706", borderColor: "#d97706" }}>
                {loading ? <><span className="spinner" /> Verifying…</> : "Verify & Sign in"}
              </button>
              <div className="flex items-center justify-center gap-2">
                {countdown > 0 ? (
                  <p className="text-xs text-gray-400">Resend in <span className="font-semibold text-gray-600">{countdown}s</span></p>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resending}
                    className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold">
                    {resending ? <><span className="spinner w-3 h-3" /> Resending…</> : <><RefreshCw className="w-3 h-3" /> Resend OTP</>}
                  </button>
                )}
              </div>
              <button type="button" onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                ← Back to sign in
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email address</label>
              <input id="email" type="email" name="email" value={form.email}
                onChange={set} required autoComplete="email"
                placeholder="you@example.com" className="input" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="input-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} name="password"
                  value={form.password} onChange={set} required autoComplete="current-password"
                  placeholder="••••••••" className="input pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Toggle password">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2">
              {loading
                ? <><span className="spinner" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          )} {/* end step conditional */}

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            {/* Google OAuth — only shown when configured */}
            {import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true" && (
              <a
                href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/oauth/google`}
                className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200
                           bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300
                           transition-all shadow-sm"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Continue with Google
              </a>
            )}

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-400">
                Works for all roles — Customer, Host &amp; Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
