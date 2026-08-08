import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [imgError, setImgError] = useState(false);
  const [liked,    setLiked]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const image = !imgError && listing.image
    ? listing.image
    : "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80";

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    if (saving) return;
    setSaving(true);
    try {
      liked
        ? await api.delete(`/wishlist/${listing._id}`)
        : await api.post("/wishlist", { listingId: listing._id });
      setLiked(!liked);
    } catch (_) {}
    finally { setSaving(false); }
  };

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-3xl"
    >
      {/* ── Image container ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gray-100 aspect-[4/3]">
        {/* Skeleton shimmer while loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton rounded-3xl" />
        )}

        <img
          src={image}
          alt={listing.title}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-500
            group-hover:scale-[1.04]
            ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Wishlist btn */}
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm
                     shadow flex items-center justify-center
                     hover:scale-110 active:scale-95 transition-transform z-10"
        >
          <Heart className={`w-4 h-4 transition-colors duration-200 ${liked ? "fill-brand text-brand" : "text-gray-700"}`} />
        </button>

        {/* Featured badge */}
        {listing.isFeatured && (
          <div className="absolute top-3 left-3 z-10">
            <span className="badge badge-brand shadow-sm">✦ Featured</span>
          </div>
        )}

        {/* Hover price strip */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 translate-y-full
                        group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-bold drop-shadow">
              ₹{listing.price?.toLocaleString("en-IN")} / night
            </span>
            {listing.averageRating > 0 && (
              <span className="flex items-center gap-1 text-white text-xs font-semibold drop-shadow">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {listing.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-3 px-1 pb-1 space-y-1">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1
                         group-hover:text-brand transition-colors duration-150 flex-1">
            {listing.title}
          </h3>
          {listing.averageRating > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-semibold text-gray-700 shrink-0 mt-0.5">
              <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
              {listing.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Location */}
        <p className="flex items-center gap-1 text-xs text-gray-500 line-clamp-1">
          <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
          {listing.location}, {listing.country}
        </p>

        {/* Price */}
        <p className="text-sm">
          <span className="font-bold text-gray-900">₹{listing.price?.toLocaleString("en-IN")}</span>
          <span className="text-gray-500"> / night</span>
          {listing.reviewCount > 0 && (
            <span className="text-gray-400 text-xs ml-2">· {listing.reviewCount} review{listing.reviewCount > 1 ? "s" : ""}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
