import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/DashboardLayout.css";
import logo from "../assets/mollytech_logo.jpg";
import {
  FiHome,
  FiList,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMessageSquare
} from "react-icons/fi";

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/ticket-center")) return "Ticket Center";
    if (path.startsWith("/records")) return "Records";
    if (path.startsWith("/reports")) return "Reports";
    if (path.startsWith("/settings")) return "Settings";

    return "Service Desk";
  };

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">
            <img src={logo} alt="MollyTech Logo" />
          </div>

          <div className="brand-text">
            <h2>MollyTech</h2>
            <p>Service Desk System</p>
          </div>
        </div>

        <nav className="nav">

          <p className="nav-title">OVERVIEW</p>

          <button
            className={isActive("/dashboard") ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            <FiHome className="icon" />
            Dashboard
          </button>

          <p className="nav-title">TICKETS</p>

          <button
            className={isActive("/ticket-center") ? "active" : ""}
            onClick={() => navigate("/ticket-center")}
          >
            <FiList className="icon" />
            Ticket Center
          </button>

          <p className="nav-title">DATA</p>

          <button
            className={isActive("/records") ? "active" : ""}
            onClick={() => navigate("/records")}
          >
            <FiFileText className="icon" />
            Records
          </button>

          {/* 🔥 NEW SECTION */}
          <p className="nav-title">COMMUNICATION</p>

          <button
            className={isActive("/messages") ? "active" : ""}
            onClick={() => navigate("/messages")}
          >
            <FiMessageSquare className="icon" />
            Messages
          </button>

          <p className="nav-title">SYSTEM</p>

          <button
            className={isActive("/reports") ? "active" : ""}
            onClick={() => navigate("/reports")}
          >
            <FiBarChart2 className="icon" />
            Reports
          </button>

          <button
            className={isActive("/settings") ? "active" : ""}
            onClick={() => navigate("/settings")}
          >
            <FiSettings className="icon" />
            Settings
          </button>

        </nav>

        <div className="bottom">
          <button className="logout" onClick={handleLogout}>
            <FiLogOut className="icon" />
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN */}
      <main className="main">

        <header className="topbar">
          <div className="page-info">

            <div className="title-wrap">
              <h1 className="page-title-text">
                {getPageTitle()}
              </h1>

              <div className="page-meta-text">
                Welcome back, manage your system efficiently
              </div>
            </div>

            <div className="status-pill">
              <span className="dot-online"></span>
              Admin System Online
            </div>

          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}