import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, MapPin, Sparkles, Star, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
import api from "../api/axios";
import ListingCard from "../components/ListingCard";

/* ─── Data ───────────────────────────────────────────────────────────────── */
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

const TRUST_BADGES = [
  { icon: Shield, text: "Verified hosts" },
  { icon: Clock,  text: "Instant booking" },
  { icon: Star,   text: "Top-rated stays" },
  { icon: MapPin, text: "Global destinations" },
];

const HERO_WORDS = ["escape", "adventure", "retreat", "journey", "getaway"];

/* ─── Floating particle ──────────────────────────────────────────────────── */
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={style}
    />
  );
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Typewriter headline ────────────────────────────────────────────────── */
function TypewriterWord({ words }) {
  const [wordIdx, setWordIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    const delay = deleting ? 60 : charIdx === word.length ? 2000 : 90;

    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWordIdx((i) => (i + 1) % words.length);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [charIdx, deleting, wordIdx, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-brand to-pink-400 relative">
      {words[wordIdx].slice(0, charIdx)}
      <span className="inline-block w-[3px] h-[0.85em] bg-brand ml-0.5 align-middle animate-blink" />
    </span>
  );
}

/* ─── Scroll-reveal wrapper ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const gridRef  = useRef(null);
  const heroRef  = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const [listings,       setListings]       = useState([]);
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const urlFilters = {
    search:   searchParams.get("search")   || "",
    location: searchParams.get("location") || "",
    country:  searchParams.get("country")  || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort:     searchParams.get("sort")     || "newest",
  };

  /* Parallax scroll */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fetchListings = useCallback(async (filters = {}, requestedPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: requestedPage, limit: 12 };
      if (filters.search)   params.search   = filters.search;
      if (filters.location) params.location = filters.location;
      if (filters.country)  params.country  = filters.country;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort)     params.sort     = filters.sort;

      const res = await api.get("/listings", { params });
      setListings(res.data.listings || []);
      setPage(res.data.page || requestedPage);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(urlFilters, 1);
    setActiveCategory("");
  }, [searchParams.toString()]);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    const p = new URLSearchParams(searchParams);
    if (cat) p.set("search", cat); else p.delete("search");
    setSearchParams(p);
  };

  const scrollToListings = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasActiveFilters =
    urlFilters.search || urlFilters.location || urlFilters.country ||
    urlFilters.minPrice || urlFilters.maxPrice;

  /* Generate particles once */
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    style: {
      width:  `${4 + Math.random() * 8}px`,
      height: `${4 + Math.random() * 8}px`,
      left:   `${Math.random() * 100}%`,
      top:    `${Math.random() * 100}%`,
      background: i % 3 === 0 ? "rgba(244,63,94,0.4)" : i % 3 === 1 ? "rgba(255,255,255,0.15)" : "rgba(251,191,36,0.3)",
      animation: `float ${4 + Math.random() * 6}s ease-in-out ${Math.random() * 4}s infinite alternate`,
    },
  }));

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ height: "100vh", marginTop: "-112px" }}
      >
        {/* Parallax background */}
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=90"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.1)` }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        {/* Floating particles */}
        {particles.map((p) => <Particle key={p.id} style={p.style} />)}

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingTop: "112px" }}>
          <div className="page-container">
            <div className="max-w-3xl">

              {/* Eyebrow — slides in from left */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-white/10 border border-white/20 backdrop-blur-sm mb-8"
                style={{ animation: "slideInLeft 0.8s ease both" }}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                  {total > 0 ? `${total.toLocaleString()}+ curated stays worldwide` : "Curated stays worldwide"}
                </span>
              </div>

              {/* Headline with typewriter */}
              <h1
                className="font-black text-white tracking-tight leading-[1.08] mb-6"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", animation: "slideInLeft 0.9s ease 0.1s both" }}
              >
                Find your next<br />
                <TypewriterWord words={HERO_WORDS} />
              </h1>

              {/* Subheading */}
              <p
                className="text-white/70 leading-relaxed mb-10 max-w-xl"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", animation: "slideInLeft 1s ease 0.2s both" }}
              >
                Unique homes, luxury villas, mountain cabins, and beachfront retreats —
                book with confidence and travel with joy.
              </p>

              {/* CTA row */}
              <div
                className="flex flex-wrap items-center gap-4 mb-12"
                style={{ animation: "slideInLeft 1.1s ease 0.3s both" }}
              >
                <button
                  onClick={scrollToListings}
                  className="group btn btn-primary shadow-2xl shadow-brand/40 px-8 py-4 text-base font-bold"
                >
                  Explore stays
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  to="/register"
                  className="btn px-8 py-4 text-base font-bold bg-white/15 text-white
                             border border-white/30 hover:bg-white/25 backdrop-blur-sm"
                >
                  Become a host
                </Link>
              </div>

              {/* Trust badges */}
              <div
                className="flex flex-wrap items-center gap-6"
                style={{ animation: "slideInLeft 1.2s ease 0.4s both" }}
              >
                {TRUST_BADGES.map(({ icon: Icon, text }, i) => (
                  <div
                    key={text}
                    className="flex items-center gap-2.5"
                    style={{ animation: `fadeInUp 0.5s ease ${0.5 + i * 0.1}s both` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20
                                    flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white/70" />
                    </div>
                    <span className="text-white/65 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar — animated counters */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/35 backdrop-blur-sm border-t border-white/10">
          <div className="page-container py-5">
            <div className="flex items-center gap-10 overflow-x-auto scrollbar-hide">
              {[
                { label: "Properties",   target: total || 500, suffix: "+" },
                { label: "Countries",    target: 40,           suffix: "+" },
                { label: "Happy guests", target: 10000,        suffix: "+" },
                { label: "Avg. rating",  target: null,         display: "4.9 ★" },
              ].map(({ label, target, suffix, display }) => (
                <div key={label} className="shrink-0 text-center">
                  <p className="text-white text-2xl font-extrabold leading-tight">
                    {display ?? <AnimatedCounter target={target} suffix={suffix} />}
                  </p>
                  <p className="text-white/45 text-xs mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <button
          onClick={scrollToListings}
          aria-label="Scroll down"
          className="absolute bottom-20 right-10 hidden lg:flex flex-col items-center gap-1.5
                     text-white/40 hover:text-white/70 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Scroll</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* ── Category chips ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-[112px] z-30 shadow-xs">
        <div className="page-container">
          <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleCategory(cat.value)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                            whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border
                            ${activeCategory === cat.value
                              ? "bg-gray-900 text-white border-gray-900 shadow-sm scale-105"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-800 hover:text-gray-900 hover:scale-105"
                            }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Listings grid ─────────────────────────────────────────────────── */}
      <div ref={gridRef} className="bg-gray-50 min-h-screen">
        <div className="page-container py-12">

          {/* Results header */}
          <Reveal>
            <div className="flex items-start justify-between mb-8">
              <div>
                {hasActiveFilters ? (
                  <>
                    <p className="section-label mb-1.5">Search results</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      {loading ? "Searching…" : `${total} stay${total !== 1 ? "s" : ""} found`}
                    </h2>
                  </>
                ) : (
                  <>
                    <p className="section-label mb-1.5">Handpicked for you</p>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      Explore all stays
                      {total > 0 && <span className="ml-3 text-base font-semibold text-gray-400">{total}+ properties</span>}
                    </h2>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {hasActiveFilters && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3" style={{ animation: `fadeInUp 0.4s ease ${i * 60}ms both` }}>
                  <div className="skeleton rounded-3xl aspect-[4/3]" />
                  <div className="skeleton h-4 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-1/2 rounded-lg" />
                  <div className="skeleton h-4 w-1/3 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {error && !loading && <div className="alert-error max-w-sm mx-auto text-center">{error}</div>}

          {!loading && !error && (
            <>
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                  {listings.map((listing, i) => (
                    <Reveal key={listing._id} delay={i * 60}>
                      <ListingCard listing={listing} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
                    <MapPin className="w-9 h-9 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No stays found</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-xs">Try broadening your search.</p>
                  <button onClick={() => setSearchParams({})} className="btn btn-primary btn-md">Clear all filters</button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-14">
                  <button
                    type="button" className="btn btn-outline btn-md" disabled={page === 1}
                    onClick={() => { fetchListings(urlFilters, page - 1); window.scrollTo({ top: gridRef.current?.offsetTop - 120, behavior: "smooth" }); }}
                  >← Previous</button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button key={p} type="button" onClick={() => fetchListings(urlFilters, p)}
                          className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${p === page ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button" className="btn btn-primary btn-md" disabled={page === totalPages}
                    onClick={() => { fetchListings(urlFilters, page + 1); window.scrollTo({ top: gridRef.current?.offsetTop - 120, behavior: "smooth" }); }}
                  >Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Why Wonderlust ────────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="page-container">
          <Reveal className="text-center mb-14">
            <p className="section-label mb-2">Why Wonderlust</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">Travel differently</h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto">
              We curate only the best stays so every trip feels like home.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: "🏡", title: "Unique stays",       desc: "From treehouses to villas — every property is one-of-a-kind." },
              { emoji: "🔒", title: "Safe & secure",      desc: "Every host is verified. Every booking is protected." },
              { emoji: "💬", title: "24/7 support",       desc: "Our team is always available whenever you need help." },
              { emoji: "💸", title: "Best price guarantee",desc: "Find a lower price? We'll match it, no questions asked." },
            ].map(({ emoji, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="group text-center p-6 rounded-3xl border border-gray-100 bg-white
                                hover:border-brand/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{emoji}</div>
                  <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promo strip ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand to-pink-500 py-20">
        {/* Animated background circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 animate-pulse" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-10 right-1/3 w-32 h-32 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="page-container text-center relative z-10">
          <Reveal>
            <p className="section-label text-white/70 mb-3">Own a property?</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Start earning as a host today
            </h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              List your space in minutes and join thousands of hosts earning on Wonderlust.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 btn btn-white btn-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get started — it's free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
