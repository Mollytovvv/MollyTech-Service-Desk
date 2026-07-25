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
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiMessageSquare,
  FiUserCheck
} from "react-icons/fi";

export default function DashboardLayout() {

  const { logout, token, user } = useAuth();

  const [ticketCount, setTicketCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
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


    return () => {


      socket.off(
        "conversationUpdated",
        refreshSidebarCounts
      );


      socket.off(
        "ticketUpdated",
        refreshSidebarCounts
      );


    };


  }, []);

  // ===============================
  // 🔌 SOCKET CONNECTION
  // ===============================
  useEffect(() => {

    if(!user?._id) return;


    socket.connect();


    socket.emit(
      "register",
      user._id
    );


  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const getPageTitle = () => {

      const path = location.pathname;

      if (path.startsWith("/dashboard"))
          return "Dashboard";

      if (path.startsWith("/ticket-center"))
          return "Ticket Center";

      if (path.startsWith("/records"))
          return "Records";

      if (path.startsWith("/messages"))
          return "Messages";

      if (path.startsWith("/access-requests"))
          return "Access Requests";

      if (path.startsWith("/settings"))
          return "Settings";

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

          <span>
            Messages
          </span>

          {messageCount > 0 && (
            <span className="sidebar-badge">
              {messageCount}
            </span>
          )}
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
            className={isActive("/access-requests") ? "active" : ""}
            onClick={() => navigate("/access-requests")}
          >
            <FiUserCheck className="icon" />
            Access Requests
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


            <div className="topbar-actions">

              <NotificationBell />


              <div className="status-pill">

                <span className="dot-online"></span>

                Admin System Online

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