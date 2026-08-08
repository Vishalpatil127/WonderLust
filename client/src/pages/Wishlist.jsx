import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Heart, MapPin, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) return;

    api.get("/wishlist")
      .then((res) => setItems(res.data.items || []))
      .catch((err) => setError(err.response?.data?.message || "Unable to load wishlist"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = async (listingId) => {
    setRemoving(listingId);
    try {
      await api.delete(`/wishlist/${listingId}`);
      setItems((prev) => prev.filter((item) => String(item.listing._id) !== String(listingId)));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove item");
    } finally {
      setRemoving(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">Your wishlist</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Saved stays</h1>
            <p className="mt-1 text-sm text-gray-500">A curated list of places you loved.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white shadow-sm transition">Find more stays</Link>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-56 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ _id, listing }) => (
              <div key={_id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transform hover:-translate-y-1 hover:shadow-lg transition">
                <Link to={`/listings/${listing._id}`} className="block overflow-hidden relative">
                  <img
                    src={listing.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80"}
                    alt={listing.title}
                    className="h-44 w-full object-cover"
                  />
                  <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700">
                    <MapPin className="w-3.5 h-3.5" /> {listing.country}
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-gradient-to-r from-brand to-indigo-500 text-white px-3 py-1 text-sm font-semibold">₹{listing.price?.toLocaleString("en-IN")}</div>
                </Link>
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <Link to={`/listings/${listing._id}`} className="text-base font-semibold text-gray-900 hover:text-brand transition-colors">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{listing.location}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {typeof listing.averageRating === "number" && (
                        <span className="text-yellow-500">★ {listing.averageRating.toFixed(1)}</span>
                      )}
                      <span className="text-gray-500">· {listing.reviewCount || 0} reviews</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/listings/${listing._id}`} className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">View</Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(listing._id)}
                        disabled={removing === listing._id}
                        className="inline-flex items-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                      >
                        <X className="w-4 h-4" /> {removing === listing._id ? "Removing…" : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-brand to-indigo-500 flex items-center justify-center text-white text-2xl">❤</div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 mb-6">Save places you love to find them faster later.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-brand text-white px-4 py-2 font-medium">Browse listings</Link>
          </div>
        )}
      </div>
    </div>
  );
}
