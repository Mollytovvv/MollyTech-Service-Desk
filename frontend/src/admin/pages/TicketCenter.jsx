import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../styles/TicketCenter.css";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import socket from "../../socket/socket";
import { FiAlertTriangle } from "react-icons/fi";

export default function TicketCenter() {

  // =========================
  // STATE MANAGEMENT
  // =========================
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [archiveMode, setArchiveMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [assignValue, setAssignValue] = useState("");

  const [saving, setSaving] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [resolveTicket, setResolveTicket] = useState(null);
  const [reopenTicket, setReopenTicket] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { token } = useAuth();

  // =========================
  // FETCH TICKETS
  // =========================
  useEffect(() => {
    if (!token) return;
    fetchTickets();
  }, [token]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets(res.data.tickets ?? []);
    } catch (err) {
      console.log(err);
      showToast("error", "Failed to load tickets");
    }
  };

  // =========================
  // FORMAT HELPERS
  // =========================
  const formatPriority = (priority) => {
    switch (priority) {
      case "high": return "HIGH";
      case "medium": return "MEDIUM";
      case "low": return "LOW";
      case "urgent": return "URGENT";
      default: return priority?.toUpperCase();
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "open": return "PENDING";
      case "in_progress": return "IN PROGRESS";
      case "resolved": return "RESOLVED";
      case "closed": return "CLOSED";
      case "archived": return "ARCHIVED";
      default: return status?.toUpperCase();
    }
  };

  const formatCategory = (category) => {
    if (!category) return "N/A";
    return category
      .split("_")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const formatAssignedTo = (assignedTo) => {
    if (!assignedTo) return "Unassigned";

    const roles = {
      admin: "Admin",
      it_support: "IT Support",
      technician: "Technician",
    };

    return roles[assignedTo] || assignedTo;
  };

  // =========================
  // RESOLVE TICKET
  // =========================
  const handleResolve = async (id) => {
    try {
      const res = await api.patch(
        `/tickets/${id}/resolve`,
        { status: "resolved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTicket = res.data.ticket;

      setTickets((prev) =>
        prev.map((t) => (t._id === id ? updatedTicket : t))
      );

      showToast("success", "Ticket resolved successfully");

    } catch (err) {
      console.log(err);
      showToast("error", "Failed to resolve ticket");
    }
  };

// =========================
// REOPEN TICKET
// =========================
const handleReopen = async (id) => {
  try {
    const res = await api.patch(
      `/tickets/${id}/reopen`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedTicket = res.data.ticket;

    setTickets((prev) =>
      prev.map((t) =>
        t._id === id ? updatedTicket : t
      )
    );

    showToast("success", "Ticket reopened successfully");

  } catch (err) {
    console.log(err);
    showToast("error", "Failed to reopen ticket");
  }
};

  // =========================
  // TOGGLE SELECT (ARCHIVE MODE)
  // =========================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // =========================
  // BULK ARCHIVE
  // =========================
  const handleArchive = async () => {
    try {
      await api.patch(
        "/tickets/archive",
        { ticketIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTickets((prev) =>
        prev.filter((t) => !selectedIds.includes(t._id))
      );

      setSelectedIds([]);
      setArchiveMode(false);

      showToast("success", "Tickets archived successfully");

      navigate("/records");

    } catch (err) {
      console.log(err);
      showToast("error", "Archive failed");
    }
  };

  // =========================
  // SAVE TICKET (ASSIGN + COMMENT)
  // =========================
  const handleAssign = async () => {
    if (!selectedTicket?._id) return;

  try {
    setSaving(true);

    // =====================
    // ASSIGN TICKET
    // =====================
    const assignRes = await api.patch(
      `/tickets/${selectedTicket._id}/assign`,
      {
        assignedTo: assignValue || null,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let updatedTicket = assignRes.data.ticket;

    // =====================
    // ADD COMMENT
    // =====================
    if (commentInput.trim()) {
      const commentRes = await api.post(
        `/tickets/${selectedTicket._id}/comment`,
        {
          message: commentInput,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      updatedTicket = commentRes.data.ticket;
    }

    // =====================
    // UPDATE LOCAL STATE
    // =====================
    const latestTicket = updatedTicket;

    setTickets((prev) =>
      prev.map((t) =>
        t._id === latestTicket._id
          ? latestTicket
          : t
      )
    );

    setSelectedTicket(latestTicket);

    showToast("success", "Ticket updated successfully");

    setSelectedTicket(null);
    setAssignValue("");
    setCommentInput("");

  } catch (err) {
    console.log(err);
    showToast("error", "Update failed");

  } finally {
    setSaving(false);
  }
};

  // =========================
  // REAL-TIME NEW TICKETS
  // =========================
  useEffect(() => {
    const handleNewTicket = (ticket) => {
      console.log("🔥 New Ticket Received:", ticket);

      setTickets((prev) => {
        const exists = prev.some(
          (t) => t._id === ticket._id
        );

        if (exists) return prev;

        return [ticket, ...prev];
      });
    };

    socket.on("newTicket", handleNewTicket);

    return () => {
      socket.off("newTicket", handleNewTicket);
    };
  }, []);

  // =========================
  // FILTER + SEARCH
  // =========================
  const filteredTickets = tickets
    .filter((t) => {
      if (t.status === "archived") return false;
      if (archiveMode) return t.status === "resolved";

      if (filter === "all") return true;
      if (filter === "pending") return t.status === "open";
      if (filter === "resolved") return t.status === "resolved";

      return true;
    })
    .filter((t) =>
      t.title?.toLowerCase().includes(search.toLowerCase())
    );

  const visibleIds = filteredTickets.map((t) => t._id);

  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      // deselect only visible
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      // select all visible
      setSelectedIds((prev) => [
        ...new Set([...prev, ...visibleIds]),
      ]);
    }
  };

  return (
    <div className="tickets-page">

      <div className="tickets-card">

        {/* TOOLBAR */}
        <div className="tickets-toolbar">

          <div className="search-box">
            <FiSearch />
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="archive-controls">

            <button
              className={archiveMode ? "btn-cancel-archive" : "btn-archive"}
              onClick={() => {
                setArchiveMode(!archiveMode);
                setSelectedIds([]);
              }}
            >
              {archiveMode ? "Cancel Archive" : "Archive"}
            </button>

            {archiveMode && (
              <button className="btn-select-all" onClick={handleSelectAll}>
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            )}

            {archiveMode && (
              <button
                className="btn-archive-confirm"
                onClick={handleArchive}
                disabled={selectedIds.length === 0}
              >
                Archive Selected ({selectedIds.length})
              </button>
            )}

          </div>

          {/* FILTERS */}
          <div className="filters">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>

            <button
              className={filter === "pending" ? "active" : ""}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>

            <button
              className={filter === "resolved" ? "active" : ""}
              onClick={() => setFilter("resolved")}
            >
              Resolved
            </button>
          </div>

        </div>

        {/* LIST */}
        <div className="tickets-list">

          {filteredTickets.length === 0 ? (
            <div className="empty-state">No tickets found</div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t._id}
                className={`ticket-card ${
                  selectedIds.includes(t._id) ? "selected" : ""
                }`}
                onClick={() => {
                  if (archiveMode && t.status === "resolved") {
                    toggleSelect(t._id);
                  }
                }}
              >

                {/* CHECKBOX */}
                {archiveMode && t.status === "resolved" && (
                  <input
                    type="checkbox"
                    className="ticket-select"
                    checked={selectedIds.includes(t._id)}
                    onChange={() => toggleSelect(t._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

              <div className="ticket-left">

                <div className="ticket-title-row">
                  <h3>{t.title}</h3>

                  <span className={`status-badge ${t.status}`}>
                    {formatStatus(t.status)}
                  </span>
                </div>

                <p className="ticket-desc">{t.description}</p>

                {/* EXTRA INFO (NEW) */}
                <div className="ticket-meta-grid">

                <div className="meta-item">
                  <span className="meta-label">Ticket ID</span>
                    <span className="meta-value">
                      {t.ticketId}
                    </span>
                </div>

                  <div className="meta-item">
                    <span className="meta-label">Priority</span>
                    <span className={`priority-badge ${t.priority}`}>
                      {formatPriority(t.priority)}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">
                      {formatCategory(t.category)}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Submitted By</span>
                    <span className="meta-value">{t.submittedBy? `${t.submittedBy.firstName} ${t.submittedBy.lastName}`: "System User"}</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Email</span>
                    <span className="meta-value">{t.email || "N/A"}</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Phone</span>
                    <span className="meta-value">{t.phoneNumber || "N/A"}</span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="meta-item">
                    <span className="meta-label">Assigned To</span>
                    <span className="meta-value">
                      {t.assignedTo ? formatAssignedTo(t.assignedTo) : "Unassigned"}
                    </span>
                  </div>

                </div> {/* ✅ CLOSE ticket-meta-grid */}

              </div> {/* ✅ CLOSE ticket-left */}

              {/* ACTIONS */}
              <div className="ticket-actions-bottom">

                  <button
                    className="btn-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTicket(t);
                      setAssignValue(t.assignedTo || "");
                      setCommentInput("");
                    }}
                  >
                    View
                  </button>

                  {!archiveMode && (
                    t.status === "resolved" ? (
                    <button
                      className="btn-reopen"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReopenTicket(t);
                      }}
                    >
                      Reopen
                    </button>
                    ) : (
                    <button
                        className="btn-resolve"
                        onClick={(e) => {
                            e.stopPropagation();
                            setResolveTicket(t);
                        }}
                    >
                        Resolve
                      </button>
                    )
                  )}

                </div>

              </div>
            ))
          )}

        </div>

      </div>

      {/* MODAL */}
      {selectedTicket && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedTicket(null);
            setCommentInput("");
            setShowNotesModal(false);
          }}
        >
          <div
            className="modal ticket-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="view-header">
              <h2>{selectedTicket.title}</h2>

              <span className={`status ${selectedTicket.status}`}>
                {formatStatus(selectedTicket.status)}
              </span>
            </div>

            <div className="view-body">

              {/* DESCRIPTION */}
              <div className="view-section">
                <h4>Description</h4>
                <p>{selectedTicket.description}</p>
              </div>

              {/* GRID */}
              <div className="view-grid">

              <div className="view-box">
                <span className="label">Ticket ID</span>
                <span>{selectedTicket.ticketId}</span>
              </div>

                <div className="view-box">
                  <span className="label">Priority</span>
                  <span className={`priority-badge ${selectedTicket.priority}`}>
                    {formatPriority(selectedTicket.priority)}
                  </span>
                </div>

                <div className="view-box">
                  <span className="label">Category</span>
                  <span>{formatCategory(selectedTicket.category)}</span>
                </div>

                <div className="view-box">
                  <span className="label">Submitted By</span>
                  <span>
                    {selectedTicket.submittedBy?.firstName}{" "}
                    {selectedTicket.submittedBy?.lastName}
                  </span>
                </div>

                <div className="view-box">
                  <span className="label">Email</span>
                  <span>{selectedTicket.email || "N/A"}</span>
                </div>

                <div className="view-box">
                  <span className="label">Phone</span>
                  <span>{selectedTicket.phoneNumber || "N/A"}</span>
                </div>

                <div className="view-box">
                  <span className="label">Created At</span>
                  <span>
                    {selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <div className="view-box">
                  <span className="label">Assigned To</span>
                  <select
                    value={assignValue}
                    onChange={(e) => setAssignValue(e.target.value)}
                  >
                    <option value="">Unassigned</option>
                    <option value="admin">Admin</option>
                    <option value="it_support">IT Support</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

              </div>

              {/* SUPPORT NOTES */}
              <div className="view-section comments-card">

              <div className="notes-header">

                <h4>Support Notes</h4>

                <button
                  className="btn-view-notes"
                  onClick={() => setShowNotesModal(true)}
                >
                  View Notes ({selectedTicket?.comments?.length ?? 0})
                </button>

              </div>

              <p className="comments-info">
                Official ticket updates and resolution notes.
                For additional questions and follow-ups,
                please use the Messages section.
              </p>

                <div className="support-notes-header">

                  {showNotesModal && (
                    <div
                      className="modal-overlay"
                      onClick={() => setShowNotesModal(false)}
                    >
                      <div
                        className="modal notes-modal"
                        onClick={(e) => e.stopPropagation()}
                      >

                        <div className="view-header">
                          <h2>Support Notes History</h2>
                        </div>

                        <div className="notes-history">

                          {selectedTicket?.comments?.length > 0 ? (

                            selectedTicket.comments.map((c, i) => (

                              <div key={i} className="note-card">

                                <div className="note-top">

                                  <span className="note-author">
                                    {c.user || "System"}
                                  </span>

                                  <span className="note-date">
                                    {c.createdAt
                                      ? new Date(c.createdAt).toLocaleString()
                                      : ""}
                                  </span>

                                </div>

                                <div className="note-message">
                                  {c.message}
                                </div>

                              </div>

                            ))

                          ) : (

                            <p className="empty-notes">
                              No support notes available.
                            </p>

                          )}

                        </div>

                        <div className="modal-actions">
                          <button
                            onClick={() => setShowNotesModal(false)}
                          >
                            Close
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </div>

                <div className="comment-box-card">

                  <textarea
                    className="comment-inline-input"
                    placeholder="Add an official support note..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />

                </div>

                <p className="comment-guideline">
                  Use this section for official ticket updates,
                  troubleshooting notes, and resolution details.
                </p>

              </div>
            </div> {/* CLOSE view-body */}

            {/* MODAL ACTIONS */}
            <div className="modal-actions">
              <button
                className="btn-assign"
                onClick={handleAssign}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => {
                setSelectedTicket(null);
                setShowNotesModal(false);
                setResolveTicket(null);
                setReopenTicket(null);
                }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

          {resolveTicket && (
            <div
              className="modal-overlay"
              onClick={() => setResolveTicket(null)}
            >
              <div
                className="modal resolve-modal"
                onClick={(e) => e.stopPropagation()}
              >

              <div className="resolve-header">
                  <FiAlertTriangle className="resolve-icon" />
                  <h2>Resolve Ticket</h2>
              </div>

                <div className="resolve-body">

                  <p>
                    Are you sure you want to resolve this ticket?
                  </p>

                  <div className="resolve-warning">
                    Users will no longer be able to respond unless
                    the ticket is reopened.
                  </div>

                </div>

                <div className="resolve-actions">

                  <button
                    className="btn-cancel"
                    onClick={() => setResolveTicket(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-confirm-resolve"
                    onClick={() => {
                      handleResolve(resolveTicket._id);
                      setResolveTicket(null);
                    }}
                  >
                    Resolve Ticket
                  </button>

                </div>

              </div>
            </div>
          )}

          {reopenTicket && (
            <div
              className="modal-overlay"
              onClick={() => setReopenTicket(null)}
            >
              <div
                className="modal resolve-modal"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="resolve-header">
                  <FiAlertTriangle className="resolve-icon" />
                  <h2>Reopen Ticket</h2>
                </div>

                <div className="resolve-body">

                  <p>
                    Are you sure you want to reopen this ticket?
                  </p>

                  <div className="resolve-warning">
                    The user will be able to continue sending messages.
                  </div>

                </div>

                <div className="resolve-actions">

                  <button
                    className="btn-cancel"
                    onClick={() => setReopenTicket(null)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn-confirm-resolve"
                    onClick={() => {
                      handleReopen(reopenTicket._id);
                      setReopenTicket(null);
                    }}
                  >
                    Reopen Ticket
                  </button>

                </div>

              </div>
            </div>
          )}

    </div>
  );
}