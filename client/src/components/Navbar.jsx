import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Globe, Menu, X, LogOut, Search,
  LayoutDashboard, PlusCircle, BookOpen, Heart, Star, Users,
  SlidersHorizontal, MapPin, ArrowUpDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [searchParams] = useSearchParams();

  const isHomePage = location.pathname === "/";

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [locations,    setLocations]    = useState([]);
  const [countries,    setCountries]    = useState([]);

  // Transparent only on home page before scrolling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run immediately to set initial state
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]); // re-run when route changes

  // true = transparent (white text), false = solid white (dark text)
  const isGlass = isHomePage && !scrolled;

  useEffect(() => {
    api.get("/listings", { params: { limit: 200 } })
      .then((res) => {
        const all = res.data.listings || [];
        setLocations([...new Set(all.map((l) => l.location).filter(Boolean))].sort());
        setCountries([...new Set(all.map((l) => l.country).filter(Boolean))].sort());
      })
      .catch(() => {});
  }, []);

  const [query,    setQuery]    = useState(searchParams.get("search")   || "");
  const [locFilter,setLocFilter]= useState(searchParams.get("location") || "");
  const [country,  setCountry]  = useState(searchParams.get("country")  || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort,     setSort]     = useState(searchParams.get("sort")     || "newest");

  const filterRef = useRef(null);
  const isHost  = user?.role === "host"  || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  const closeAll = () => { setMenuOpen(false); setUserMenuOpen(false); setFilterOpen(false); };

  const handleLogout = async () => {
    closeAll();
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilters = locFilter || country || minPrice || maxPrice;

  const buildParams = (overrides = {}) => {
    const p = new URLSearchParams();
    const q   = overrides.query    ?? query;
    const loc = overrides.location ?? locFilter;
    const cnt = overrides.country  ?? country;
    const min = overrides.minPrice ?? minPrice;
    const max = overrides.maxPrice ?? maxPrice;
    const srt = overrides.sort     ?? sort;
    if (q)   p.set("search",   q);
    if (loc) p.set("location", loc);
    if (cnt) p.set("country",  cnt);
    if (min) p.set("minPrice", min);
    if (max) p.set("maxPrice", max);
    if (srt) p.set("sort",     srt);
    return p.toString();
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setFilterOpen(false);
    navigate(`/?${buildParams()}`);
  };

  const handleReset = () => {
    setQuery(""); setLocFilter(""); setCountry("");
    setMinPrice(""); setMaxPrice(""); setSort("newest");
    navigate("/");
  };

  const roleBadge = {
    admin:    "bg-red-100 text-red-600",
    host:     "bg-amber-100 text-amber-700",
    customer: "bg-brand-50 text-brand",
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isGlass
        ? "bg-gradient-to-b from-black/40 to-transparent border-b border-transparent"
        : "bg-white border-b border-gray-200 shadow-sm"
    }`}>
      <div className="page-container">
        <div className="flex items-center gap-3 h-20 md:h-28">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-6">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className={`hidden sm:block text-xl font-extrabold tracking-tight transition-colors ${
              isGlass ? "text-white" : "text-gray-900"
            }`}>
              Wonder<span className="text-brand">lust</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 relative" ref={filterRef}>
            <form onSubmit={handleSearch}>
              <div className={`flex items-center gap-1 border rounded-full shadow-sm px-4 py-3 transition-all ${
                isGlass
                  ? filterOpen
                    ? "bg-white/95 border-white shadow-card"
                    : "bg-white/20 border-white/40 hover:bg-white/30 backdrop-blur-sm"
                  : filterOpen
                    ? "bg-white border-gray-400 shadow-card"
                    : "bg-white border-gray-300 hover:border-gray-400"
              }`}>
                <Search className={`w-4 h-4 shrink-0 ${isGlass && !filterOpen ? "text-white/70" : "text-gray-400"}`} />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search destinations, places…"
                  onFocus={() => setFilterOpen(true)}
                  className={`flex-1 text-sm bg-transparent outline-none min-w-0 px-1 ${
                    isGlass && !filterOpen
                      ? "text-white placeholder:text-white/60"
                      : "text-gray-900 placeholder:text-gray-400"
                  }`}
                />

                {/* Sort */}
                <div className={`hidden md:flex items-center gap-1 border-l pl-2 ml-1 ${
                  isGlass && !filterOpen ? "border-white/30" : "border-gray-200"
                }`}>
                  <ArrowUpDown className={`w-3.5 h-3.5 shrink-0 ${isGlass && !filterOpen ? "text-white/60" : "text-gray-400"}`} />
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); navigate(`/?${buildParams({ sort: e.target.value })}`); }}
                    className={`text-xs bg-transparent outline-none cursor-pointer ${
                      isGlass && !filterOpen ? "text-white/80" : "text-gray-600"
                    }`}
                    aria-label="Sort"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>

                {/* Filters */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex items-center gap-1 ml-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    hasActiveFilters
                      ? "bg-brand text-white"
                      : isGlass && !filterOpen
                        ? "bg-white/20 text-white hover:bg-white/30"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>

                <button type="submit"
                  className="ml-1 bg-brand text-white rounded-full px-4 py-1.5 text-xs font-bold hover:bg-brand-dark transition-colors shrink-0">
                  Search
                </button>
              </div>

              {/* Filter dropdown */}
              {filterOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-modal p-4 animate-slide-up">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="input-label flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                      <select value={locFilter} onChange={(e) => setLocFilter(e.target.value)} className="input py-2 text-sm">
                        <option value="">All locations</option>
                        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Country</label>
                      <select value={country} onChange={(e) => setCountry(e.target.value)} className="input py-2 text-sm">
                        <option value="">All countries</option>
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Min price (₹)</label>
                      <input type="number" placeholder="0" value={minPrice} min="0" onChange={(e) => setMinPrice(e.target.value)} className="input py-2 text-sm" />
                    </div>
                    <div>
                      <label className="input-label">Max price (₹)</label>
                      <input type="number" placeholder="Any" value={maxPrice} min="0" onChange={(e) => setMaxPrice(e.target.value)} className="input py-2 text-sm" />
                    </div>
                  </div>
                  <div className="mt-3 sm:hidden">
                    <label className="input-label flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Sort by</label>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="input py-2 text-sm">
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price ↑</option>
                      <option value="price_desc">Price ↓</option>
                      <option value="oldest">Oldest</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <button type="button" onClick={handleReset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                      <X className="w-3.5 h-3.5" /> Clear all
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">Apply filters</button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0 ml-6">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full border transition-all ${
                    isGlass
                      ? "border-white/40 hover:bg-white/20 bg-white/10 backdrop-blur-sm"
                      : "border-gray-200 hover:shadow-card bg-white"
                  }`}
                >
                  <Menu className={`w-4 h-4 ${isGlass ? "text-white" : "text-gray-600"}`} />
                  <div className="w-7 h-7 rounded-full bg-brand border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-extrabold text-white uppercase">{user.username?.[0]}</span>
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-11 z-20 w-60 bg-white rounded-2xl border border-gray-100 shadow-modal overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleBadge[user.role] || "bg-gray-100 text-gray-600"}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1.5">
                        {isHost && (
                          <Link to="/listings/new" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <PlusCircle className="w-4 h-4 text-gray-400" /> Add listing
                          </Link>
                        )}
                        {isHost && !isAdmin && (
                          <Link to="/host/dashboard" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <LayoutDashboard className="w-4 h-4 text-gray-400" /> Host dashboard
                          </Link>
                        )}
                        {isAdmin && (
                          <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <LayoutDashboard className="w-4 h-4 text-gray-400" /> Admin dashboard
                          </Link>
                        )}
                        {isAdmin && (
                          <Link to="/admin/users" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Users className="w-4 h-4 text-gray-400" /> Manage users
                          </Link>
                        )}
                        {user.role === "customer" && (
                          <>
                            <Link to="/my-bookings" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <BookOpen className="w-4 h-4 text-gray-400" /> My bookings
                            </Link>
                            <Link to="/my-reviews" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <Star className="w-4 h-4 text-gray-400" /> My reviews
                            </Link>
                            <Link to="/wishlist" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                              <Heart className="w-4 h-4 text-gray-400" /> Wishlist
                            </Link>
                          </>
                        )}
                        <hr className="my-1.5 border-gray-100" />
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className={`btn btn-sm rounded-full font-semibold transition-all ${
                isGlass
                  ? "bg-white/20 text-white border border-white/40 hover:bg-white/30 backdrop-blur-sm"
                  : "btn-outline"
              }`}>
                Log in
              </Link>
            )}

            <button
              className={`md:hidden p-2 rounded-xl transition-colors ${isGlass ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <X className={`w-5 h-5 ${isGlass ? "text-white" : "text-gray-700"}`} />
                : <Menu className={`w-5 h-5 ${isGlass ? "text-white" : "text-gray-700"}`} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-slide-up bg-white rounded-b-2xl">
            <nav className="flex flex-col gap-1 px-2">
              <NavLink to="/" end onClick={closeAll}
                className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                Explore
              </NavLink>
              {user ? (
                <>
                  {isHost && (
                    <NavLink to="/listings/new" onClick={closeAll}
                      className={({ isActive }) => `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                      Add Listing
                    </NavLink>
                  )}
                  {isHost && !isAdmin && (
                    <NavLink to="/host/dashboard" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                      Host Dashboard
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink to="/admin" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                      Admin Dashboard
                    </NavLink>
                  )}
                  {user.role === "customer" && (
                    <>
                      <NavLink to="/my-bookings" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Bookings</NavLink>
                      <NavLink to="/my-reviews" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">My Reviews</NavLink>
                      <NavLink to="/wishlist" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Wishlist</NavLink>
                    </>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left w-full">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeAll} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Log in</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
