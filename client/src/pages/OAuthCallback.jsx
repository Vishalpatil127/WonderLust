import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Globe } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

/**
 * Landing page for Google OAuth callback.
 * The backend redirects here with ?accessToken=...&refreshToken=...
 * We persist the tokens, fetch /auth/me, set the user, then redirect.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromTokens } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const accessToken  = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const oauthError   = searchParams.get("error");

    if (oauthError || !accessToken) {
      setError("Google sign-in failed. Please try again.");
      setTimeout(() => navigate("/login", { replace: true }), 2500);
      return;
    }

    // Persist tokens
    localStorage.setItem("token", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    // Fetch user profile, then redirect based on role
    api.get("/auth/me")
      .then((res) => {
        const user = res.data.user;
        setUserFromTokens(user);
        if (user.role === "admin")      navigate("/admin",          { replace: true });
        else if (user.role === "host")  navigate("/host/dashboard", { replace: true });
        else                            navigate("/",               { replace: true });
      })
      .catch(() => {
        setError("Could not load your account. Please log in manually.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white">
      <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow">
        <Globe className="w-6 h-6 text-white" />
      </div>
      {error ? (
        <div className="text-center space-y-2">
          <p className="text-red-500 font-semibold">{error}</p>
          <p className="text-sm text-gray-400">Redirecting to login…</p>
        </div>
      ) : (
        <div className="text-center space-y-2">
          <div className="spinner w-8 h-8 mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Signing you in with Google…</p>
        </div>
      )}
    </div>
  );
}
