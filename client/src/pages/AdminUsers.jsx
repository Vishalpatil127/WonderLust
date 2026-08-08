import { useCallback, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Users, Search, Shield, ChevronLeft, ChevronRight,
  Trash2, RefreshCw, UserCheck,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ROLES = ["customer", "host", "admin"];

const ROLE_STYLES = {
  admin:    "bg-red-50   text-red-600   border-red-200",
  host:     "bg-amber-50 text-amber-700 border-amber-200",
  customer: "bg-brand-50 text-brand     border-brand/20",
};

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${ROLE_STYLES[role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {role}
    </span>
  );
}

function UserRow({ user, currentUserId, onRoleChange, onDelete }) {
  const [changing, setChanging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isSelf = String(user._id) === String(currentUserId);

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    if (newRole === user.role) return;
    setChanging(true);
    try {
      await onRoleChange(user._id, newRole);
    } finally {
      setChanging(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await onDelete(user._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Avatar + name */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-brand uppercase">{user.username?.[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.username}
              {isSelf && <span className="ml-1.5 text-xs text-gray-400 font-normal">(you)</span>}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Joined */}
      <td className="px-4 py-3.5 text-sm text-gray-500 hidden sm:table-cell">
        {new Date(user.createdAt).toLocaleDateString("en-IN", {
          year: "numeric", month: "short", day: "numeric",
        })}
      </td>

      {/* Role */}
      <td className="px-4 py-3.5">
        {isSelf ? (
          <RoleBadge role={user.role} />
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={user.role}
              onChange={handleRoleChange}
              disabled={changing}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700
                         outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            {changing && <span className="spinner w-3.5 h-3.5" />}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 text-right">
        {!isSelf && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:bg-red-50
                       px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100
                       transition-all disabled:opacity-50"
          >
            {deleting
              ? <span className="spinner w-3.5 h-3.5" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
            <span className="hidden sm:inline">{deleting ? "Deleting…" : "Delete"}</span>
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const { user: currentUser, loading: authLoading } = useAuth();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const fetchUsers = useCallback(async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:  opts.page       ?? page,
        limit: 15,
        search: opts.search    ?? search,
        role:  opts.roleFilter ?? roleFilter,
      };
      const res = await api.get("/auth/admin/users", { params });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.page || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    if (currentUser?.role === "admin") fetchUsers();
  }, [currentUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers({ page: 1, search, roleFilter });
  };

  const handleRoleFilterChange = (e) => {
    const val = e.target.value;
    setRoleFilter(val);
    setPage(1);
    fetchUsers({ page: 1, search, roleFilter: val });
  };

  const handleRoleChange = async (userId, newRole) => {
    await api.patch(`/auth/admin/users/${userId}/role`, { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (String(u._id) === String(userId) ? { ...u, role: newRole } : u))
    );
  };

  const handleDelete = async (userId) => {
    await api.delete(`/auth/admin/users/${userId}`);
    setUsers((prev) => prev.filter((u) => String(u._id) !== String(userId)));
    setTotal((t) => t - 1);
  };

  const goToPage = (p) => {
    setPage(p);
    fetchUsers({ page: p, search, roleFilter });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="page-container py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link to="/admin" className="btn btn-ghost btn-sm gap-1.5 text-gray-500">
                <ChevronLeft className="w-4 h-4" /> Dashboard
              </Link>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-gray-900 leading-tight">Manage Users</h1>
                  {!loading && (
                    <p className="text-xs text-gray-400">{total} user{total !== 1 ? "s" : ""} total</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => fetchUsers({ page, search, roleFilter })}
              className="btn btn-outline btn-sm gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-6 space-y-5">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-48">
              <label className="input-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Username or email…"
                  className="input pl-9"
                />
              </div>
            </div>

            {/* Role filter */}
            <div className="w-36">
              <label className="input-label">Role</label>
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="input"
              >
                <option value="">All roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-md gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </form>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] hidden sm:table-cell">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em]">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-[0.15em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3.5" colSpan={4}>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    currentUserId={currentUser._id || currentUser.id}
                    onRoleChange={handleRoleChange}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserCheck className="w-10 h-10 text-gray-200" />
                      <p className="text-sm text-gray-400 font-medium">No users found</p>
                      {(search || roleFilter) && (
                        <button
                          type="button"
                          onClick={() => { setSearch(""); setRoleFilter(""); fetchUsers({ page: 1, search: "", roleFilter: "" }); }}
                          className="text-xs text-brand hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} · {total} users
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-ghost btn-sm p-1.5"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      p === page
                        ? "bg-gray-900 text-white"
                        : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-ghost btn-sm p-1.5"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
