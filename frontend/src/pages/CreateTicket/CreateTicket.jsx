import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateTicket.css";

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    submittedBy: "",
    category: "general",
    priority: "low",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/tickets", form);

      alert("Ticket created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket">
      <h2>Create Ticket</h2>

      <form onSubmit={handleSubmit}>

        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        {/* SUBMITTED BY */}
        <input
          name="submittedBy"
          placeholder="Submitted By (Name or Email)"
          value={form.submittedBy}
          onChange={handleChange}
        />

        {/* CATEGORY */}
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option value="general">General</option>
          <option value="technical">Technical</option>
          <option value="billing">Billing</option>
          <option value="request">Request</option>
        </select>

        {/* PRIORITY */}
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}