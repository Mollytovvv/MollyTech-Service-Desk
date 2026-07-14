import { useEffect, useState } from "react";
import CreateTicketModal from "../components/CreateTicketModal";
import api from "../../api/axios";
import "../styles/UserTicketCenter.css";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket/socket";

import {
  FiTag,
  FiAlertTriangle,
  FiActivity,
  FiCalendar,
  FiSearch,
  FiPlus,
} from "react-icons/fi";

export default function UserTicketCenter() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  // ===============================
  // FETCH USER TICKETS
  // ===============================

  const fetchTickets = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await api.get("/tickets/my");

      setTickets(response.data.tickets);
    } catch (error) {
      console.log(
        "FETCH TICKETS ERROR:",
        error.response?.data || error.message
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTickets(true);
  }, []);

  useEffect(() => {
    const handleTicketUpdate = () => {
      fetchTickets(false);
    };

    socket.on("ticketUpdated", handleTicketUpdate);
    socket.on("newTicket", handleTicketUpdate);

    return () => {
      socket.off("ticketUpdated", handleTicketUpdate);
      socket.off("newTicket", handleTicketUpdate);
    };
  }, []);

  const capitalize = (text) => {
    if (!text) return "";

    const formatted = text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return formatted.replace(/\bIt\b/g, "IT");
  };

  const filteredTickets = tickets.filter((ticket) => {

    const query = searchTerm.trim().toLowerCase();

    const matchesSearch =
      query === "" ||
      ticket.ticketId?.toLowerCase().includes(query) ||
      ticket.title?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      ticket.priority?.toLowerCase() === priorityFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      ticket.category?.toLowerCase() === categoryFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory
    );
  });

  return (
    <div className="user-ticket-center">
      {/* HEADER */}

      <section className="ticket-center-header">
        <div>
          <h2>
            Hello, {user?.firstName || user?.name || "there"} 👋
          </h2>

          <p>
            Need IT support? Create a ticket or track your existing requests.
          </p>
        </div>

        <button
          className="create-ticket-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus />
          New Ticket
        </button>
      </section>

      {/* TOOLBAR */}

      <section className="ticket-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search by Ticket ID, title, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
        >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
        </select>

        <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
        >
            <option value="all">All Categories</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="network">Network</option>
            <option value="account">Account</option>
            <option value="printer">Printer</option>
            <option value="others">Others</option>
        </select>
      </section>

      {/* TICKETS */}

      <section className="ticket-table">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner"></div>

            <h3>Loading tickets...</h3>

            <p>
              Please wait while we retrieve your support requests.
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗂</div>

            <h3>No Support Tickets</h3>

            <p>
              You haven't submitted any support requests yet.
            </p>

            <button
              className="create-ticket-btn"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Ticket
            </button>
          </div>
        ) : (
          <div className="user-ticket-list">
            {filteredTickets.map((ticket) => (
          <div
            className="user-ticket-card"
            key={ticket._id}
          >
            {/* LEFT SIDE */}

            <div className="user-ticket-info">

            <div className="ticket-row">

              <div className="ticket-field">
                <span className="ticket-label">Ticket ID</span>
                <h3 className="ticket-id">{ticket.ticketId}</h3>
              </div>

              <div className="ticket-field">
                <span className="ticket-label">Created</span>

                <span className="ticket-date">
                  <FiCalendar />
                  {new Date(ticket.createdAt).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {" • "}
                  {new Date(ticket.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="ticket-field">
                <span className="ticket-label">Assigned To</span>

                <span className="ticket-assigned">
                  {ticket.assignedTo ? capitalize(ticket.assignedTo) : "Unassigned"}
                </span>
              </div>

            </div>

              <div className="ticket-field">
                <span className="ticket-label">Title</span>

                <h4>{ticket.title}</h4>
              </div>

              <div className="ticket-field">
                <span className="ticket-label">Description</span>

                <p className="ticket-description">
                  {ticket.description}
                </p>
              </div>

              <div className="ticket-contact-grid">

                <div className="ticket-field">
                  <span className="ticket-label">Email</span>
                  <span>{ticket.email || "N/A"}</span>
                </div>

                <div className="ticket-field">
                  <span className="ticket-label">Phone</span>
                  <span>{ticket.phoneNumber || "N/A"}</span>
                </div>

              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="user-ticket-meta">

              <div className="ticket-meta-card">

                <small>Category</small>

                <span className="user-ticket-category">
                  <FiTag />
                  {capitalize(ticket.category)}
                </span>

              </div>

              <div className="ticket-meta-card">

                <small>Priority</small>

                <span className="user-ticket-priority">
                  <FiAlertTriangle />
                  {capitalize(ticket.priority)}
                </span>

              </div>

              <div className="ticket-meta-card">

                <small>Status</small>

                <span className={`user-status-${ticket.status}`}>
                  <FiActivity />
                  {capitalize(ticket.status)}
                </span>

              </div>

            </div>

          </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE MODAL */}

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => {
            setShowCreateModal(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}