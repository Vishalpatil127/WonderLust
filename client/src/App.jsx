import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from "./pages/AdminUsers";
import EditListing from "./pages/EditListing";
import ForgotPassword from "./pages/ForgotPassword";
import HostDashboard from "./pages/HostDashboard";
import Home from "./pages/Home";
import ListingDetail from "./pages/ListingDetail";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import MyReviews from "./pages/MyReviews";
import NewListing from "./pages/NewListing";
import OAuthCallback from "./pages/OAuthCallback";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";

// Pages that manage their own full-bleed layout (no shared navbar needed)
const FULL_BLEED = ["/login", "/register", "/admin/login", "/forgot-password", "/reset-password"];

function Layout({ children }) {
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no navbar */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/admin/login"  element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/google/callback" element={<OAuthCallback />} />

          {/* Main app — with navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/"                element={<Home />} />
                  <Route path="/listings/:id"    element={<ListingDetail />} />
                  <Route
                    path="/listings/new"
                    element={
                      <ProtectedRoute roles={["host", "admin"]}><NewListing /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/listings/:id/edit"
                    element={
                      <ProtectedRoute roles={["host", "admin"]}><EditListing /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/host/dashboard"
                    element={
                      <ProtectedRoute roles={["host", "admin"]}><HostDashboard /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute><MyBookings /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-reviews"
                    element={
                      <ProtectedRoute><MyReviews /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute><Wishlist /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>
                    }
                  />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
