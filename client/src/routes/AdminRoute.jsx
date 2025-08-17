import React from "react";
import { Navigate } from "react-router-dom";
import { getRole, isExpired } from "../auth";

export default function AdminRoute({ children }) {
  if (isExpired()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role !== "ADMIN") return <Navigate to="/login" replace />;
  return children;
}
