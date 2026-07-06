import { useState } from "react";

import {
  formatCategory,
  formatStatus,
  formatPriority,
} from "../../utils/formatter";

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
  loading,
}) {

const [search, setSearch] = useState("");

const filteredConversations = conversations.filter((conversation) => {
  const query = search.toLowerCase();

  return (
    conversation.ticketId?.title?.toLowerCase().includes(query) ||
    conversation.ticketId?._id?.toLowerCase().includes(query) ||
    conversation.ticketId?.submittedBy?.firstName
      ?.toLowerCase()
      .includes(query) ||
    conversation.ticketId?.submittedBy?.lastName
      ?.toLowerCase()
      .includes(query) ||
    conversation.ticketId?.category?.toLowerCase().includes(query) ||
    conversation.lastMessage?.toLowerCase().includes(query)
  );
});

  return (
    <div className="messages-sidebar">

      <div className="messages-sidebar-header">
        <h2 className="messages-title">Messages</h2>

        <span className="conversation-count">
          {conversations.length}
        </span>
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

      {loading ? (
        <p className="muted">Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p className="muted">No conversations yet</p>
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
                  {c.ticketId?.title || "Untitled Ticket"}
                </div>

              <div className="conversation-ticket">
                <span className="ticket-label">Ticket ID:</span>{" "}
                <span className="ticket-number">
                  #{c.ticketId?._id?.slice(-6) || "------"}
                </span>
              </div>

              </div>

              <span
                className={`conversation-status ${c.ticketId?.status}`}
              >
                {formatStatus(c.ticketId?.status)}
              </span>

            </div>

            {/* ================= REQUESTER ================= */}

            <div className="conversation-requester">

              <i className="fa-solid fa-user"></i>

            <span>
              {c.ticketId?.submittedBy
                ? `${c.ticketId.submittedBy.firstName} ${c.ticketId.submittedBy.lastName}`
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
              className={`conversation-priority ${c.ticketId?.priority}`}
            >
              {formatPriority(c.ticketId?.priority)?.toUpperCase()}
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
  );
}