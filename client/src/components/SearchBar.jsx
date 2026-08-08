import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchBar({ onSearch, locations = [], countries = [] }) {
  const empty = { search: "", location: "", country: "", minPrice: "", maxPrice: "", sort: "newest" };
  const [filters, setFilters] = useState(empty);
  const [showFilters, setShowFilters] = useState(false);

  const set = (e) => setFilters((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onSearch(filters); };

  const handleReset = () => { setFilters(empty); onSearch(empty); };

  const hasActiveFilters =
    filters.location || filters.country || filters.minPrice || filters.maxPrice;

  return (
    <div className="w-full">
      {/* Main search row */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-card px-2 py-2 max-w-3xl mx-auto">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            name="search"
            placeholder="Search destinations, places…"
            value={filters.search}
            onChange={set}
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400 px-1"
          />

          <div className="h-6 w-px bg-gray-200 hidden sm:block" />

          <select
            name="sort"
            value={filters.sort}
            onChange={set}
            aria-label="Sort listings"
            className="hidden sm:block text-sm bg-transparent outline-none text-gray-600 cursor-pointer px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="oldest">Oldest</option>
          </select>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all ${
              hasActiveFilters
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            )}
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-sm rounded-full px-5"
          >
            Search
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="max-w-3xl mx-auto mt-3 bg-white border border-gray-200 rounded-2xl shadow-card p-4 animate-slide-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="input-label">Location</label>
                <select name="location" value={filters.location} onChange={set} className="input py-2 text-sm">
                  <option value="">All locations</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Country</label>
                <select name="country" value={filters.country} onChange={set} className="input py-2 text-sm">
                  <option value="">All countries</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Min price (₹)</label>
                <input type="number" name="minPrice" placeholder="0" value={filters.minPrice} onChange={set} className="input py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="input-label">Max price (₹)</label>
                <input type="number" name="maxPrice" placeholder="Any" value={filters.maxPrice} onChange={set} className="input py-2 text-sm" min="0" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
              <button type="submit" className="btn btn-primary btn-sm" onClick={() => setShowFilters(false)}>
                Apply filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
