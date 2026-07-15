import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../styles/UserArchives.css";

import {
  FiSearch,
  FiArchive,
} from "react-icons/fi";

export default function UserArchives() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [restoreTicket, setRestoreTicket] = useState(null);
  const [deleteTicket, setDeleteTicket] = useState(null);

  useEffect(() => {
    fetchArchivedTickets();
  }, []);

  const fetchArchivedTickets = async () => {
    try {
      setLoading(true);

      const res = await api.get("/tickets/my/archived");

      setTickets(res.data.tickets || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (text) => {
    if (!text) return "";

    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\bIt\b/g, "IT");
  };

    const handleUnarchive = async (ticketId) => {
    try {
        await api.patch(`/tickets/my/${ticketId}/unarchive`);

        setTickets((prev) =>
        prev.filter((t) => t._id !== ticketId)
        );

        setRestoreTicket(null);

        // showToast("success", "Ticket restored successfully.");
    } catch (err) {
        console.log(err);
        // showToast("error", err.response?.data?.message);
    }
    };

    const handleDelete = async (ticketId) => {
    try {
        await api.delete(`/tickets/my/${ticketId}`);

        setTickets((prev) =>
        prev.filter((t) => t._id !== ticketId)
        );

        setDeleteTicket(null);

        // showToast("success", "Ticket deleted successfully.");
    } catch (err) {
        console.log(err);
        // showToast("error", err.response?.data?.message);
    }
    };

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      ticket.ticketId?.toLowerCase().includes(query) ||
      ticket.title?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query);

    const matchesPriority =
      priorityFilter === "all" ||
      ticket.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === "all" ||
      ticket.category === categoryFilter;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesCategory
    );
  });

  return (
    <div className="user-archives">

      <section className="archives-header">

        <h2>Archived Tickets</h2>

        <p>
            Review your previously archived support requests.
        </p>

      </section>

      <section className="archives-toolbar">

        <div className="archives-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search archived tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

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

      {loading ? (

        <div className="archives-empty">
          Loading archived tickets...
        </div>

      ) : filteredTickets.length === 0 ? (

        <div className="archives-empty">

          <FiArchive size={48} />

          <h3>No Archived Tickets</h3>

          <p>
            Archived support requests will appear here.
          </p>

        </div>

      ) : (

        <div className="archives-table-wrapper">

        <table className="archives-table">

            <thead>

            <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Archived On</th>
                <th>Actions</th>
            </tr>

            </thead>

            <tbody>

            {filteredTickets.map((ticket) => (

                <tr key={ticket._id}>

                <td className="ticket-id">
                    {ticket.ticketId}
                </td>

                <td>
                    <div className="archive-title">
                    <strong>{ticket.title}</strong>

                    <small>
                        {ticket.description?.length > 60
                        ? ticket.description?.substring(0, 60) + "..."
                        : ticket.description}
                    </small>
                    </div>
                </td>

                <td>
                    <span className="category-pill">
                    {capitalize(ticket.category)}
                    </span>
                </td>

                <td>
                    <span
                    className={`priority-pill priority-${ticket.priority}`}
                    >
                    {capitalize(ticket.priority)}
                    </span>
                </td>

                <td>
                    <span className="archive-status-pill">
                        Archived
                    </span>
                </td>

                <td>
                    {ticket.archivedAt
                    ? new Date(ticket.archivedAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td>

                    <div className="archive-actions">

                    <button
                        className="restore-btn"
                        onClick={() => setRestoreTicket(ticket)}
                    >
                        Restore
                    </button>

                    <button
                        className="delete-btn"
                        onClick={() => setDeleteTicket(ticket)}
                    >
                        Delete
                    </button>

                    </div>

                </td>

                </tr>

            ))}

            </tbody>

        </table>

        </div>

      )}

            {deleteTicket && (
            <div
                className="modal-overlay archive-delete-modal"
                onClick={() => setDeleteTicket(null)}
            >
            <div
            className="modal resolve-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="resolve-header">
                <h2>Delete Ticket</h2>
            </div>

            <div className="resolve-body">
                <p>
                Delete this archived ticket permanently?
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
                Cancel
                </button>

                <button
                className="btn-delete"
                onClick={() =>
                    handleDelete(deleteTicket._id)
                }
                >
                Delete
                </button>
            </div>
            </div>
        </div>
        )}

        {restoreTicket && (
        <div
            className="modal-overlay archive-restore-modal"
            onClick={() => setRestoreTicket(null)}
        >
            <div
            className="modal resolve-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="resolve-header">
                <h2>Restore Ticket</h2>
            </div>

            <div className="resolve-body">
                <p>
                Restore this archived ticket?
                </p>

                <div className="resolve-warning">
                The ticket will return to your active tickets.
                </div>
            </div>

            <div className="resolve-actions">
                <button
                className="btn-keep-ticket"
                onClick={() => setRestoreTicket(null)}
                >
                Cancel
                </button>

                <button
                className="btn-confirm"
                onClick={() =>
                    handleUnarchive(restoreTicket._id)
                }
                >
                Restore
                </button>
            </div>
            </div>
        </div>
        )}

    </div>

  );
}