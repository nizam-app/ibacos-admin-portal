// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  // token / user না থাকলে -> login এ ফেলে দাও
  if (!token || !rawUser) {
    return <Navigate to="/" replace />;
  }

  let user = null;
  try {
    user = JSON.parse(rawUser);
  } catch (e) {
    console.error("Invalid user JSON in localStorage", e);
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  // যদি allowedRoles দেয়া থাকে, সেটা check করবো
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // role mismatch হলে তার নিজের dashboard এ নেয়া
      if (user.role === "CALL_CENTER") {
        return <Navigate to="/call-center/dashboard" replace />;
      }
      if (user.role === "DISPATCHER") {
        return <Navigate to="/dispatcher/overview" replace />;
      }
      if (user.role === "ADMIN") {
        return <Navigate to="/admin/overview" replace />;
      }

      // fallback
      return <Navigate to="/" replace />;
    }
  }

  // সব ঠিক থাকলে আসল children render করো
  return <>{children}</>;
};

export default ProtectedRoute;
