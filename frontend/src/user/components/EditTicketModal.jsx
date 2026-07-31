import { useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "../styles/EditTicketModal.css";

import {
  FiX,
  FiEdit3,
  FiTag,
  FiAlertTriangle,
  FiFileText,
  FiMail,
  FiPhone,
} from "react-icons/fi";

export default function EditTicketModal({ ticket, onClose }) {
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: ticket.title || "",
    category: ticket.category || "others",
    priority: ticket.priority || "medium",
    description: ticket.description || "",
    email: ticket.email || "",
    phoneNumber: ticket.phoneNumber || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put(`/tickets/${ticket._id}`, formData);

      showToast("success", "Ticket updated successfully.");

      onClose();
    } catch (error) {
        
    console.log("UPDATE ERROR");
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("Message:", error.message);

      showToast("error", "Failed to update ticket.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-ticket-modal">

        {/* HEADER */}

        <div className="modal-header">
          <div>
            <h2>
              <FiEdit3 />
              Edit Support Ticket
            </h2>

            <p>
              Update your support request before submitting your changes.
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <FiX />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* TITLE */}

          <div className="form-group">
            <label>Ticket Title</label>

            <input
              type="text"
              name="title"
              placeholder="Enter ticket title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY + PRIORITY */}

          <div className="form-grid">

            <div className="form-group">
              <label>
                <FiTag />
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="account">Account</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FiAlertTriangle />
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">
            <label>
              <FiFileText />
              Description
            </label>

            <textarea
              name="description"
              rows={6}
              placeholder="Describe your issue..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* CONTACT */}

          <div className="form-grid">

            <div className="form-group">
              <label>
                <FiMail />
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                <FiPhone />
                Phone Number
              </label>

              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* FOOTER */}

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}