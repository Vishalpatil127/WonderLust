import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  admin:    { label: "Admin",    color: "text-red-500",   bg: "bg-red-50 border-red-200" },
  host:     { label: "Host",     color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  customer: { label: "Explorer", color: "text-brand",     bg: "bg-brand-50 border-brand/20" },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      const role = data.user?.role;
      if (from) { navigate(from, { replace: true }); return; }
      if (role === "admin")     navigate("/admin",          { replace: true });
      else if (role === "host") navigate("/host/dashboard", { replace: true });
      else                      navigate("/",               { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
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
              <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white/10 border-white/20">
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

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
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
              <p className="text-xs text-gray-400">Works for all roles — Customer, Host &amp; Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
