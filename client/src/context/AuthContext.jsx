import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Bootstrap: verify token on mount ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    api.get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Helpers ── */
  const _persist = (data) => {
    localStorage.setItem("token", data.accessToken);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    _persist(res.data);
    return res.data;
  };

  const register = async (username, email, password, role = "customer") => {
    const res = await api.post("/auth/register", { username, email, password, role });
    _persist(res.data);
    // Re-fetch /auth/me to guarantee user state is fully hydrated before any redirect
    const me = await api.get("/auth/me");
    setUser(me.data.user);
    return res.data;
  };

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch (_) { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  const adminLogin = async (email, password) => {
    // Step 1 — verify credentials and trigger OTP (no tokens returned yet)
    const res = await api.post("/auth/admin/login", { email, password });
    return res.data; // { message, email }
  };

  const verifyAdminOtp = async (email, otp) => {
    // Step 2 — verify OTP and receive tokens
    const res = await api.post("/auth/admin/verify-otp", { email, otp });
    _persist(res.data);
    return res.data;
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");
    const res = await api.post("/auth/refresh", { refreshToken });
    localStorage.setItem("token", res.data.accessToken);
    return res.data.accessToken;
  };

  const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (email, otp, password) => {
    const res = await api.post("/auth/reset-password", { email, otp, password });
    return res.data;
  };

  /* ── Role helpers ── */
  const isAdmin    = user?.role === "admin";
  const isHost     = user?.role === "host" || user?.role === "admin";
  const isCustomer = user?.role === "customer";

  // Used by OAuthCallback to hydrate user after token-based redirect
  const setUserFromTokens = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, adminLogin, verifyAdminOtp, register, logout,
      refreshAccessToken, forgotPassword, resetPassword,
      isAdmin, isHost, isCustomer,
      setUserFromTokens,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
