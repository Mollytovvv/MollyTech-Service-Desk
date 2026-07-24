import { useEffect, useRef, useState } from "react";

import {
  formatCategory,
  formatStatus,
  formatPriority,
} from "../../../utils/formatter";

import "../../styles/ConversationList.css";

// ==========================
// RELATIVE TIME FORMATTER
// ==========================
const formatTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const then = new Date(date);

  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (then.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return then.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

// ==========================
// CATEGORY ICONS
// ==========================
const getCategoryIcon = (category) => {
  switch (category) {
    case "software":
      return "fa-laptop-code";

    case "hardware":
      return "fa-desktop";

    case "network":
      return "fa-network-wired";

    case "account":
      return "fa-user-lock";

    case "bug":
      return "fa-bug";

    default:
      return "fa-circle-info";
  }
};

export default function ConversationList({
    conversations,
    selectedConversation,
    onSelect,
    onArchive,
    onUnarchive,
    loading,
    filter,
    setFilter,
}) {

const [search, setSearch] = useState("");
const [openMenu, setOpenMenu] = useState(null);
const [confirmAction, setConfirmAction] = useState(null);

const sidebarRef = useRef(null);
const [showScrollButton, setShowScrollButton] = useState(false);

useEffect(() => {
  const sidebar = sidebarRef.current;

  if (!sidebar) return;

  const handleScroll = () => {
    const distanceFromBottom =
      sidebar.scrollHeight -
      sidebar.scrollTop -
      sidebar.clientHeight;

    setShowScrollButton(distanceFromBottom > 250);
  };

  sidebar.addEventListener("scroll", handleScroll);

  return () =>
    sidebar.removeEventListener(
      "scroll",
      handleScroll
    );

}, []);

const scrollToBottom = () => {
  sidebarRef.current?.scrollTo({
    top: sidebarRef.current.scrollHeight,
    behavior: "smooth",
  });
};

const query = search.toLowerCase();

console.log("CONVERSATIONS:", conversations);

const filteredConversations = conversations.filter((conversation) => {
  if (conversation.ticketId?.status === "cancelled") {
    return false;
  }
  
  const matchesSearch =
    conversation.ticketId?.title?.toLowerCase().includes(query) ||
    conversation.ticketId?._id?.toLowerCase().includes(query) ||
    conversation.ticketId?.submittedBy?.firstName?.toLowerCase().includes(query) ||
    conversation.ticketId?.submittedBy?.lastName?.toLowerCase().includes(query) ||
    conversation.ticketId?.category?.toLowerCase().includes(query) ||
    conversation.lastMessage?.toLowerCase().includes(query);

    let matchesFilter = !conversation.isArchived;

    if (filter === "unread") {
        matchesFilter =
            conversation.adminUnread && !conversation.isArchived;
    }

    if (filter === "archives") {
        matchesFilter = conversation.isArchived;
    }

  return matchesSearch && matchesFilter;
});

  return (
  <div className="messages-sidebar">

    {/* HEADER */}
    <div className="messages-sidebar-header">

        <div className="messages-header-top">

            <h2 className="messages-title">Messages</h2>

        <span className="conversation-count">
            {filteredConversations.length}
        </span>
    </div>

      {/* FILTER TABS */}
      <div className="conversation-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>

        <button
          className={filter === "archives" ? "active" : ""}
          onClick={() => setFilter("archives")}
        >
          Archives
        </button>
      </div>

    </div>

      <div className="conversation-search">

          <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />

          <i className="fa-solid fa-magnifying-glass"></i>

      </div>

      <div
          className="conversation-list"
          ref={sidebarRef}
      >

      {loading ? (
          <p className="muted">
              Loading conversations...
          </p>
      ) : filteredConversations.length === 0 ? (
          <p className="muted">
              No conversations found
          </p>
      ) : (
          filteredConversations.map((c) => (

            <div
              key={c._id}
              className={`conversation-item ${
                selectedConversation?._id === c._id ? "active" : ""
              }`}
              onClick={() => onSelect(c)}
            >

            {/* ================= TOP ================= */}

            <div className="conversation-top">

              <div className="conversation-title-group">

              <div className="conversation-title">

                <span>
                  {c.ticketId?.title || "Untitled Ticket"}
                </span>

                {c.adminUnread && (
                  <span className="conversation-unread-dot"></span>
                )}

              </div>

              <div className="conversation-ticket">
                <span className="ticket-label">Ticket ID:</span>{" "}
                  <span className="ticket-number">
                    {c.ticketId?.ticketId || "------"}
                  </span>
              </div>

              </div>

              <div className="conversation-actions">

                  <span
                      className={`conversation-status ${c.ticketId?.status}`}
                  >
                      {formatStatus(c.ticketId?.status)}
                  </span>

                  <div className="conversation-menu-wrapper">

                      <button
                          className="conversation-menu-btn"
                          onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(openMenu === c._id ? null : c._id);
                          }}
                      >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>

                      {openMenu === c._id && (
                          <div
                              className="conversation-menu"
                              onClick={(e) => e.stopPropagation()}
                          >
                              {filter === "archives" ? (
                                  <button
                                      className="conversation-menu-item"
                                      onClick={() => {
                                          setConfirmAction({
                                              type: "restore",
                                              id: c._id,
                                              title: c.ticketId?.title || "this conversation"
                                          });

                                          setOpenMenu(null);
                                      }}
                                  >
                                      <i className="fa-solid fa-box-open"></i>
                                      Restore
                                  </button>
                              ) : (
                                  <button
                                      className="conversation-menu-item"
                                      onClick={() => {
                                          setConfirmAction({
                                              type: "archive",
                                              id: c._id,
                                              title: c.ticketId?.title || "this conversation"
                                          });

                                          setOpenMenu(null);
                                      }}
                                  >
                                      <i className="fa-solid fa-box-archive"></i>
                                      Archive
                                  </button>
                              )}
                          </div>
                      )}

                  </div>

              </div>

            </div>

            {/* ================= REQUESTER ================= */}

            <div className="conversation-requester">

              <i className="fa-solid fa-user"></i>

            <span>
              {c.requester
                ? `${c.requester.firstName} ${c.requester.lastName}`
                : "Unknown User"}
            </span>

            </div>

            {/* ================= TAGS ================= */}

            <div className="conversation-tags">

              <span className="conversation-category">

                <i
                  className={`fa-solid ${getCategoryIcon(
                    c.ticketId?.category
                  )}`}
                ></i>

                {formatCategory(c.ticketId?.category)}

              </span>

              <span
                className={`conversation-priority ${
                  c.ticketId?.priority || "unknown"
                }`}
              >
                {formatPriority(c.ticketId?.priority) || "NORMAL"}
              </span>

            </div>

            {/* ================= LAST MESSAGE ================= */}

            <div className="conversation-bottom">

              <div className="conversation-last">
                {c.lastMessage || "No messages yet"}
              </div>

              <div className="conversation-time">
                {formatTime(c.updatedAt)}
              </div>

            </div>

          </div>
        ))
      )}

      </div>

      {showScrollButton && (
        <button
          className="conversation-scroll-btn"
          onClick={scrollToBottom}
        >
          <i className="fa-solid fa-arrow-down"></i>
        </button>
      )}

      {confirmAction && (
          <div className="conversation-confirm-overlay">

              <div className="conversation-confirm-box">

                  <i
                    className={
                      confirmAction.type === "archive"
                      ? "fa-solid fa-box-archive"
                      : "fa-solid fa-box-open"
                    }
                  ></i>


                  <h3>
                    {confirmAction.type === "archive"
                      ? "Archive this conversation?"
                      : "Restore this conversation?"}
                  </h3>


                  <p>
                    {confirmAction.type === "archive"
                      ? `Are you sure you want to archive "${confirmAction.title}"?`
                      : `Are you sure you want to restore "${confirmAction.title}" back to active conversations?`
                    }
                  </p>


                  <div className="conversation-confirm-actions">

                      <button
                          className="cancel-confirm"
                          onClick={() => setConfirmAction(null)}
                      >
                          Cancel
                      </button>


                      <button
                          className={
                            confirmAction.type === "archive"
                            ? "danger-confirm"
                            : "restore-confirm"
                          }
                          onClick={() => {

                              if(confirmAction.type === "archive"){
                                  onArchive(confirmAction.id);
                              }
                              else{
                                  onUnarchive(confirmAction.id);
                              }

                              setConfirmAction(null);

                          }}
                      >
                          {
                            confirmAction.type === "archive"
                            ? "Archive"
                            : "Restore"
                          }
                      </button>

                  </div>

              </div>

          </div>
      )}

    </div>
  );
}