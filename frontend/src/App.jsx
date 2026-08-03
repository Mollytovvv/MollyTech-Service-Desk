import { Routes, Route } from "react-router-dom";

import Login from "./auth/Login";

import ResetPassword from "./auth/ResetPassword";

// ===========================
// ADMIN / STAFF PAGES
// ===========================

import Dashboard from "./admin/pages/Dashboard";
import TicketCenter from "./admin/pages/TicketCenter";
import Records from "./admin/pages/Records";
import Messages from "./admin/pages/Messages";
import Settings from "./admin/pages/Settings";
import AccessRequests from "./admin/pages/AccessRequests";
import Announcements from "./admin/pages/Announcements";

// ===========================
// USER PAGES
// ===========================

import UserDashboard from "./user/pages/UserDashboard";
import UserTicketCenter from "./user/pages/UserTicketCenter";
import UserArchives from "./user/pages/UserArchives";
import UserMessages from "./user/pages/UserMessages";
import UserSettings from "./user/pages/UserSettings";

// ===========================
// LAYOUTS
// ===========================

import DashboardLayout from "./admin/layouts/DashboardLayout";
import UserDashboardLayout from "./user/layouts/UserDashboardLayout";

// ===========================
// SECURITY
// ===========================

import ProtectedRoute from "./components/ProtectedRoute";

// ===========================
// CONTEXT
// ===========================

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ===========================
            PUBLIC ROUTES
        ============================ */}

        <Route
            path="/"
            element={<Login />}
        />

        <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
        />

        {/* ===========================
            STAFF ROUTES

            ADMIN
            TECHNICIAN
            SUPPORT
        ============================ */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "technician",
                "support",
              ]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/ticket-center"
            element={<TicketCenter />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />

          <Route
            path="/records"
            element={<Records />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        {/* ===========================
            ADMIN ONLY ROUTES
        ============================ */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
              ]}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/announcements"
            element={<Announcements />}
          />

          <Route
            path="/access-requests"
            element={<AccessRequests />}
          />
        </Route>

        {/* ===========================
            USER ROUTES

            NORMAL USERS ONLY
        ============================ */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
              ]}
            >
              <UserDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/user/tickets"
            element={<UserTicketCenter />}
          />

          <Route
            path="/user/archives"
            element={<UserArchives />}
          />

          <Route
            path="/user/messages"
            element={<UserMessages />}
          />

          <Route
            path="/user/settings"
            element={<UserSettings />}
          />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;