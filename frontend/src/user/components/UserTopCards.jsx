import {
  FiFileText,
  FiClock,
  FiLoader,
  FiCheckCircle
} from "react-icons/fi";

import "../styles/UserTopCards.css";

export default function UserTopCards({ stats }) {

  const cards = [
    {
      label: "Total Tickets",
      value: stats.total,
      icon: <FiFileText />,
      type: "tickets"
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <FiClock />,
      type: "pending"
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      icon: <FiLoader />,
      type: "progress"
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <FiCheckCircle />,
      type: "resolved"
    }
  ];

  return (
    <div className="kpi-grid">

      {cards.map((card, index) => (
        <div
          key={index}
          className="kpi-card"
        >

          <div className={`kpi-icon ${card.type}`}>
            {card.icon}
          </div>

          <div className="kpi-content">
            <p>{card.label}</p>
            <h2>{card.value}</h2>
          </div>

        </div>
      ))}

    </div>
  );
}