import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, roles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return redirectByRole(user.role);
  }

  if (roles && !roles.includes(user.role)) {
    return redirectByRole(user.role);
  }

  return children;
}

function redirectByRole(role) {
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === "staff") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  if (role === "customer") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}