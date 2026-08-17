import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ChevronDown, MapPin, Sparkles, Star, Shield, Clock,
  ArrowRight, Play, Globe, Heart, Zap,
} from "lucide-react";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";

/* ─── constants ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: "All",         value: "",            icon: "✦" },
  { label: "Beach",       value: "beach",       icon: "🏖️" },
  { label: "Mountains",   value: "mountain",    icon: "⛰️" },
  { label: "City",        value: "city",        icon: "🏙️" },
  { label: "Countryside", value: "countryside", icon: "🌾" },
  { label: "Luxury",      value: "luxury",      icon: "💎" },
  { label: "Cabins",      value: "cabin",       icon: "🪵" },
  { label: "Trending",    value: "trending",    icon: "🔥" },
  { label: "Lakeside",    value: "lake",        icon: "🌊" },
  { label: "Desert",      value: "desert",      icon: "🏜️" },
];

const HERO_WORDS  = ["escape", "adventure", "retreat", "journey", "getaway"];
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=90",
];

const WHY_CARDS = [
  { emoji: "🏡", title: "Unique stays",         desc: "From treehouses to villas — every property is one-of-a-kind.", color: "from-rose-500/10 to-pink-500/5" },
  { emoji: "🔒", title: "Safe & secure",         desc: "Every host is verified. Every booking is protected.",          color: "from-blue-500/10 to-cyan-500/5" },
  { emoji: "💬", title: "24/7 support",           desc: "Our team is always available whenever you need help.",         color: "from-amber-500/10 to-yellow-500/5" },
  { emoji: "💸", title: "Best price guarantee",   desc: "Find a lower price? We'll match it, no questions asked.",     color: "from-green-500/10 to-emerald-500/5" },
];

/* ─── Typewriter ─────────────────────────────────────────────────────────── */
function TypewriterWord({ words }) {
  const [wi, setWi]           = useState(0);
  const [ci, setCi]           = useState(0);
  const [deleting, setDel]    = useState(false);

  useEffect(() => {
    const word  = words[wi];
    const delay = deleting ? 55 : ci === word.length ? 2200 : 85;
    const t = setTimeout(() => {
      if (!deleting && ci < word.length)       setCi(c => c + 1);
      else if (!deleting && ci === word.length) setDel(true);
      else if (deleting && ci > 0)             setCi(c => c - 1);
      else { setDel(false); setWi(i => (i + 1) % words.length); }
    }, delay);
    return () => clearTimeout(t);
  }, [ci, deleting, wi, words]);

  return (
    <span className="relative inline-block">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400">
        {words[wi].slice(0, ci)}
      </span>
      <span className="inline-block w-0.5 h-[0.8em] bg-rose-400 ml-0.5 align-middle"
            style={{ animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [val, setVal]   = useState(0);
  const ref             = useRef(null);
  const done            = useRef(false);

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 1800, 1);
          setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Scroll reveal ──────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "", from = "bottom" }) {
  const ref       = useRef(null);
  const [vis, setVis] = useState(false);

  const initial = from === "left" ? "translateX(-40px)"
                : from === "right" ? "translateX(40px)"
                : "translateY(32px)";

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); ob.disconnect(); }
    }, { threshold: 0.12 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : initial,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

/* ─── Floating badge ─────────────────────────────────────────────────────── */
function FloatBadge({ style, children }) {
  return (
    <div className="absolute hidden lg:flex items-center gap-2.5 bg-white/95 backdrop-blur-sm
                    rounded-2xl px-4 py-3 shadow-2xl border border-white/60"
         style={style}>
      {children}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef        = useRef(null);
  const [scrollY, setScrollY]           = useState(0);
  const [heroImg, setHeroImg]           = useState(0);

  const [listings, setListings]         = useState([]);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [activeCategory, setActive]     = useState("");

  const urlFilters = {
    search:   searchParams.get("search")   || "",
    location: searchParams.get("location") || "",
    country:  searchParams.get("country")  || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort:     searchParams.get("sort")     || "newest",
  };

  /* parallax */
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* hero image carousel */
  useEffect(() => {
    const t = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const fetchListings = useCallback(async (filters = {}, pg = 1) => {
    setLoading(true); setError("");
    try {
      const p = { page: pg, limit: 12 };
      if (filters.search)   p.search   = filters.search;
      if (filters.location) p.location = filters.location;
      if (filters.country)  p.country  = filters.country;
      if (filters.minPrice) p.minPrice = filters.minPrice;
      if (filters.maxPrice) p.maxPrice = filters.maxPrice;
      if (filters.sort)     p.sort     = filters.sort;
      const res = await api.get("/listings", { params: p });
      setListings(res.data.listings || []);
      setPage(res.data.page || pg);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(urlFilters, 1); setActive(""); }, [searchParams.toString()]);

  const handleCategory = (cat) => {
    setActive(cat);
    const p = new URLSearchParams(searchParams);
    if (cat) p.set("search", cat); else p.delete("search");
    setSearchParams(p);
  };

  const scrollDown = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const hasFilters = urlFilters.search || urlFilters.location || urlFilters.country ||
                     urlFilters.minPrice || urlFilters.maxPrice;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════════════════════════════════
          HERO — immersive full-viewport
      ════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ height: "100vh", marginTop: "-112px" }}>

        {/* Crossfade background carousel */}
        {HERO_IMAGES.map((src, i) => (
          <img key={src} src={src} alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{
              opacity: i === heroImg ? 1 : 0,
              transform: `translateY(${scrollY * 0.25}px) scale(1.08)`,
            }}
          />
        ))}

        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }} />

        {/* Animated gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #f43f5e, #fb923c, #f43f5e, transparent)", animation: "shimmer 3s linear infinite", backgroundSize: "200% 100%" }} />

        {/* Floating UI badges */}
        <FloatBadge style={{ top: "28%", right: "8%", animation: "floatY 4s ease-in-out infinite" }}>
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-green-500 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">Average rating</p>
            <p className="text-sm font-extrabold text-gray-900 mt-0.5">4.9 / 5.0</p>
          </div>
        </FloatBadge>

        <FloatBadge style={{ bottom: "30%", right: "12%", animation: "floatY 5s ease-in-out 1s infinite" }}>
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 fill-brand text-brand" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">New listing</p>
            <p className="text-sm font-extrabold text-gray-900 mt-0.5">Bali Villa ✨</p>
          </div>
        </FloatBadge>

        <FloatBadge style={{ top: "45%", right: "5%", animation: "floatY 6s ease-in-out 2s infinite" }}>
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">Instant book</p>
            <p className="text-sm font-extrabold text-gray-900 mt-0.5">Available now</p>
          </div>
        </FloatBadge>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingTop: "112px" }}>
          <div className="page-container">
            <div className="max-w-2xl">

              {/* Pill tag */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                              bg-white/10 border border-white/15 backdrop-blur-md mb-7"
                   style={{ animation: "slideInLeft 0.7s ease both" }}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-white/85 tracking-wider uppercase">
                  {total > 0 ? `${total}+ curated stays worldwide` : "Curated stays worldwide"}
                </span>
              </div>

              {/* Main headline */}
              <h1 className="font-black text-white leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(3rem, 5.5vw, 5rem)", animation: "slideInLeft 0.8s ease 0.05s both" }}>
                Find your<br />next{" "}
                <TypewriterWord words={HERO_WORDS} />
              </h1>

              {/* Sub */}
              <p className="text-white/60 leading-relaxed mb-9 max-w-lg"
                 style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", animation: "slideInLeft 0.9s ease 0.15s both" }}>
                Unique homes, luxury villas, mountain cabins, and beachfront retreats —
                book with confidence and travel with joy.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-12"
                   style={{ animation: "slideInLeft 1s ease 0.25s both" }}>
                <button onClick={scrollDown}
                  className="group relative overflow-hidden inline-flex items-center gap-2.5
                             px-8 py-4 rounded-full bg-brand text-white font-bold text-base
                             shadow-xl shadow-brand/40 hover:shadow-2xl hover:shadow-brand/50
                             transition-all duration-300 hover:scale-[1.03]">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                                   -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Explore stays</span>
                  <ArrowRight className="w-4 h-4 relative transition-transform group-hover:translate-x-1" />
                </button>

                <Link to="/register"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full
                             bg-white/10 border border-white/20 text-white font-bold text-base
                             backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <Globe className="w-4 h-4" />
                  Become a host
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-5"
                   style={{ animation: "slideInLeft 1.1s ease 0.35s both" }}>
                {[
                  { icon: Shield, text: "Verified hosts" },
                  { icon: Clock,  text: "Instant booking" },
                  { icon: Star,   text: "Top-rated stays" },
                  { icon: MapPin, text: "40+ countries" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={text} className="flex items-center gap-2"
                       style={{ animation: `fadeInUp 0.5s ease ${0.4 + i * 0.08}s both` }}>
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15
                                    flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-white/60" />
                    </div>
                    <span className="text-white/55 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image dots */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroImg(i)}
              className={`rounded-full transition-all duration-300 ${i === heroImg ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
          ))}
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/10"
             style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)" }}>
          <div className="page-container py-4">
            <div className="flex items-center gap-8 sm:gap-14 overflow-x-auto scrollbar-hide">
              {[
                { label: "Properties",   target: total || 500, suffix: "+" },
                { label: "Countries",    target: 40,           suffix: "+" },
                { label: "Happy guests", target: 10000,        suffix: "+" },
                { label: "Avg. rating",  display: "4.9 ★" },
              ].map(({ label, target, suffix, display }) => (
                <div key={label} className="shrink-0 flex items-center gap-3">
                  <div>
                    <p className="text-white text-xl sm:text-2xl font-black leading-tight tabular-nums">
                      {display ?? <Counter target={target} suffix={suffix} />}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5 font-medium">{label}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10 last:hidden" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <button onClick={scrollDown} aria-label="Scroll down"
          className="absolute bottom-24 right-8 hidden lg:flex flex-col items-center gap-1
                     text-white/30 hover:text-white/60 transition-colors">
          <span className="text-[9px] uppercase tracking-[0.25em] font-semibold">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </button>
      </section>

      {/* ════════════════════════════════════
          CATEGORY CHIPS
      ════════════════════════════════════ */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-[112px] z-30">
        <div className="page-container">
          <div className="flex items-center gap-2.5 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat, i) => (
              <button key={cat.value} type="button" onClick={() => handleCategory(cat.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold
                            whitespace-nowrap transition-all duration-200 shrink-0 border
                            ${activeCategory === cat.value
                              ? "bg-gray-950 text-white border-gray-950 shadow-md scale-105"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:scale-105"
                            }`}
                style={{ animation: `fadeInUp 0.35s ease ${i * 25}ms both` }}
              >
                <span className="text-sm">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          LISTINGS
      ════════════════════════════════════ */}
      <div ref={gridRef} className="min-h-screen">
        <div className="page-container py-12">

          <Reveal>
            <div className="flex items-start justify-between mb-8">
              <div>
                {hasFilters ? (
                  <>
                    <p className="section-label mb-1">Search results</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      {loading ? "Searching…" : `${total} stay${total !== 1 ? "s" : ""} found`}
                    </h2>
                  </>
                ) : (
                  <>
                    <p className="section-label mb-1">Handpicked for you</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Explore all stays
                      {total > 0 && <span className="ml-2 text-base font-semibold text-gray-400">{total}+ properties</span>}
                    </h2>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button onClick={() => setSearchParams({})} className="btn btn-ghost btn-sm text-brand hover:bg-brand-50">
                    Clear filters
                  </button>
                )}
                {totalPages > 1 && <span className="text-sm text-gray-400 hidden sm:block">Page {page} of {totalPages}</span>}
              </div>
            </div>
          </Reveal>

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3" style={{ animation: `fadeInUp 0.4s ease ${i * 50}ms both` }}>
                  <div className="skeleton rounded-3xl aspect-[4/3]" />
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && <div className="alert-error max-w-sm mx-auto text-center">{error}</div>}

          {!loading && !error && (
            <>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing, i) => (
                    <Reveal key={listing._id} delay={i * 55}>
                      <ListingCard listing={listing} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5 text-3xl">🏕️</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No stays found</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs">Try broadening your search or clearing filters.</p>
                  <button onClick={() => setSearchParams({})} className="btn btn-primary btn-md">Clear all filters</button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button type="button" className="btn btn-outline btn-md" disabled={page === 1}
                    onClick={() => { fetchListings(urlFilters, page - 1); window.scrollTo({ top: gridRef.current?.offsetTop - 120, behavior: "smooth" }); }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                    <button key={p} type="button" onClick={() => fetchListings(urlFilters, p)}
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${p === page ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  ))}
                  <button type="button" className="btn btn-primary btn-md" disabled={page === totalPages}
                    onClick={() => { fetchListings(urlFilters, page + 1); window.scrollTo({ top: gridRef.current?.offsetTop - 120, behavior: "smooth" }); }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════
          WHY WONDERLUST
      ════════════════════════════════════ */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="page-container">
          <Reveal className="text-center mb-14">
            <p className="section-label mb-2">Why Wonderlust</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Travel differently</h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto text-base">
              We curate only the best stays so every trip feels like home.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CARDS.map(({ emoji, title, desc, color }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className={`group relative overflow-hidden rounded-3xl p-7 border border-gray-100
                                bg-gradient-to-br ${color} hover:border-gray-200
                                hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-default`}>
                  <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 inline-block">
                    {emoji}
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  <div className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-3xl opacity-5
                                  bg-gradient-to-tl from-gray-900 to-transparent" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOST CTA — cinematic
      ════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-gray-950">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-gray-950/70" />
        {/* Glowing orb */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
             style={{ background: "radial-gradient(circle, #f43f5e 0%, transparent 70%)" }} />

        <div className="page-container relative z-10">
          <div className="max-w-2xl">
            <Reveal from="left">
              <p className="section-label text-brand/70 mb-3">Own a property?</p>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
                Start earning as a<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
                  host today
                </span>
              </h2>
              <p className="text-gray-400 mb-9 text-lg max-w-md">
                List your space in minutes and join thousands of hosts earning on Wonderlust.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register"
                  className="group relative overflow-hidden inline-flex items-center gap-2.5
                             px-8 py-4 rounded-full bg-brand text-white font-bold text-base
                             shadow-xl shadow-brand/30 hover:shadow-brand/50 transition-all hover:scale-[1.03]">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                                   -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative">Get started — it's free</span>
                  <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full
                                   border border-white/15 text-white/70 font-semibold text-base
                                   hover:bg-white/5 hover:text-white transition-all">
                  <Play className="w-4 h-4 fill-current" />
                  Watch how it works
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
