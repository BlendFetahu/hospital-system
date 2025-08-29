// client/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, getRole } from "../auth";

const norm = (r) => String(r || "").replace(/^ROLE_/i, "").toUpperCase();

export default function ProtectedRoute({ allowed = [] }) {
  const location = useLocation();

  let token = null;
  let role = null;

  try {
    token = getToken();          // mund të kthejë null
    role  = norm(getRole());     // norm-on edhe null pa problem
  } catch (e) {
    console.error("ProtectedRoute auth error:", e);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const allowedNorm = allowed.map(norm);
  if (allowedNorm.length > 0 && !allowedNorm.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

