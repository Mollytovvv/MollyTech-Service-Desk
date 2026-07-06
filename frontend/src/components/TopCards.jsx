import { FaUsers, FaTicketAlt, FaClock, FaCheckCircle } from "react-icons/fa";
import "../styles/TopCards.css";

export default function TopCards({ tickets = [] }) {

  const totalTickets = tickets.length;
  const pending = tickets.filter(t => t.status === "pending").length;
  const resolved = tickets.filter(t => t.status === "closed").length;

  const kpis = [
    {
      label: "Total Users",
      value: "--",
      icon: <FaUsers />,
      type: "users"
    },
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: <FaTicketAlt />,
      type: "tickets"
    },
    {
      label: "Pending Tickets",
      value: pending,
      icon: <FaClock />,
      type: "pending"
    },
    {
      label: "Resolved Tickets",
      value: resolved,
      icon: <FaCheckCircle />,
      type: "resolved"
    }
  ];

  return (
    <div className="kpi-grid">

      {kpis.map((kpi, index) => (
        <div key={index} className="kpi-card">

          <div className={`kpi-icon ${kpi.type}`}>
            {kpi.icon}
          </div>

          <div className="kpi-content">
            <p>{kpi.label}</p>
            <h2>{kpi.value}</h2>
          </div>

        </div>
      ))}

    </div>
  );
}