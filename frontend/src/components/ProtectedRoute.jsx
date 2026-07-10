import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const { token, user, authReady } = useAuth();

  if (!authReady) {
    return null;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}