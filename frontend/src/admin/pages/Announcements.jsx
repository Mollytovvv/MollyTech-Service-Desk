import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AnnouncementModal from "../components/announcements/AnnouncementModal";

import {
    FiBell,
    FiPlus,
    FiSearch,
    FiRefreshCw,
    FiEdit2,
    FiTrash2,
    FiEye,
    FiEyeOff,
    FiBookmark,
    FiGrid,
    FiCheckCircle,
    FiSlash,
    FiStar,
} from "react-icons/fi";

import "../styles/Announcements.css";

export default function Announcements() {

    const { token } = useAuth();

    const { showToast } = useToast();

    const [announcements, setAnnouncements] = useState([]);

    const [deleteAnnouncement, setDeleteAnnouncement] = useState(null);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);

    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    // ==========================================
    // FETCH
    // ==========================================

    const fetchAnnouncements = async () => {

        try {

            setLoading(true);

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

    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async (id) => {

        try {

            await api.delete(

                `/announcements/${id}`,

                {
                    headers:{
                        Authorization:`Bearer ${token}`,
                    },
                }

            );


            setAnnouncements((prev)=>

                prev.filter(
                    (announcement)=>
                        announcement._id !== id
                )

            );


            showToast(
                "success",
                "Announcement deleted successfully."
            );


        } catch(err){

            console.log(err);


            showToast(
                "error",
                err.response?.data?.message ||
                "Unable to delete announcement."
            );

        }

    };

    // ==========================================
    // PIN
    // ==========================================

    const handlePin = async (id) => {

        try {

            await api.patch(

                `/announcements/${id}/pin`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            showToast(
                "success",
                "Announcement updated."
            );

            fetchAnnouncements();

        } catch (err) {

            console.log(err);

            showToast(
                "error",
                "Unable to update announcement."
            );

        }

    };

    // ==========================================
    // ACTIVE
    // ==========================================

    const handleVisibility = async (id) => {

        try {

            await api.patch(

                `/announcements/${id}/active`,

                {},

                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }

            );

            showToast(
                "success",
                "Announcement updated."
            );

            fetchAnnouncements();

        } catch (err) {

            console.log(err);

            showToast(
                "error",
                "Unable to update announcement."
            );

        }

    };

    // ==========================================
    // FILTER
    // ==========================================

    const filteredAnnouncements = useMemo(() => {

        return announcements.filter((announcement) => {

            const matchesSearch =

                announcement.title
                    .toLowerCase()
                    .includes(search.toLowerCase())

                ||

                announcement.content
                    .toLowerCase()
                    .includes(search.toLowerCase());

            if (!matchesSearch) return false;

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

    }, [
        announcements,
        search,
        filter,
    ]);

    // ==========================================
    // DASHBOARD CARDS
    // ==========================================

    const totalAnnouncements = announcements.length;

    const totalVisible =
        announcements.filter(
            a => a.active
        ).length;

    const totalHidden =
        announcements.filter(
            a => !a.active
        ).length;

    const totalPinned =
        announcements.filter(
            a => a.pinned
        ).length;

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="announcements-loading">

                <FiBell size={42} />

                <h3>
                    Loading Announcements...
                </h3>

                <p>
                    Please wait while we load the latest announcements.
                </p>

            </div>

        );

    }

return (

    <div className="announcements-page">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="announcement-header">

            <div>

            </div>

            <div className="announcement-header-actions">

                <button
                    className="refresh-announcement-btn"
                    onClick={fetchAnnouncements}
                >

                    <FiRefreshCw />

                    Refresh

                </button>

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

        </div>

        {/* ==========================================
            STATISTICS
        ========================================== */}

        <div className="announcement-stats">

            <div className="announcement-stat-card">

                <FiGrid />

                <div>

                    <h4>Total</h4>

                    <span>{totalAnnouncements}</span>

                </div>

            </div>

            <div className="announcement-stat-card">

                <FiCheckCircle />

                <div>

                    <h4>Visible</h4>

                    <span>{totalVisible}</span>

                </div>

            </div>

            <div className="announcement-stat-card">

                <FiStar />

                <div>

                    <h4>Pinned</h4>

                    <span>{totalPinned}</span>

                </div>

            </div>

            <div className="announcement-stat-card">

                <FiSlash />

                <div>

                    <h4>Hidden</h4>

                    <span>{totalHidden}</span>

                </div>

            </div>

        </div>

        {/* ==========================================
            TOOLBAR
        ========================================== */}

        <div className="announcement-toolbar">

            <div className="announcement-search">

                <FiSearch />

                <input
                    type="text"
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            <div className="announcement-filters">

                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => setFilter("all")}
                >
                    All
                </button>

                <button
                    className={filter === "active" ? "active" : ""}
                    onClick={() => setFilter("active")}
                >
                    Visible
                </button>

                <button
                    className={filter === "hidden" ? "active" : ""}
                    onClick={() => setFilter("hidden")}
                >
                    Hidden
                </button>

                <button
                    className={filter === "pinned" ? "active" : ""}
                    onClick={() => setFilter("pinned")}
                >
                    Pinned
                </button>

            </div>

        </div>

        {/* ==========================================
            LIST
        ========================================== */}

        <div className="announcement-list">

            {filteredAnnouncements.length === 0 ? (

                <div className="announcement-empty">

                    <FiBell size={56} />

                    <h3>

                        No announcements available

                    </h3>

                    <p>

                        Create your first announcement to keep everyone informed.

                    </p>

                </div>

            ) : (

                filteredAnnouncements.map((announcement) => (

                    <div
                        key={announcement._id}
                        className={`announcement-card ${announcement.pinned ? "pinned" : ""}`}
                    >

                        {/* ======================== */}

                        <div className="announcement-card-header">

                            <div className="announcement-title">

                                <h3>

                                    {announcement.title}

                                </h3>

                                {announcement.pinned && (

                                    <span className="pinned-badge">

                                        <FiBookmark />

                                        Pinned

                                    </span>

                                )}

                            </div>

                            <div className="announcement-actions">

                                <button
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

                                    {announcement.active
                                        ? <FiEyeOff />
                                        : <FiEye />}

                                </button>

                                <button
                                    className="danger"
                                    title="Delete"
                                    onClick={() => {
                                        setDeleteAnnouncement(announcement);
                                    }}
                                >
                                    <FiTrash2 />
                                </button>

                            </div>

                        </div>

                        {/* ======================== */}

                        <div className="announcement-meta">

                            <span
                                className={`announcement-type ${announcement.type}`}
                            >

                                {announcement.type}

                            </span>

                            <span
                                className={
                                    announcement.active
                                        ? "status-badge active"
                                        : "status-badge hidden"
                                }
                            >

                                {announcement.active
                                    ? "Visible"
                                    : "Hidden"}

                            </span>

                            <span>

                                {new Date(
                                    announcement.createdAt
                                ).toLocaleString([], {

                                    month: "short",

                                    day: "numeric",

                                    year: "numeric",

                                    hour: "numeric",

                                    minute: "2-digit",

                                })}

                            </span>

                        </div>

                        {/* ======================== */}

                        <div className="announcement-content">

                            <p>

                                {announcement.content}

                            </p>

                        </div>

                    </div>

                ))

            )}

        </div>

        {/* ==========================================
            MODAL
        ========================================== */}

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

        {deleteAnnouncement && (

            <div
                className="modal-overlay"
                onClick={() => setDeleteAnnouncement(null)}
            >

                <div
                    className="modal resolve-modal"
                    onClick={(e)=>e.stopPropagation()}
                >

                    <div className="resolve-header">

                        <FiTrash2 className="resolve-icon"/>

                        <h2>
                            Delete Announcement
                        </h2>

                    </div>


                    <div className="resolve-body">

                        <p>
                            Are you sure you want to delete this announcement?
                        </p>


                        <div className="resolve-warning">

                            This action cannot be undone.

                        </div>

                    </div>


                    <div className="resolve-actions">


                        <button
                            className="btn-keep-ticket"
                            onClick={() =>
                                setDeleteAnnouncement(null)
                            }
                        >

                            Cancel

                        </button>



                        <button
                            className="btn-delete-ticket"
                            onClick={() => {

                                handleDelete(
                                    deleteAnnouncement._id
                                );

                                setDeleteAnnouncement(null);

                            }}
                        >

                            Delete

                        </button>


                    </div>


                </div>

            </div>

        )}

    </div>

);

}