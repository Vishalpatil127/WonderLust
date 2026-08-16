import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Eye, EyeOff, ArrowRight, Check, Home, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    value: "customer",
    label: "Explorer",
    icon: User,
    desc: "Browse & book unique stays",
    color: "border-brand bg-brand-50",
    active: "ring-2 ring-brand border-brand",
  },
  {
    value: "host",
    label: "Host",
    icon: Home,
    desc: "List & manage your property",
    color: "border-amber-300 bg-amber-50",
    active: "ring-2 ring-amber-400 border-amber-400",
  },
];

const PERKS = {
  customer: ["Browse thousands of unique stays", "Real-time booking & confirmation", "Leave reviews & build a wishlist"],
  host:     ["List your property for free", "Manage bookings from a dashboard", "Grow your hosting income"],
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const [form, setForm]     = useState({ username: "", email: "", password: "", role: "customer" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      if (from) { navigate(from, { replace: true }); return; }
      navigate(form.role === "host" ? "/host/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = form.password.length === 0 ? 0
    : form.password.length < 6  ? 1
    : form.password.length < 10 ? 2 : 3;
  const [strengthLabel, strengthColor] = [
    ["", "Weak", "Good", "Strong"][pwStrength],
    ["", "bg-red-400", "bg-amber-400", "bg-green-500"][pwStrength],
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-brand/20" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white">Wonderlust</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-white text-2xl font-bold">
            {form.role === "host" ? "Start hosting today" : "Join millions of travellers"}
          </h2>
          <ul className="space-y-3">
            {PERKS[form.role].map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in py-4">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900">Wonderlust</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(({ value, label, icon: Icon, desc, color, active }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: value }))}
                className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left
                  ${form.role === value ? active : "border-gray-200 hover:border-gray-300 bg-white"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${form.role === value ? (value === "host" ? "bg-amber-100" : "bg-brand-50") : "bg-gray-100"}`}>
                  <Icon className={`w-4 h-4 ${form.role === value ? (value === "host" ? "text-amber-600" : "text-brand") : "text-gray-400"}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${form.role === value ? (value === "host" ? "text-amber-700" : "text-brand") : "text-gray-700"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="input-label">Username</label>
              <input id="username" name="username" value={form.username} onChange={set}
                required minLength={3} autoComplete="username" placeholder="johndoe" className="input" />
            </div>
            <div>
              <label htmlFor="email" className="input-label">Email address</label>
              <input id="email" type="email" name="email" value={form.email} onChange={set}
                required autoComplete="email" placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} name="password"
                  value={form.password} onChange={set} required minLength={6}
                  autoComplete="new-password" placeholder="Min. 6 characters" className="input pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Toggle password">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? strengthColor : "bg-gray-100"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strengthLabel} password</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2">
              {loading
                ? <><span className="spinner" /> Creating account…</>
                : <><span>Create {form.role === "host" ? "Host" : "Explorer"} account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-5 text-xs text-center text-gray-400">
            By signing up, you agree to our{" "}
            <span className="text-gray-600 font-medium">Terms</span> and{" "}
            <span className="text-gray-600 font-medium">Privacy Policy</span>.
          </p>

          <div className="mt-5 pt-5 border-t border-gray-100">
            {import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true" && (
              <>
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
                  Sign up with Google
                </a>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Google sign-up creates a Customer account by default.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
