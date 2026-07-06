import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, authReady } = useAuth();

  // ⛔ IMPORTANT: wait until auth is initialized
  if (!authReady) {
    return null; // or a loading spinner
  }

  // 🔐 after auth is ready, decide access
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}