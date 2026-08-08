import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { CalendarDays, Home, User, DollarSign } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function BookingCard({ booking, isHostView }) {
  const listing = booking.listing || {};
  const customer = booking.customer || {};
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{listing.title || "Unknown listing"}</h2>
          <p className="text-sm text-gray-500 mt-1">{listing.location}, {listing.country}</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{booking.status}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Dates</p>
          <p className="mt-2 text-sm text-gray-900">{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Guests</p>
          <p className="mt-2 text-sm text-gray-900">{booking.guests} guest{booking.guests !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
        <span className="inline-flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> ₹{booking.totalPrice?.toLocaleString("en-IN")}
        </span>
        {isHostView && (
          <span className="inline-flex items-center gap-2">
            <User className="w-4 h-4" /> {customer.username || "Guest"}
          </span>
        )}
      </div>

      <div className="mt-6">
        <Link to={`/listings/${listing._id}`} className="text-brand font-semibold hover:underline">
          View listing details
        </Link>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const endpoint = user.role === "host" || user.role === "admin" ? "/bookings/host" : "/bookings/mine";
    api.get(endpoint)
      .then((res) => setBookings(res.data.bookings || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load bookings"))
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

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="page-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">
              {user.role === "host" || user.role === "admin" ? "Host bookings" : "My bookings"}
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {user.role === "host" || user.role === "admin" ? "Your hosting activity" : "Upcoming trips"}
            </h1>
          </div>
          <Link to="/" className="btn btn-outline btn-sm">Browse stays</Link>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="grid gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-40 rounded-3xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-5">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                isHostView={user.role === "host" || user.role === "admin"}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</p>
            <p className="text-sm text-gray-500 mb-6">Start by browsing listings and making your first booking.</p>
            <Link to="/" className="btn btn-primary btn-md">Browse stays</Link>
          </div>
        )}
      </div>
    </div>
  );
}
