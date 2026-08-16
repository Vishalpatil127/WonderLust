import { useEffect, useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, TrendingUp, BarChart2,
  Plus, Eye, Pencil, Trash2, Star,
  MapPin, ChevronRight, CheckCircle2,
  AlertCircle, Clock, Users, Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, colorClass }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900">{value ?? "—"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Status Badge ───────────────────────────────────────────────────────── */
function Badge({ status }) {
  const map = {
    active:   "bg-green-50 text-green-600 border-green-200",
    inactive: "bg-gray-100 text-gray-500 border-gray-200",
    pending:  "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${map[status] || map.inactive}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-green-500" : status === "pending" ? "bg-amber-400" : "bg-gray-400"}`} />
      {status}
    </span>
  );
}

/* ─── Listing Row ────────────────────────────────────────────────────────── */
function ListingRow({ listing, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(listing._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all group">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        <img
          src={listing.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&q=80"}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=200&q=80"; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{listing.title}</p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          {listing.location}{listing.country ? `, ${listing.country}` : ""}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <Badge status={listing.status || "active"} />
          {listing.averageRating > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {listing.averageRating.toFixed(1)}
              <span className="text-gray-400">({listing.reviewCount})</span>
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-black text-gray-900">₹{listing.price?.toLocaleString("en-IN")}</p>
        <p className="text-xs text-gray-400">/ night</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Link
          to={`/listings/${listing._id}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand-50 transition-all"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <Link
          to={`/listings/${listing._id}/edit`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
          title="Delete"
        >
          {deleting ? <span className="spinner w-3.5 h-3.5" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/* ─── Booking Row ────────────────────────────────────────────────────────── */
function BookingRow({ booking }) {
  const statusMap = {
    confirmed: "bg-green-50 text-green-600 border-green-200",
    pending:   "bg-amber-50 text-amber-600 border-amber-200",
    cancelled: "bg-red-50 text-red-500 border-red-200",
    completed: "bg-blue-50 text-blue-600 border-blue-200",
  };
  const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-black text-brand uppercase">
          {booking.user?.username?.[0] || "G"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {booking.user?.username || "Guest"}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {booking.listing?.title || "Listing"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {fmt(booking.checkIn)} → {fmt(booking.checkOut)} · {booking.guests} guest{booking.guests > 1 ? "s" : ""}
        </p>
      </div>

      {/* Price */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-sm font-black text-gray-900">₹{booking.totalPrice?.toLocaleString("en-IN")}</p>
        <p className="text-xs text-gray-400">total</p>
      </div>

      {/* Status */}
      <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold capitalize shrink-0 ${statusMap[booking.status] || statusMap.pending}`}>
        {booking.status}
      </span>
    </div>
  );
}

/* ─── Guidance Sidebar ───────────────────────────────────────────────────── */
function GuidanceSidebar({ listingCount, bookingCount }) {
  const steps = [
    { label: "Create your first listing",    done: listingCount > 0,  icon: Home },
    { label: "Add photos & description",     done: listingCount > 0,  icon: Sparkles },
    { label: "Get your first booking",       done: bookingCount > 0,  icon: BookOpen },
    { label: "Respond to guest reviews",     done: false,             icon: Star },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Setup guide</p>
        <h3 className="text-base font-extrabold text-gray-900">Complete your profile</h3>
        <p className="text-xs text-gray-400 mt-1">Hosts with complete profiles get 3× more bookings.</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">{completed}/{steps.length} completed</span>
          <span className="text-xs font-bold text-brand">{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(({ label, done, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-green-50" : "bg-gray-50"}`}>
              {done
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Icon className="w-4 h-4 text-gray-400" />}
            </div>
            <span className={`text-xs font-medium ${done ? "line-through text-gray-400" : "text-gray-700"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      {completed < steps.length && (
        <Link
          to="/listings/new"
          className="flex items-center justify-between w-full px-4 py-3 bg-brand-50 border border-brand/20 rounded-xl text-sm font-semibold text-brand hover:bg-brand/10 transition-colors"
        >
          <span>Continue setup</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}

      {/* Tips */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Quick tips</p>
        {[
          { icon: AlertCircle, text: "Add at least 5 photos to increase bookings by 40%." },
          { icon: Clock,       text: "Respond to inquiries within 1 hour for Superhost status." },
          { icon: Users,       text: "Offer flexible cancellation to attract more guests." },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <Icon className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [tab,      setTab]      = useState("listings"); // listings | bookings

  useEffect(() => {
    if (!user || (user.role !== "host" && user.role !== "admin")) return;
    Promise.all([
      api.get("/dashboard/host"),
      api.get("/listings/my"),
      api.get("/bookings/host?limit=20"),
    ])
      .then(([dashRes, listRes, bookRes]) => {
        setStats(dashRes.data);
        setListings(listRes.data.listings || []);
        setBookings(bookRes.data.bookings || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load dashboard"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteListing = async (id) => {
    await api.delete(`/listings/${id}`);
    setListings((prev) => prev.filter((l) => l._id !== id));
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-10 h-10" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "host" && user.role !== "admin") return <Navigate to="/" replace />;

  const revenue     = stats?.bookings?.totalRevenue || 0;
  const totalBook   = stats?.bookings?.totalBookings || 0;
  const occupancy   = listings.length > 0
    ? Math.min(100, Math.round((totalBook / (listings.length * 30)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand mb-1">
                Host Dashboard
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                Welcome back, {user.username} 👋
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Here's an overview of your listings and bookings.
              </p>
            </div>
            <Link
              to="/listings/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand/90 transition-colors shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Add New Listing
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {error && <div className="alert-error mb-6">{error}</div>}

        {/* ── Metrics Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Home} label="Active Listings"
              value={listings.length}
              sub={listings.length === 1 ? "1 property" : `${listings.length} properties`}
              colorClass="bg-brand-50 text-brand"
            />
            <StatCard
              icon={BookOpen} label="Total Bookings"
              value={totalBook}
              sub="All time"
              colorClass="bg-blue-50 text-blue-500"
            />
            <StatCard
              icon={TrendingUp} label="Revenue"
              value={`₹${revenue.toLocaleString("en-IN")}`}
              sub="Lifetime earnings"
              colorClass="bg-green-50 text-green-500"
            />
            <StatCard
              icon={BarChart2} label="Occupancy Rate"
              value={`${occupancy}%`}
              sub="Based on bookings"
              colorClass="bg-amber-50 text-amber-500"
            />
          </div>
        )}

        {/* ── Main content + sidebar ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── Left: Tabs ── */}
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {[
                { key: "listings", label: "My Listings",    count: listings.length },
                { key: "bookings", label: "Recent Bookings", count: bookings.length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    tab === key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    tab === key ? "bg-brand-50 text-brand" : "bg-gray-200 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Listings Tab ── */}
            {tab === "listings" && (
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-2xl bg-white border border-gray-100 animate-pulse" />
                  ))
                ) : listings.length > 0 ? (
                  listings.map((listing) => (
                    <ListingRow
                      key={listing._id}
                      listing={listing}
                      onDelete={handleDeleteListing}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                      <Home className="w-6 h-6 text-brand" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">No listings yet</p>
                    <p className="text-sm text-gray-400 mb-5">
                      Create your first listing to start welcoming guests.
                    </p>
                    <Link to="/listings/new" className="btn btn-primary btn-md gap-2">
                      <Plus className="w-4 h-4" /> Add your first listing
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── Bookings Tab ── */}
            {tab === "bookings" && (
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl bg-white border border-gray-100 animate-pulse" />
                  ))
                ) : bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <BookingRow key={booking._id} booking={booking} />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">No bookings yet</p>
                    <p className="text-sm text-gray-400">
                      Bookings will appear here once guests reserve your listings.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Guidance Sidebar ── */}
          <GuidanceSidebar
            listingCount={listings.length}
            bookingCount={bookings.length}
          />
        </div>
      </div>
    </div>
  );
}
