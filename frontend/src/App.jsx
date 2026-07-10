import { Routes, Route } from "react-router-dom";

import Login from "./auth/Login";

import Dashboard from "./admin/pages/Dashboard";
import TicketCenter from "./admin/pages/TicketCenter";
import Records from "./admin/pages/Records";
import Messages from "./admin/pages/Messages";

import UserDashboard from "./user/pages/UserDashboard";

import DashboardLayout from "./admin/layouts/DashboardLayout";
import UserDashboardLayout from "./user/layouts/UserDashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Login />} />

        {/* ===========================
            ADMIN ROUTES
        ============================ */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticket-center" element={<TicketCenter />} />
          <Route path="/records" element={<Records />} />
          <Route path="/messages" element={<Messages />} />
        </Route>

        {/* ===========================
            USER ROUTES
        ============================ */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />
        </Route>

      </Routes>
    </ToastProvider>
  );
}

export default App;