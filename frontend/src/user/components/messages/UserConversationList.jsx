import { useMemo, useState, useRef, useEffect } from "react";

import "../../styles/UserConversationList.css";

import {
    formatStatus,
    formatPriority,
    formatCategory,
    formatAssignedTo,
} from "../../../utils/formatter";

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

export default function UserConversationList({
    conversations = [],
    archivedConversations = [],
    selectedConversation,
    setSelectedConversation,
    onArchive,
    onUnarchive,
    loading,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); 
  const menuRef = useRef({});

  const sidebarRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // =========================
  // CLOSE DROPDOWN
  // =========================

  useEffect(() => {

      const handleClickOutside = (e) => {

      const activeMenu =
          menuOpen &&
          menuRef.current[menuOpen];

      if (
          activeMenu &&
          !activeMenu.contains(e.target)
      ) {
          setMenuOpen(null);
      }

      };

      document.addEventListener(
          "mousedown",
          handleClickOutside
      );

      return () =>
          document.removeEventListener(
              "mousedown",
              handleClickOutside
          );

  }, []);

  // =========================
  // SCROLL TO BOTTOM BUTTON
  // =========================

  useEffect(() => {

    const sidebar = sidebarRef.current;

    if(!sidebar) return;


    const handleScroll = () => {

      const distanceFromBottom =
        sidebar.scrollHeight -
        sidebar.scrollTop -
        sidebar.clientHeight;


      setShowScrollButton(
        distanceFromBottom > 250
      );

    };


    sidebar.addEventListener(
      "scroll",
      handleScroll
    );


    return () => {

      sidebar.removeEventListener(
        "scroll",
        handleScroll
      );

    };


  }, []);

  const scrollToBottom = () => {

    sidebarRef.current?.scrollTo({

      top: sidebarRef.current.scrollHeight,

      behavior:"smooth",

    });

  };

  const filteredConversations = useMemo(() => {
    const source =
      filter === "archives"
        ? archivedConversations
        : conversations;

    const query = search.toLowerCase();

    console.log(
  "RENDER CONVERSATIONS:",
  source.map(c => ({
    id:c._id,
    title:c.ticketId?.title
  }))
);

    return source.filter((conversation) => {
      if (conversation.ticketId?.status === "cancelled") {
        return false;
      }

      const matchesSearch =
        conversation.ticketId?.title
          ?.toLowerCase()
          .includes(query) ||
        conversation.ticketId?.ticketId
          ?.toLowerCase()
          .includes(query) ||
        conversation.lastMessage
          ?.toLowerCase()
          .includes(query);

    if (filter === "unread") {
      return conversation.userUnread;
    }

      return matchesSearch;
    });

  }, [
    conversations,
    archivedConversations,
    search,
    filter,
  ]);

  return (
    <aside className="conversation-sidebar">

      {/* ================= HEADER ================= */}

      <div className="conversation-header">

        <div className="conversation-header-top">

          <h3>Messages</h3>

          <span>{filteredConversations.length}</span>

        </div>

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

      {/* ================= SEARCH ================= */}

      <div className="conversation-search">

        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <i className="fa-solid fa-magnifying-glass"></i>

      </div>

      {/* ================= LIST ================= */}

        <div
          className="conversation-list"
          ref={sidebarRef}
        >

        {filteredConversations.length === 0 ? (

          <div className="conversation-empty">
            No conversations found.
          </div>

        ) : (

          filteredConversations.map((conversation) => (

            <div
              key={conversation._id}
              className={`conversation-card ${
                selectedConversation?._id === conversation._id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedConversation(conversation)
              }
            >

              {/* ================= TOP ================= */}

              <div className="conversation-top">

                  <div className="conversation-title-group">

                      <div className="conversation-title">

                          <span>
                              {conversation.ticketId?.title ||
                                  "Untitled Ticket"}
                          </span>

                              {conversation.userUnread && (
                                  <span className="conversation-unread-dot"></span>
                              )}

                      </div>

                      <div className="conversation-ticket">

                          <span className="ticket-label">
                              Ticket ID:
                          </span>

                          <span className="ticket-number">
                              {conversation.ticketId?.ticketId ||
                                  "------"}
                          </span>

                      </div>

                  </div>

                  <div className="conversation-actions">

                      <span
                          className={`conversation-status ${
                              conversation.ticketId?.status || ""
                          }`}
                      >
                          {formatStatus(
                              conversation.ticketId?.status
                          )}
                      </span>

                      <div
                          className="conversation-menu-wrapper"
                          ref={(el) =>
                              (menuRef.current[conversation._id] = el)
                          }
                      >

                          <button
                              className="conversation-menu-btn"
                              onClick={(e) => {

                                  e.stopPropagation();

                                  setMenuOpen(
                                      menuOpen === conversation._id
                                          ? null
                                          : conversation._id
                                  );

                              }}
                          >
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>

                          {menuOpen === conversation._id && (

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
                                              id: conversation._id,
                                              title:
                                                  conversation.ticketId?.title ||
                                                  "this conversation",
                                          });

                                          setMenuOpen(null);

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
                                              id: conversation._id,
                                              title:
                                                  conversation.ticketId?.title ||
                                                  "this conversation",
                                          });

                                          setMenuOpen(null);

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

              {/* ================= SUPPORT AGENT ================= */}

              <div className="conversation-requester">

                  <i className="fa-solid fa-headset"></i>

                  <span>
                    {conversation.ticketId?.assignedTo
                      ? formatAssignedTo(conversation.ticketId.assignedTo)
                      : "Awaiting Support"}
                  </span>

              </div>

              {/* ================= TAGS ================= */}

              <div className="conversation-tags">

                <span className="conversation-category">

                  <i
                    className={`fa-solid ${getCategoryIcon(
                      conversation.ticketId?.category
                    )}`}
                  ></i>

                  {formatCategory(
                    conversation.ticketId?.category
                  )}

                </span>

                <span
                  className={`conversation-priority ${
                    conversation.ticketId?.priority || ""
                  }`}
                >
                  {formatPriority(
                    conversation.ticketId?.priority
                  )}
                </span>

              </div>

              {/* ================= BOTTOM ================= */}

              <div className="conversation-bottom">

                <div className="conversation-last">

                  {conversation.lastMessage ||
                    "No messages yet"}

                </div>

                <div className="conversation-time">

                  {formatTime(
                    conversation.updatedAt
                  )}

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
                            ? `Are you sure you want to archive "${confirmAction.title}"? This will hide the conversation from your active messages but will not close the ticket.`
                            : `Are you sure you want to restore "${confirmAction.title}" back to active conversations?`}
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
                            onClick={(e) => {

                                e.stopPropagation();

                                if (confirmAction.type === "archive") {
                                    onArchive(confirmAction.id);
                                } else {
                                    onUnarchive(confirmAction.id);
                                }

                                setConfirmAction(null);

                            }}
                        >
                            {confirmAction.type === "archive"
                                ? "Archive"
                                : "Restore"}
                        </button>

                    </div>

                </div>

            </div>
        )}

    </aside>
  );
}