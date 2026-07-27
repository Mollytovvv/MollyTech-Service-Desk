import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AnnouncementModal from "../components/announcements/AnnouncementModal";

import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiBookmark,
  FiBookmark as FiPinned,
  FiBell,
} from "react-icons/fi";

import "../styles/Announcements.css";

export default function Announcements() {

  const { token } = useAuth();

  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null);

  // =========================
  // FETCH ANNOUNCEMENTS
  // =========================

  const fetchAnnouncements = async () => {

    try {

      const res = await api.get(
        "/announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnnouncements(
        res.data.announcements || []
      );

    } catch (err) {

      console.log(err);

      showToast(
        "error",
        "Failed to load announcements."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (!token) return;

    fetchAnnouncements();

  }, [token]);

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this announcement?"
      );

    if (!confirmDelete) return;

    try {

      await api.delete(
        `/announcements/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnnouncements((prev) =>
        prev.filter((a) => a._id !== id)
      );

      showToast(
        "success",
        "Announcement deleted."
      );

    } catch (err) {

      console.log(err);

      showToast(
        "error",
        "Failed to delete announcement."
      );

    }

  };

  // =========================
  // PIN
  // =========================

  const handlePin = async (id) => {

    try {

      const res = await api.patch(
        `/announcements/${id}/pin`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnnouncements((prev) =>
        prev.map((announcement) => {

          if (
            announcement._id !== id
          ) {
            return announcement;
          }

          return res.data.announcement;

        })
      );

      showToast(
        "success",
        "Announcement updated."
      );

    } catch (err) {

      console.log(err);

      showToast(
        "error",
        "Unable to update announcement."
      );

    }

  };

  // =========================
  // SHOW / HIDE
  // =========================

  const handleVisibility = async (id) => {

    try {

      const res = await api.patch(
        `/announcements/${id}/active`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnnouncements((prev) =>
        prev.map((announcement) => {

          if (
            announcement._id !== id
          ) {
            return announcement;
          }

          return res.data.announcement;

        })
      );

      showToast(
        "success",
        "Announcement updated."
      );

    } catch (err) {

      console.log(err);

      showToast(
        "error",
        "Unable to update announcement."
      );

    }

  };

  // =========================
  // FILTER
  // =========================

  const filteredAnnouncements =
    announcements.filter((announcement) => {

      const matchesSearch =

        announcement.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        announcement.content
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {

        case "active":
          return announcement.active;

        case "hidden":
          return !announcement.active;

        case "pinned":
          return announcement.pinned;

        default:
          return true;

      }

    });

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div className="announcements-page loading">

        Loading announcements...

      </div>

    );

  }

  return (

    <div className="announcements-page">

      <div className="announcement-header">

        <div>

          <h1>

            <FiBell />

            Announcements

          </h1>

          <p>

            Manage company-wide announcements
            for all users.

          </p>

        </div>

        <button
          className="new-announcement-btn"
          onClick={() => {

            setEditingAnnouncement(null);

            setShowModal(true);

          }}
        >

          <FiPlus />

          New Announcement

        </button>

      </div>

      <div className="announcement-toolbar">

        <div className="announcement-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <div className="announcement-filters">

          <button
            className={
              filter === "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              filter === "active"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("active")
            }
          >
            Active
          </button>

          <button
            className={
              filter === "hidden"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("hidden")
            }
          >
            Hidden
          </button>

          <button
            className={
              filter === "pinned"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("pinned")
            }
          >
            Pinned
          </button>

        </div>

      </div>

      <div className="announcement-list">

                {filteredAnnouncements.length === 0 ? (

          <div className="announcement-empty">

            <FiBell size={42} />

            <h3>
              No announcements found
            </h3>

            <p>
              Create your first announcement to keep users informed.
            </p>

          </div>

        ) : (

          filteredAnnouncements.map((announcement) => (

            <div
              key={announcement._id}
              className={`announcement-card ${
                announcement.pinned ? "pinned" : ""
              }`}
            >

              <div className="announcement-card-header">

                <div>

                  <h3>

                    {announcement.title}

                    {announcement.pinned && (
                      <span className="pinned-badge">

                        <FiPinned />

                        Pinned

                      </span>
                    )}

                  </h3>

                  <div className="announcement-meta">

                    <span
                      className={`announcement-type ${announcement.type}`}
                    >
                      {announcement.type.toUpperCase()}
                    </span>

                    <span>
                      {new Date(
                        announcement.createdAt
                      ).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    <span>
                      {announcement.active
                        ? "Visible"
                        : "Hidden"}
                    </span>

                  </div>

                </div>

                <div className="announcement-actions">

                  <button
                    type="button"
                    title="Edit"
                    onClick={() => {

                      setEditingAnnouncement(
                        announcement
                      );

                      setShowModal(true);

                    }}
                  >

                    <FiEdit2 />

                  </button>

                  <button
                    type="button"
                    title={
                      announcement.pinned
                        ? "Unpin"
                        : "Pin"
                    }
                    onClick={() =>
                      handlePin(
                        announcement._id
                      )
                    }
                  >

                    <FiBookmark />

                  </button>

                  <button
                    type="button"
                    title={
                      announcement.active
                        ? "Hide"
                        : "Show"
                    }
                    onClick={() =>
                      handleVisibility(
                        announcement._id
                      )
                    }
                  >

                    {announcement.active ? (
                      <FiEyeOff />
                    ) : (
                      <FiEye />
                    )}

                  </button>

                  <button
                    type="button"
                    title="Delete"
                    className="danger"
                    onClick={() =>
                      handleDelete(
                        announcement._id
                      )
                    }
                  >

                    <FiTrash2 />

                  </button>

                </div>

              </div>

              <div className="announcement-content">

                <p>

                  {announcement.content}

                </p>

              </div>

            </div>

          ))

        )}

      </div>

      {showModal && (

        <AnnouncementModal

          announcement={editingAnnouncement}

          onClose={() => {

            setShowModal(false);

            setEditingAnnouncement(null);

          }}

          onSaved={() => {

            fetchAnnouncements();

            setShowModal(false);

            setEditingAnnouncement(null);

          }}

        />

      )}

    </div>

  );

}