import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Shield, Home, TrendingUp, BookOpen, Activity } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, label, value, color = "brand" }) {
  const colors = {
    brand: { bg: "bg-brand-50", icon: "text-brand", border: "border-brand/10" },
    blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
    green: { bg: "bg-green-50", icon: "text-green-500", border: "border-green-100" },
  };
  const c = colors[color] || colors.brand;

  return (
    <div className={`bg-white rounded-3xl border ${c.border} p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
        <span className="text-xs text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-5 text-3xl font-extrabold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "host" && user.role !== "admin")) return;

    api.get("/dashboard/host")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "host" && user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">Host dashboard</p>
              <h1 className="text-3xl font-extrabold text-gray-900">Welcome back, {user.username}</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your listings and bookings from one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/listings/new" className="btn btn-primary btn-sm">Add new listing</Link>
              <Link to="/my-bookings" className="btn btn-outline btn-sm">View bookings</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {error && <div className="alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-40 rounded-3xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Home} label="My listings" value={stats?.listings} color="brand" />
            <StatCard icon={BookOpen} label="Total bookings" value={stats?.bookings?.totalBookings} color="blue" />
            <StatCard icon={TrendingUp} label="Revenue" value={`₹${stats?.bookings?.totalRevenue?.toLocaleString("en-IN") || 0}`} color="green" />
            <StatCard icon={Activity} label="Platform access" value={user.role === "admin" ? "Admin" : "Host"} color="brand" />
          </div>
        )}
      </div>
    </div>
  );
}
