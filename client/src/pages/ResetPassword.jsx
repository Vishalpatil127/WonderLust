import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Key, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(form.email, form.otp, form.password);
      setMessage("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80')" }}>
        <div className="h-full bg-black/40" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-[0.25em]">
              <Key className="w-4 h-4" /> Reset password
            </span>
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Create a new password</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your email, OTP, and a secure new password.</p>
          </div>

          {message && <div className="alert-success mb-4">{message}</div>}
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={setField}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="otp" className="input-label">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={form.otp}
                onChange={setField}
                required
                className="input"
                placeholder="123456"
              />
            </div>
            <div>
              <label htmlFor="password" className="input-label">New password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={setField}
                required
                minLength={6}
                className="input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2">
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
