import { Routes, Route } from "react-router-dom";

import Login from "./auth/Login";

import Dashboard from "./admin/pages/Dashboard";
import TicketCenter from "./admin/pages/TicketCenter";
import Records from "./admin/pages/Records";
import Messages from "./admin/pages/Messages";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./admin/layouts/DashboardLayout";

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />

        {/* ADMIN LAYOUT */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticket-center" element={<TicketCenter />} />
          <Route path="/records" element={<Records />} />
          <Route path="/messages" element={<Messages />} />
        </Route>

      </Routes>
    </ToastProvider>
  );
}

export default App;