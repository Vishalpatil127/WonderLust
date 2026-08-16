import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">

        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-brand" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-modal">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-xs font-semibold text-brand mb-3">
              <Lock className="w-3 h-3" /> Admin Access
            </span>
            <h1 className="text-2xl font-extrabold text-white mb-1">Welcome back, Admin</h1>
            <p className="text-gray-400 text-sm">Sign in to access the admin panel.</p>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 rounded-xl p-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                ? <><span className="spinner" /> Signing in…</>
                : <><Lock className="w-4 h-4" /> Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

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
