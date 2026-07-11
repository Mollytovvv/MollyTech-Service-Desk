import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import logo from "../../assets/mollytech_logo.jpg";

import {
  FiHome,
  FiFileText,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

import "../styles/UserDashboardLayout.css";

const UserDashboardLayout = () => {

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ================= PAGE HEADER =================

  const pageInfo = {
    "/user/dashboard": {
      title: "Dashboard",
      description: "Welcome back, manage your support requests efficiently",
    },

    "/user/tickets": {
      title: "My Tickets",
      description: "Track and manage all of your support requests.",
    },

    "/user/messages": {
      title: "Messages",
      description: "Communicate directly with the IT support team.",
    },

    "/user/profile": {
      title: "Profile",
      description: "Manage your personal information.",
    },

    "/user/settings": {
      title: "Settings",
      description: "Customize your account preferences.",
    },
  };

  const currentPage = pageInfo[location.pathname] || {
    title: "User Portal",
    description: "Welcome to MollyTech Service Desk.",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="user-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div>

          {/* BRAND */}

          <div className="brand">

            <div className="brand-logo">
              <img
                src={logo}
                alt="MollyTech Logo"
              />
            </div>

            <div className="brand-text">
              <h2>MollyTech</h2>
              <p>Service Desk System</p>
            </div>

          </div>

          {/* NAVIGATION */}

          <nav className="nav">

            <p className="nav-title">
              OVERVIEW
            </p>

            <NavLink
              to="/user/dashboard"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <FiHome className="icon" />
              Dashboard
            </NavLink>

            <p className="nav-title">
              SUPPORT
            </p>

            <NavLink
              to="/user/tickets"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <FiFileText className="icon" />
              My Tickets
            </NavLink>

            <NavLink
              to="/user/messages"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <FiMessageSquare className="icon" />
              Messages
            </NavLink>

            <p className="nav-title">
              ACCOUNT
            </p>

            <NavLink
              to="/user/profile"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <FiUser className="icon" />
              Profile
            </NavLink>

            <NavLink
              to="/user/settings"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              <FiSettings className="icon" />
              Settings
            </NavLink>

          </nav>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="bottom">

          <button
            className="logout"
            onClick={handleLogout}
          >
            <FiLogOut className="icon" />
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        <header className="topbar">

          <div className="page-info">

            <div className="title-wrap">

              <h1 className="page-title-text">
                {currentPage.title}
              </h1>

              <div className="page-meta-text">
                {currentPage.description}
              </div>

            </div>

            <div className="status-pill">
              <span className="dot-online"></span>
              User Portal Online
            </div>

          </div>

        </header>

        <section className="content">
          <Outlet />
        </section>

      </main>

    </div>
  );
};

export default UserDashboardLayout;