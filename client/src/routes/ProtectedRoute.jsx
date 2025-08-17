// client/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken, getRole } from "../auth";

export default function ProtectedRoute({ allowed }) {
  const token = getToken();
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;

  if (allowed && allowed.length > 0 && !allowed.map(r => r.toUpperCase()).includes(role)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
