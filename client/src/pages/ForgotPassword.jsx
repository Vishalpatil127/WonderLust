import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage("OTP sent to your email. Use it to reset your password.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')" }}>
        <div className="h-full bg-black/40" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold uppercase tracking-[0.25em]">
              <Mail className="w-4 h-4" /> Forgot password
            </span>
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Reset your password</h1>
            <p className="mt-2 text-sm text-gray-500">Enter your email to receive an OTP and reset your password.</p>
          </div>

          {message && <div className="alert-success mb-4">{message}</div>}
          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full gap-2">
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Remembered your password? <Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="mt-2">
              Have an OTP? <Link to="/reset-password" className="text-brand font-semibold hover:underline">Reset password</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
