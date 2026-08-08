import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Props:
 *  - roles: string | string[]  — if provided, only those roles can access
 *  - redirectTo: string        — where to send unauthenticated users (default /login)
 */
export default function ProtectedRoute({ children, roles, redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  /* Not logged in */
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  /* Logged in but wrong role */
  if (roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    if (!allowed.includes(user.role)) {
      // Admin can go everywhere
      if (user.role === "admin") return children;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
