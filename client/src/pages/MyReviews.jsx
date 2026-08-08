import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Star, Pencil, Trash2, MapPin } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onDelete }) {
  const listing = review.listing || {};
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    setDeleting(true);
    try {
      await onDelete(review._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-card transition-shadow">
      {/* Listing info */}
      <Link
        to={`/listings/${listing._id}`}
        className="flex items-center gap-3 mb-4 group"
      >
        {listing.image && (
          <img
            src={listing.image}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors truncate">
            {listing.title || "Listing"}
          </p>
          {listing.location && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {listing.location}{listing.country ? `, ${listing.country}` : ""}
            </p>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between mb-3">
        <StarDisplay rating={review.rating} />
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

      {/* Review images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {review.images.map((img) => (
            <img
              key={img}
              src={img}
              alt="Review"
              className="w-16 h-14 object-cover rounded-xl border border-gray-100"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Link
          to={`/listings/${listing._id}`}
          className="btn btn-ghost btn-sm text-xs gap-1.5"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit on listing page
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn btn-ghost btn-sm text-xs text-red-500 hover:bg-red-50 gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
}

export default function MyReviews() {
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!user) return;
    api.get("/reviews/me")
      .then((res) => setReviews(res.data.reviews || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (reviewId) => {
    await api.delete(`/reviews/${reviewId}`);
    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">
              Your feedback
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">My Reviews</h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} review{reviews.length !== 1 ? "s" : ""} written
              </p>
            )}
          </div>
          <Link to="/" className="btn btn-outline btn-sm">
            Browse stays
          </Link>
        </div>

        {error && <div className="alert-error mb-6">{error}</div>}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-3xl bg-white border border-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Star className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-500 mb-6">
              After your stay, share your experience to help other travellers.
            </p>
            <Link to="/" className="btn btn-primary btn-md">
              Find a stay to review
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
