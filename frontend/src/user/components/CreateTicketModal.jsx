import { useState } from "react";
import { FiX } from "react-icons/fi";

import api from "../../api/axios";

import "../styles/CreateTicketModal.css";


export default function CreateTicketModal({ onClose }) {


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
  // HANDLE INPUT CHANGE
  // ===============================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    });

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
        formData
      );


      console.log(
        "Ticket Created:",
        response.data
      );


      alert("Ticket created successfully");


      onClose();


    } catch (error) {


      console.log(
        "CREATE TICKET ERROR:",
        error.response?.data || error.message
      );


      alert(
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
      onClick={onClose}
    >

      <div
        className="create-ticket-modal"
        onClick={(e) => e.stopPropagation()}
      >


        {/* HEADER */}

        <div className="modal-header">

          <div>

            <h2>
              Create Support Ticket
            </h2>

            <p>
              Fill in the details below to submit your request.
            </p>

          </div>


          <button
            className="close-btn"
            onClick={onClose}
          >

            <FiX />

          </button>


        </div>




        {/* FORM */}

        <form
          className="ticket-form"
          onSubmit={handleSubmit}
        >



          {/* SUBJECT */}

          <div className="form-group">

            <label>
              Subject
            </label>


            <input

              type="text"

              name="title"

              value={formData.title}

              onChange={handleChange}

              placeholder="Briefly describe your issue"

              required

            />


          </div>




          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>


            <input

              type="email"

              name="email"

              value={formData.email}

              onChange={handleChange}

              placeholder="Enter your email"

              required

            />


          </div>




          {/* PHONE NUMBER */}

          <div className="form-group">

            <label>
              Phone Number
            </label>


            <input

              type="text"

              name="phoneNumber"

              value={formData.phoneNumber}

              onChange={handleChange}

              placeholder="09XXXXXXXXX"

            />


          </div>




          {/* CATEGORY */}

          <div className="form-group">

            <label>
              Category
            </label>


            <select

              name="category"

              value={formData.category}

              onChange={handleChange}

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

              <option value="email">
                Email
              </option>

              <option value="account">
                Account
              </option>

              <option value="others">
                Others
              </option>


            </select>


          </div>




          {/* PRIORITY */}

          <div className="form-group">

            <label>
              Priority
            </label>


            <select

              name="priority"

              value={formData.priority}

              onChange={handleChange}

            >

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>


            </select>


          </div>




          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>


            <textarea

              name="description"

              value={formData.description}

              onChange={handleChange}

              rows="6"

              placeholder="Describe your issue in detail..."

              required

            />


          </div>




          {/* ACTIONS */}

          <div className="modal-actions">


            <button

              type="button"

              className="cancel-btn"

              onClick={onClose}

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
                : "Submit Ticket"
              }


            </button>


          </div>



        </form>



      </div>



    </div>

  );

}