import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../styles/Records.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export default function Records() {
  const [archivedTickets, setArchivedTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [actionMode, setActionMode] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { token } = useAuth();

  // FETCH
  useEffect(() => {
    if (!token) return;

    const fetchArchived = async () => {
      try {
        setLoading(true);

        const res = await api.get("/tickets/status/archived", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setArchivedTickets(res.data.tickets || []);
      } catch (err) {
        console.log(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArchived();
  }, [token]);

  // =========================
  // UNARCHIVE
  // =========================
  const handleUnarchive = async () => {
    try {
      await api.patch(
        "/tickets/unarchive",
        { ticketIds: selectedIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const restoredCount = selectedIds.length;

      // Remove restored tickets immediately
      setArchivedTickets((prev) =>
        prev.filter((t) => !selectedIds.includes(t._id))
      );

      setSelectedIds([]);
      setActionMode(null);

      showToast(
        "success",
        `${restoredCount} archived ticket${
          restoredCount > 1 ? "s have" : " has"
        } been restored`
      );

      // Give user time to see toast
      setTimeout(() => {
        navigate("/ticket-center");
      }, 1500);

    } catch (err) {
      console.log(err.response?.data || err.message);

      showToast(
        "error",
        err.response?.data?.message || "Failed to restore tickets"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    try {
      await api.delete(
        "/tickets/delete",
        {
          data: {
            ticketIds: selectedIds,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const deletedCount = selectedIds.length;

      setArchivedTickets((prev) =>
        prev.filter((t) => !selectedIds.includes(t._id))
      );

      setSelectedIds([]);
      setActionMode(null);

      showToast(
        "success",
        `${deletedCount} archived ticket${
          deletedCount > 1 ? "s have" : " has"
        } been deleted`
      );

    } catch (err) {

      console.log(err.response?.data || err.message);

      showToast(
        "error",
        err.response?.data?.message ||
        "Failed to delete tickets"
      );

    }
  };

  // FILTER + SEARCH
  const filteredTickets = archivedTickets
    .filter((t) => {
      if (filter === "all") return true;
      if (filter === "high") return t.priority === "high";
      if (filter === "medium") return t.priority === "medium";
      if (filter === "low") return t.priority === "low";
      if (filter === "urgent") return t.priority === "urgent";
      return true;
    })
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        t.title?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t._id?.toLowerCase().includes(q)
      );
    });

  // =========================
  // SELECT ALL (CLEAN VERSION)
  // =========================
  const visibleIds = filteredTickets.map((t) => t._id);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      // deselect visible only
      setSelectedIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      // select visible only
      setSelectedIds((prev) => [
        ...new Set([...prev, ...visibleIds]),
      ]);
    }
  };

  return (
    <div className="records-page">
      <div className="records-card">

        {/* HEADER */}
        <div className="records-header">
          <h2 className="records-title">Archived Records</h2>

          <div className="records-toolbar">

            <input
              className="records-search"
              placeholder="Search title, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="records-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* DEFAULT BUTTONS */}
            {actionMode === null && (
              <>
                <button
                  className="btn-unarchive"
                  onClick={() => {
                    setActionMode("restore");
                    setSelectedIds([]);
                  }}
                >
                  Unarchive
                </button>

                <button
                  className="btn-delete"
                  onClick={() => {
                    setActionMode("delete");
                    setSelectedIds([]);
                  }}
                >
                  Delete
                </button>
              </>
            )}

            {/* RESTORE MODE */}
            {actionMode === "restore" && (
              <>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setActionMode(null);
                    setSelectedIds([]);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn-confirm"
                  disabled={selectedIds.length === 0}
                  onClick={handleUnarchive}
                >
                  Restore ({selectedIds.length})
                </button>

                <button
                  className="btn-select-all"
                  onClick={handleSelectAll}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </>
            )}

            {/* DELETE MODE */}
            {actionMode === "delete" && (
              <>
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setActionMode(null);
                    setSelectedIds([]);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="btn-delete-confirm"
                  disabled={selectedIds.length === 0}
                  onClick={handleDelete}
                >
                  Delete ({selectedIds.length})
                </button>

                <button
                  className="btn-select-all"
                  onClick={handleSelectAll}
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </button>
              </>
            )} 

          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="empty-state">Loading archived tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">No archived tickets found</div>
        ) : (
          <div className="table-wrapper">

            <table className="records-table">

            <thead>
            <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Ticket ID</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Archived At</th>
            </tr>
            </thead>

            <tbody>
            {filteredTickets.map((t) => (
            <tr
              key={t._id}
              onClick={() => {
                if (!actionMode) return;
                toggleSelect(t._id);
              }}
                className={`${actionMode ? "clickable-row" : ""} ${
                selectedIds.includes(t._id) ? "selected-row" : ""
              }`}
            >

                {/* TITLE + CHECKBOX COMBINED */}
                <td className="title-cell title-flex">

                    {/* CHECKBOX (ONLY WHEN UNARCHIVE MODE IS ON) */}
                    {actionMode && (
                    <input
                      type="checkbox"
                      className="row-checkbox"
                      checked={selectedIds.includes(t._id)}
                      onChange={() => toggleSelect(t._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    )}

                    <div>
                    <strong>{t.title}</strong>
                    <div className="desc">{t.description}</div>
                    </div>

                </td>

                <td className="center">
                    <span className="badge archived">ARCHIVED</span>
                </td>

                <td className="center">#{t._id?.slice(-6)}</td>

                <td className="center">
                    <span className={`priority-badge ${t.priority}`}>
                        {t.priority?.toUpperCase()}
                    </span>
                </td>

                <td className="center">{t.category || "N/A"}</td>

                <td className="email-cell center">{t.email || "N/A"}</td>

                <td className="phone-cell center">{t.phoneNumber || "N/A"}</td>

                <td className="center">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : "N/A"}
                </td>

                <td className="center">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "N/A"}
                </td>

                </tr>
            ))}
            </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}