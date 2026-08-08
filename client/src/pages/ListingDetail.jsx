import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin, Star, Share2, Heart, Pencil, Trash2,
  ChevronLeft, Shield, Users, Wifi, Wind, Coffee,
  ParkingCircle, Tv, CheckCircle2, Award, Clock,
  BadgeCheck, Grid2x2, CreditCard,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import PaymentModal from "../components/PaymentModal";
import { openRazorpayCheckout } from "../hooks/useRazorpay";

const today = () => new Date().toISOString().split("T")[0];
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().split("T")[0]; };
const nightsBetween = (a, b) => (!a || !b) ? 0 : Math.max(0, Math.floor((new Date(b) - new Date(a)) / 86400000));
const FALLBACK = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80";
const PHOTO_LABELS = ["Property", "Bedroom", "Living room", "Kitchen"];
const PHOTO_SETS = {
  bedroom: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"],
  living:  ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=800&q=80"],
  kitchen: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
};
const AMENITIES = [
  { icon: Wifi,          label: "Free WiFi",       desc: "High-speed internet" },
  { icon: Wind,          label: "Air conditioning", desc: "Climate controlled" },
  { icon: Coffee,        label: "Kitchen",          desc: "Fully equipped" },
  { icon: ParkingCircle, label: "Free parking",     desc: "On premises" },
  { icon: Tv,            label: "Smart TV",         desc: "Netflix & more" },
  { icon: Shield,        label: "Self check-in",    desc: "Keypad available" },
];
function getGallery(listingId, heroImage) {
  const seed = listingId ? listingId.split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0) : 42;
  const pick = (arr) => arr[seed % arr.length];
  return [heroImage || FALLBACK, pick(PHOTO_SETS.bedroom), pick(PHOTO_SETS.living), pick(PHOTO_SETS.kitchen)];
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing,          setListing]          = useState(null);
  const [reviews,          setReviews]          = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [submitting,       setSubmitting]       = useState(false);
  const [booking,          setBooking]          = useState(false);
  const [bookingDone,      setBookingDone]      = useState(false);
  const [bookingError,     setBookingError]     = useState("");
  const [paymentStep,      setPaymentStep]      = useState("idle");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingOrder,     setPendingOrder]     = useState(null);
  const [editingId,        setEditingId]        = useState(null);
  const [editingReview,    setEditingReview]    = useState(null);
  const [liked,            setLiked]            = useState(false);
  const [wishlistLoading,  setWishlistLoading]  = useState(false);
  const [activePhoto,      setActivePhoto]      = useState(0);
  const [checkIn,          setCheckIn]          = useState(addDays(today(), 1));
  const [checkOut,         setCheckOut]         = useState(addDays(today(), 4));
  const [guests,           setGuests]           = useState(1);

  const loadListing = async () => { const r = await api.get(`/listings/${id}`); setListing(r.data.listing); };
  const loadReviews = async () => { const r = await api.get(`/reviews/listing/${id}`); setReviews(r.data.reviews || []); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await Promise.all([loadListing(), loadReviews()]); }
      catch (e) { setError(e.response?.data?.message || "Failed to load listing"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!user) { setLiked(false); return; }
    api.get("/wishlist")
      .then((r) => setLiked(Boolean(r.data.items?.some((i) => String(i.listing?._id) === String(id)))))
      .catch(() => {});
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this listing?")) return;
    try { await api.delete(`/listings/${id}`); navigate("/"); }
    catch (e) { setError(e.response?.data?.message || "Delete failed"); }
  };

  const handleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      liked ? await api.delete(`/wishlist/${id}`) : await api.post("/wishlist", { listingId: id });
      setLiked(!liked);
    } catch (_) {} finally { setWishlistLoading(false); }
  };

  const handleReviewSubmit = async (payload) => {
    setSubmitting(true);
    try {
      editingId ? await api.put(`/reviews/${editingId}`, payload)
                : await api.post("/reviews", { ...payload, listingId: id });
      setEditingId(null); setEditingReview(null);
      await Promise.all([loadReviews(), loadListing()]);
    } finally { setSubmitting(false); }
  };

  const handleReviewDelete = async (rid) => {
    if (!window.confirm("Delete this review?")) return;
    try { await api.delete(`/reviews/${rid}`); await Promise.all([loadReviews(), loadListing()]); }
    catch (e) { setError(e.response?.data?.message || "Failed to delete review"); }
  };

  const confirmBooking = async ({ paymentId = null, orderId = null, mock = false } = {}) => {
    setShowPaymentModal(false);
    setBooking(true);
    setPaymentStep("confirming");
    try {
      await api.post("/bookings", {
        listingId: id, checkIn, checkOut, guests, totalPrice: total,
        paymentId, orderId: orderId || pendingOrder?.id || null, mock,
      });
      setBookingDone(true);
    } catch (e) {
      setBookingError(e.response?.data?.message || e.message || "Booking failed.");
    } finally {
      setBooking(false); setPaymentStep("idle"); setPendingOrder(null);
    }
  };

  const handleBooking = async () => {
    setBookingError("");
    if (nights < 1) { setBookingError("Please select valid dates."); return; }
    setBooking(true);
    try {
      setPaymentStep("creating");
      const receipt = `wl_${id.slice(-8)}_${Date.now().toString().slice(-8)}`;
      const { data: orderData } = await api.post("/payments/create-order", { amount: total, currency: "INR", receipt });
      const order = orderData.order;
      setPaymentStep("checkout");
      const result = await openRazorpayCheckout({ order, amount: total, name: listing.title, user });
      if (result.useCustomModal) {
        setPendingOrder(order); setShowPaymentModal(true);
        setBooking(false); setPaymentStep("idle"); return;
      }
      await confirmBooking({ paymentId: result.paymentId, orderId: result.orderId, mock: false });
    } catch (e) {
      setBookingError(e.message === "Payment cancelled"
        ? "Payment was cancelled. You can try again."
        : e.response?.data?.message || e.message || "Booking failed.");
    } finally { setBooking(false); setPaymentStep("idle"); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="skeleton w-16 h-16 rounded-3xl" />
      <div className="space-y-2 text-center">
        <div className="skeleton h-5 w-48 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded-lg" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4 px-6">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-lg font-bold text-gray-900">Listing not found</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button onClick={() => navigate("/")} className="btn btn-primary btn-md">Back to listings</button>
      </div>
    </div>
  );

  if (!listing) return null;

  const nights      = nightsBetween(checkIn, checkOut);
  const subtotal    = listing.price * nights;
  const serviceFee  = Math.round(subtotal * 0.12);
  const total       = subtotal + serviceFee;
  const minCheckout = addDays(checkIn, 1);
  const isOwner     = user && listing.owner && String(listing.owner._id) === String(user.id);
  const isHostOrAdmin = user?.role === "host" || user?.role === "admin";
  const hasReviewed = reviews.some((r) => String(r.user?._id || r.user) === String(user?.id));
  const gallery     = getGallery(listing._id, listing.image);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-100">
          <div className="page-container py-3 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-1.5 text-gray-600">
              <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}
                className="btn btn-ghost btn-sm gap-1.5 text-gray-600">
                <Share2 className="w-4 h-4" /><span className="hidden sm:inline">Share</span>
              </button>
              <button onClick={handleWishlist}
                className={`btn btn-sm gap-1.5 ${liked ? "bg-brand-50 text-brand border border-brand/20" : "btn-ghost text-gray-600"}`}>
                <Heart className={`w-4 h-4 ${liked ? "fill-brand text-brand" : ""}`} />
                <span className="hidden sm:inline">{liked ? "Saved" : "Save"}</span>
              </button>
              {isOwner && (
                <>
                  <Link to={`/listings/${id}/edit`} className="btn btn-outline btn-sm gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button onClick={handleDelete} className="btn btn-danger btn-sm gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* GALLERY */}
        <div className="page-container py-5">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden" style={{ height: "500px" }}>
            <div className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer group" onClick={() => setActivePhoto(0)}>
              <img src={gallery[0]} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = FALLBACK; }} />
              {listing.averageRating > 0 && (
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 rounded-full shadow text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{listing.averageRating.toFixed(1)}
                  <span className="text-gray-500 font-normal">({listing.reviewCount})</span>
                </div>
              )}
            </div>
            {gallery.slice(1, 4).map((src, i) => (
              <div key={i} className="relative overflow-hidden cursor-pointer group" onClick={() => setActivePhoto(i + 1)}>
                <img src={src} alt={PHOTO_LABELS[i + 1]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.currentTarget.src = FALLBACK; }} />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">{PHOTO_LABELS[i + 1]}</div>
                {i === 2 && <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow"><Grid2x2 className="w-3.5 h-3.5" /> All photos</div>}
              </div>
            ))}
          </div>
          <div className="md:hidden flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
            {gallery.map((src, i) => (
              <div key={i} onClick={() => setActivePhoto(i)} className={`shrink-0 rounded-2xl overflow-hidden cursor-pointer ${activePhoto === i ? "ring-2 ring-brand ring-offset-2" : ""}`} style={{ width: "72vw", height: "210px" }}>
                <img src={src} alt={PHOTO_LABELS[i]} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = FALLBACK; }} />
              </div>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 mt-3">
            {gallery.map((src, i) => (
              <button key={i} onClick={() => setActivePhoto(i)} className={`relative rounded-xl overflow-hidden shrink-0 transition-all ${activePhoto === i ? "ring-2 ring-brand ring-offset-1" : "opacity-60 hover:opacity-100"}`} style={{ width: 80, height: 56 }}>
                <img src={src} alt={PHOTO_LABELS[i]} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1"><p className="text-white text-[9px] font-semibold truncate">{PHOTO_LABELS[i]}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div className="page-container pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
            {/* LEFT */}
            <div className="space-y-8 min-w-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">{listing.title}</h1>
                <div className="flex items-center flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600"><MapPin className="w-4 h-4 text-brand shrink-0" />{listing.location}, {listing.country}</span>
                  {listing.averageRating > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />{listing.averageRating.toFixed(1)}
                      <span className="text-gray-400 font-normal">({listing.reviewCount} review{listing.reviewCount !== 1 ? "s" : ""})</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="divider" />
              {listing.owner && (
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-brand-50 border-2 border-brand flex items-center justify-center shrink-0">
                    <span className="text-xl font-black text-brand uppercase">{listing.owner.username?.[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">Hosted by {listing.owner.username}</p>
                    <p className="text-sm text-gray-500 mb-4">Typically responds within an hour</p>
                    <div className="flex flex-wrap gap-4">
                      {[{ icon: Award, label: "Superhost", sub: "Top-rated host" }, { icon: Clock, label: "Fast replies", sub: "Within an hour" }, { icon: BadgeCheck, label: "Identity verified", sub: "Trusted host" }].map(({ icon: Icon, label, sub }) => (
                        <div key={label} className="flex items-center gap-2"><Icon className="w-4 h-4 text-brand shrink-0" /><div><p className="text-xs font-semibold text-gray-800">{label}</p><p className="text-xs text-gray-400">{sub}</p></div></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="divider" />
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-4">About this place</h2>
                <p className="text-gray-600 leading-8 text-base whitespace-pre-line">{listing.description || "No description provided."}</p>
              </div>
              <div className="divider" />
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-6">What this place offers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AMENITIES.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-gray-200 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-gray-600" /></div>
                      <div><p className="text-sm font-semibold text-gray-900">{label}</p><p className="text-xs text-gray-400">{desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="divider" />
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Guest reviews</h2>
                    {listing.reviewCount > 0 && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-gray-900">{listing.averageRating?.toFixed(1)}</span> · {listing.reviewCount} review{listing.reviewCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <ReviewList reviews={reviews} currentUserId={user?.id}
                  onEdit={(r) => { setEditingId(r._id); setEditingReview(r); }}
                  onDelete={handleReviewDelete} />
              </div>
              {user && !hasReviewed && !editingId && !isOwner && (
                <div className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
                  <p className="text-sm font-bold text-gray-900 mb-4">Share your experience</p>
                  <ReviewForm onSubmit={handleReviewSubmit} loading={submitting} />
                </div>
              )}
              {editingReview && (
                <div className="bg-gray-50 rounded-3xl border border-gray-100 p-7">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-gray-900">Edit your review</p>
                    <button onClick={() => { setEditingId(null); setEditingReview(null); }} className="text-xs text-gray-400 hover:text-gray-700">Cancel</button>
                  </div>
                  <ReviewForm initialData={editingReview} onSubmit={handleReviewSubmit} submitLabel="Update review" loading={submitting} />
                </div>
              )}
              {!user && (
                <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <Star className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-sm text-gray-600"><Link to="/login" className="text-brand font-semibold hover:underline">Sign in</Link> to leave a review.</p>
                </div>
              )}
            </div>

            {/* RIGHT — Booking card */}
            <div>
              <div className="sticky top-32 rounded-3xl border border-gray-200 shadow-modal bg-white overflow-hidden">
                <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-gray-900 to-gray-800">
                  <p className="text-3xl font-black text-white">&#8377;{listing.price?.toLocaleString("en-IN")}<span className="text-base font-normal text-white/60 ml-1">/ night</span></p>
                  {listing.averageRating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-white">{listing.averageRating.toFixed(1)}</span>
                      <span className="text-white/50 text-sm">· {listing.reviewCount} review{listing.reviewCount !== 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  {bookingDone ? (
                    <div className="flex flex-col items-center text-center py-6 gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <div>
                        <p className="text-lg font-extrabold text-gray-900 mb-1">Booking confirmed!</p>
                        <p className="text-sm text-gray-500">Your stay at <span className="font-semibold">{listing.title}</span> is confirmed.</p>
                      </div>
                      <Link to="/my-bookings" className="btn btn-primary btn-lg w-full">View my bookings</Link>
                    </div>
                  ) : isOwner ? (
                    <div className="flex items-center gap-3 py-4 px-4 bg-gray-50 rounded-2xl">
                      <Shield className="w-5 h-5 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500">You own this listing.</p>
                    </div>
                  ) : isHostOrAdmin ? (
                    <div className="flex items-center gap-3 py-4 px-4 bg-gray-50 rounded-2xl">
                      <Shield className="w-5 h-5 text-gray-400 shrink-0" />
                      <p className="text-sm text-gray-500">Host accounts cannot make bookings.</p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                          <div className="p-3.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-in</p>
                            <input type="date" value={checkIn} min={addDays(today(), 1)}
                              onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1)); }}
                              className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer" />
                          </div>
                          <div className="p-3.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Check-out</p>
                            <input type="date" value={checkOut} min={minCheckout}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="w-full text-sm font-bold text-gray-900 bg-transparent outline-none cursor-pointer" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3.5">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Guests</p>
                            <p className="text-sm font-bold text-gray-900">{guests} guest{guests > 1 ? "s" : ""}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-all font-bold">-</button>
                            <span className="text-sm font-bold w-4 text-center">{guests}</span>
                            <button type="button" onClick={() => setGuests(Math.min(16, guests + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-all font-bold">+</button>
                          </div>
                        </div>
                      </div>
                      {nights > 0 && (
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-sm">
                          <div className="flex justify-between text-gray-600"><span>&#8377;{listing.price?.toLocaleString("en-IN")} x {nights} night{nights > 1 ? "s" : ""}</span><span className="font-medium text-gray-900">&#8377;{subtotal.toLocaleString("en-IN")}</span></div>
                          <div className="flex justify-between text-gray-600"><span>Service fee</span><span className="font-medium text-gray-900">&#8377;{serviceFee.toLocaleString("en-IN")}</span></div>
                          <div className="border-t border-gray-200 pt-3 flex justify-between font-extrabold text-gray-900 text-base"><span>Total</span><span>&#8377;{total.toLocaleString("en-IN")}</span></div>
                        </div>
                      )}
                      {bookingError && <p className="alert-error">{bookingError}</p>}
                      {user ? (
                        <button onClick={handleBooking} disabled={booking || nights < 1} className="btn btn-primary btn-lg w-full text-base font-bold">
                          {booking
                            ? <><span className="spinner" />{" "}{paymentStep === "creating" ? "Creating order…" : paymentStep === "checkout" ? "Awaiting payment…" : paymentStep === "confirming" ? "Confirming booking…" : "Processing…"}</>
                            : nights < 1 ? "Select dates" : <><CreditCard className="w-4 h-4" /> Pay &amp; Reserve</>}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <Link to="/register" state={{ from: { pathname: `/listings/${id}` } }} className="btn btn-primary btn-lg w-full block text-center text-base font-bold">Sign up to book</Link>
                          <p className="text-xs text-center text-gray-500">Already have an account?{" "}<Link to="/login" state={{ from: { pathname: `/listings/${id}` } }} className="text-brand font-semibold hover:underline">Log in</Link></p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 text-center">You won&apos;t be charged yet</p>
                    </>
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500 font-medium">{listing.reviewCount ? `${listing.reviewCount} guest${listing.reviewCount > 1 ? "s" : ""} have stayed here` : "Be the first to stay here"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          amount={total} nights={nights} listing={listing?.title}
          onSuccess={(opts) => confirmBooking({ mock: true, ...opts })}
          onCancel={() => { setShowPaymentModal(false); setPendingOrder(null); setBookingError("Payment was cancelled."); }}
        />
      )}
    </>
  );
}
