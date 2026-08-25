import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Globe, Heart, MapPin, Play, Shield, Sparkles, Star, Zap } from "lucide-react";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";

/* ── Constants ───────────────────────────────────────────────────────────── */
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

const WORDS  = ["escape", "adventure", "retreat", "journey", "getaway"];
const IMAGES = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=90",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=90",
];

/* ── Typewriter ──────────────────────────────────────────────────────────── */
function Typewriter() {
  const [wi, setWi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = WORDS[wi];
    const ms = del ? 55 : ci === w.length ? 2200 : 90;
    const t = setTimeout(() => {
      if (!del && ci < w.length) setCi(c => c + 1);
      else if (!del) setDel(true);
      else if (del && ci > 0) setCi(c => c - 1);
      else { setDel(false); setWi(i => (i + 1) % WORDS.length); }
    }, ms);
    return () => clearTimeout(t);
  }, [ci, del, wi]);
  return (
    <span className="relative">
      <span className="text-transparent bg-clip-text"
        style={{ backgroundImage: "linear-gradient(135deg,#f43f5e,#fb923c,#fbbf24)" }}>
        {WORDS[wi].slice(0, ci)}
      </span>
      <span className="inline-block w-[3px] h-[0.75em] bg-rose-400 ml-0.5 align-middle rounded-full"
        style={{ animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

/* ── Counter ─────────────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 1600, 1);
          setV(Math.floor((1 - (1 - p) ** 3) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}{suffix}</span>;
}

/* ── Scroll Reveal ───────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, y = 28, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); ob.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : `translateY(${y}px)`,
      transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
    }}>{children}</div>
  );
}

/* ── Floating Pill (desktop only) ───────────────────────────────────────── */
function Pill({ icon, label, value, color, delay = "0s" }) {
  return (
    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl
                    px-4 py-3 shadow-2xl border border-white/50"
      style={{ animation: `floatY 4s ease-in-out ${delay} infinite` }}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="leading-tight">
        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-extrabold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/* ── Mobile stat badge ───────────────────────────────────────────────────── */
function MobileStat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-white text-lg font-black tabular-nums leading-tight">{value}</p>
      <p className="text-white/40 text-[10px] font-medium mt-0.5">{label}</p>
    </div>
  );
}

/* ── Home ────────────────────────────────────────────────────────────────── */
export default function Home() {
  const [sp, setSp]               = useSearchParams();
  const gridRef                   = useRef(null);
  const [scrollY, setScrollY]     = useState(0);
  const [imgIdx, setImgIdx]       = useState(0);
  const [listings, setListings]   = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [cat, setCat]             = useState("");

  const filters = {
    search: sp.get("search") || "", location: sp.get("location") || "",
    country: sp.get("country") || "", minPrice: sp.get("minPrice") || "",
    maxPrice: sp.get("maxPrice") || "", sort: sp.get("sort") || "newest",
  };

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % IMAGES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const fetch = useCallback(async (f = {}, pg = 1) => {
    setLoading(true); setError("");
    try {
      const p = {
        page: pg, limit: 12,
        ...(f.search   && { search:   f.search }),
        ...(f.location && { location: f.location }),
        ...(f.country  && { country:  f.country }),
        ...(f.minPrice && { minPrice: f.minPrice }),
        ...(f.maxPrice && { maxPrice: f.maxPrice }),
        ...(f.sort     && { sort:     f.sort }),
      };
      const r = await api.get("/listings", { params: p });
      setListings(r.data.listings || []);
      setPage(r.data.page || pg);
      setTotalPages(r.data.totalPages || 1);
      setTotal(r.data.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(filters, 1); setCat(""); }, [sp.toString()]);

  const goTo = (c) => {
    setCat(c);
    const p = new URLSearchParams(sp);
    if (c) p.set("search", c); else p.delete("search");
    setSp(p);
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const scrollDown = () => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const hasF = filters.search || filters.location || filters.country || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen">

      {/* ════════════ HERO ════════════ */}
      <section className="relative overflow-hidden" style={{ height: "100vh", marginTop: "-80px" }}>

        {/* Carousel images */}
        {IMAGES.map((src, i) => (
          <img key={src} src={src} alt="" loading={i === 0 ? "eager" : "lazy"}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms]"
            style={{
              opacity: i === imgIdx ? 1 : 0,
              transform: `translateY(${scrollY * 0.22}px) scale(1.08)`,
              objectPosition: "center 55%",
            }} />
        ))}

        {/* ── Gradient system ── */}
        {/* Mobile: stronger overall cover so text is always readable on any image */}
        <div className="absolute inset-0 md:hidden" style={{
          background: "linear-gradient(to bottom,rgba(0,0,0,.65) 0%,rgba(0,0,0,.55) 50%,rgba(0,0,0,.70) 100%)" }} />
        {/* Desktop: directional gradients to keep right side open */}
        <div className="absolute inset-0 hidden md:block" style={{
          background: "linear-gradient(105deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.42) 45%,rgba(0,0,0,.10) 100%)" }} />
        <div className="absolute inset-0 hidden md:block" style={{
          background: "linear-gradient(to top,rgba(0,0,0,.45) 0%,rgba(0,0,0,.15) 35%,transparent 60%)" }} />
        {/* Top band for navbar contrast — both breakpoints */}
        <div className="absolute inset-x-0 top-0 h-32" style={{
          background: "linear-gradient(to bottom,rgba(0,0,0,.50) 0%,transparent 100%)" }} />

        {/* Shimmer line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,#f43f5e 30%,#fb923c 60%,transparent)",
                   animation: "shimmer 3s linear infinite", backgroundSize: "200% 100%" }} />

        {/* Orbs — desktop only to avoid clutter on mobile */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(244,63,94,.15),transparent 70%)",
                   animation: "orbFloat 8s ease-in-out infinite" }} />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(251,146,60,.12),transparent 70%)",
                   animation: "orbFloat 10s ease-in-out 2s infinite reverse" }} />

        {/* ── Hero content ── */}
        <div className="absolute inset-0 flex items-center pt-20 md:pt-28">
          <div className="page-container w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left — copy */}
              <div className="text-center lg:text-left">

                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2
                                rounded-full mb-5 sm:mb-7 border border-white/20 bg-white/10 backdrop-blur-md"
                  style={{ animation: "fadeInUp .7s ease both" }}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-bold text-white/85 uppercase tracking-[.12em]">
                    {total > 0 ? `${total}+ curated stays worldwide` : "Curated stays worldwide"}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-white font-black leading-[1.06] mb-5 sm:mb-6"
                  style={{ fontSize: "clamp(2.2rem,7vw,5.2rem)", animation: "fadeInUp .8s ease .06s both" }}>
                  Find your perfect{" "}<Typewriter />
                </h1>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 mb-8 sm:mb-10"
                  style={{ animation: "fadeInUp 1s ease .22s both" }}>
                  <button onClick={scrollDown}
                    className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5
                               w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-full font-bold text-base text-white
                               shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[.98]"
                    style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)" }}>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20
                                     to-transparent -translate-x-full group-hover:translate-x-full
                                     transition-transform duration-700" />
                    <span className="relative">Explore stays</span>
                    <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link to="/register"
                    className="inline-flex items-center justify-center gap-2
                               w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-full font-bold text-base
                               text-white border border-white/25 bg-white/10 backdrop-blur-sm
                               hover:bg-white/18 hover:border-white/40 transition-all duration-300 active:scale-[.98]">
                    <Globe className="w-4 h-4 shrink-0" />
                    Become a host
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4"
                  style={{ animation: "fadeInUp 1.1s ease .3s both" }}>
                  {[
                    { icon: Shield, t: "Verified hosts" },
                    { icon: Star,   t: "Top-rated stays" },
                    { icon: MapPin, t: "40+ countries" },
                  ].map(({ icon: I, t }) => (
                    <div key={t} className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 border border-white/15
                                      flex items-center justify-center shrink-0">
                        <I className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/55" />
                      </div>
                      <span className="text-white/55 text-xs sm:text-sm font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — floating pills (lg+ only) */}
              <div className="hidden lg:flex flex-col gap-3 items-end"
                style={{ animation: "fadeInUp .9s ease .2s both" }}>
                <Pill icon={<Star className="w-4 h-4 fill-green-500 text-green-500" />}
                  label="Average rating" value="4.9 / 5.0" color="bg-green-50" delay="0s" />
                <Pill icon={<Zap className="w-4 h-4 fill-amber-400 text-amber-400" />}
                  label="Instant book" value="Available now" color="bg-amber-50" delay="1.2s" />
                <Pill icon={<Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
                  label="New listing" value="Bali Villa ✨" color="bg-rose-50" delay="2.4s" />
                <Pill icon={<MapPin className="w-4 h-4 text-blue-500" />}
                  label="Top destination" value="Santorini, Greece" color="bg-blue-50" delay="0.6s" />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="absolute bottom-20 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {IMAGES.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === imgIdx ? "w-7 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/35"}`} />
          ))}
        </div>

        {/* Stats strip */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/8"
          style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(20px)" }}>
          <div className="page-container py-3 sm:py-4">
            {/* Mobile: 2×2 grid so stats don't crunch horizontally */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <MobileStat value={`${total || 500}+`} label="Properties" />
              <MobileStat value="40+" label="Countries" />
              <MobileStat value="10k+" label="Happy guests" />
              <MobileStat value="4.9 ★" label="Avg. rating" />
            </div>
            {/* Tablet + desktop: single row */}
            <div className="hidden sm:flex items-stretch gap-0 overflow-x-auto scrollbar-hide divide-x divide-white/10">
              {[
                { label: "Properties",   to: total || 500, suffix: "+" },
                { label: "Countries",    to: 40,           suffix: "+" },
                { label: "Happy guests", to: 10000,        suffix: "+" },
                { label: "Avg. rating",  display: "4.9 ★" },
              ].map(({ label, to, suffix, display }) => (
                <div key={label} className="px-5 lg:px-6 first:pl-0 last:pr-0 shrink-0 text-center">
                  <p className="text-white text-xl sm:text-2xl font-black tabular-nums">
                    {display ?? <Counter to={to} suffix={suffix} />}
                  </p>
                  <p className="text-white/35 text-xs font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ MARQUEE ════════════ */}
      <div className="bg-gray-950 border-y border-white/5 py-3 overflow-hidden">
        <div className="flex" style={{ animation: "marquee 25s linear infinite" }}>
          {[...Array(3)].map((_, rep) => (
            <div key={rep} className="flex items-center gap-6 sm:gap-8 shrink-0 px-6 sm:px-8">
              {["🏖️ Bali","⛰️ Santorini","🏙️ Tokyo","🌾 Tuscany",
                "💎 Maldives","🪵 Banff","🌊 Amalfi","🏜️ Marrakech",
                "🏔️ Swiss Alps","🌴 Phuket"].map((d) => (
                <span key={d} className="text-white/40 text-xs sm:text-sm font-medium whitespace-nowrap flex items-center gap-2">
                  {d}
                  <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ CATEGORIES ════════════ */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-20 md:top-28 z-30">
        <div className="page-container">
          <div className="flex gap-2 overflow-x-auto py-3 sm:py-4 scrollbar-hide items-center">
            {CATEGORIES.map((c, i) => (
              <button key={c.value} type="button" onClick={() => goTo(c.value)}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2
                            rounded-full text-xs sm:text-sm font-semibold
                            whitespace-nowrap border transition-all duration-200 shrink-0
                            ${cat === c.value
                              ? "bg-gray-950 text-white border-gray-950 shadow-md"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-700 hover:text-gray-900"
                            }`}
                style={{ animation: `fadeInUp .3s ease ${i * 20}ms both` }}>
                <span className="text-sm sm:text-base leading-none">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ LISTINGS ════════════ */}
      <div ref={gridRef} className="min-h-screen bg-gray-50" style={{ scrollMarginTop: "175px" }}>
        <div className="page-container py-6 sm:py-10">

          <Reveal className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <p className="section-label mb-1">{hasF ? "Search results" : "Handpicked for you"}</p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {loading ? "Loading…" : hasF
                  ? `${total} stay${total !== 1 ? "s" : ""} found`
                  : "Explore all stays"}
                {!hasF && total > 0 && (
                  <span className="ml-2 text-sm font-semibold text-gray-400">{total}+ properties</span>
                )}
              </h2>
            </div>
            <div className="flex gap-3 mt-1">
              {hasF && (
                <button onClick={() => setSp({})} className="btn btn-ghost btn-sm text-brand">
                  Clear filters
                </button>
              )}
              {totalPages > 1 && (
                <span className="text-sm text-gray-400 hidden sm:inline">Page {page}/{totalPages}</span>
              )}
            </div>
          </Reveal>

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3"
                  style={{ animation: `fadeInUp .4s ease ${i * 45}ms both` }}>
                  <div className="skeleton rounded-3xl aspect-[4/3]" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <p className="alert-error max-w-xs mx-auto text-center">{error}</p>
          )}

          {!loading && !error && (
            <>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {listings.map((l, i) => (
                    <Reveal key={l._id} delay={i * 50}>
                      <ListingCard listing={l} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-20 text-center px-4">
                  <div className="text-5xl mb-5">🏕️</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No stays found</h3>
                  <p className="text-sm text-gray-400 mb-6">Try clearing your filters.</p>
                  <button onClick={() => setSp({})} className="btn btn-primary btn-md">
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 sm:mt-12 flex-wrap">
                  <button className="btn btn-outline btn-sm sm:btn-md" disabled={page === 1}
                    onClick={() => { fetch(filters, page - 1); window.scrollTo({ top: (gridRef.current?.offsetTop || 0) - 100, behavior: "smooth" }); }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => fetch(filters, p)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-sm font-bold transition-all
                        ${p === page ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                      {p}
                    </button>
                  ))}
                  <button className="btn btn-primary btn-sm sm:btn-md" disabled={page === totalPages}
                    onClick={() => { fetch(filters, page + 1); window.scrollTo({ top: (gridRef.current?.offsetTop || 0) - 100, behavior: "smooth" }); }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ════════════ WHY SECTION ════════════ */}
      <section className="bg-white py-14 sm:py-20 border-t border-gray-100">
        <div className="page-container">
          <Reveal className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand
                             text-xs font-bold uppercase tracking-widest mb-3">
              Why Wonderlust
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
              Travel differently
            </h2>
            <p className="text-gray-400 mt-3 max-w-sm mx-auto text-sm sm:text-base">
              We curate only the best so every trip feels special.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              { e: "🏡", t: "Unique stays",       d: "From treehouses to villas — every property is one-of-a-kind.", g: "from-rose-500/10 to-pink-500/5",    b: "border-rose-100" },
              { e: "🔒", t: "Safe & secure",       d: "Every host is verified. Every booking is protected.",          g: "from-blue-500/10 to-cyan-500/5",    b: "border-blue-100" },
              { e: "💬", t: "24/7 support",         d: "Our team is always available whenever you need help.",         g: "from-amber-500/10 to-yellow-500/5", b: "border-amber-100" },
              { e: "💸", t: "Best price guarantee", d: "Find it cheaper? We'll match it, no questions asked.",         g: "from-green-500/10 to-emerald-500/5",b: "border-green-100" },
            ].map(({ e, t, d, g, b }, i) => (
              <Reveal key={t} delay={i * 80}>
                <div className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7
                                 border bg-gradient-to-br ${g} ${b}
                                 hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4
                                  group-hover:scale-110 group-hover:rotate-6
                                  transition-transform duration-300 inline-block">{e}</div>
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{t}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOST CTA ════════════ */}
      <section className="relative overflow-hidden py-16 sm:py-24" style={{ background: "#0a0a0a" }}>
        <img src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1920&q=80"
          alt="" className="absolute inset-0 w-full h-full object-cover opacity-[.18]" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,rgba(10,10,10,.97) 40%,rgba(10,10,10,.7))" }} />
        {/* Glow orbs — desktop only */}
        <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-1/2 w-[600px] h-[600px]
                        rounded-full opacity-[.08] pointer-events-none"
          style={{ background: "radial-gradient(circle,#f43f5e,transparent 70%)", transform: "translate(-20%,-50%)" }} />

        <div className="page-container relative z-10">
          <Reveal y={20}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-rose-500/30
                             bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-widest mb-5">
              Own a property?
            </span>
            <h2 className="font-black text-white leading-tight mb-4 sm:mb-5 max-w-xl"
              style={{ fontSize: "clamp(1.75rem,5vw,3.5rem)" }}>
              Start earning as a{" "}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg,#f43f5e,#fb923c,#fbbf24)" }}>
                host today
              </span>
            </h2>
            <p className="text-gray-400 mb-7 sm:mb-8 text-sm sm:text-base max-w-sm">
              List your space in minutes. Join thousands of hosts earning on Wonderlust.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link to="/register"
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2.5
                           w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-base
                           text-white shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[.98]"
                style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)" }}>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20
                                 to-transparent -translate-x-full group-hover:translate-x-full
                                 transition-transform duration-700" />
                <span className="relative">Get started — it's free</span>
                <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2
                                 w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold
                                 text-base text-white/65 border border-white/15
                                 hover:bg-white/5 hover:text-white/90 transition-all duration-300">
                <Play className="w-4 h-4 fill-current" />
                How it works
              </button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
