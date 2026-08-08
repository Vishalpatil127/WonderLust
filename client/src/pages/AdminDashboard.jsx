import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Home, Star, TrendingUp,
  Activity, ArrowUpRight, Shield,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatCard({ icon: Icon, label, value, trend, color = "brand" }) {
  const colors = {
    brand:  { bg: "bg-brand-50",  icon: "text-brand",    border: "border-brand/10" },
    blue:   { bg: "bg-blue-50",   icon: "text-blue-500", border: "border-blue-100" },
    green:  { bg: "bg-green-50",  icon: "text-green-500",border: "border-green-100" },
    amber:  { bg: "bg-amber-50",  icon: "text-amber-500",border: "border-amber-100" },
  };
  const c = colors[color];

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-5 shadow-sm hover:shadow-card transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />{trend}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold text-gray-900">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    api.get("/dashboard/admin")
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, {user.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8 space-y-8">
        {/* Stats grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4" />
                <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Home}      label="Total listings" value={stats?.listings}                   trend={12} color="brand" />
            <StatCard icon={Users}     label="Total users"    value={stats?.users}                      trend={8}  color="blue" />
            <StatCard icon={Star}      label="Total bookings" value={stats?.bookings?.totalBookings}     trend={5}  color="amber" />
            <StatCard icon={TrendingUp}label="Total revenue"  value={`₹${(stats?.bookings?.totalRevenue || 0).toLocaleString("en-IN")}`} trend={20} color="green" />
          </div>
        )}

        {/* Activity placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              {[
                { action: "New listing added", time: "2 min ago", icon: Home },
                { action: "New user registered", time: "15 min ago", icon: Users },
                { action: "Review posted", time: "1 hr ago", icon: Star },
                { action: "Booking confirmed", time: "3 hr ago", icon: TrendingUp },
              ].map(({ action, time, icon: Icon }) => (
                <div key={action} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{action}</p>
                    <p className="text-xs text-gray-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <LayoutDashboard className="w-5 h-5 text-brand" />
              <h2 className="font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "View listings", href: "/",            icon: Home,       color: "bg-brand-50 text-brand" },
                { label: "Manage users", href: "/admin/users",  icon: Users,      color: "bg-blue-50 text-blue-600" },
                { label: "See reviews",  href: "#",             icon: Star,       color: "bg-amber-50 text-amber-600" },
                { label: "Bookings",     href: "#",             icon: TrendingUp, color: "bg-green-50 text-green-600" },
              ].map(({ label, href, icon: Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all`}
                >
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
