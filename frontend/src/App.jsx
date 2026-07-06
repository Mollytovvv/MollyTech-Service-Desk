import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TicketCenter from "./pages/TicketCenter";
import Records from "./pages/Records";
import Messages from "./pages/Messages"; // ✅ ADD THIS

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />

        {/* PROTECTED LAYOUT */}
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

          {/* ✅ NEW MESSAGES PAGE */}
          <Route path="/messages" element={<Messages />} />

        </Route>

      </Routes>
    </ToastProvider>
  );
}

export default App;