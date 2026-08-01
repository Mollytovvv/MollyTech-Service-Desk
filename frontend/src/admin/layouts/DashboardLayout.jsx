import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket/socket";
import "../styles/DashboardLayout.css";
import NotificationBell from "../../components/notifications/NotificationBell";
import logo from "../../assets/mollytech_logo.jpg";

import {
  FiHome,
  FiList,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiUserCheck,
  FiBell
} from "react-icons/fi";

export default function DashboardLayout() {

  const { logout, token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [ticketCount, setTicketCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [accessRequestCount, setAccessRequestCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // ===============================
  // 🔔 SIDEBAR COUNTS
  // ===============================
  const fetchSidebarCounts = async () => {

    try {

      const res = await api.get(
        "/dashboard/sidebar-counts",
        {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );


      setTicketCount(
        res.data.ticketCount || 0
      );


      setMessageCount(
        res.data.messageCount || 0
      );

      setAccessRequestCount(
        res.data.accessRequestCount || 0
      );

    } catch(err){

      console.log(
        "SIDEBAR COUNT ERROR:",
        err
      );

    }

  };


  useEffect(() => {

    if(!token) return;

    fetchSidebarCounts();

  }, [token]);

  // ===============================
  // 🔥 REALTIME SIDEBAR COUNTS
  // ===============================
  useEffect(() => {


    const refreshSidebarCounts = (data) => {

      console.log(
        "🔥 SIDEBAR COUNT UPDATE:",
        data
      );

      fetchSidebarCounts();

    };


    socket.on(
      "conversationUpdated",
      refreshSidebarCounts
    );

    socket.on(
      "newTicket",
      refreshSidebarCounts
    );

    socket.on(
      "ticketUpdated",
      refreshSidebarCounts
    );

    socket.on(
      "assignedTicket",
      refreshSidebarCounts
    );

    socket.on(
        "notificationCreated",
        refreshSidebarCounts
    );

    socket.on("accessRequestUpdated", () => {

        console.log("accessRequestUpdated received");

        refreshSidebarCounts();

    });

    return () => {

        socket.off(
          "conversationUpdated",
          refreshSidebarCounts
        );

        socket.off(
          "newTicket",
          refreshSidebarCounts
        );

        socket.off(
          "ticketUpdated",
          refreshSidebarCounts
        );

        socket.off(
          "assignedTicket",
          refreshSidebarCounts
        );

        socket.off(
          "accessRequestUpdated",
          refreshSidebarCounts
        );

        socket.off(
            "notificationCreated",
            refreshSidebarCounts
        );

    };


  }, []);


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

    if (path.startsWith("/ticket-center")) 
      return "Ticket Center";

    if (path.startsWith("/records")) 
      return "Records";

    if (path.startsWith("/messages"))
      return "Messages";

    if (path.startsWith("/announcements"))
      return "Announcements";

    if (path.startsWith("/settings")) 
      return "Settings";

    if (path.startsWith("/access-requests")) 
      return "Access Requests";

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

          <span>
            Ticket Center
          </span>

          {ticketCount > 0 && (
            <span className="sidebar-badge">
              {ticketCount}
            </span>
          )}
          </button>

          {isAdmin && (
            <>
              <p className="nav-title">DATA</p>

              <button
                className={isActive("/records") ? "active" : ""}
                onClick={() => navigate("/records")}
              >
                <FiFileText className="icon" />
                Records
              </button>
            </>
          )}

          {/* 🔥 NEW SECTION */}
          <p className="nav-title">CONTENT</p>

          <button
            className={isActive("/announcements") ? "active" : ""}
            onClick={() => navigate("/announcements")}
          >
            <FiBell className="icon" />

            <span>
              Announcements
            </span>
          </button>

          {/* 🔥 NEW SECTION */}
          <p className="nav-title">COMMUNICATION</p>

          <button
            className={isActive("/messages") ? "active" : ""}
            onClick={() => navigate("/messages")}
          >
          <FiMessageSquare className="icon" />

          <span>
            Messages
          </span>

          {messageCount > 0 && (
            <span className="sidebar-badge">
              {messageCount}
            </span>
          )}
          </button>

          {isAdmin && (
            <>
              <p className="nav-title">SYSTEM</p>

              <button
                className={isActive("/access-requests") ? "active" : ""}
                onClick={() => navigate("/access-requests")}
              >
                <FiUserCheck className="icon" />

                <span>Access Requests</span>

                {accessRequestCount > 0 && (
                  <span className="sidebar-badge">
                    {accessRequestCount}
                  </span>
                )}
              </button>

              <button
                className={isActive("/settings") ? "active" : ""}
                onClick={() => navigate("/settings")}
              >
                <FiSettings className="icon" />
                Settings
              </button>
            </>
          )}

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


            <div className="topbar-actions">

              <NotificationBell />


              <div className="status-pill">
                <span className="dot-online"></span>

                {user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "technician"
                  ? "Technician"
                  : user?.role === "support"
                  ? "IT Support"
                  : "User"}{" "}
                Online
              </div>


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