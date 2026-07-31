import { useEffect, useState } from "react";
import {
  FiX,
  FiInfo,
  FiLayers,
  FiEdit3,
  FiUsers,
  FiAtSign,
  FiSmartphone,
  FiGrid,
  FiFlag,
  FiMessageSquare,
  FiFileText,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";
import "../styles/CreateTicketModal.css";

export default function CreateTicketModal({
    onClose,
    onTicketCreated
}) {

  const { user } = useAuth();
  const { showToast } = useToast();

  const DESCRIPTION_LIMIT = 500;

  const [formData, setFormData] = useState({

      title: "",

      email: "",

      phoneNumber: "",

      category: "",

      priority: "low",

      description: "",

  });

  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH USER PROFILE
  // ===============================

  useEffect(()=>{

      const fetchProfile = async()=>{

          try{

              const res = await api.get(
                  "/users/me"
              );


              setFormData(prev=>({

                  ...prev,

                  email: res.data.email || "",

                  phoneNumber: (res.data.phone || "")
                    .replace(/^(\+63|63)/, "")
                    .replace(/^0/, "")

              }));


          }
          catch(err){

              console.error(
                  "Failed to load user profile",
                  err
              );

          }

      };


      fetchProfile();


  },[]);

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================
  const handleChange = (e) => {

      const { name, value } = e.target;

      if (name === "phoneNumber") {

          const numbersOnly = value.replace(/\D/g, "");

          setFormData(prev => ({
              ...prev,
              phoneNumber: numbersOnly.slice(0, 10)
          }));

          return;
      }

      setFormData(prev => ({
          ...prev,
          [name]: value
      }));

  };

  // ===============================
  // SUBMIT TICKET
  // ===============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

  const response = await api.post(
      "/tickets",
      {
          title: formData.title,
          category: formData.category,
          priority: formData.priority,
          description: formData.description,
      }
  );

      console.log("Ticket Created:", response.data);

      showToast(
          "success",
          "Ticket created successfully"
      );


      if(onTicketCreated){
          onTicketCreated();
      }


      onClose();
      
    } catch (error) {
      console.log(
        "CREATE TICKET ERROR:",
        error.response?.data || error.message
      );

      showToast(
        "error",
        error.response?.data?.message ||
          "Failed to create ticket"
      );
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={!loading ? onClose : undefined}
    >
      <div
        className="create-ticket-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}

        <div className="modal-header">
          <div>
            <h2>Create Support Ticket</h2>

            <p>
              Submit an IT issue and our support team
              will review it as soon as possible.
            </p>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* TIPS */}

        <div className="ticket-tips">
          <div className="tips-title">
            <FiInfo />
            <span>Before submitting your request</span>
          </div>

          <ul>
            <li>Use a clear and descriptive subject.</li>
            <li>Mention any error messages shown.</li>
            <li>Include the affected device or software.</li>
            <li>Describe the issue step-by-step.</li>
          </ul>
        </div>

        {/* FORM */}

        <form
          className="ticket-form"
          onSubmit={handleSubmit}
        >
          {/* REQUEST DETAILS */}

          <h3 className="form-section-title">
            <FiLayers />
            Request Details
          </h3>

          <div className="form-group">
            <label>
              <FiEdit3 />
              Subject *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Briefly describe your issue"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FiGrid />
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">
                  Select Category
                </option>

                <option value="hardware">
                  Hardware
                </option>

                <option value="software">
                  Software
                </option>

                <option value="network">
                  Network
                </option>

                <option value="account">
                  Account
                </option>

                <option value="others">
                  Others
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <FiFlag />
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="low">
                  🟢 Low
                </option>

                <option value="medium">
                  🟡 Medium
                </option>

                <option value="high">
                  🔴 High
                </option>

                <option value="urgent">
                  ⛔ Urgent
                </option>
              </select>

            </div>
          </div>

          {/* CONTACT */}

          <h3 className="form-section-title">
            <FiUsers />
            Contact Information
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>
                <FiAtSign />
                Email *
              </label>

              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
              />
            </div>

            <div className="form-group">
              <label>
                <FiSmartphone />
                Phone Number
              </label>

              <div className="phone-input-wrapper">

                  <span className="phone-prefix">
                      +63
                  </span>

                  <input
                      type="text"
                      name="phoneNumber"
                      value={
                          formData.phoneNumber.replace(
                              /(\d{3})(\d{3})(\d{0,4})/,
                              (_, a, b, c) =>
                                  c ? `${a} ${b} ${c}` : `${a} ${b}`
                          )
                      }
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="923 832 1211"
                      maxLength={12}
                  />

              </div>
            </div>
          </div>

          {/* DESCRIPTION */}

          <h3 className="form-section-title">
            <FiMessageSquare />
            Issue Description
          </h3>

          <div className="form-group">
            <label>
              <FiFileText />
              Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              maxLength={DESCRIPTION_LIMIT}
              disabled={loading}
              placeholder={`Example:

• What were you doing?
• What happened?
• Any error messages?
• When did it start?`}
                            required
            />

            <div className="character-counter">
              {formData.description.length} /{" "}
              {DESCRIPTION_LIMIT}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}