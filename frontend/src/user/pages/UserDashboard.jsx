import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiFolder,
  FiMessageCircle,
  FiPlus,
  FiSettings,
} from "react-icons/fi";

import api from "../../api/axios";
import socket from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";

import UserTopCards from "../components/UserTopCards";
import CreateTicketModal from "../components/CreateTicketModal";

import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    stats: {
      total: 0,
      pending: 0,
      messages: 0,
      resolved: 0,
    },
    recentTickets: [],
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/tickets/my/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboard(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchDashboard();
  }, [token]);

  useEffect(() => {
    if (!user) return;

    socket.on("ticketUpdated", fetchDashboard);

    return () => {
      socket.off("ticketUpdated", fetchDashboard);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="user-dashboard loading">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* HEADER */}
      <section className="dashboard-intro">
        <div>
          <h2>
            Welcome back, {user?.firstName} {user?.lastName} 👋
          </h2>
          <p>How can we assist you today?</p>
        </div>
      </section>

      <UserTopCards stats={dashboard.stats} />

      {/* MAIN WORKSPACE */}
      <div className="workspace">
        {/* RECENT TICKETS */}
        <section className="work-area">
          <div className="panel-header panel-header-row">
            <div>
              <h2>Recent Tickets</h2>
              <p>Manage your submitted support requests</p>
            </div>

            <button
              className="view-all-btn"
              onClick={() => navigate("/user/tickets")}
            >
              View All
            </button>
          </div>

          <div className="ticket-list-scroll">
            {dashboard.recentTickets?.length === 0 ? (
              <div className="empty-state">
                <h3>No tickets yet</h3>
                <p>
                  Create your first support ticket to get assistance from IT.
                </p>
              </div>
            ) : (
              dashboard.recentTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="ticket-row"
                >
                  <div className="ticket-icon">🎫</div>

                  <div className="ticket-content">
                    <span className="ticket-label">
                      SUPPORT TICKET
                    </span>

                    <h4 className="ticket-title">
                      {ticket.title}
                    </h4>

                    <div className="ticket-info">
                      <span>Ticket ID: {ticket.ticketId}</span>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <div className="ticket-badges">
                      <span className={`status ${ticket.status}`}>
                        {ticket.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>

                      <span className={`priority ${ticket.priority}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}

                      <br />

                      {new Date(ticket.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <aside className="panel-card quick-actions">
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="action-list">
            <button
              className="action-item"
              onClick={() => setShowCreateTicket(true)}
            >
              <FiPlus />

              <div>
                <h4>Create Ticket</h4>
                <p>Submit a new issue</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/tickets")}
            >
              <FiFolder />

              <div>
                <h4>My Tickets</h4>
                <p>View ticket history</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/messages")}
            >
              <FiMessageCircle />

              <div>
                <h4>Contact Support</h4>
                <p>Chat with IT team</p>
              </div>
            </button>

            <button
              className="action-item"
              onClick={() => navigate("/user/settings")}
            >
              <FiSettings />

              <div>
                <h4>Settings</h4>
                <p>Manage your account</p>
              </div>
            </button>
          </div>
        </aside>
      </div>

      {/* ANNOUNCEMENTS */}
      <section className="panel-card announcements">
        <div className="panel-header">
          <h2>Announcements</h2>
        </div>

        <div className="announcement-item">
          <FiBell />

          <div>
            <h4>System Maintenance</h4>
            <p>
              Scheduled maintenance updates will appear here.
            </p>
          </div>
        </div>
      </section>

      {showCreateTicket && (
        <CreateTicketModal
          onClose={() => setShowCreateTicket(false)}
          onTicketCreated={() => {
            setShowCreateTicket(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
}