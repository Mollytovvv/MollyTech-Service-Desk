import "../styles/ViewTicketModal.css";

import {
  FiX,
  FiCalendar,
  FiTag,
  FiAlertTriangle,
  FiActivity,
  FiUser,
  FiMessageCircle,
} from "react-icons/fi";

export default function ViewTicketModal({ ticket, onClose }) {
  if (!ticket) return null;

  const capitalize = (text) => {
    if (!text) return "";

    const formatted = text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return formatted.replace(/\bIt\b/g, "IT");
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="view-ticket-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER ================= */}

        <div className="view-ticket-header">
          <div>
            <h2>{ticket.ticketId}</h2>
            <p>{ticket.title}</p>
          </div>

          <button
            className="close-modal-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="view-ticket-summary">

          <div className="summary-item">
            <small>Status</small>

            <span className={`status-${ticket.status}`}>
              <FiActivity />
              {capitalize(ticket.status)}
            </span>
          </div>

          <div className="summary-item">
            <small>Priority</small>

            <span className={`priority-${ticket.priority?.toLowerCase()}`}>
              <FiAlertTriangle />
              {capitalize(ticket.priority)}
            </span>
          </div>

          <div className="summary-item">
            <small>Category</small>

            <span>
              <FiTag />
              {capitalize(ticket.category)}
            </span>
          </div>

          <div className="summary-item">
            <small>Assigned To</small>

            <span>
              <FiUser />
              {ticket.assignedTo
                ? capitalize(ticket.assignedTo)
                : "Unassigned"}
            </span>
          </div>

          <div className="summary-item">
            <small>Created</small>

            <span>
              <FiCalendar />
              {new Date(ticket.createdAt).toLocaleDateString([], {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" • "}
              {new Date(ticket.createdAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>

        </div>

        {/* ================= MESSAGES ================= */}

        <section className="ticket-section">

          <h3>
            <FiMessageCircle />
            Comments
          </h3>

          {/* Original Request */}

          <div className="conversation-message user">

            <div className="message-header">

              <strong>You</strong>

              <small>
                {new Date(ticket.createdAt).toLocaleString()}
              </small>

            </div>

            <p>{ticket.description}</p>

          </div>

          {/* IT Responses */}

          {ticket.comments && ticket.comments.length > 0 ? (

            ticket.comments.map((comment) => (

              <div
                key={comment._id}
                className="conversation-message admin"
              >

                <div className="message-header">

                  <strong>
                    {comment.author || "IT Support"}
                  </strong>

                  <small>
                    {new Date(comment.createdAt).toLocaleString()}
                  </small>

                </div>

                <p>{comment.message}</p>

              </div>

            ))

          ) : (

            <div className="empty-conversation">

              <FiMessageCircle size={32} />

              <h4>No Updates Yet</h4>

              <p>
                Your request has been received successfully.
                An IT Support Engineer will post updates here as work progresses.
              </p>

            </div>

          )}

          {/* Read Only Notice */}

          <div className="ticket-info-box">

            <h4>Need Further Assistance?</h4>

            <p>
                This page provides a read-only history of your support request. If your issue persists after the ticket has been resolved, please use the Messages section below to submit a follow-up so our IT Support team can continue assisting you.
            </p>

          </div>

        </section>

      </div>
    </div>
  );
}