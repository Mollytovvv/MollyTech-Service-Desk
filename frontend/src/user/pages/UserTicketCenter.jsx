import { useEffect, useState } from "react";
import CreateTicketModal from "../components/CreateTicketModal";
import EditTicketModal from "../components/EditTicketModal";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";
import "../styles/UserTicketCenter.css";
import { useAuth } from "../../context/AuthContext";
import ViewTicketModal from "../components/ViewTicketModal";
import socket from "../../socket/socket";

import {
  FiTag,
  FiAlertTriangle,
  FiActivity,
  FiCalendar,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEdit,
  FiXCircle,
  FiTrash2,
  FiEye,
  FiArchive,
} from "react-icons/fi";

export default function UserTicketCenter() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelTicket, setCancelTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);
  const [archiveTicket, setArchiveTicket] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);

  const { user } = useAuth();
  const { showToast } = useToast();

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

    // Display-friendly labels
    if (text === "other") return "Others";
    if (text === "it") return "IT";

    const formatted = text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return formatted.replace(/\bIt\b/g, "IT");
  };

  const getLatestAdminResponse = (ticket) => {
    if (!ticket.comments || ticket.comments.length === 0) {
      return null;
    }

    return ticket.comments[ticket.comments.length - 1];
  };

  const handleEdit = (ticket) => {
    setActiveMenu(null);
    setSelectedTicket(ticket);
    setShowEditModal(true);
  };

  const handleView = (ticket) => {
    setActiveMenu(null);
    setViewTicket(ticket);
    setShowViewModal(true);
  };

  // ===============================
  // CANCEL TICKET
  // ===============================
  const handleCancelTicket = async (ticketId) => {

    try {
      await api.patch(`/tickets/${ticketId}/cancel`);

      // Remove immediately from UI
      setTickets((prev) =>
        prev.filter((t) => t._id !== ticketId)
      );

      setActiveMenu(null);

      showToast(
        "success",
        "Ticket request cancelled successfully."
      );

    } catch (err) {
      console.log(err);

      showToast(
        "error",
        err.response?.data?.message ||
        "Failed to cancel ticket."
      );
    }
  };


  // ===============================
  // DELETE TICKET
  // ===============================
  const handleDeleteTicket = async (ticketId) => {
    try {
      await api.delete(`/tickets/my/${ticketId}`);

    setTickets((prev) =>
      prev.filter((t) => t._id !== ticketId)
    );

    setActiveMenu(null);

    showToast(
      "success",
      "Ticket deleted successfully."
    );

    } catch (err) {
      console.log(err);

      showToast(
        "error",
        err.response?.data?.message ||
        "Failed to delete ticket."
      );
    }
  };

  const handleArchiveTicket = async (ticketId) => {
    try {
      await api.patch(`/tickets/my/${ticketId}/archive`);

      setTickets((prev) =>
        prev.filter((t) => t._id !== ticketId)
      );

      setActiveMenu(null);

      showToast(
        "success",
        "Ticket archived successfully."
      );

    } catch (err) {
      console.log(err);

      showToast(
        "error",
        err.response?.data?.message ||
        "Failed to archive ticket."
      );
    }
  };

  const toggleMenu = (ticketId) => {
    setActiveMenu(
      activeMenu === ticketId ? null : ticketId
    );
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

            <div className="ticket-content-grid">

              {/* LEFT */}
              <div className="ticket-details-card">

                <div className="ticket-field">
                  <span className="ticket-label">Title</span>

                  <h4 className="ticket-title">
                    {ticket.title}
                  </h4>
                </div>

                <div className="ticket-field">
                  <span className="ticket-label">Description</span>

                  <p className="ticket-description">
                    {ticket.description}
                  </p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="admin-response-card">

                <span className="ticket-label">
                  Admin Response
                </span>

                {getLatestAdminResponse(ticket) ? (

                  <>
                    <p className="admin-response-text">
                      {getLatestAdminResponse(ticket).message}
                    </p>

                    <small className="admin-response-date">
                      {new Date(
                        getLatestAdminResponse(ticket).createdAt
                      ).toLocaleString()}
                    </small>
                  </>

                ) : (

                  <p className="admin-response-empty">
                    No response yet.
                    Our support team will update you here once they begin working on your request.
                  </p>

                )}

              </div>

            </div>

            <div className="ticket-divider"></div>

            <div className="ticket-contact-grid">

              <div className="ticket-field">
                <span className="ticket-label">Email</span>
                <span>{ticket.email || "N/A"}</span>
              </div>

              <div className="ticket-field">
                <span className="ticket-label">Phone</span>

                <span>
                  {ticket.phoneNumber
                    ? (() => {
                        const phone = ticket.phoneNumber.replace(/\D/g, "");

                        const local =
                          phone.startsWith("63")
                            ? phone.slice(2)
                            : phone;

                        return `+63 ${local.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          "$1 $2 $3"
                        )}`;
                      })()
                    : "N/A"}
                </span>
              </div>

            </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="user-ticket-meta">

              {/* ACTION HEADER */}

              <div className="ticket-actions-header">

                <span>Actions</span>

                <div className="ticket-menu-container">

                  <button
                    className="ticket-menu-btn"
                    onClick={() => toggleMenu(ticket._id)}
                    aria-label="Ticket actions"
                  >
                    <FiMoreVertical />
                  </button>

                  {activeMenu === ticket._id && (

                  <div className="ticket-action-menu">

                    <button onClick={() => handleView(ticket)}>
                      <FiEye />
                      View Ticket
                    </button>

                    {ticket.status === "pending" && (
                      <button onClick={() => handleEdit(ticket)}>
                        <FiEdit />
                        Edit Ticket
                      </button>
                    )}

                    {ticket.status === "pending" && (
                      <button
                        onClick={() => {
                          setCancelTicket(ticket);
                          setActiveMenu(null);
                        }}
                      >
                        <FiXCircle />
                        Cancel Request
                      </button>
                    )}

                    {(ticket.status === "resolved" || ticket.status === "closed") && (
                      <button
                        onClick={() => {
                          setArchiveTicket(ticket);
                          setActiveMenu(null);
                        }}
                      >
                        <FiArchive />
                        Archive Ticket
                      </button>
                    )}

                    {ticket.status === "cancelled" && (
                      <button
                        onClick={() => {
                          setDeleteTicket(ticket);
                          setActiveMenu(null);
                        }}
                      >
                        <FiTrash2 />
                        Delete Ticket
                      </button>
                    )}

                  </div>

                  )}

                </div>

              </div>

              <div className="ticket-meta-card">

                <small>Category</small>

                <span className="user-ticket-category">
                  <FiTag />
                  {capitalize(ticket.category)}
                </span>

              </div>


              <div className="ticket-meta-card">

                <small>Priority</small>

              <span
                className={`user-ticket-priority user-priority-${ticket.priority?.toLowerCase()}`}
              >
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

      {cancelTicket && (
        <div
          className="modal-overlay"
          onClick={() => setCancelTicket(null)}
        >
          <div
            className="modal resolve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resolve-header">
              <FiAlertTriangle className="resolve-icon" />
              <h2>Cancel Ticket Request</h2>
            </div>

            <div className="resolve-body">
              <p>
                Are you sure you want to cancel this ticket request?
              </p>

              <div className="resolve-warning">
                The ticket will disappear from the administrator's active queue.
              </div>
            </div>

            <div className="resolve-actions">
              <button
                className="btn-keep-ticket"
                onClick={() => setCancelTicket(null)}
              >
                Keep Ticket
              </button>

              <button
                className="btn-cancel-ticket"
                onClick={() => {
                  handleCancelTicket(cancelTicket._id);
                  setCancelTicket(null);
                }}
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>
      )}

      {archiveTicket && (
        <div
          className="modal-overlay"
          onClick={() => setArchiveTicket(null)}
        >
          <div
            className="modal resolve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resolve-header">
              <FiArchive className="resolve-icon" />
              <h2>Archive Ticket</h2>
            </div>

            <div className="resolve-body">
              <p>
                Are you sure you want to archive this ticket?
              </p>

              <div className="resolve-warning">
                Archived tickets will be moved to your Archives page.
              </div>
            </div>

            <div className="resolve-actions">
              <button
                className="btn-keep-ticket"
                onClick={() => setArchiveTicket(null)}
              >
                Keep Ticket
              </button>

              <button
                className="btn-delete-ticket"
                onClick={() => {
                  handleArchiveTicket(archiveTicket._id);
                  setArchiveTicket(null);
                }}
              >
                Archive Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTicket && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteTicket(null)}
        >
          <div
            className="modal resolve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resolve-header">
              <FiTrash2 className="resolve-icon" />
              <h2>Delete Ticket</h2>
            </div>

            <div className="resolve-body">
              <p>
                Are you sure you want to permanently delete this ticket?
              </p>

              <div className="resolve-warning">
                This action cannot be undone.
              </div>
            </div>

            <div className="resolve-actions">
              <button
                className="btn-keep-ticket"
                onClick={() => setDeleteTicket(null)}
              >
                Keep Ticket
              </button>

              <button
                className="btn-delete-ticket"
                onClick={() => {
                  handleDeleteTicket(deleteTicket._id);
                  setDeleteTicket(null);
                }}
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}

      {showCreateModal && (
          <CreateTicketModal
              onClose={() => {
                  setShowCreateModal(false);
              }}

              onTicketCreated={() => {
                  fetchTickets();
              }}
          />
      )}

      {/* EDIT MODAL */}

      {showEditModal && selectedTicket && (
        <EditTicketModal
          ticket={selectedTicket}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTicket(null);
            setActiveMenu(null);   // <-- add this
            fetchTickets();
          }}
        />
      )}

      {/* VIEW MODAL */}

      {showViewModal && viewTicket && (
        <ViewTicketModal
          ticket={viewTicket}
          onClose={() => {
            setShowViewModal(false);
            setViewTicket(null);
            setActiveMenu(null);
          }}
        />
      )}
    </div>
  );
}